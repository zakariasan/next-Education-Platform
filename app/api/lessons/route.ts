import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

async function getAuthenticated() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;
  return await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });
}

export async function POST(req: NextRequest) {
  const user = await getAuthenticated();

  if (!user) {
    return NextResponse.json(
      { error: "User(Teacher) not Authenticated 😭😔💔 Login!!" },
      { status: 401 },
    );
  }
  try {
    const { title, description, content, classId, status } = await req.json();
    if (!title || !content || !classId) {
      return NextResponse.json(
        { error: "Missing title or the Content of the Lesson!!" },
        { status: 400 },
      );
    }
    const newLesson = await prisma.lesson.create({
      data: {
        title,
        description,
        content,
        status,
        teacherId: user.id,
        classId,
      },
    });

    return NextResponse.json(newLesson, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Error creating Lesson" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  if (!classId) NextResponse.json({error: "Missing classId"}, {status:400})
  try {
    const lessons = await prisma.lesson.findMany({
       where: classId ? {classId} : undefined,
      include: { class: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(lessons, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: error },
      { status: 500 },
    );
  }
}
