// GET every quiz across the caller's classes (admins: all), optional ?moduleId=
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { quizInclude, serializeQuiz } from "@/lib/quiz/queries";

export async function GET(req: NextRequest) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const moduleId = req.nextUrl.searchParams.get("moduleId");
  const quizzes = await prisma.quiz.findMany({
    where: {
      ...(isAdmin(user) ? {} : { class: { teacherId: user.id } }),
      ...(moduleId ? { OR: [{ moduleId }, { moduleId: null }] } : {}),
    },
    include: quizInclude,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(quizzes.map((q) => serializeQuiz(q, false)));
}
