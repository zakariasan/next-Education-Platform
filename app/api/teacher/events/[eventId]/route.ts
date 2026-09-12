// PATCH / DELETE an event (creator or admin)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, requireTeacherOrAdmin, type SessionUser } from "@/lib/gamification/access";
import { ensureSeanceForEvent, eventInclude, parseEventBody, serializeEvent } from "@/lib/sessions";

type Ctx = { params: Promise<{ eventId: string }> };

async function editable(user: SessionUser, eventId: string) {
  const ev = await prisma.event.findUnique({ where: { id: eventId }, include: { seance: { select: { settledAt: true } } } });
  if (!ev) return null;
  if (!isAdmin(user) && ev.createdById !== user.id) return null;
  return ev;
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { eventId } = await params;
  const ev = await editable(user, eventId);
  if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const parsed = parseEventBody({
    title: ev.title, description: ev.description, type: ev.type, scope: ev.scope, classId: ev.classId, schoolId: ev.schoolId,
    startsAt: ev.date.toISOString(), endsAt: ev.endsAt?.toISOString() ?? null,
    ...body,
  });
  if ("error" in parsed) return NextResponse.json({ error: parsed.error }, { status: 400 });
  if (ev.seance?.settledAt && parsed.data.type !== "SESSION") return NextResponse.json({ error: "This session already ran; attendance was recorded" }, { status: 400 });
  const updated = await prisma.$transaction(async (tx) => {
    await tx.event.update({ where: { id: eventId }, data: parsed.data });
    await ensureSeanceForEvent(tx, eventId);
    return tx.event.findUniqueOrThrow({ where: { id: eventId }, include: eventInclude });
  });
  return NextResponse.json(serializeEvent(updated));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { eventId } = await params;
  const ev = await editable(user, eventId);
  if (!ev) return NextResponse.json({ error: "Event not found" }, { status: 404 });
  if (ev.seance?.settledAt) return NextResponse.json({ error: "This session already ran; attendance was recorded. Keep it for the records." }, { status: 400 });
  await prisma.event.delete({ where: { id: eventId } });
  return NextResponse.json({ deleted: true });
}
