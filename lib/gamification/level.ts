import { GAMIFICATION } from "./config";

const { base, exponent, max } = GAMIFICATION.level;

export function cumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0;
  return Math.round(base * Math.pow(level - 1, exponent));
}

export function levelFromXp(totalXp: number): number {
  const xp = Math.max(0, totalXp);
  let level = 1;
  while (level < max && xp >= cumulativeXpForLevel(level + 1)) level++;
  return level;
}

export type LevelInfo = {
  level: number;
  totalXp: number;
  currentLevelXp: number; // XP earned inside the current level
  xpToNextLevel: number; // remaining XP to level up
  nextLevelSpan: number; // total XP width of the current level
  progress: number; // 0..1
};

export function levelInfo(totalXp: number): LevelInfo {
  const level = levelFromXp(totalXp);
  const floor = cumulativeXpForLevel(level);
  const ceil = level >= max ? floor : cumulativeXpForLevel(level + 1);
  const span = Math.max(1, ceil - floor);
  const inLevel = Math.max(0, totalXp - floor);
  return {
    level,
    totalXp,
    currentLevelXp: inLevel,
    xpToNextLevel: level >= max ? 0 : Math.max(0, ceil - totalXp),
    nextLevelSpan: span,
    progress: level >= max ? 1 : Math.min(1, inLevel / span),
  };
}
