// GET quizzes of a class, POST create quiz (draft)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/gamification/access";
import { manageableClass } from "@/lib/quiz/access";
import { quizInclude, serializeQuiz } from "@/lib/quiz/queries";
import { validateQuiz } from "@/lib/quiz/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableClass(user, id))) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  const quizzes = await prisma.quiz.findMany({ where: { classId: id }, include: quizInclude, orderBy: { updatedAt: "desc" } });
  return NextResponse.json(quizzes.map((q) => serializeQuiz(q, true)));
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  const cls = await manageableClass(user, id);
  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  const v = validateQuiz(await req.json().catch(() => ({})));
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });
  const q = v.value;
  const quiz = await prisma.quiz.create({
    data: {
      title: q.title,
      description: q.description,
      teacherId: cls.teacherId,
      classId: id,
      lessonId: q.lessonId,
      moduleId: q.moduleId,
      projectId: q.projectId,
      dueDate: q.dueDate,
      duration: q.duration,
      xpReward: q.xpReward,
      showAnswers: q.showAnswers,
      questions: {
        create: q.questions.map((x, i) => ({
          type: x.type,
          text: x.text,
          imageUrl: x.imageUrl,
          points: x.points,
          required: x.required,
          orderIndex: i,
          options: x.options,
          correctIndexes: x.correctIndexes,
          correctText: x.correctText,
          correctNumber: x.correctNumber,
          tolerance: x.tolerance,
        })),
      },
    },
    include: quizInclude,
  });
  return NextResponse.json(serializeQuiz(quiz, true), { status: 201 });
}
