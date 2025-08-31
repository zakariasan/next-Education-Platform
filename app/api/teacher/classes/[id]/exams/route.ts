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
  };

  console.log("Chek in : ", body);
  // Verify ownership
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });
  if (!cls || cls.teacherId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  console.log("Check cls: ", cls);
  const exam = await prisma.exam.create({
    data: {
      title: body.title,
      description: body.description,
      type: body.type,
      date: body.date ? new Date(body.date) : undefined,
      maxScore: body.maxScore ?? 20,
      maxXP: body.maxXP ?? 100,
      classId,
      teacherId: session.user.id,
    },
  });

  console.log("Check Exam============================= > >  > > >  : ", exam);
  return NextResponse.json(exam, { status: 201 });
}
