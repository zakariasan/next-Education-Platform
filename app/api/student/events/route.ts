// GET events for the student's classes, their schools and global ones, with own attendance
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/gamification/access";
import { eventInclude, serializeEvent, syncSessions } from "@/lib/sessions";

export async function GET() {
  const { user, error } = await requireStudent();
  if (error) return error;
  const classes = await prisma.class.findMany({ where: { students: { some: { id: user.id } } }, select: { id: true, schoolId: true } });
  const classIds = classes.map((c) => c.id);
  await syncSessions(classIds);
  const events = await prisma.event.findMany({
    where: {
      OR: [
        { scope: "GLOBAL" },
        { classId: { in: classIds } },
        { schoolId: { in: classes.map((c) => c.schoolId).filter((s): s is string => !!s) } },
      ],
    },
    include: { ...eventInclude, seance: { select: { id: true, settledAt: true, _count: { select: { participations: true } }, participations: { where: { studentId: user.id }, select: { attendance: true, points: true } } } } },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(
    events.map((e) => ({
      ...serializeEvent(e),
      myAttendance: e.seance?.participations[0]?.attendance ?? null,
      myPoints: e.seance?.participations[0]?.points ?? 0,
    })),
  );
}
