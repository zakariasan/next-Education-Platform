// GET — published notes from every class the student is enrolled in.
//
// "Note" is the teacher-facing name for a Lesson: written material kept
// against a class. Drafts stay invisible until the teacher publishes them.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/gamification/access";

export async function GET() {
  const { user, error } = await requireStudent();
  if (error) return error;

  const notes = await prisma.lesson.findMany({
    where: {
      status: "PUBLISHED",
      class: { students: { some: { id: user.id } } },
    },
    select: {
      id: true,
      title: true,
      description: true,
      updatedAt: true,
      class: { select: { id: true, name: true } },
      teacher: { select: { name: true } },
      materials: { select: { id: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json(
    notes.map((n) => ({
      id: n.id,
      title: n.title,
      description: n.description,
      className: n.class.name,
      classId: n.class.id,
      teacherName: n.teacher.name,
      materialCount: n.materials.length,
      updatedAt: n.updatedAt.toISOString(),
    })),
  );
}
