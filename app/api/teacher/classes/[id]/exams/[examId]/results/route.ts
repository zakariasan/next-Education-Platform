// app/api/teacher/classes/[id]/exams/[examId]/results/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExamResult } from "@prisma/client";

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
    // Get all students in the class and their results for this exam
    const classWithStudents = await prisma.class.findUnique({
      where: { id: classId },
      include: {
        students: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!classWithStudents) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    // Get existing results
    const existingResults = await prisma.examResult.findMany({
      where: { examId },
      include: {
        student: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create a map of existing results
    const resultMap = new Map(existingResults.map(r => [r.studentId, r]));

    // Combine students with their results (or create empty result objects)
    const results = classWithStudents.students.map(student => {
      const existingResult = resultMap.get(student.id);
      return existingResult || {
        id: null,
        examId,
        studentId: student.id,
        score: 0,
        xpAwarded: 0,
        notes: null,
        student,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Exam results error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

export async function POST(
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
    // Get exam info for XP calculation
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      select: { maxScore: true, maxXP: true }
    });

    if (!exam) {
      return NextResponse.json({ error: "Exam not found" }, { status: 404 });
    }

    // Update or create results
    const results = await Promise.all(
      body.results.map(async (result: ExamResult) => {
        // Calculate XP based on score
        const xpAwarded = Math.round((result.score / exam.maxScore) * exam.maxXP);
        
        return prisma.examResult.upsert({
          where: {
            examId_studentId: {
              examId,
              studentId: result.studentId
            }
          },
          update: {
            score: result.score,
            xpAwarded,
            notes: result.notes
          },
          create: {
            examId,
            studentId: result.studentId,
            score: result.score,
            xpAwarded,
            notes: result.notes
          },
          include: {
            student: {
              select: { id: true, name: true, email: true }
            }
          }
        });
      })
    );

    // Update total XP for each student
    for (const result of results) {
      await prisma.user.update({
        where: { id: result.studentId },
        data: {
          totalXP: {
            increment: result.xpAwarded - (body.results.find((r: ExamResult) => r.studentId === result.studentId)?.oldXP || 0)
          }
        }
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Save results error]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
