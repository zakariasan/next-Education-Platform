import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string, seanceId: string }> }

) {
  const { seanceId } = await params;

  try {
    // Delete participations first to avoid foreign key issues
    await prisma.seanceParticipation.deleteMany({
      where: { seanceId },
    });

    // Then delete the seance itself
    await prisma.seance.delete({
      where: { id: seanceId },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE seance error:", err);
    return NextResponse.json(
      { error: "Failed to delete seance", details: err},
      { status: 500 }
    );
  }
}

