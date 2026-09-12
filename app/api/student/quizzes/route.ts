// GET published quizzes of the student's classes with attempt status
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/gamification/access";
import { studentClassIds } from "@/lib/quiz/access";

export async function GET() {
  const { user, error } = await requireStudent();
  if (error) return error;
  const classIds = await studentClassIds(user.id);
  const [quizzes, attempts] = await Promise.all([
    prisma.quiz.findMany({
      where: { classId: { in: classIds }, status: "PUBLISHED" },
      include: {
        class: { select: { name: true } },
        lesson: { select: { title: true } },
        module: { select: { id: true, title: true } },
        project: { select: { id: true, currentVersion: { select: { title: true } } } },
        questions: { select: { points: true } },
      },
      orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
    }),
    prisma.quizAttempt.findMany({ where: { studentId: user.id } }),
  ]);
  const byQuiz = new Map(attempts.map((a) => [a.quizId, a]));
  return NextResponse.json(
    quizzes.map((q) => {
      const a = byQuiz.get(q.id);
      return {
        id: q.id,
        title: q.title,
        description: q.description,
        className: q.class.name,
        lessonTitle: q.lesson?.title ?? null,
        moduleId: q.moduleId,
        moduleTitle: q.module?.title ?? null,
        projectId: q.projectId,
        projectTitle: q.project?.currentVersion?.title ?? null,
        dueDate: q.dueDate?.toISOString() ?? null,
        duration: q.duration,
        xpReward: q.xpReward,
        questionCount: q.questions.length,
        maxScore: q.questions.reduce((s, x) => s + x.points, 0),
        attempt: a ? { percent: a.percent, score: a.score, xpAwarded: a.xpAwarded, submittedAt: a.submittedAt?.toISOString() ?? null } : null,
      };
    }),
  );
}
