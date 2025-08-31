// app/api/teacher/classes/[id]/exams/[examId]/files/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { ExamFileKind } from "@prisma/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; examId: string }> },
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
    const files = await prisma.examFile.findMany({
      where: { examId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error("[Exam files error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; examId: string }> },
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
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const kind = formData.get("kind") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Save file to public/uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${Date.now()}-${file.name}`;

    // Create the uploads directory (without the filename)
    const uploadsDir = join(process.cwd(), "public/uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Create the full file path
    const filePath = join(uploadsDir, fileName);
    await writeFile(filePath, buffer);

    // Save file info to database
    const examFile = await prisma.examFile.create({
      data: {
        examId,
        name: name || file.name,
        url: `/uploads/${fileName}`,
        kind: (kind as ExamFileKind) || "OTHER",
      },
    });

    return NextResponse.json(examFile, { status: 201 });
  } catch (error) {
    console.error("[File upload error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
