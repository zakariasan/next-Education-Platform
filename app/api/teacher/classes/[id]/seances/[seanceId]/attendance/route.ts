// app/api/teacher/classes/[id]/seances/[seanceId]/attendance/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { AttendanceStatus } from '@prisma/client';
// Fetch all participations for a seance
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string, seanceId: string }> }
) {
  try {
    const para = await params
    const { seanceId } = para;

    if (!seanceId) {
      return NextResponse.json({ error: "Seance ID is required" }, { status: 400 });
    }

    const participations = await prisma.seanceParticipation.findMany({
      where: { seanceId },
      include: { student: true },
    });

    return NextResponse.json(participations);
  } catch (err) {
    console.error("❌ Attendance fetch error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// Update attendance per student

// --- Update attendance / points safely ---
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string; seanceId: string }> }
) {
  const { seanceId } = await context.params;
  const { studentId, attendance, xp } = await req.json();
  
  if (!studentId) {
    return NextResponse.json({ error: "studentId required" }, { status: 400 });
  }

  // Build update data object dynamically - don't initialize with invalid values
  const dataToUpdate: {
    attendance?: AttendanceStatus;
    points?: number;
  } = {};

  // Only add attendance if it's provided
  if (attendance) {
    dataToUpdate.attendance = attendance as AttendanceStatus;
  }
  
  // Only add points if xp is provided
  if (xp !== undefined) {
    dataToUpdate.points = xp;
  }

  try {
    // Fetch current participation
    const participation = await prisma.seanceParticipation.findUnique({
      where: { seanceId_studentId: { seanceId, studentId } },
    });

    if (!participation) {
      return NextResponse.json({ error: "Participation record not found" }, { status: 404 });
    }

    // Only update if there's actually data to update
    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ error: "No valid data to update" }, { status: 400 });
    }

    const updated = await prisma.seanceParticipation.update({
      where: { seanceId_studentId: { seanceId, studentId } },
      data: dataToUpdate,
    });

    // Update totalXp if XP changed
    if (xp !== undefined) {
      const xpDiff = xp - (participation.points || 0);
      if (xpDiff !== 0) {
        await prisma.user.update({
          where: { id: studentId },
          data: { totalXP: { increment: xpDiff } },
        });
      }
    }

    return NextResponse.json({ success: true, updated });
  } catch (err) {
    console.error("PATCH error:", err);
    return NextResponse.json(
      { error: "Failed to update participation", details: err },
      { status: 500 }
    );
  }
}
