export type AutoConfig =
  | { type: "NUMERIC"; answer: number; tolerance: number; unit?: string }
  | { type: "MCQ"; choices: string[]; correctIndexes: number[] }
  | { type: "UNIT"; expectedUnit: string };

const UNIT_ALIASES: Record<string, string> = {
  "m/s": "m·s⁻¹",
  "m.s-1": "m·s⁻¹",
  "m s^-1": "m·s⁻¹",
  "m/s^2": "m·s⁻²",
  "m/s²": "m·s⁻²",
  "m.s-2": "m·s⁻²",
  "kg.m/s": "kg·m·s⁻¹",
  "kg·m/s": "kg·m·s⁻¹",
  "n": "N",
  "j": "J",
  "w": "W",
  "hz": "Hz",
  "pa": "Pa",
};

export function normalizeUnit(u: string): string {
  const t = u.trim().replace(/\s+/g, " ");
  const lower = t.toLowerCase();
  return UNIT_ALIASES[lower] ?? UNIT_ALIASES[t] ?? t;
}

/** Returns a score 0..100 for one AUTO criterion, or null if the answer is unreadable. */
export function autoGrade(config: AutoConfig, answer: unknown): number {
  switch (config.type) {
    case "NUMERIC": {
      const raw = typeof answer === "object" && answer !== null ? (answer as { value?: unknown }).value : answer;
      const n = typeof raw === "number" ? raw : parseFloat(String(raw ?? ""));
      if (!Number.isFinite(n)) return 0;
      const ok = Math.abs(n - config.answer) <= Math.abs(config.tolerance);
      if (!ok) return 0;
      if (config.unit) {
        const u = typeof answer === "object" && answer !== null ? (answer as { unit?: unknown }).unit : undefined;
        if (typeof u === "string" && normalizeUnit(u) !== normalizeUnit(config.unit)) return 50;
      }
      return 100;
    }
    case "MCQ": {
      const picked = Array.isArray(answer)
        ? answer.map(Number).filter(Number.isFinite)
        : typeof answer === "number"
          ? [answer]
          : [];
      const correct = new Set(config.correctIndexes);
      const chosen = new Set(picked);
      if (chosen.size === 0) return 0;
      let hits = 0;
      for (const c of correct) if (chosen.has(c)) hits++;
      const wrong = [...chosen].filter((c) => !correct.has(c)).length;
      const score = ((hits - wrong) / Math.max(1, correct.size)) * 100;
      return Math.max(0, Math.min(100, Math.round(score)));
    }
    case "UNIT": {
      if (typeof answer !== "string") return 0;
      return normalizeUnit(answer) === normalizeUnit(config.expectedUnit) ? 100 : 0;
    }
    default:
      return 0;
  }
}
