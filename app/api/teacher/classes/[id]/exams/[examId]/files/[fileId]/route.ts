// app/api/teacher/classes/[id]/exams/[examId]/files/[fileId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; examId: string; fileId: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: classId, examId, fileId } = await params;

  // Verify ownership
  const cls = await prisma.class.findUnique({
    where: { id: classId },
    select: { teacherId: true },
  });

  if (!cls || cls.teacherId !== session.user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    // Get file info before deletion
    const file = await prisma.examFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.examId !== examId) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Delete from database
    await prisma.examFile.delete({
      where: { id: fileId }
    });

    // Try to delete physical file (don't fail if it doesn't exist)
    try {
      const filePath = join(process.cwd(), "public", file.url);
      await unlink(filePath);
    } catch (error) {
      console.warn("Could not delete physical file:", error);
    }

    return NextResponse.json({ message: "File deleted successfully" });
  } catch (error) {
    console.error("[Delete file error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
