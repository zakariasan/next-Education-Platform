import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticated } from "@/lib/auth";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {

  const user = await getAuthenticated();

  if (!user) {
    return NextResponse.json(
      { error: "User(Teacher) not Authenticated 😭😔💔 Login!!" },
      { status: 401 },
    );
  }
  try {
    const { id } = await context.params;

    // fetch class with students and their participations
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            participations: {
              include: { seance: true },
            },
          },
        },
        seances: true, // to know total seances
      },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const totalSeances = classData.seances.length || 1; // avoid /0

    const results = classData.students.map((student) => {
      const totalPresent = student.participations.filter(
        (p) => p.attendance === "PRESENT"
      ).length;

      // Attendance percentage
      const attendancePercentage = Math.round(
        (totalPresent / totalSeances) * 100
      );

      // XP & Levels (ex: 100 xp = 1 level, 250 xp = lvl 2 etc.)
      const xp = student.totalXP ?? 0;
      const level = Math.floor(xp / 100);
      const xpPercent = (xp % 100); // how much progress in current level

      // Status rules
      let status = "Good";
      if (attendancePercentage < 50) status = "At Risk";
      if (attendancePercentage < 25) status = "Critical";
      if (attendancePercentage > 80 && xp >= 200) status = "Excellent";

      return {
        id: student.id,
        name: student.name,
        attendance: `${totalPresent}/${totalSeances}`,
        attendancePercentage,
        xp,
        level,
        xpPercent,
        status,
      };
    });

    return NextResponse.json(results);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
