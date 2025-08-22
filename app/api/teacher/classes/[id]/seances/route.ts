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

  try {
    const body = await req.json();
    const { title, startsAt, endsAt } = body;
const startsAtISO = new Date(startsAt).toISOString()
const endsAtISO = new Date(endsAt).toISOString()

    const seance = await prisma.seance.create({
      data: {
        title,
        startsAt: startsAtISO,
        endsAt: endsAtISO,
        classId,
      },
    });

    return NextResponse.json(seance);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
