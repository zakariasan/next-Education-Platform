// app/api/teacher/dashboard/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { settleEndedSessions } from "@/lib/sessions";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const teacherId = session.user.id;
    const now = new Date();

    const classes = await prisma.class.findMany({
      where: { teacherId },
      select: {
        id: true,
        name: true,
        _count: { select: { students: true } },
        seances: { select: { startsAt: true }, orderBy: { startsAt: "asc" } },
      },
    });
    await settleEndedSessions(classes.map((c) => c.id));

    const [uniqueStudents, attendance, leaderboard] = await Promise.all([
      prisma.user.count({ where: { role: "STUDENT", studentClasses: { some: { teacherId } } } }),
      prisma.seanceParticipation.groupBy({
        by: ["attendance"],
        where: { seance: { class: { teacherId } } },
        _count: { _all: true },
      }),
      prisma.user.findMany({
        where: { role: "STUDENT", studentClasses: { some: { teacherId } } },
        orderBy: { totalXP: "desc" },
        take: 10,
        select: { id: true, name: true, email: true, totalXP: true },
      }),
    ]);

    const totalSessions = attendance.reduce((s, a) => s + a._count._all, 0);
    const totalPresence = attendance.find((a) => a.attendance === "PRESENT")?._count._all ?? 0;

    return NextResponse.json({
      totalStudents: uniqueStudents,
      totalClasses: classes.length,
      upcomingSessions: classes.reduce((acc, c) => acc + c.seances.filter((s) => s.startsAt > now).length, 0),
      completedSessions: classes.reduce((acc, c) => acc + c.seances.filter((s) => s.startsAt <= now).length, 0),
      avgAttendance: totalSessions ? ((totalPresence / totalSessions) * 100).toFixed(1) : 0,
      leaderboard,
      classes: classes.map((c) => ({
        id: c.id,
        name: c.name,
        students: c._count.students,
        nextSession: c.seances.find((s) => s.startsAt > now)?.startsAt ?? null,
      })),
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard" }, { status: 500 });
  }
}
