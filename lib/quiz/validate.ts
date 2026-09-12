import type { QuestionType } from "./grade";

export type QuestionInput = {
  id?: string;
  type: QuestionType;
  text: string;
  imageUrl: string | null;
  points: number;
  required: boolean;
  options: string[];
  correctIndexes: number[];
  correctText: string | null;
  correctNumber: number | null;
  tolerance: number | null;
};

export type QuizInput = {
  title: string;
  description: string | null;
  lessonId: string | null;
  moduleId: string | null;
  projectId: string | null;
  dueDate: Date | null;
  duration: number | null;
  xpReward: number;
  showAnswers: boolean;
  questions: QuestionInput[];
};

type R<T> = { ok: true; value: T } | { ok: false; error: string };

const TYPES: QuestionType[] = ["MULTIPLE_CHOICE", "CHECKBOXES", "TRUE_FALSE", "SHORT_ANSWER", "NUMERIC"];

export function validateQuiz(raw: unknown): R<QuizInput> {
  if (!raw || typeof raw !== "object") return { ok: false, error: "Missing quiz" };
  const r = raw as Record<string, unknown>;
  const title = String(r.title ?? "").trim();
  if (!title) return { ok: false, error: "Title is required" };
  const xpReward = Number(r.xpReward ?? 50);
  if (!Number.isInteger(xpReward) || xpReward < 0) return { ok: false, error: "XP must be a non-negative integer" };
  const duration = r.duration == null || r.duration === "" ? null : Number(r.duration);
  if (duration != null && (!Number.isFinite(duration) || duration <= 0)) return { ok: false, error: "Time limit must be positive" };
  const dueDate = r.dueDate ? new Date(String(r.dueDate)) : null;
  if (dueDate && Number.isNaN(dueDate.getTime())) return { ok: false, error: "Invalid due date" };

  const qs = Array.isArray(r.questions) ? r.questions : [];
  if (!qs.length) return { ok: false, error: "Add at least one question" };
  const questions: QuestionInput[] = [];
  for (const [i, q] of qs.entries()) {
    if (!q || typeof q !== "object") return { ok: false, error: `Question ${i + 1} is invalid` };
    const x = q as Record<string, unknown>;
    const type = TYPES.includes(x.type as QuestionType) ? (x.type as QuestionType) : null;
    if (!type) return { ok: false, error: `Question ${i + 1}: unknown type` };
    const text = String(x.text ?? "").trim();
    if (!text) return { ok: false, error: `Question ${i + 1} needs a text` };
    const points = Number(x.points ?? 1);
    if (!Number.isFinite(points) || points < 0) return { ok: false, error: `Question ${i + 1}: invalid points` };
    let options = Array.isArray(x.options) ? x.options.map((o) => String(o).trim()) : [];
    let correctIndexes = Array.isArray(x.correctIndexes) ? [...new Set(x.correctIndexes.map(Number).filter(Number.isInteger))] : [];
    let correctText: string | null = null;
    let correctNumber: number | null = null;
    let tolerance: number | null = null;
    if (type === "TRUE_FALSE") {
      options = ["True", "False"];
      if (correctIndexes.length !== 1 || correctIndexes[0] > 1) return { ok: false, error: `Question ${i + 1}: pick True or False` };
    } else if (type === "MULTIPLE_CHOICE" || type === "CHECKBOXES") {
      options = options.filter(Boolean);
      if (options.length < 2) return { ok: false, error: `Question ${i + 1} needs at least two options` };
      correctIndexes = correctIndexes.filter((c) => c >= 0 && c < options.length);
      if (!correctIndexes.length) return { ok: false, error: `Question ${i + 1}: mark the correct option` };
      if (type === "MULTIPLE_CHOICE") correctIndexes = [correctIndexes[0]];
    } else if (type === "SHORT_ANSWER") {
      correctText = String(x.correctText ?? "").trim();
      if (!correctText) return { ok: false, error: `Question ${i + 1}: give the accepted answer(s)` };
      options = [];
      correctIndexes = [];
    } else {
      correctNumber = Number(x.correctNumber);
      tolerance = Number(x.tolerance ?? 0);
      if (!Number.isFinite(correctNumber)) return { ok: false, error: `Question ${i + 1}: numeric answer required` };
      if (!Number.isFinite(tolerance) || tolerance < 0) tolerance = 0;
      options = [];
      correctIndexes = [];
    }
    questions.push({
      id: typeof x.id === "string" ? x.id : undefined,
      type,
      text,
      imageUrl: typeof x.imageUrl === "string" && x.imageUrl.trim() ? x.imageUrl.trim() : null,
      points,
      required: x.required !== false,
      options,
      correctIndexes,
      correctText,
      correctNumber,
      tolerance,
    });
  }
  const opt = (k: string) => (typeof r[k] === "string" && (r[k] as string).trim() ? (r[k] as string).trim() : null);
  return {
    ok: true,
    value: {
      title,
      description: opt("description"),
      lessonId: opt("lessonId"),
      moduleId: opt("moduleId"),
      projectId: opt("projectId"),
      dueDate,
      duration,
      xpReward,
      showAnswers: r.showAnswers !== false,
      questions,
    },
  };
}
