// app/api/teacher/dashboard/route.ts
// app/api/teacher/dashboard/route.ts
// app/api/teacher/dashboard/route.ts
import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust path

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teacherId = session.user.id;

    console.log("TEACHER ID " , teacherId)
    // --- Fetch all classes for this teacher ---
    const classes = await prisma.class.findMany({
      where: { teacherId },
      include: {
        students: {
          include: { studentClasses : true },
        },
        seances: {
          include: {participations : true},
        },
      },
    });

    // --- Global stats across all classes ---
    const uniqueStudents = new Set(
      classes.flatMap(c => c.students.map(s => s.id))
    );

    let totalSessions = 0, totalPresence = 0;
    classes.forEach(cls => {
      cls.seances.forEach(se => {
        totalSessions += se.participations.length;
        totalPresence += se.participations.filter(a => a.attendance === "PRESENT").length;
      });
    });
// Leaderboard: top 10 students across all teacher’s classes
// Leaderboard: top 10 students across all teacher’s classes
const leaderboard = await prisma.user.findMany({
  where: {
    role: "STUDENT",
    studentClasses: {
      some: {
        teacherId: teacherId, // filter only classes belonging to this teacher
      },
    },
  },
  orderBy: { totalXP: "desc" },
  take: 10,
  select: {
    id: true,
    name: true,
    email: true,
    totalXP: true,
  },
});
    // --- Prepare response ---
    return NextResponse.json({
      totalStudents: uniqueStudents.size,
      totalClasses: classes.length,
      upcomingSessions: classes.reduce(
        (acc, c) => acc + c.seances.filter(s => s.createdAt > new Date()).length,
        0
      ),
      completedSessions: classes.reduce(
        (acc, c) => acc + c.seances.filter(s => s.createdAt <= new Date()).length,
        0
      ),
      avgAttendance: totalSessions
        ? ((totalPresence / totalSessions) * 100).toFixed(1)
        : 0,
      leaderboard,
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        students: c.students.length,
        nextSession: c.seances.find(s => s.createdAt > new Date())?.createdAt|| null,
      })),
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard", details: error },
      { status: 500 }
    );
  }
}

