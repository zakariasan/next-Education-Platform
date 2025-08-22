// app/api/student/progress/route.ts
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
    const progress = await prisma.seanceParticipation.findMany({
      where: { studentId: session.user.id },
         });

    const formatted = progress.map(p => ({
      points: p.points,
      attendance: p.attendance,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error in progress:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

