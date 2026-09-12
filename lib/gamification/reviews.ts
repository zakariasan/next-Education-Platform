// Review queue read model + grading, shared by teacher and peer routes.
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { criteriaForReviewer, evaluateBadges, finalizeAttempt, rewardPeerReview, type FinalizeResult } from "./pipeline";
import type { CriterionMode } from "./types";

const queueInclude = {
  attempt: {
    include: {
      student: { select: { id: true, name: true, avatar: true } },
      version: { select: { title: true, versionNumber: true, estimatedHours: true, xpReward: true, threshold: true } },
      project: { select: { id: true, isCore: true, module: { select: { id: true, title: true, teacherId: true } } } },
    },
  },
} satisfies Prisma.ReviewAssignmentInclude;

export type QueueItem = {
  assignmentId: string;
  kind: "TEACHER" | "PEER";
  status: "PENDING" | "DONE";
  createdAt: string;
  attempt: {
    id: string;
    attemptNumber: number;
    submittedAt: string | null;
    actualHours: number | null;
    state: string;
    score: number | null;
    student: { id: string; name: string; avatar: string | null };
    projectId: string;
    projectTitle: string;
    isCore: boolean;
    estimatedHours: number;
    xpReward: number;
    threshold: number;
    moduleId: string;
    moduleTitle: string;
  };
};

export async function reviewQueue(where: Prisma.ReviewAssignmentWhereInput): Promise<QueueItem[]> {
  const rows = await prisma.reviewAssignment.findMany({ where, include: queueInclude, orderBy: [{ status: "asc" }, { createdAt: "asc" }] });
  return rows.map((r) => ({
    assignmentId: r.id,
    kind: r.kind,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
    attempt: {
      id: r.attempt.id,
      attemptNumber: r.attempt.attemptNumber,
      submittedAt: r.attempt.submittedAt?.toISOString() ?? null,
      actualHours: r.attempt.actualHours,
      state: r.attempt.state,
      score: r.attempt.score,
      student: r.attempt.student,
      projectId: r.attempt.project.id,
      projectTitle: r.attempt.version.title,
      isCore: r.attempt.project.isCore,
      estimatedHours: r.attempt.version.estimatedHours,
      xpReward: r.attempt.version.xpReward,
      threshold: r.attempt.version.threshold,
      moduleId: r.attempt.project.module.id,
      moduleTitle: r.attempt.project.module.title,
    },
  }));
}

export type ReviewDetail = QueueItem & {
  statement: string;
  answers: Record<string, unknown>;
  criteria: {
    id: string;
    title: string;
    description: string | null;
    weight: number;
    mode: CriterionMode;
    autoConfig: unknown;
    score: number | null;
    comment: string | null;
    graderId: string | null;
    gradable: boolean;
  }[];
};

export async function reviewDetail(assignmentId: string, reviewerId: string): Promise<ReviewDetail | null> {
  const row = await prisma.reviewAssignment.findFirst({ where: { id: assignmentId, reviewerId }, include: queueInclude });
  if (!row) return null;
  const [item] = await reviewQueue({ id: assignmentId });
  const { attempt, criteria, isTeacher } = await criteriaForReviewer(prisma, row.attemptId, reviewerId);
  const gradable = new Set(criteria.map((c) => c.id));
  const scores = await prisma.criterionScore.findMany({ where: { attemptId: attempt.id } });
  const byId = new Map(scores.map((s) => [s.criterionId, s]));
  return {
    ...item,
    statement: attempt.version.statement,
    answers: (attempt.answers as Record<string, unknown> | null) ?? {},
    criteria: attempt.version.criteria.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      weight: c.weight,
      mode: c.mode,
      autoConfig: isTeacher ? c.autoConfig : null,
      score: byId.get(c.id)?.score ?? null,
      comment: byId.get(c.id)?.comment ?? null,
      graderId: byId.get(c.id)?.graderId ?? null,
      gradable: gradable.has(c.id),
    })),
  };
}

export type GradeInput = { scores: Record<string, { score: number; comment?: string }>; feedback?: string };

export async function submitReview(
  assignmentId: string,
  reviewerId: string,
  input: GradeInput,
): Promise<{ result: FinalizeResult; reviewerBadges: string[] } | { error: string }> {
  const row = await prisma.reviewAssignment.findFirst({ where: { id: assignmentId, reviewerId } });
  if (!row) return { error: "Review not found" };

  return prisma.$transaction(async (tx) => {
    const { attempt, criteria, isTeacher } = await criteriaForReviewer(tx, row.attemptId, reviewerId);
    if (attempt.state === "VALIDATED" || attempt.state === "FAILED") return { error: "This attempt is already finalized" };
    const gradable = new Map(criteria.map((c) => [c.id, c]));
    let wrote = 0;
    for (const [criterionId, s] of Object.entries(input.scores ?? {})) {
      const c = gradable.get(criterionId);
      if (!c) continue;
      const score = Math.max(0, Math.min(100, Number(s.score)));
      if (!Number.isFinite(score)) continue;
      const spot = isTeacher && c.mode === "PEER";
      await tx.criterionScore.upsert({
        where: { attemptId_criterionId: { attemptId: attempt.id, criterionId } },
        update: { score, comment: s.comment ?? null, graderId: reviewerId, mode: c.mode, spotChecked: spot },
        create: { attemptId: attempt.id, criterionId, score, comment: s.comment ?? null, graderId: reviewerId, mode: c.mode, spotChecked: spot },
      });
      wrote++;
    }
    if (!wrote) return { error: "No gradable criteria were scored" };

    const now = new Date();
    await tx.reviewAssignment.update({ where: { id: row.id }, data: { status: "DONE", completedAt: now } });
    if (typeof input.feedback === "string" && input.feedback.trim()) {
      await tx.projectAttempt.update({ where: { id: attempt.id }, data: { feedback: input.feedback.trim(), reviewerId } });
    } else if (isTeacher) {
      await tx.projectAttempt.update({ where: { id: attempt.id }, data: { reviewerId } });
    }
    let reviewerBadges: string[] = [];
    if (row.kind === "PEER" && !isTeacher) {
      await rewardPeerReview(tx, reviewerId, attempt.id);
      reviewerBadges = await evaluateBadges(tx, reviewerId);
    }

    const result = await finalizeAttempt(tx, attempt.id);
    return { result, reviewerBadges };
  });
}
