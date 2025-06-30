import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: { lessonId: string } },
) {
  const { lessonID } = await params;

  if (!lessonID || typeof lessonID !== "string") {
    NextResponse.json({ error: "Missing classId" }, { status: 400 });
    throw new Error("Missing Prams lessonID");
  }
  try {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonID },
    });
    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching lesson look for them !!!No Lesson" },
      { status: 500 },
    );
  }
}

export async function PUT(
  req: NextRequest,

  { params }: { params: { lessonId: string } },
) {
  const { lessonID } = await params;

  if (!lessonID || typeof lessonID !== "string") {
    NextResponse.json({ error: "Missing classId" }, { status: 400 });
    throw new Error("Missing Prams lessonID");
  }

  try {
    const { title, description, content, classId, status } = await req.json();
    if (!title || !content || !classId) {
      return NextResponse.json(
        { error: "Missing title or the Content of the Lesson!!" },
        { status: 400 },
      );
    }

    const LessonUpdated = await prisma.lesson.update({
      where: { id: lessonID },
      data: {
        title,
        description,
        content,
        status,
        classId,
      },
    });

    return NextResponse.json(LessonUpdated, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error Updating Lesson" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { lessonId: string } },
) {
  const { lessonID } = await params;

  if (!lessonID || typeof lessonID !== "string") {
    NextResponse.json({ error: "Missing LessonId" }, { status: 400 });
    throw new Error("Missing Params lessonID");
  }
  try {
    const lesson = await prisma.lesson.delete({
      where: { id: lessonID },
    });
    return NextResponse.json(lesson, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Error deleting lesson!!!" },
      { status: 500 },
    );
  }
}
