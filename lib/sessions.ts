// Planned sessions: an Event of type SESSION on a class owns a Seance. When the
// session has ended, settleEndedSessions() marks every enrolled student
// PRESENT with +SESSION_XP once (idempotent via Seance.settledAt); the teacher
// then fixes exceptions from the séance page.
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const SESSION_XP = 1;

export const eventInclude = {
  class: { select: { id: true, name: true } },
  school: { select: { id: true, name: true } },
  createdBy: { select: { id: true, name: true } },
  seance: { select: { id: true, settledAt: true, _count: { select: { participations: true } } } },
} satisfies Prisma.EventInclude;

export type EventRow = Prisma.EventGetPayload<{ include: typeof eventInclude }>;

export function serializeEvent(e: EventRow) {
  const now = Date.now();
  const end = (e.endsAt ?? e.date).getTime();
  return {
    id: e.id,
    title: e.title,
    description: e.description,
    type: e.type,
    scope: e.scope,
    startsAt: e.date.toISOString(),
    endsAt: e.endsAt?.toISOString() ?? null,
    classId: e.classId,
    className: e.class?.name ?? null,
    schoolId: e.schoolId,
    schoolName: e.school?.name ?? null,
    createdById: e.createdById,
    createdByName: e.createdBy.name,
    seanceId: e.seance?.id ?? null,
    settled: !!e.seance?.settledAt,
    participants: e.seance?._count.participations ?? 0,
    status: now < e.date.getTime() ? "upcoming" : now <= end ? "live" : "past",
  };
}

export type EventDTO = ReturnType<typeof serializeEvent>;

export function parseEventBody(body: Record<string, unknown>) {
  const title = String(body.title ?? "").trim();
  if (!title) return { error: "Title is required" } as const;
  const startsAt = new Date(String(body.startsAt ?? ""));
  if (Number.isNaN(startsAt.getTime())) return { error: "Start date is required" } as const;
  const endsAt = body.endsAt ? new Date(String(body.endsAt)) : null;
  if (endsAt && (Number.isNaN(endsAt.getTime()) || endsAt <= startsAt)) return { error: "End must be after start" } as const;
  const type = body.type === "SESSION" || body.type === "EXAM" ? body.type : "OTHER";
  const scope = body.scope === "GLOBAL" || body.scope === "SCHOOL" ? body.scope : "CLASS";
  const classId = typeof body.classId === "string" && body.classId ? body.classId : null;
  const schoolId = typeof body.schoolId === "string" && body.schoolId ? body.schoolId : null;
  if (scope === "CLASS" && !classId) return { error: "Pick a class" } as const;
  if (scope === "SCHOOL" && !schoolId) return { error: "Pick a school" } as const;
  if (type === "SESSION" && scope !== "CLASS") return { error: "Sessions belong to a class" } as const;
  return {
    data: {
      title,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      date: startsAt,
      endsAt: endsAt ?? (type === "SESSION" ? new Date(startsAt.getTime() + 2 * 3600_000) : null),
      type,
      scope,
      classId: scope === "CLASS" ? classId : null,
      schoolId: scope === "SCHOOL" ? schoolId : null,
    },
  } as const;
}

/** Create the linked Seance for a class session event. */
export async function ensureSeanceForEvent(tx: Prisma.TransactionClient, eventId: string) {
  const ev = await tx.event.findUniqueOrThrow({ where: { id: eventId }, include: { seance: true } });
  if (ev.type !== "SESSION" || !ev.classId) return null;
  if (ev.seance) {
    return tx.seance.update({ where: { id: ev.seance.id }, data: { title: ev.title, startsAt: ev.date, endsAt: ev.endsAt } });
  }
  return tx.seance.create({ data: { title: ev.title, startsAt: ev.date, endsAt: ev.endsAt, classId: ev.classId, eventId } });
}

/** Settle every ended, unsettled session (optionally only for some classes). Returns settled seance ids. */
export async function settleEndedSessions(classIds?: string[]): Promise<string[]> {
  const now = new Date();
  const due = await prisma.seance.findMany({
    where: {
      settledAt: null,
      eventId: { not: null },
      OR: [{ endsAt: { lte: now } }, { endsAt: null, startsAt: { lte: now } }],
      ...(classIds ? { classId: { in: classIds } } : {}),
    },
    select: { id: true, classId: true, participations: { select: { studentId: true } } },
    take: 50,
  });
  const settled: string[] = [];
  for (const s of due) {
    const students = await prisma.user.findMany({ where: { studentClasses: { some: { id: s.classId } }, role: "STUDENT" }, select: { id: true } });
    const already = new Set(s.participations.map((p) => p.studentId));
    const missing = students.filter((st) => !already.has(st.id));
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.seance.updateMany({ where: { id: s.id, settledAt: null }, data: { settledAt: now } });
      if (!claimed.count) return;
      if (missing.length) {
        await tx.seanceParticipation.createMany({ data: missing.map((st) => ({ seanceId: s.id, studentId: st.id, attendance: "PRESENT", points: SESSION_XP })) });
        for (const st of missing) {
          await tx.xpEvent.create({ data: { userId: st.id, amount: SESSION_XP, reason: "SESSION", attemptId: s.id, dedupeKey: `session:${st.id}:${s.id}` } });
        }
        await tx.user.updateMany({ where: { id: { in: missing.map((st) => st.id) } }, data: { totalXP: { increment: SESSION_XP } } });
      }
    });
    settled.push(s.id);
  }
  return settled;
}

/**
 * Séances created from the class page own no Event, so they were invisible on
 * the events boards (and never settled). Give every such séance its Event so
 * both the teacher and the student see the same list. Already-ended séances
 * that the teacher filled in by hand are marked settled, so the automatic
 * "everyone present" pass does not rewrite their attendance.
 */
export async function backfillEventsForSeances(classIds?: string[]): Promise<string[]> {
  const orphans = await prisma.seance.findMany({
    where: { eventId: null, ...(classIds ? { classId: { in: classIds } } : {}) },
    select: {
      id: true,
      title: true,
      startsAt: true,
      endsAt: true,
      classId: true,
      class: { select: { teacherId: true } },
      _count: { select: { participations: true } },
    },
    take: 100,
  });
  const now = new Date();
  const linked: string[] = [];
  for (const s of orphans) {
    const ended = (s.endsAt ?? s.startsAt).getTime() <= now.getTime();
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.seance.findUnique({ where: { id: s.id }, select: { eventId: true, settledAt: true } });
      if (!fresh || fresh.eventId) return;
      const ev = await tx.event.create({
        data: {
          title: s.title?.trim() || "Class session",
          date: s.startsAt,
          endsAt: s.endsAt,
          type: "SESSION",
          scope: "CLASS",
          classId: s.classId,
          createdById: s.class.teacherId,
        },
      });
      await tx.seance.update({
        where: { id: s.id },
        data: { eventId: ev.id, settledAt: fresh.settledAt ?? (ended && s._count.participations > 0 ? now : null) },
      });
      linked.push(s.id);
    });
  }
  return linked;
}

/** Everything the events boards need before reading: link loose séances, then settle what ended. */
export async function syncSessions(classIds?: string[]) {
  await backfillEventsForSeances(classIds);
  await settleEndedSessions(classIds);
}
