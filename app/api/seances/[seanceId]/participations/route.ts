// app/api/seances/[seanceId]/participations/route.ts
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
    { params }: { params: Promise<{ seanceId: string }> }  // params is now a Promise
) {

  const {seanceId} = await params
  const { studentId, attendance, pointsDelta, notes } = await req.json();
  const participation = await prisma.seanceParticipation.upsert({
    where: {
      seanceId_studentId: { seanceId: seanceId, studentId }
    },
    update: {
      attendance,
      points: pointsDelta,
      notes,
    },
    create: {
      seanceId: seanceId,
      studentId,
      attendance,
      points : pointsDelta,
      notes,
    },
  });

  // update total XP on User
  if (pointsDelta !== 0) {
    await prisma.user.update({
      where: { id: studentId },
      data: { totalXP: { increment: pointsDelta } }
    });
  }

  return Response.json(participation);
}
