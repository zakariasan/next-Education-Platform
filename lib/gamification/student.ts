// Student-facing read models: progress summary, sanitized project panel data.
import { prisma } from "@/lib/prisma";
import type { AutoConfig } from "./autograde";
import { levelInfo, type LevelInfo } from "./level";
import { canRetry, retryAvailableAt } from "./scoring";
import type { AttemptState, CriterionMode } from "./types";

export type BadgeDTO = { code: string; title: string; description: string; icon: string; awardedAt: string | null };

export type ProgressSummary = {
  level: LevelInfo;
  correctionPoints: number;
  badges: BadgeDTO[];
  moduleXp?: number;
  coreTotal?: number;
  coreValidated?: number;
  coreCompletion?: number;
};

export async function progressSummary(studentId: string, moduleId?: string): Promise<ProgressSummary> {
  const [user, allBadges, mine] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: studentId }, select: { totalXP: true, correctionPoints: true } }),
    prisma.badge.findMany({ orderBy: { code: "asc" } }),
    prisma.userBadge.findMany({ where: { userId: studentId } }),
  ]);
  const awarded = new Map(mine.map((b) => [b.badgeId, b.awardedAt]));
  const out: ProgressSummary = {
    level: levelInfo(user.totalXP),
    correctionPoints: user.correctionPoints,
    badges: allBadges.map((b) => ({ code: b.code, title: b.title, description: b.description, icon: b.icon, awardedAt: awarded.get(b.id)?.toISOString() ?? null })),
  };
  if (moduleId) {
    const [xp, core, validated] = await Promise.all([
      prisma.xpEvent.aggregate({ where: { userId: studentId, moduleId }, _sum: { amount: true } }),
      prisma.project.findMany({ where: { moduleId, status: "PUBLISHED", isCore: true }, select: { id: true } }),
      prisma.projectAttempt.findMany({ where: { studentId, state: "VALIDATED", project: { moduleId, isCore: true, status: "PUBLISHED" } }, select: { projectId: true }, distinct: ["projectId"] }),
    ]);
    out.moduleXp = xp._sum.amount ?? 0;
    out.coreTotal = core.length;
    out.coreValidated = validated.length;
    out.coreCompletion = core.length ? Math.round((validated.length / core.length) * 100) : 0;
  }
  return out;
}

/** Auto-grading config with the answers stripped out. */
export function publicAutoConfig(cfg: AutoConfig | null): Record<string, unknown> | null {
  if (!cfg) return null;
  switch (cfg.type) {
    case "NUMERIC":
      return { type: "NUMERIC", unit: cfg.unit ?? null };
    case "MCQ":
      return { type: "MCQ", choices: cfg.choices, multiple: cfg.correctIndexes.length > 1 };
    case "UNIT":
      return { type: "UNIT" };
    case "QUIZ":
      return { type: "QUIZ", quizId: cfg.quizId, minPercent: cfg.minPercent ?? null };
  }
}

export type LinkedQuiz = { id: string; title: string; questionCount: number; xpReward: number; percent: number | null; required: boolean };

export type StudentCriterion = {
  id: string;
  title: string;
  description: string | null;
  weight: number;
  mode: CriterionMode;
  input: Record<string, unknown> | null;
  score: number | null;
  comment: string | null;
};

export type StudentProjectPanel = {
  id: string;
  moduleId: string;
  moduleTitle: string;
  title: string;
  isCore: boolean;
  statement: string;
  objectives: string[];
  allowedResources: string[];
  estimatedHours: number;
  xpReward: number;
  threshold: number;
  versionNumber: number;
  prerequisites: { id: string; title: string; validated: boolean }[];
  state: "locked" | "available" | "in_progress" | "validated" | "failed";
  attempt: {
    id: string;
    state: AttemptState;
    attemptNumber: number;
    startedAt: string | null;
    submittedAt: string | null;
    reviewedAt: string | null;
    actualHours: number | null;
    score: number | null;
    feedback: string | null;
    xpAwarded: number;
    answers: Record<string, unknown>;
    pendingReviews: { kind: "TEACHER" | "PEER"; status: "PENDING" | "DONE" }[];
  } | null;
  criteria: StudentCriterion[];
  quizzes: LinkedQuiz[];
  retry: { allowed: boolean; availableAt: string | null; failedAttempts: number };
};

export async function studentProjectPanel(studentId: string, projectId: string): Promise<StudentProjectPanel | null> {
  const project = await prisma.project.findFirst({
    where: { id: projectId, status: "PUBLISHED" },
    include: {
      module: { select: { id: true, title: true } },
      currentVersion: { include: { criteria: { orderBy: { orderIndex: "asc" } } } },
      prerequisites: { select: { id: true, currentVersion: { select: { title: true } } } },
    },
  });
  if (!project?.currentVersion) return null;
  const v = project.currentVersion;

  const attempts = await prisma.projectAttempt.findMany({
    where: { studentId, projectId },
    orderBy: { attemptNumber: "desc" },
    include: { criterionScores: true, reviews: { select: { kind: true, status: true } } },
  });
  const latest = attempts[0] ?? null;
  const validatedAttempt = attempts.find((a) => a.state === "VALIDATED") ?? null;
  const current = validatedAttempt ?? latest;

  const prereqValidated = new Set(
    (
      await prisma.projectAttempt.findMany({
        where: { studentId, state: "VALIDATED", projectId: { in: project.prerequisites.map((p) => p.id) } },
        select: { projectId: true },
      })
    ).map((a) => a.projectId),
  );
  const unlocked = project.prerequisites.every((p) => prereqValidated.has(p.id));

  let state: StudentProjectPanel["state"];
  if (validatedAttempt) state = "validated";
  else if (!unlocked) state = "locked";
  else if (!latest || latest.state === "NOT_STARTED") state = "available";
  else if (latest.state === "FAILED") state = "failed";
  else state = "in_progress";

  const scores = new Map((current?.criterionScores ?? []).map((s) => [s.criterionId, s]));
  // Criterion scores are only shown once the attempt is finalized.
  const showScores = current?.state === "VALIDATED" || current?.state === "FAILED";
  const failed = attempts.filter((a) => a.state === "FAILED");
  const lastFailedAt = latest?.state === "FAILED" ? latest.reviewedAt : null;

  // Quizzes attached to this project or required by a QUIZ criterion.
  const requiredQuizIds = v.criteria
    .map((c) => c.autoConfig as AutoConfig | null)
    .filter((c): c is Extract<AutoConfig, { type: "QUIZ" }> => c?.type === "QUIZ")
    .map((c) => c.quizId);
  const linkedQuizzes = await prisma.quiz.findMany({
    where: { status: "PUBLISHED", OR: [{ projectId: project.id }, { id: { in: requiredQuizIds } }] },
    select: { id: true, title: true, xpReward: true, _count: { select: { questions: true } }, attempts: { where: { studentId }, select: { percent: true } } },
  });

  return {
    id: project.id,
    moduleId: project.module.id,
    moduleTitle: project.module.title,
    title: v.title,
    isCore: project.isCore,
    statement: v.statement,
    objectives: (v.objectives as string[]) ?? [],
    allowedResources: (v.allowedResources as string[]) ?? [],
    estimatedHours: v.estimatedHours,
    xpReward: v.xpReward,
    threshold: v.threshold,
    versionNumber: v.versionNumber,
    prerequisites: project.prerequisites.map((p) => ({ id: p.id, title: p.currentVersion?.title ?? "Untitled", validated: prereqValidated.has(p.id) })),
    state,
    attempt: current
      ? {
          id: current.id,
          state: current.state,
          attemptNumber: current.attemptNumber,
          startedAt: current.startedAt?.toISOString() ?? null,
          submittedAt: current.submittedAt?.toISOString() ?? null,
          reviewedAt: current.reviewedAt?.toISOString() ?? null,
          actualHours: current.actualHours,
          score: showScores ? current.score : null,
          feedback: showScores ? current.feedback : null,
          xpAwarded: current.xpAwarded,
          answers: (current.answers as Record<string, unknown> | null) ?? {},
          pendingReviews: current.reviews,
        }
      : null,
    criteria: v.criteria.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      weight: c.weight,
      mode: c.mode,
      input: publicAutoConfig((c.autoConfig as AutoConfig | null) ?? null),
      score: showScores ? (scores.get(c.id)?.score ?? null) : null,
      comment: showScores ? (scores.get(c.id)?.comment ?? null) : null,
    })),
    quizzes: linkedQuizzes.map((q) => ({
      id: q.id,
      title: q.title,
      questionCount: q._count.questions,
      xpReward: q.xpReward,
      percent: q.attempts[0]?.percent ?? null,
      required: requiredQuizIds.includes(q.id),
    })),
    retry: {
      allowed: state === "failed" ? canRetry(lastFailedAt) : false,
      availableAt: lastFailedAt ? retryAvailableAt(lastFailedAt).toISOString() : null,
      failedAttempts: failed.length,
    },
  };
}
