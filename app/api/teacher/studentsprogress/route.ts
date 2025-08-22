import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // adjust your path
import {prisma} from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/teacher/studentsprogress
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teacherId = session.user.id;

  // Fetch all students that have classes of this teacher
  const students = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      studentClasses: { some: { teacherId } },
    },
    select: {
      id: true,
      name: true,
      totalXP: true,
      studentClasses: {
        select: { name: true },
      },
    },
    orderBy: { totalXP: "desc" },
  });

  // Map level and rank
  const leaderboard = students.map((s, index) => ({
    id: s.id,
    name: s.name,
    className: s.studentClasses[0]?.name || "N/A",
    totalXp: s.totalXP,
    level: Math.floor(s.totalXP / 100) + 1,
    rank: index + 1,
    // rankChange placeholder (can be implemented with history tracking)
    rankChange: 0,
  }));

  return NextResponse.json(leaderboard);
}

