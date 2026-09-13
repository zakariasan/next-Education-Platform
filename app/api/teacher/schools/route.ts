// app/api/teacher/schools/route.ts
// GET (list schools the teacher belongs to), POST (create a school)
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { requireAuthor } from "@/lib/access/ownership";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schools = await prisma.school.findMany({
    where: { teachers: { some: { teacherId: session.user.id } } },
    include: {
      classes: { select: { id: true } },
      teachers: { select: { teacherId: true } },
    },
    // `createdById` is part of the model, so it is already returned; the UI uses
    // it to show edit controls only to the school's creator.
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(schools, { status: 200 });
}

export async function POST(req: NextRequest) {
  // Only teachers and admins may author a school; a student session used to be
  // enough to create one and attach itself as the school's teacher.
  const { user, error } = await requireAuthor();
  if (error) return error;

  const { name, description } = await req.json();
  if (!name) {
    return NextResponse.json(
      { error: "Missing Name of the School!!" },
      { status: 400 },
    );
  }

  const school = await prisma.school.create({
    data: {
      name,
      description,
      createdById: user.id,
      teachers: { create: { teacherId: user.id } },
    },
  });

  return NextResponse.json(school, { status: 201 });
}
