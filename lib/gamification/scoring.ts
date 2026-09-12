import { GAMIFICATION } from "./config";

export type CriterionLike = { id: string; weight: number };

/** Weighted percentage 0..100. Missing scores count as 0. */
export function weightedScore(
  criteria: CriterionLike[],
  scores: Record<string, number | undefined>,
): number {
  const totalWeight = criteria.reduce((s, c) => s + c.weight, 0);
  if (totalWeight <= 0) return 0;
  const sum = criteria.reduce(
    (s, c) => s + (Math.min(100, Math.max(0, scores[c.id] ?? 0)) * c.weight),
    0,
  );
  return Math.round((sum / totalWeight) * 100) / 100;
}

export function isValidated(score: number, threshold: number): boolean {
  return score >= threshold;
}

export type XpBreakdown = {
  base: number;
  speedBonus: number;
  retryPenalty: number;
  total: number;
};

export function xpForValidation(args: {
  xpReward: number;
  estimatedHours: number;
  actualHours: number | null | undefined;
  failedAttemptsBefore: number;
}): XpBreakdown {
  const { speedBonusPercent, retryPenaltyPercent, retryPenaltyCapPercent } =
    GAMIFICATION.xp;
  const base = args.xpReward;
  const underEstimate =
    args.actualHours != null && args.actualHours > 0 && args.actualHours < args.estimatedHours;
  const speedBonus = underEstimate ? Math.round((base * speedBonusPercent) / 100) : 0;
  const penaltyPct = Math.min(
    retryPenaltyCapPercent,
    retryPenaltyPercent * Math.max(0, args.failedAttemptsBefore),
  );
  const retryPenalty = Math.round((base * penaltyPct) / 100);
  return { base, speedBonus, retryPenalty, total: Math.max(0, base + speedBonus - retryPenalty) };
}

/** Retry allowed once the cooldown since the last failure has elapsed. Never a permanent lock. */
export function retryAvailableAt(lastFailedAt: Date): Date {
  return new Date(lastFailedAt.getTime() + GAMIFICATION.retry.cooldownHours * 3600_000);
}

export function canRetry(lastFailedAt: Date | null | undefined, now = new Date()): boolean {
  if (!lastFailedAt) return true;
  return now.getTime() >= retryAvailableAt(lastFailedAt).getTime();
}

export function hoursBetween(start: Date, end: Date): number {
  return Math.round(((end.getTime() - start.getTime()) / 3600_000) * 100) / 100;
}
