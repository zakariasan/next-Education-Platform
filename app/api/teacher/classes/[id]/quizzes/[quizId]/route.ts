// GET quiz (with answers), PATCH content/status, DELETE
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/gamification/access";
import { manageableClass } from "@/lib/quiz/access";
import { quizInclude, serializeQuiz, teacherQuiz } from "@/lib/quiz/queries";
import { validateQuiz } from "@/lib/quiz/validate";

type Ctx = { params: Promise<{ id: string; quizId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, quizId } = await params;
  if (!(await manageableClass(user, id))) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  const quiz = await teacherQuiz(quizId, id);
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  return NextResponse.json(serializeQuiz(quiz, true));
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, quizId } = await params;
  if (!(await manageableClass(user, id))) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  const quiz = await teacherQuiz(quizId, id);
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  if (body.status === "DRAFT" || body.status === "PUBLISHED" || body.status === "ARCHIVED") {
    if (body.status === "PUBLISHED" && quiz.questions.length === 0) return NextResponse.json({ error: "Add a question before publishing" }, { status: 400 });
    const updated = await prisma.quiz.update({ where: { id: quizId }, data: { status: body.status }, include: quizInclude });
    if (body.quiz === undefined) return NextResponse.json(serializeQuiz(updated, true));
  }
  if (body.quiz !== undefined) {
    const v = validateQuiz(body.quiz);
    if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
    const q = v.value;
    // Questions are replaced wholesale; existing attempts keep their answers JSON
    // keyed by question id, so ids of unchanged questions are preserved.
    await prisma.$transaction(async (tx) => {
      const keep = new Set(q.questions.map((x) => x.id).filter((x): x is string => !!x));
      await tx.question.deleteMany({ where: { quizId, id: { notIn: [...keep] } } });
      for (const [i, x] of q.questions.entries()) {
        const data = {
          type: x.type, text: x.text, imageUrl: x.imageUrl, points: x.points, required: x.required, orderIndex: i,
          options: x.options, correctIndexes: x.correctIndexes, correctText: x.correctText, correctNumber: x.correctNumber, tolerance: x.tolerance,
        };
        if (x.id && keep.has(x.id)) await tx.question.updateMany({ where: { id: x.id, quizId }, data });
        else await tx.question.create({ data: { ...data, quizId } });
      }
      await tx.quiz.update({
        where: { id: quizId },
        data: {
          title: q.title, description: q.description, lessonId: q.lessonId, moduleId: q.moduleId, projectId: q.projectId,
          dueDate: q.dueDate, duration: q.duration, xpReward: q.xpReward, showAnswers: q.showAnswers,
        },
      });
    });
  }
  const fresh = await teacherQuiz(quizId, id);
  return NextResponse.json(serializeQuiz(fresh!, true));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, quizId } = await params;
  if (!(await manageableClass(user, id))) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  const quiz = await prisma.quiz.findFirst({ where: { id: quizId, classId: id }, select: { id: true } });
  if (!quiz) return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
  await prisma.quiz.delete({ where: { id: quizId } });
  return NextResponse.json({ deleted: true });
}
