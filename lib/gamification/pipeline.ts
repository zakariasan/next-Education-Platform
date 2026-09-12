// Evaluation pipeline: auto-grading on submit, reviewer assignment,
// finalisation (threshold → VALIDATED/FAILED), XP award (exactly once) and
// badge evaluation. Every entry point runs inside a Prisma transaction.
import type { Prisma } from "@prisma/client";
import { autoGrade, type AutoConfig } from "./autograde";
import { BADGES, earnedBadgeCodes } from "./badges";
import { GAMIFICATION } from "./config";
import { computeNodeStates, type AttemptSummary, type Edge } from "./graph";
import { levelFromXp } from "./level";
import { hoursBetween, isValidated, weightedScore, xpForValidation } from "./scoring";
import { awardXp, peerReviewDedupeKey, validationDedupeKey } from "./service";

export type Tx = Prisma.TransactionClient;

export type FinalizeResult = {
  finalized: boolean;
  state: "VALIDATED" | "FAILED" | "UNDER_REVIEW" | "SUBMITTED";
  score: number | null;
  xpAwarded: number;
  newlyUnlocked: string[];
  newBadges: string[];
};

async function moduleGraph(tx: Tx, moduleId: string, studentId: string) {
  const projects = await tx.project.findMany({
    where: { moduleId, status: "PUBLISHED" },
    select: { id: true, prerequisites: { select: { id: true } } },
  });
  const ids = new Set(projects.map((p) => p.id));
  const edges: Edge[] = [];
  for (const p of projects) for (const q of p.prerequisites) if (ids.has(q.id)) edges.push({ from: q.id, to: p.id });
  const attempts = await tx.projectAttempt.findMany({
    where: { studentId, projectId: { in: [...ids] } },
    orderBy: { attemptNumber: "desc" },
    select: { projectId: true, state: true },
  });
  const summary: AttemptSummary[] = [];
  const seen = new Set<string>();
  const validated = new Set(attempts.filter((a) => a.state === "VALIDATED").map((a) => a.projectId));
  for (const a of attempts) {
    if (seen.has(a.projectId)) continue;
    seen.add(a.projectId);
    summary.push({ projectId: a.projectId, state: validated.has(a.projectId) ? "VALIDATED" : a.state });
  }
  return { nodeIds: [...ids], edges, summary };
}

/** Score every AUTO criterion of an attempt from its answers. */
export async function autoGradeAttempt(tx: Tx, attemptId: string) {
  const attempt = await tx.projectAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { version: { include: { criteria: true } } },
  });
  const answers = (attempt.answers as Record<string, unknown> | null) ?? {};
  for (const c of attempt.version.criteria) {
    if (c.mode !== "AUTO" || !c.autoConfig) continue;
    const cfg = c.autoConfig as AutoConfig;
    let input = answers[c.id];
    if (cfg.type === "QUIZ") {
      const qa = await tx.quizAttempt.findUnique({ where: { quizId_studentId: { quizId: cfg.quizId, studentId: attempt.studentId } } });
      input = qa?.percent ?? null;
    }
    const score = autoGrade(cfg, input);
    await tx.criterionScore.upsert({
      where: { attemptId_criterionId: { attemptId, criterionId: c.id } },
      update: { score, mode: "AUTO" },
      create: { attemptId, criterionId: c.id, score, mode: "AUTO" },
    });
  }
}

/** Create TEACHER / PEER review assignments for the criteria that need a human. */
export async function assignReviewers(tx: Tx, attemptId: string) {
  const attempt = await tx.projectAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { version: { include: { criteria: true } }, project: { include: { module: true } } },
  });
  const modes = new Set(attempt.version.criteria.map((c) => c.mode));
  const teacherId = attempt.project.module.teacherId;

  if (modes.has("TEACHER")) {
    await tx.reviewAssignment.upsert({
      where: { attemptId_reviewerId: { attemptId, reviewerId: teacherId } },
      update: {},
      create: { attemptId, reviewerId: teacherId, kind: "TEACHER" },
    });
  }

  if (modes.has("PEER")) {
    // Peers must have validated this project themselves. Prefer the least loaded one.
    const candidates = await tx.projectAttempt.findMany({
      where: { projectId: attempt.projectId, state: "VALIDATED", studentId: { not: attempt.studentId } },
      select: { studentId: true },
      distinct: ["studentId"],
    });
    let reviewerId: string | null = null;
    if (candidates.length) {
      const loads = await tx.reviewAssignment.groupBy({
        by: ["reviewerId"],
        where: { reviewerId: { in: candidates.map((c) => c.studentId) }, status: "PENDING" },
        _count: { _all: true },
      });
      const load = new Map(loads.map((l) => [l.reviewerId, l._count._all]));
      const sorted = [...candidates].sort((a, b) => (load.get(a.studentId) ?? 0) - (load.get(b.studentId) ?? 0) || a.studentId.localeCompare(b.studentId));
      reviewerId = sorted[0].studentId;
    }
    if (reviewerId) {
      await tx.reviewAssignment.upsert({
        where: { attemptId_reviewerId: { attemptId, reviewerId } },
        update: {},
        create: { attemptId, reviewerId, kind: "PEER" },
      });
      await tx.user.update({
        where: { id: attempt.studentId },
        data: { correctionPoints: { decrement: GAMIFICATION.correctionPoints.costPerReviewRequest } },
      });
      await tx.user.updateMany({ where: { id: attempt.studentId, correctionPoints: { lt: 0 } }, data: { correctionPoints: 0 } });
    } else if (!modes.has("TEACHER")) {
      // Nobody has validated it yet: the teacher covers the peer criteria.
      await tx.reviewAssignment.upsert({
        where: { attemptId_reviewerId: { attemptId, reviewerId: teacherId } },
        update: {},
        create: { attemptId, reviewerId: teacherId, kind: "PEER" },
      });
    } else {
      await tx.reviewAssignment.update({
        where: { attemptId_reviewerId: { attemptId, reviewerId: teacherId } },
        data: { kind: "TEACHER" },
      });
    }
  }
}

/** Criteria a reviewer is expected to score on an attempt. */
export async function criteriaForReviewer(tx: Tx, attemptId: string, reviewerId: string) {
  const assignment = await tx.reviewAssignment.findUnique({ where: { attemptId_reviewerId: { attemptId, reviewerId } } });
  const attempt = await tx.projectAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: { version: { include: { criteria: { orderBy: { orderIndex: "asc" } } } }, reviews: true, project: { include: { module: true } } },
  });
  const isTeacher = attempt.project.module.teacherId === reviewerId;
  // Teachers may score (spot-check) every human-graded criterion; peers only PEER ones.
  const criteria = attempt.version.criteria.filter((c) => {
    if (c.mode === "AUTO") return false;
    if (isTeacher) return true;
    return assignment?.kind === "PEER" && c.mode === "PEER";
  });
  return { attempt, assignment, criteria, isTeacher };
}

/**
 * Finalize an attempt when every criterion has a score. Awards XP once per
 * project and evaluates badges. Safe to call repeatedly.
 */
export async function finalizeAttempt(tx: Tx, attemptId: string): Promise<FinalizeResult> {
  const attempt = await tx.projectAttempt.findUniqueOrThrow({
    where: { id: attemptId },
    include: {
      version: { include: { criteria: true } },
      criterionScores: true,
      project: { select: { id: true, moduleId: true, isCore: true } },
    },
  });
  const none: FinalizeResult = { finalized: false, state: "UNDER_REVIEW", score: null, xpAwarded: 0, newlyUnlocked: [], newBadges: [] };
  if (attempt.state === "VALIDATED" || attempt.state === "FAILED") {
    return { ...none, finalized: true, state: attempt.state, score: attempt.score, xpAwarded: attempt.xpAwarded };
  }
  const scored = new Map(attempt.criterionScores.map((s) => [s.criterionId, s.score]));
  const missing = attempt.version.criteria.filter((c) => !scored.has(c.id));
  if (missing.length) {
    if (attempt.state === "SUBMITTED") await tx.projectAttempt.update({ where: { id: attemptId }, data: { state: "UNDER_REVIEW" } });
    return none;
  }

  const score = weightedScore(attempt.version.criteria, Object.fromEntries(scored));
  const validated = isValidated(score, attempt.version.threshold);
  const now = new Date();

  // Snapshot node states before validation to report newly unlocked nodes.
  const graph = validated ? await moduleGraph(tx, attempt.project.moduleId, attempt.studentId) : null;
  const before = graph ? computeNodeStates(graph.nodeIds, graph.edges, graph.summary) : null;

  let xpAwarded = 0;
  if (validated) {
    const failedBefore = await tx.projectAttempt.count({
      where: { projectId: attempt.projectId, studentId: attempt.studentId, state: "FAILED" },
    });
    const xp = xpForValidation({
      xpReward: attempt.version.xpReward,
      estimatedHours: attempt.version.estimatedHours,
      actualHours: attempt.actualHours,
      failedAttemptsBefore: failedBefore,
    });
    const awarded = await awardXp(tx, {
      userId: attempt.studentId,
      amount: xp.total,
      reason: "PROJECT_VALIDATED",
      projectId: attempt.projectId,
      moduleId: attempt.project.moduleId,
      attemptId,
      dedupeKey: validationDedupeKey(attempt.studentId, attempt.projectId),
    });
    xpAwarded = awarded ? xp.total : 0;
  }

  await tx.projectAttempt.update({
    where: { id: attemptId },
    data: { state: validated ? "VALIDATED" : "FAILED", score, reviewedAt: now, xpAwarded },
  });
  await tx.reviewAssignment.updateMany({ where: { attemptId, status: "PENDING" }, data: { status: "DONE", completedAt: now } });

  let newlyUnlocked: string[] = [];
  if (graph && before) {
    const after = computeNodeStates(graph.nodeIds, graph.edges, [
      ...graph.summary.filter((s) => s.projectId !== attempt.projectId),
      { projectId: attempt.projectId, state: "VALIDATED" },
    ]);
    newlyUnlocked = graph.nodeIds.filter((id) => before.get(id) === "locked" && after.get(id) === "available");
  }

  const newBadges = await evaluateBadges(tx, attempt.studentId);
  return { finalized: true, state: validated ? "VALIDATED" : "FAILED", score, xpAwarded, newlyUnlocked, newBadges };
}

/** Award any badge the student now qualifies for. Returns newly awarded codes. */
export async function evaluateBadges(tx: Tx, userId: string): Promise<string[]> {
  const [validated, peerReviews, user, modules] = await Promise.all([
    tx.projectAttempt.findMany({
      where: { studentId: userId, state: "VALIDATED" },
      include: { version: { select: { estimatedHours: true } }, project: { select: { id: true, isCore: true, moduleId: true } } },
    }),
    tx.reviewAssignment.count({ where: { reviewerId: userId, kind: "PEER", status: "DONE" } }),
    tx.user.findUniqueOrThrow({ where: { id: userId }, select: { totalXP: true } }),
    tx.module.findMany({
      where: { projects: { some: { attempts: { some: { studentId: userId, state: "VALIDATED" } } } } },
      select: { id: true, projects: { where: { status: "PUBLISHED", isCore: true }, select: { id: true } } },
    }),
  ]);
  const validatedIds = new Set(validated.map((a) => a.project.id));
  const ctx = {
    validatedCoreCount: validated.filter((a) => a.project.isCore).length,
    validatedElectiveCount: validated.filter((a) => !a.project.isCore).length,
    coreCompleteModules: modules.filter((m) => m.projects.length > 0 && m.projects.every((p) => validatedIds.has(p.id))).length,
    speedValidations: validated.filter((a) => a.actualHours != null && a.actualHours > 0 && a.actualHours < a.version.estimatedHours).length,
    peerReviewsDone: peerReviews,
    comebackValidations: validated.filter((a) => a.attemptNumber > 1).length,
    level: levelFromXp(user.totalXP),
  };
  const codes = earnedBadgeCodes(ctx);
  if (!codes.length) return [];
  const badges = await tx.badge.findMany({ where: { code: { in: codes } } });
  const have = new Set((await tx.userBadge.findMany({ where: { userId }, select: { badgeId: true } })).map((b) => b.badgeId));
  const fresh = badges.filter((b) => !have.has(b.id));
  if (fresh.length) await tx.userBadge.createMany({ data: fresh.map((b) => ({ userId, badgeId: b.id })) });
  return fresh.map((b) => b.code);
}

/** Record a completed peer review: XP + correction points, once per attempt. */
export async function rewardPeerReview(tx: Tx, reviewerId: string, attemptId: string) {
  const awarded = await awardXp(tx, {
    userId: reviewerId,
    amount: GAMIFICATION.xp.peerReviewXp,
    reason: "PEER_REVIEW",
    attemptId,
    dedupeKey: peerReviewDedupeKey(reviewerId, attemptId),
  });
  if (awarded) {
    await tx.user.update({ where: { id: reviewerId }, data: { correctionPoints: { increment: GAMIFICATION.correctionPoints.earnedPerPeerReview } } });
  }
  return awarded;
}

export function ensureBadgeCatalogue(tx: Tx) {
  return Promise.all(
    BADGES.map((b) => tx.badge.upsert({ where: { code: b.code }, update: { title: b.title, description: b.description, icon: b.icon }, create: b })),
  );
}

export { hoursBetween };
