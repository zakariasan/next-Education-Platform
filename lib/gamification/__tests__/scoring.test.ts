import { describe, expect, it } from "vitest";
import { canRetry, isValidated, retryAvailableAt, weightedScore, xpForValidation } from "../scoring";
import { GAMIFICATION } from "../config";
import { autoGrade } from "../autograde";

describe("validation threshold", () => {
  const criteria = [
    { id: "c1", weight: 50 },
    { id: "c2", weight: 30 },
    { id: "c3", weight: 20 },
  ];

  it("computes a weighted percentage", () => {
    expect(weightedScore(criteria, { c1: 100, c2: 100, c3: 100 })).toBe(100);
    expect(weightedScore(criteria, { c1: 100, c2: 0, c3: 0 })).toBe(50);
    expect(weightedScore(criteria, { c1: 80, c2: 50, c3: 100 })).toBe(75);
  });

  it("treats missing scores as zero", () => {
    expect(weightedScore(criteria, { c1: 100 })).toBe(50);
  });

  it("validates at or above the threshold only", () => {
    expect(isValidated(70, 70)).toBe(true);
    expect(isValidated(69.99, 70)).toBe(false);
  });
});

describe("xp rules", () => {
  it("adds a speed bonus when under the estimate", () => {
    const xp = xpForValidation({ xpReward: 200, estimatedHours: 5, actualHours: 3, failedAttemptsBefore: 0 });
    expect(xp.speedBonus).toBe(Math.round((200 * GAMIFICATION.xp.speedBonusPercent) / 100));
    expect(xp.total).toBe(200 + xp.speedBonus);
  });

  it("gives no bonus at or over the estimate", () => {
    expect(xpForValidation({ xpReward: 200, estimatedHours: 5, actualHours: 5, failedAttemptsBefore: 0 }).speedBonus).toBe(0);
    expect(xpForValidation({ xpReward: 200, estimatedHours: 5, actualHours: null, failedAttemptsBefore: 0 }).speedBonus).toBe(0);
  });

  it("applies a small, capped retry penalty", () => {
    const one = xpForValidation({ xpReward: 200, estimatedHours: 5, actualHours: 6, failedAttemptsBefore: 1 });
    expect(one.retryPenalty).toBe(Math.round((200 * GAMIFICATION.xp.retryPenaltyPercent) / 100));
    const many = xpForValidation({ xpReward: 200, estimatedHours: 5, actualHours: 6, failedAttemptsBefore: 50 });
    expect(many.retryPenalty).toBe(Math.round((200 * GAMIFICATION.xp.retryPenaltyCapPercent) / 100));
    expect(many.total).toBeGreaterThan(0);
  });
});

describe("retry rules", () => {
  it("allows retry after the cooldown, never permanently locks", () => {
    const failedAt = new Date("2026-01-01T00:00:00Z");
    const soon = new Date(failedAt.getTime() + 60_000);
    expect(canRetry(failedAt, soon)).toBe(false);
    expect(canRetry(failedAt, retryAvailableAt(failedAt))).toBe(true);
    expect(canRetry(null)).toBe(true);
    expect(retryAvailableAt(failedAt).getTime() - failedAt.getTime()).toBe(
      GAMIFICATION.retry.cooldownHours * 3600_000,
    );
  });
});

describe("auto grading", () => {
  it("grades numeric answers with tolerance and unit check", () => {
    const cfg = { type: "NUMERIC" as const, answer: 9.81, tolerance: 0.05, unit: "m/s²" };
    expect(autoGrade(cfg, { value: 9.8, unit: "m/s^2" })).toBe(100);
    expect(autoGrade(cfg, { value: 9.8, unit: "N" })).toBe(50);
    expect(autoGrade(cfg, { value: 10.5 })).toBe(0);
    expect(autoGrade(cfg, "abc")).toBe(0);
  });

  it("grades MCQ with partial credit and wrong-pick penalty", () => {
    const cfg = { type: "MCQ" as const, choices: ["a", "b", "c", "d"], correctIndexes: [0, 2] };
    expect(autoGrade(cfg, [0, 2])).toBe(100);
    expect(autoGrade(cfg, [0])).toBe(50);
    expect(autoGrade(cfg, [0, 1])).toBe(0);
    expect(autoGrade(cfg, [])).toBe(0);
  });

  it("normalizes units", () => {
    const cfg = { type: "UNIT" as const, expectedUnit: "m/s" };
    expect(autoGrade(cfg, "m.s-1")).toBe(100);
    expect(autoGrade(cfg, "km/h")).toBe(0);
  });
});
