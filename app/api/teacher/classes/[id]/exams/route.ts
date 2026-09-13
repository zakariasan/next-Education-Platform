import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const para = await params;
  const classId = para.id;

  // Ensure the requester is this class's teacher
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });

  if (!cls || cls.teacherId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const exams = await prisma.exam.findMany({
      where: { classId },
      include: { files: true, results: true },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(exams);
  } catch (error) {
    console.error("[ospyyyy errorrrrrrrrr]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const para = await params;
  const classId = para.id;
  const body = (await req.json()) as {
    title: string;
    description?: string;
    type: "MIDTERM" | "FINAL" | "LOCAL" | "CUSTOM";
    date?: string; // ISO
    maxScore?: number; // default 20
    maxXP?: number; // default 100
    // Where the exam sits in a graph, if anywhere.
    moduleId?: string | null; // a node inside that module's Holy Graph
    isMilestone?: boolean; // a node of the course map, between rings of modules
    passPercent?: number; // percent of maxScore needed to count as passed
    // Other classes that should sit this exam too. The owning class is always
    // included whether or not it appears here.
    classIds?: string[];
  };

  // Verify ownership
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });
  if (!cls || cls.teacherId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  // A milestone exam belongs to the course map, so it never also sits inside a
  // single module's graph.
  const isMilestone = body.isMilestone === true;
  let moduleId: string | null = null;
  if (!isMilestone && body.moduleId) {
    const mod = await prisma.module.findFirst({
      where: { id: body.moduleId, teacherId: session.user.id },
      select: { id: true },
    });
    if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 400 });
    moduleId = mod.id;
  }

  const exam = await prisma.exam.create({
    data: {
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date ? new Date(body.date) : undefined,
      maxScore: body.maxScore ?? 20,
      maxXP: body.maxXP ?? 100,
      moduleId,
      isMilestone,
      passPercent:
        typeof body.passPercent === "number"
          ? Math.min(100, Math.max(0, Math.round(body.passPercent)))
          : 50,
      classId,
      teacherId: session.user.id,
    },
  });

  // Share it with the chosen classes. Only classes this teacher runs, and the
  // owning class is always part of the audience.
  const extra = Array.isArray(body.classIds) ? body.classIds.map(String) : [];
  const allowed = extra.length
    ? await prisma.class.findMany({
        where: { id: { in: extra }, teacherId: session.user.id },
        select: { id: true },
      })
    : [];
  const audience = [...new Set([classId, ...allowed.map((c) => c.id)])];
  await prisma.examClass.createMany({
    data: audience.map((cid) => ({ examId: exam.id, classId: cid })),
    skipDuplicates: true,
  });

  return NextResponse.json(exam, { status: 201 });
}
