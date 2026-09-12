// Pure quiz grading, shared by the submit API and unit tests.
export type QuestionType = "MULTIPLE_CHOICE" | "CHECKBOXES" | "TRUE_FALSE" | "SHORT_ANSWER" | "NUMERIC";

export type GradableQuestion = {
  id: string;
  type: QuestionType;
  points: number;
  options?: string[] | null;
  correctIndexes: number[];
  correctText?: string | null;
  correctNumber?: number | null;
  tolerance?: number | null;
};

export type QuestionResult = { questionId: string; earned: number; points: number; correct: boolean };

const norm = (s: unknown) => String(s ?? "").trim().toLowerCase().replace(/\s+/g, " ");

export function gradeQuestion(q: GradableQuestion, answer: unknown): QuestionResult {
  const points = Math.max(0, q.points);
  const res = (earned: number) => ({ questionId: q.id, earned, points, correct: earned >= points && points > 0 });
  switch (q.type) {
    case "MULTIPLE_CHOICE":
    case "TRUE_FALSE": {
      const picked = Array.isArray(answer) ? Number(answer[0]) : Number(answer);
      if (!Number.isInteger(picked)) return res(0);
      return res(q.correctIndexes.includes(picked) ? points : 0);
    }
    case "CHECKBOXES": {
      const picked = new Set((Array.isArray(answer) ? answer : [answer]).map(Number).filter(Number.isInteger));
      if (!picked.size || !q.correctIndexes.length) return res(0);
      const correct = new Set(q.correctIndexes);
      let hits = 0;
      for (const c of correct) if (picked.has(c)) hits++;
      const wrong = [...picked].filter((p) => !correct.has(p)).length;
      const frac = Math.max(0, (hits - wrong) / correct.size);
      return res(Math.round(frac * points * 100) / 100);
    }
    case "SHORT_ANSWER": {
      const accepted = (q.correctText ?? "").split("|").map(norm).filter(Boolean);
      return res(accepted.includes(norm(answer)) ? points : 0);
    }
    case "NUMERIC": {
      const n = typeof answer === "number" ? answer : parseFloat(String(answer ?? "").replace(",", "."));
      if (!Number.isFinite(n) || q.correctNumber == null) return res(0);
      return res(Math.abs(n - q.correctNumber) <= Math.abs(q.tolerance ?? 0) ? points : 0);
    }
    default:
      return res(0);
  }
}

export function gradeQuiz(questions: GradableQuestion[], answers: Record<string, unknown>) {
  const results = questions.map((q) => gradeQuestion(q, answers[q.id]));
  const score = Math.round(results.reduce((s, r) => s + r.earned, 0) * 100) / 100;
  const maxScore = questions.reduce((s, q) => s + Math.max(0, q.points), 0);
  const percent = maxScore > 0 ? Math.round((score / maxScore) * 1000) / 10 : 0;
  return { results, score, maxScore, percent };
}

export function quizXp(xpReward: number, percent: number) {
  return Math.round((xpReward * Math.max(0, Math.min(100, percent))) / 100);
}
