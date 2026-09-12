// POST { answers } — single attempt per student; XP awarded once
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/gamification/access";
import { studentClassIds } from "@/lib/quiz/access";
import { gradeQuiz, quizXp } from "@/lib/quiz/grade";
import { awardXp } from "@/lib/gamification/service";

export async function POST(req: NextRequest, { params }: { params: Promise<{ quizId: string }> }) {
  const { user, error } = await requireStudent();
  if (error) return error;
  const { quizId } = await params;
  const quiz = await prisma.quiz.findFirst({
    where: { id: quizId, status: "PUBLISHED", classId: { in: await studentClassIds(user.id) } },
    include: { questions: true },
  });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  const existing = await prisma.quizAttempt.findUnique({ where: { quizId_studentId: { quizId, studentId: user.id } } });
  if (existing) return NextResponse.json({ error: "Already submitted" }, { status: 400 });
  if (quiz.dueDate && quiz.dueDate.getTime() < Date.now()) return NextResponse.json({ error: "This quiz is past its due date" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const raw = body.answers && typeof body.answers === "object" ? (body.answers as Record<string, unknown>) : {};
  const ids = new Set(quiz.questions.map((q) => q.id));
  const answers: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(raw)) if (ids.has(k)) answers[k] = v;

  const g = gradeQuiz(quiz.questions.map((q) => ({ ...q, options: q.options as string[] | null })), answers);
  const xp = quizXp(quiz.xpReward, g.percent);

  const attempt = await prisma.$transaction(async (tx) => {
    const a = await tx.quizAttempt.create({
      data: { quizId, studentId: user.id, answers: answers as object, score: g.score, maxScore: g.maxScore, percent: g.percent, xpAwarded: xp, submittedAt: new Date() },
    });
    if (xp > 0) {
      await awardXp(tx, { userId: user.id, amount: xp, reason: "QUIZ", moduleId: quiz.moduleId, projectId: quiz.projectId, dedupeKey: `quiz:${user.id}:${quizId}` });
    }
    return a;
  });
  return NextResponse.json({ score: attempt.score, maxScore: attempt.maxScore, percent: attempt.percent, xpAwarded: attempt.xpAwarded, results: g.results });
}
