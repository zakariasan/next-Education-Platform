import type { AutoConfig } from "./autograde";
import { GAMIFICATION } from "./config";
import type { CriterionInput, ProjectContentInput } from "./types";

export type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string };

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

export function parseAutoConfig(raw: unknown): AutoConfig | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  switch (r.type) {
    case "NUMERIC": {
      const answer = Number(r.answer);
      const tolerance = Number(r.tolerance ?? 0);
      if (!Number.isFinite(answer) || !Number.isFinite(tolerance) || tolerance < 0) return null;
      return { type: "NUMERIC", answer, tolerance, unit: typeof r.unit === "string" && r.unit.trim() ? r.unit.trim() : undefined };
    }
    case "MCQ": {
      if (!isStringArray(r.choices) || r.choices.length < 2) return null;
      const correct = Array.isArray(r.correctIndexes) ? r.correctIndexes.map(Number) : [];
      if (!correct.length || correct.some((i) => !Number.isInteger(i) || i < 0 || i >= (r.choices as string[]).length)) return null;
      return { type: "MCQ", choices: r.choices, correctIndexes: [...new Set(correct)] };
    }
    case "UNIT": {
      if (typeof r.expectedUnit !== "string" || !r.expectedUnit.trim()) return null;
      return { type: "UNIT", expectedUnit: r.expectedUnit.trim() };
    }
    case "QUIZ": {
      if (typeof r.quizId !== "string" || !r.quizId) return null;
      const minPercent = r.minPercent == null || r.minPercent === "" ? undefined : Number(r.minPercent);
      if (minPercent != null && (!Number.isFinite(minPercent) || minPercent < 0 || minPercent > 100)) return null;
      return { type: "QUIZ", quizId: r.quizId, minPercent };
    }
    default:
      return null;
  }
}

export function validateCriteria(raw: unknown): ValidationResult<CriterionInput[]> {
  if (!Array.isArray(raw) || raw.length === 0) return { ok: false, error: "At least one rubric criterion is required" };
  const out: CriterionInput[] = [];
  for (const [i, c] of raw.entries()) {
    if (!c || typeof c !== "object") return { ok: false, error: `Criterion ${i + 1} is invalid` };
    const r = c as Record<string, unknown>;
    const title = String(r.title ?? "").trim();
    if (!title) return { ok: false, error: `Criterion ${i + 1} needs a title` };
    const weight = Number(r.weight);
    if (!Number.isFinite(weight) || weight <= 0) return { ok: false, error: `"${title}" needs a positive weight` };
    const mode = r.mode;
    if (mode !== "AUTO" && mode !== "TEACHER" && mode !== "PEER") return { ok: false, error: `"${title}" has an invalid evaluation mode` };
    let autoConfig: AutoConfig | null = null;
    if (mode === "AUTO") {
      autoConfig = parseAutoConfig(r.autoConfig);
      if (!autoConfig) return { ok: false, error: `"${title}" is auto-graded but has no valid answer config` };
    }
    out.push({
      id: typeof r.id === "string" ? r.id : undefined,
      title,
      description: typeof r.description === "string" && r.description.trim() ? r.description.trim() : null,
      weight: Math.round(weight),
      mode,
      autoConfig,
    });
  }
  return { ok: true, value: out };
}

export function validateProjectContent(raw: unknown): ValidationResult<ProjectContentInput> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Missing project content" };
  const r = raw as Record<string, unknown>;
  const title = String(r.title ?? "").trim();
  if (!title) return { ok: false, error: "Title is required" };
  const statement = String(r.statement ?? "").trim();
  if (!statement) return { ok: false, error: "Statement is required" };
  const estimatedHours = Number(r.estimatedHours);
  if (!Number.isFinite(estimatedHours) || estimatedHours <= 0) return { ok: false, error: "Estimated hours must be > 0" };
  const xpReward = Number(r.xpReward);
  if (!Number.isInteger(xpReward) || xpReward < 0) return { ok: false, error: "XP reward must be a non-negative integer" };
  const threshold = r.threshold == null ? GAMIFICATION.validation.defaultThresholdPercent : Number(r.threshold);
  if (!Number.isFinite(threshold) || threshold < 1 || threshold > 100) return { ok: false, error: "Threshold must be between 1 and 100" };
  const objectives = isStringArray(r.objectives) ? r.objectives.map((s) => s.trim()).filter(Boolean) : [];
  const allowedResources = isStringArray(r.allowedResources) ? r.allowedResources.map((s) => s.trim()).filter(Boolean) : [];
  const criteria = validateCriteria(r.criteria);
  if (!criteria.ok) return criteria;
  return {
    ok: true,
    value: { title, statement, objectives, estimatedHours, xpReward, allowedResources, threshold: Math.round(threshold), criteria: criteria.value },
  };
}
