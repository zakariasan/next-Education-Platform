// GET events visible to the teacher (own classes/schools + global), POST create
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { ensureSeanceForEvent, eventInclude, parseEventBody, serializeEvent, syncSessions } from "@/lib/sessions";

export async function GET() {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const admin = isAdmin(user);
  const classes = admin ? [] : await prisma.class.findMany({ where: { teacherId: user.id }, select: { id: true, schoolId: true } });
  await syncSessions(admin ? undefined : classes.map((c) => c.id));
  const events = await prisma.event.findMany({
    where: admin
      ? {}
      : {
          OR: [
            { scope: "GLOBAL" },
            { classId: { in: classes.map((c) => c.id) } },
            { schoolId: { in: classes.map((c) => c.schoolId).filter((s): s is string => !!s) } },
            { createdById: user.id },
          ],
        },
    include: eventInclude,
    orderBy: { date: "asc" },
  });
  return NextResponse.json(events.map(serializeEvent));
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const parsed = parseEventBody(await req.json().catch(() => ({})));
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  const d = parsed.data;
  if (!isAdmin(user)) {
    if (d.scope === "GLOBAL") return NextResponse.json({ error: "Only admins create global events" }, { status: 403 });
    if (d.classId && !(await prisma.class.findFirst({ where: { id: d.classId, teacherId: user.id } }))) return NextResponse.json({ error: "Not your class" }, { status: 403 });
    if (d.schoolId && !(await prisma.schoolTeacher.findFirst({ where: { schoolId: d.schoolId, teacherId: user.id } }))) return NextResponse.json({ error: "Not your school" }, { status: 403 });
  }
  const event = await prisma.$transaction(async (tx) => {
    const ev = await tx.event.create({ data: { ...d, createdById: user.id } });
    await ensureSeanceForEvent(tx, ev.id);
    return tx.event.findUniqueOrThrow({ where: { id: ev.id }, include: eventInclude });
  });
  return NextResponse.json(serializeEvent(event), { status: 201 });
}
