// One student seen from the teacher's class: full profile, edits, move, removal.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManage } from "@/lib/access/ownership";
import { studentSelect } from "@/lib/roster";
import bcrypt from "bcrypt";

type Ctx = { params: Promise<{ id: string; studentId: string }> };

/** The student must actually be in this class, or the teacher has no business with them. */
async function enrolled(classId: string, studentId: string) {
  return prisma.class.findFirst({
    where: { id: classId, students: { some: { id: studentId } } },
    select: { id: true },
  });
}

export async function GET(req: Request, context: Ctx) {
  const { id: classId, studentId } = await context.params;
  const { error } = await requireManage("class", classId);
  if (error) return error;
  if (!(await enrolled(classId, studentId))) return NextResponse.json({ error: "Student not in this class" }, { status: 404 });

  const student = await prisma.user.findUnique({
    where: { id: studentId },
    select: {
      ...studentSelect,
      provider: true,
      updatedAt: true,
      correctionPoints: true,
      studentClasses: { select: { id: true, name: true }, orderBy: { name: "asc" } },
      participations: {
        where: { seance: { classId } },
        select: { attendance: true, points: true, seance: { select: { id: true, title: true, startsAt: true } } },
        orderBy: { seance: { startsAt: "desc" } },
        take: 20,
      },
    },
  });
  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  const present = student.participations.filter((p) => p.attendance === "PRESENT").length;
  return NextResponse.json({
    ...student,
    // The password is stored as a bcrypt hash and cannot be read back; the
    // teacher can only set a new one (PATCH with `password`).
    hasPassword: student.provider !== "google",
    presentCount: present,
    sessionCount: student.participations.length,
  });
}

/** Edit the profile, set a new password, and/or move the student to another class. */
export async function PATCH(req: Request, context: Ctx) {
  const { id: classId, studentId } = await context.params;
  const { user, error } = await requireManage("class", classId);
  if (error) return error;
  if (!(await enrolled(classId, studentId))) return NextResponse.json({ error: "Student not in this class" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: { name?: string; email?: string; avatar?: string | null; password?: string } = {};

  if (body.name !== undefined) {
    const name = String(body.name).trim();
    if (!name) return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    data.name = name;
  }
  if (body.email !== undefined) {
    const email = String(body.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "That email is not valid" }, { status: 400 });
    const taken = await prisma.user.findFirst({ where: { email, id: { not: studentId } }, select: { id: true } });
    if (taken) return NextResponse.json({ error: "Another account already uses that email" }, { status: 409 });
    data.email = email;
  }
  if (body.avatar !== undefined) data.avatar = String(body.avatar).trim() || null;
  if (body.password) {
    const password = String(body.password);
    if (password.length < 6) return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    data.password = await bcrypt.hash(password, 10);
  }

  // Moving to another class: the teacher must own the destination too.
  const moveToClassId = typeof body.moveToClassId === "string" && body.moveToClassId ? body.moveToClassId : null;
  if (moveToClassId && moveToClassId !== classId) {
    const target = await requireManage("class", moveToClassId);
    if (target.error) return NextResponse.json({ error: "That is not one of your classes" }, { status: 403 });
  }

  try {
    const student = await prisma.$transaction(async (tx) => {
      if (Object.keys(data).length) await tx.user.update({ where: { id: studentId }, data });

      if (moveToClassId && moveToClassId !== classId) {
        await tx.class.update({ where: { id: classId }, data: { students: { disconnect: { id: studentId } } } });
        await tx.classEnrollment.deleteMany({ where: { classId, studentId } });
        await tx.class.update({ where: { id: moveToClassId }, data: { students: { connect: { id: studentId } } } });
        await tx.classEnrollment.upsert({
          where: { classId_studentId: { classId: moveToClassId, studentId } },
          create: { classId: moveToClassId, studentId },
          update: { banned: false, bannedAt: null, bannedReason: null },
        });
      }

      return tx.user.findUniqueOrThrow({ where: { id: studentId }, select: studentSelect });
    });

    return NextResponse.json({ ...student, movedTo: moveToClassId && moveToClassId !== classId ? moveToClassId : null });
  } catch (err) {
    console.error("[class student PATCH]", err, "by", user.id);
    return NextResponse.json({ error: "Could not save the student" }, { status: 500 });
  }
}

/**
 * Take the student off this class roster. The account and its past attendance
 * stay; only the enrolment goes, so the student can be added back later.
 */
export async function DELETE(req: Request, context: Ctx) {
  const { id: classId, studentId } = await context.params;
  const { error } = await requireManage("class", classId);
  if (error) return error;
  if (!(await enrolled(classId, studentId))) return NextResponse.json({ error: "Student not in this class" }, { status: 404 });

  try {
    await prisma.$transaction([
      prisma.class.update({ where: { id: classId }, data: { students: { disconnect: { id: studentId } } } }),
      prisma.classEnrollment.deleteMany({ where: { classId, studentId } }),
    ]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[class student DELETE]", err);
    return NextResponse.json({ error: "Could not remove the student" }, { status: 500 });
  }
}
