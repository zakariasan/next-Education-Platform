import { describe, expect, it } from "vitest";
import { cumulativeXpForLevel, levelFromXp, levelInfo } from "../level";
import { GAMIFICATION } from "../config";

describe("level curve", () => {
  it("level 1 costs nothing and later levels cost increasingly more", () => {
    expect(cumulativeXpForLevel(1)).toBe(0);
    const steps = [2, 3, 4, 5, 10, 20].map(
      (l) => cumulativeXpForLevel(l) - cumulativeXpForLevel(l - 1),
    );
    for (let i = 1; i < steps.length; i++) expect(steps[i]).toBeGreaterThan(steps[i - 1]);
  });

  it("matches the configured formula", () => {
    const { base, exponent } = GAMIFICATION.level;
    expect(cumulativeXpForLevel(2)).toBe(Math.round(base * Math.pow(1, exponent)));
    expect(cumulativeXpForLevel(10)).toBe(Math.round(base * Math.pow(9, exponent)));
  });

  it("levelFromXp is the inverse of cumulativeXpForLevel", () => {
    expect(levelFromXp(0)).toBe(1);
    expect(levelFromXp(99)).toBe(1);
    expect(levelFromXp(100)).toBe(2);
    expect(levelFromXp(cumulativeXpForLevel(7))).toBe(7);
    expect(levelFromXp(cumulativeXpForLevel(7) - 1)).toBe(6);
  });

  it("exposes XP to next level", () => {
    const info = levelInfo(150);
    expect(info.level).toBe(2);
    expect(info.xpToNextLevel).toBe(cumulativeXpForLevel(3) - 150);
    expect(info.progress).toBeGreaterThan(0);
    expect(info.progress).toBeLessThan(1);
  });

  it("caps at max level", () => {
    const info = levelInfo(10_000_000);
    expect(info.level).toBe(GAMIFICATION.level.max);
    expect(info.xpToNextLevel).toBe(0);
    expect(info.progress).toBe(1);
  });
});
