// app/api/teacher/classes/[classId]/seances/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { getAuthenticated } from "@/lib/auth";
export async function GET(
  req: Request,
    { params }: { params: Promise<{ id : string }> }  // params is now a Promise

) {
  const para = await params
  const classId = para.id;
  const user = await getAuthenticated();

  if (!user) {
    return NextResponse.json(
      { error: "User(Teacher) not Authenticated 😭😔💔 Login!!" },
      { status: 401 },
    );
  }
  try {
    const seances = await prisma.seance.findMany({
      where: { classId },
      include: { participations: true },
    });

    return NextResponse.json(seances);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  req: Request,
    { params }: { params: Promise<{ id : string }> }  // params is now a Promise
) {
  const para = await params
    const classId = para.id;

  const user = await getAuthenticated();
  if (!user) {
    return NextResponse.json(
      { error: "User(Teacher) not Authenticated 😭😔💔 Login!!" },
      { status: 401 },
    );
  }
  const klass = await prisma.class.findUnique({ where: { id: classId }, select: { teacherId: true } });
  if (!klass) return NextResponse.json({ error: "Class not found" }, { status: 404 });
  if (klass.teacherId !== user.id) {
    const me = await prisma.user.findUnique({ where: { id: user.id }, select: { role: true } });
    if (me?.role !== "ADMIN") return NextResponse.json({ error: "Not your class" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { title, startsAt, endsAt } = body;
const startsAtISO = new Date(startsAt).toISOString()
const endsAtISO = endsAt ? new Date(endsAt).toISOString() : null

    // A séance and its Event are the same thing seen from two sides: the teacher
    // plans it here, the student reads it on the events board. Create both.
    const seance = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          title: String(title ?? "").trim() || "Class session",
          date: startsAtISO,
          endsAt: endsAtISO,
          type: "SESSION",
          scope: "CLASS",
          classId,
          createdById: klass.teacherId,
        },
      });
      return tx.seance.create({
        data: {
          title,
          startsAt: startsAtISO,
          endsAt: endsAtISO,
          classId,
          eventId: event.id,
        },
      });
    });

    return NextResponse.json(seance);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
