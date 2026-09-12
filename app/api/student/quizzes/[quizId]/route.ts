// GET quiz to take (no answer keys) or review (keys if showAnswers and attempted)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/gamification/access";
import { studentClassIds } from "@/lib/quiz/access";
import { quizInclude, serializeQuiz } from "@/lib/quiz/queries";
import { gradeQuiz } from "@/lib/quiz/grade";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  const { user, error } = await requireStudent();
  if (error) return error;
  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, status: "PUBLISHED", classId: { in: await studentClassIds(user.id) } },
    include: quizInclude,
  });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  const attempt = await prisma.quizAttempt.findUnique({ where: { quizId_studentId: { quizId, studentId: user.id } } });
  const reveal = !!attempt && quiz.showAnswers;
  const dto = serializeQuiz(quiz, reveal);
  const answers = (attempt?.answers as Record<string, unknown> | null) ?? null;
  const results = attempt && answers ? gradeQuiz(quiz.questions.map((q) => ({ ...q, options: q.options as string[] | null })), answers).results : null;
  return NextResponse.json({
    ...dto,
    attempt: attempt
      ? { score: attempt.score, maxScore: attempt.maxScore, percent: attempt.percent, xpAwarded: attempt.xpAwarded, submittedAt: attempt.submittedAt?.toISOString() ?? null, answers, results }
      : null,
  });
}
