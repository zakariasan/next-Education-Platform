// app/api/teacher/schools/route.ts
// GET (list schools the teacher belongs to), POST (create a school)
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

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
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(schools, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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
      createdById: session.user.id,
      teachers: { create: { teacherId: session.user.id } },
    },
  });

  return NextResponse.json(school, { status: 201 });
}
