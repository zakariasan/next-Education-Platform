// GET / PUT / DELETE one lesson.
//
// Authorisation is the shared creator rule: the teacher who created the lesson
// may edit or delete it, and an admin may act on any lesson. Enrolled students
// may read a published lesson.
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/gamification/access";
import { canManage, requireManage } from "@/lib/access/ownership";

type Ctx = { params: Promise<{ lessonID: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { lessonID } = await params;
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const lesson = await prisma.lesson.findUnique({ where: { id: lessonID } });
  if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });

  if (!(await canManage(user, "lesson", lessonID))) {
    const enrolled = await prisma.class.findFirst({
      where: { id: lesson.classId, students: { some: { id: user.id } } },
      select: { id: true },
    });
    if (!enrolled || lesson.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }
  }

  return NextResponse.json(lesson, { status: 200 });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { lessonID } = await params;
  const { error } = await requireManage("lesson", lessonID);
  if (error) return error;

  const { title, description, content, status } = await req.json().catch(() => ({}));
  if (!title || !content) {
    return NextResponse.json({ error: "Missing title or content" }, { status: 400 });
  }

  // classId is deliberately not updatable here: moving a lesson into another
  // class would need an ownership check on that class too.
  const updated = await prisma.lesson.update({
    where: { id: lessonID },
    data: { title, description, content, status },
  });
  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { lessonID } = await params;
  const { error } = await requireManage("lesson", lessonID);
  if (error) return error;

  await prisma.materials.deleteMany({ where: { lessonId: lessonID } });
  const lesson = await prisma.lesson.delete({ where: { id: lessonID } });
  return NextResponse.json(lesson, { status: 200 });
}
