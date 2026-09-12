// app/api/student/classes-info/route.ts
// GET: the student's classes with school + teacher name, for the dashboard card
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const student = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      studentClasses: {
        select: {
          id: true,
          name: true,
          teacher: { select: { name: true } },
          school: { select: { name: true } },
        },
      },
    },
  });

  const classesInfo = (student?.studentClasses ?? []).map((cls) => ({
    classId: cls.id,
    className: cls.name,
    teacherName: cls.teacher.name,
    schoolName: cls.school?.name ?? null,
  }));

  return NextResponse.json(classesInfo, { status: 200 });
}
