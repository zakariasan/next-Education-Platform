import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, seanceId: string }> }

) {
  const { seanceId } = await params;

  try {
    const seance = await prisma.seance.findUnique({
      where: { id: seanceId },
      select: { eventId: true },
    });

    // Delete participations first to avoid foreign key issues
    await prisma.seanceParticipation.deleteMany({
      where: { seanceId },
    });

    // Then delete the seance itself
    await prisma.seance.delete({
      where: { id: seanceId },
    });

    // The linked Event is the student-facing half of the same session; without
    // this it would keep showing on the events board after the séance is gone.
    if (seance?.eventId) {
      await prisma.event.delete({ where: { id: seance.eventId } });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE seance error:", err);
    return NextResponse.json(
      { error: "Failed to delete seance", details: err},
      { status: 500 }
    );
  }
}
