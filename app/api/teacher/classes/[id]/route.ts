// GET / PATCH / DELETE one class.
//
// Authorisation is the shared creator rule: the teacher who created the class
// may edit or delete it, and an admin may act on any class.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManage } from "@/lib/access/ownership";
import { studentSelect } from "@/lib/roster";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await requireManage("class", id);
  if (error) return error;

  const classData = await prisma.class.findUnique({
    where: { id },
    include: {
      // Selected, not `true`: the raw User row carries the password hash.
      students: { select: studentSelect },
      _count: {
        select: { students: true, lessons: true, quizzes: true, exams: true, seances: true },
      },
    },
  });
  if (!classData) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  return NextResponse.json(classData, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await requireManage("class", id);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const data: { name?: string; description?: string | null; archived?: boolean } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    data.name = body.name.trim();
  }
  if (body.description !== undefined) {
    data.description = typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
  }
  if (typeof body.archived === "boolean") data.archived = body.archived;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const updated = await prisma.class.update({ where: { id }, data });
  return NextResponse.json(updated, { status: 200 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { error } = await requireManage("class", id);
  if (error) return error;

  // A class owns lessons, quizzes, exams and seances. Deleting it would take
  // real student work with it, so only an empty class is removable; anything
  // else should be archived instead.
  const [lessons, quizzes, exams, seances, students] = await Promise.all([
    prisma.lesson.count({ where: { classId: id } }),
    prisma.quiz.count({ where: { classId: id } }),
    prisma.exam.count({ where: { classId: id } }),
    prisma.seance.count({ where: { classId: id } }),
    prisma.class.findUnique({ where: { id }, select: { _count: { select: { students: true } } } }),
  ]);
  const enrolled = students?._count.students ?? 0;

  if (lessons || quizzes || exams || seances || enrolled) {
    await prisma.class.update({ where: { id }, data: { archived: true } });
    return NextResponse.json(
      { archived: true, reason: "Class has content or students, so it was archived instead of deleted." },
      { status: 200 },
    );
  }

  await prisma.class.delete({ where: { id } });
  return NextResponse.json({ deleted: true }, { status: 200 });
}
