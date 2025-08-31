import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: classId, examId } = await params;

  // Verify ownership
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });

  if (!cls || cls.teacherId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        files: true,
        results: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    if (!exam || exam.classId !== classId) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    return NextResponse.json(exam);
  } catch (error) {
    console.error("[Exam details error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: classId, examId } = await params;
  const body = await req.json();

  // Verify ownership
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });

  if (!cls || cls.teacherId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const exam = await prisma.exam.update({
      where: { id: examId },
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        date: body.date ? new Date(body.date) : null,
        maxScore: body.maxScore,
        maxXP: body.maxXP,
      },
      include: {
        files: true,
        results: {
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        }
      }
    });

    return NextResponse.json(exam);
  } catch (error) {
    console.error("[Exam update error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; examId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: classId, examId } = await params;

  // Verify ownership
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });

  if (!cls || cls.teacherId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    await prisma.exam.delete({
      where: { id: examId }
    });

    return NextResponse.json({ message: "Exam deleted successfully" });
  } catch (error) {
    console.error("[Exam delete error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
