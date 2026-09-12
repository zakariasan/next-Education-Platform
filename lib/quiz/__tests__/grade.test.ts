import { describe, expect, it } from "vitest";
import { gradeQuestion, gradeQuiz, quizXp, type GradableQuestion } from "../grade";

const mc: GradableQuestion = { id: "q1", type: "MULTIPLE_CHOICE", points: 2, options: ["a", "b", "c"], correctIndexes: [1] };
const cb: GradableQuestion = { id: "q2", type: "CHECKBOXES", points: 4, options: ["a", "b", "c", "d"], correctIndexes: [0, 2] };
const sa: GradableQuestion = { id: "q3", type: "SHORT_ANSWER", points: 1, correctIndexes: [], correctText: "Newton | Isaac Newton" };
const num: GradableQuestion = { id: "q4", type: "NUMERIC", points: 3, correctIndexes: [], correctNumber: 9.81, tolerance: 0.05 };
const tf: GradableQuestion = { id: "q5", type: "TRUE_FALSE", points: 1, options: ["True", "False"], correctIndexes: [0] };

describe("quiz grading", () => {
  it("grades single choice and true/false", () => {
    expect(gradeQuestion(mc, 1).earned).toBe(2);
    expect(gradeQuestion(mc, [1]).earned).toBe(2);
    expect(gradeQuestion(mc, 0).earned).toBe(0);
    expect(gradeQuestion(tf, 0).correct).toBe(true);
    expect(gradeQuestion(tf, "x").earned).toBe(0);
  });

  it("gives partial credit on checkboxes and penalises wrong picks", () => {
    expect(gradeQuestion(cb, [0, 2]).earned).toBe(4);
    expect(gradeQuestion(cb, [0]).earned).toBe(2);
    expect(gradeQuestion(cb, [0, 1]).earned).toBe(0);
    expect(gradeQuestion(cb, []).earned).toBe(0);
  });

  it("matches short answers case/space-insensitively with alternatives", () => {
    expect(gradeQuestion(sa, "  isaac   NEWTON ").earned).toBe(1);
    expect(gradeQuestion(sa, "newton").earned).toBe(1);
    expect(gradeQuestion(sa, "einstein").earned).toBe(0);
  });

  it("grades numeric answers with tolerance and comma decimals", () => {
    expect(gradeQuestion(num, "9,8").earned).toBe(3);
    expect(gradeQuestion(num, 9.9).earned).toBe(0);
  });

  it("totals a quiz and converts to XP", () => {
    const g = gradeQuiz([mc, cb, sa, num, tf], { q1: 1, q2: [0], q3: "Newton", q4: 9.81, q5: 1 });
    expect(g.maxScore).toBe(11);
    expect(g.score).toBe(8);
    expect(g.percent).toBe(72.7);
    expect(quizXp(50, g.percent)).toBe(36);
    expect(quizXp(50, 0)).toBe(0);
  });
});
