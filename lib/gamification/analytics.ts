// Teacher module dashboard: per-project attempts, validation rate, actual vs
// estimated hours (with recalibration flags) and the criteria students fail most.
import { prisma } from "@/lib/prisma";

export const HOURS_FLAG_RATIO = 0.3; // flag when |actual − estimate| exceeds 30 % of the estimate

export type CriterionStat = { id: string; title: string; mode: string; avgScore: number; failRate: number; samples: number };

export type ProjectAnalytics = {
  id: string;
  title: string;
  isCore: boolean;
  status: string;
  estimatedHours: number;
  xpReward: number;
  students: number;
  attempts: number;
  validated: number;
  failed: number;
  pending: number;
  validationRate: number | null;
  avgActualHours: number | null;
  hoursRatio: number | null;
  hoursFlag: "over" | "under" | null;
  avgScore: number | null;
  hardestCriteria: CriterionStat[];
};

export type ModuleAnalytics = {
  studentsEngaged: number;
  studentsCoreComplete: number;
  totalAttempts: number;
  totalValidated: number;
  pendingReviews: number;
  flagged: number;
  projects: ProjectAnalytics[];
};

export async function moduleAnalytics(moduleId: string): Promise<ModuleAnalytics> {
  const projects = await prisma.project.findMany({
    where: { moduleId, status: { not: "ARCHIVED" } },
    orderBy: { orderIndex: "asc" },
    include: {
      currentVersion: { select: { title: true, estimatedHours: true, xpReward: true } },
      attempts: {
        include: {
          criterionScores: { include: { criterion: { select: { id: true, title: true, mode: true } } } },
        },
      },
    },
  });

  const engaged = new Set<string>();
  const validatedByStudent = new Map<string, Set<string>>();
  let totalAttempts = 0;
  let totalValidated = 0;
  let pendingReviews = 0;

  const out: ProjectAnalytics[] = projects.map((p) => {
    const attempts = p.attempts;
    const students = new Set(attempts.map((a) => a.studentId));
    for (const s of students) engaged.add(s);
    const validated = attempts.filter((a) => a.state === "VALIDATED");
    const failed = attempts.filter((a) => a.state === "FAILED");
    const pending = attempts.filter((a) => a.state === "SUBMITTED" || a.state === "UNDER_REVIEW");
    for (const a of validated) {
      if (!validatedByStudent.has(a.studentId)) validatedByStudent.set(a.studentId, new Set());
      validatedByStudent.get(a.studentId)!.add(p.id);
    }
    totalAttempts += attempts.length;
    totalValidated += validated.length;
    pendingReviews += pending.length;

    const finished = [...validated, ...failed];
    const hours = finished.map((a) => a.actualHours).filter((h): h is number => h != null && h > 0);
    const avgActualHours = hours.length ? Math.round((hours.reduce((s, h) => s + h, 0) / hours.length) * 10) / 10 : null;
    const est = p.currentVersion?.estimatedHours ?? 0;
    const hoursRatio = avgActualHours != null && est > 0 ? Math.round((avgActualHours / est) * 100) / 100 : null;
    let hoursFlag: ProjectAnalytics["hoursFlag"] = null;
    if (hoursRatio != null && hours.length >= 2) {
      if (hoursRatio > 1 + HOURS_FLAG_RATIO) hoursFlag = "over";
      else if (hoursRatio < 1 - HOURS_FLAG_RATIO) hoursFlag = "under";
    }
    const scores = finished.map((a) => a.score).filter((s): s is number => s != null);
    const avgScore = scores.length ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : null;

    const crit = new Map<string, { title: string; mode: string; sum: number; n: number; fails: number }>();
    for (const a of finished) {
      for (const cs of a.criterionScores) {
        const c = crit.get(cs.criterionId) ?? { title: cs.criterion.title, mode: cs.criterion.mode, sum: 0, n: 0, fails: 0 };
        c.sum += cs.score;
        c.n += 1;
        if (cs.score < 50) c.fails += 1;
        crit.set(cs.criterionId, c);
      }
    }
    const hardestCriteria: CriterionStat[] = [...crit.entries()]
      .map(([id, c]) => ({ id, title: c.title, mode: c.mode, avgScore: Math.round(c.sum / c.n), failRate: Math.round((c.fails / c.n) * 100), samples: c.n }))
      .sort((a, b) => b.failRate - a.failRate || a.avgScore - b.avgScore)
      .slice(0, 3);

    return {
      id: p.id,
      title: p.currentVersion?.title ?? "Untitled",
      isCore: p.isCore,
      status: p.status,
      estimatedHours: est,
      xpReward: p.currentVersion?.xpReward ?? 0,
      students: students.size,
      attempts: attempts.length,
      validated: validated.length,
      failed: failed.length,
      pending: pending.length,
      validationRate: finished.length ? Math.round((validated.length / finished.length) * 100) : null,
      avgActualHours,
      hoursRatio,
      hoursFlag,
      avgScore,
      hardestCriteria,
    };
  });

  const coreIds = projects.filter((p) => p.isCore && p.status === "PUBLISHED").map((p) => p.id);
  const studentsCoreComplete = coreIds.length ? [...validatedByStudent.values()].filter((set) => coreIds.every((id) => set.has(id))).length : 0;

  return {
    studentsEngaged: engaged.size,
    studentsCoreComplete,
    totalAttempts,
    totalValidated,
    pendingReviews,
    flagged: out.filter((p) => p.hoursFlag).length,
    projects: out,
  };
}
