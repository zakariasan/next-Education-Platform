// GET per-student results; DELETE ?studentId= resets one attempt (XP is reverted)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/gamification/access";
import { manageableClass } from "@/lib/quiz/access";

type Ctx = { params: Promise<{ id: string; quizId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, quizId } = await params;
  if (!(await manageableClass(user, id))) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const [quiz, students, attempts] = await Promise.all([
    prisma.quiz.findFirst({ where: { id: quizId, classId: id }, include: { questions: { orderBy: { orderIndex: "asc" }, select: { id: true, text: true, points: true, type: true } } } }),
    prisma.user.findMany({ where: { studentClasses: { some: { id } } }, select: { id: true, name: true, email: true, avatar: true }, orderBy: { name: "asc" } }),
    prisma.quizAttempt.findMany({ where: { quizId } }),
  ]);
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  const byStudent = new Map(attempts.map((a) => [a.studentId, a]));
  const rows = students.map((s) => {
    const a = byStudent.get(s.id);
    return {
      student: s,
      attempted: !!a,
      score: a?.score ?? null,
      maxScore: a?.maxScore ?? null,
      percent: a?.percent ?? null,
      xpAwarded: a?.xpAwarded ?? 0,
      submittedAt: a?.submittedAt?.toISOString() ?? null,
      answers: (a?.answers as Record<string, unknown> | null) ?? null,
    };
  });
  const done = rows.filter((r) => r.attempted);
  return NextResponse.json({
    quiz: { id: quiz.id, title: quiz.title, questions: quiz.questions },
    stats: {
      students: students.length,
      attempted: done.length,
      avgPercent: done.length ? Math.round(done.reduce((s, r) => s + (r.percent ?? 0), 0) / done.length) : null,
    },
    rows,
  });
}

export async function DELETE(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, quizId } = await params;
  if (!(await manageableClass(user, id))) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  const studentId = req.nextUrl.searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "studentId required" }, { status: 400 });
  const attempt = await prisma.quizAttempt.findUnique({ where: { quizId_studentId: { quizId, studentId } } });
  if (!attempt) return NextResponse.json({ error: "No attempt" }, { status: 404 });
  await prisma.$transaction([
    prisma.quizAttempt.delete({ where: { id: attempt.id } }),
    prisma.xpEvent.deleteMany({ where: { dedupeKey: `quiz:${studentId}:${quizId}` } }),
    prisma.user.update({ where: { id: studentId }, data: { totalXP: { decrement: attempt.xpAwarded } } }),
  ]);
  return NextResponse.json({ reset: true });
}
