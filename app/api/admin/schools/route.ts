// app/api/admin/schools/route.ts
// GET (list every school), POST (create a school assigned to an existing teacher)
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const schools = await prisma.school.findMany({
    include: {
      createdBy: { select: { name: true } },
      teachers: { include: { teacher: { select: { id: true, name: true, email: true } } } },
      classes: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(schools, { status: 200 });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, teacherId } = await req.json();
  if (!name || !teacherId) {
    return NextResponse.json(
      { error: "Missing name or teacherId" },
      { status: 400 },
    );
  }

  const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
  if (!teacher || teacher.role !== "TEACHER") {
    return NextResponse.json({ error: "Invalid teacherId" }, { status: 400 });
  }

  const school = await prisma.school.create({
    data: {
      name,
      description,
      createdById: session.user.id,
      teachers: { create: { teacherId } },
    },
  });

  return NextResponse.json(school, { status: 201 });
}
