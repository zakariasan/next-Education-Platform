import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Make sure this matches your other files
import { AttendanceStatus } from '@prisma/client';

export async function POST(req: Request) {
  const { seanceId, attendance } = await req.json();

  if (!seanceId || !attendance) {
    return NextResponse.json({ error: "Missing seanceId or attendance" }, { status: 400 });
  }

  // Make sure all students exist in DB
  const studentIds = Object.keys(attendance);
  const validStudents = await prisma.user.findMany({
    where: { id: { in: studentIds } },
    select: { id: true }
  });
  const validIds = validStudents.map(s => s.id);

  const participationRecords = Object.entries(attendance)
    .filter(([studentId]) => validIds.includes(studentId))
    .map(([studentId, status]) => ({
      seanceId,
      studentId,
      attendance: status as AttendanceStatus,
      points: 0
    }));

  const participations = await prisma.seanceParticipation.createMany({
    data: participationRecords,
  });

  return NextResponse.json({ success: true, participations });
}

