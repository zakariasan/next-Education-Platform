// app/api/student/leaderboard/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const student = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        studentClasses: {
              include: {
                students: {
                  include: { studentClasses : true },
            },
          },
        },
      },
    });

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // collect leaderboard from the first class
    const classes = student.studentClasses.map(sc => sc);
    const leaderboards = classes.map(cls => ({
      classId: cls.id,
      className: cls.name,
      leaderboard: cls.students
        .map(s => ({
          id: s.id,
          name: s.name,
          totalXP: s.totalXP ?? 0,
        }))
        .sort((a, b) => b.totalXP - a.totalXP),
    }));


    return NextResponse.json(leaderboards);
  } catch (err) {
    console.error("Error in leaderboard:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
