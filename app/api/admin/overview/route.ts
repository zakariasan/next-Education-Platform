// app/api/admin/overview/route.ts
// GET: global aggregate stats for the admin dashboard
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [schoolCount, teacherCount, studentCount, classCount, xpAgg] =
    await prisma.$transaction([
      prisma.school.count(),
      prisma.user.count({ where: { role: "TEACHER" } }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.class.count(),
      prisma.user.aggregate({
        where: { role: "STUDENT" },
        _sum: { totalXP: true },
      }),
    ]);

  return NextResponse.json(
    {
      schoolCount,
      teacherCount,
      studentCount,
      classCount,
      totalXP: xpAgg._sum.totalXP ?? 0,
    },
    { status: 200 },
  );
}
