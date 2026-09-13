// GET (lessons of one class), POST (create a lesson in a class you own).
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/gamification/access";
import { canManage, requireManage } from "@/lib/access/ownership";

export async function POST(req: NextRequest) {
  const { title, description, content, classId, status } = await req.json().catch(() => ({}));
  if (!title || !content || !classId) {
    return NextResponse.json(
      { error: "Missing title, content or classId" },
      { status: 400 },
    );
  }

  // You may only add a lesson to a class you created (admins: any class).
  const { user, error } = await requireManage("class", classId);
  if (error) return error;

  const newLesson = await prisma.lesson.create({
    data: { title, description, content, status, teacherId: user.id, classId },
  });
  return NextResponse.json(newLesson, { status: 201 });
}

export async function GET(req: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const classId = new URL(req.url).searchParams.get("classId");
  if (!classId) return NextResponse.json({ error: "Missing classId" }, { status: 400 });

  // The class owner and admins see every lesson including drafts. An enrolled
  // student sees only published ones. Everyone else sees nothing.
  const owns = await canManage(user, "class", classId);
  if (!owns) {
    const enrolled = await prisma.class.findFirst({
      where: { id: classId, students: { some: { id: user.id } } },
      select: { id: true },
    });
    if (!enrolled) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  }

  const lessons = await prisma.lesson.findMany({
    where: { classId, ...(owns ? {} : { status: "PUBLISHED" }) },
    include: { class: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(lessons, { status: 200 });
}
