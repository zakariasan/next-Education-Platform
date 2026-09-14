// Roster of one class: GET the students, POST to add one.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManage } from "@/lib/access/ownership";
import { studentSelect } from "@/lib/roster";
import bcrypt from "bcrypt";

export async function GET(
  req: Request,
   context: { params: Promise<{ id: string }>  }
) {
  try {
    const { id } = await context.params;
    const { error } = await requireManage("class", id);
    if (error) return error;

    const classData = await prisma.class.findUnique({
      where: { id },
      include: { students: { select: studentSelect, orderBy: { name: "asc" } } },
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(classData.students);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

/**
 * Add a student to the class. Either an existing account (by email), or a new
 * one when the teacher also sends a name and a first password.
 */
export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: classId } = await context.params;
  const { error } = await requireManage("class", classId);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  const name = String(body.name ?? "").trim();
  const password = typeof body.password === "string" ? body.password : "";

  if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

  try {
    let student = await prisma.user.findUnique({ where: { email }, select: { ...studentSelect, password: false } });

    if (!student) {
      if (!name || password.length < 6) {
        return NextResponse.json(
          { error: "No account with that email. To create one, send a name and a password of at least 6 characters." },
          { status: 404 },
        );
      }
      student = await prisma.user.create({
        data: { name, email, password: await bcrypt.hash(password, 10), role: "STUDENT", provider: "credentials" },
        select: studentSelect,
      });
    } else if (student.role && student.role !== "STUDENT") {
      return NextResponse.json({ error: `${student.name} is a ${student.role.toLowerCase()}, not a student` }, { status: 400 });
    }

    const already = await prisma.class.findFirst({
      where: { id: classId, students: { some: { id: student.id } } },
      select: { id: true },
    });
    if (already) return NextResponse.json({ error: `${student.name} is already in this class` }, { status: 409 });

    await prisma.$transaction([
      prisma.class.update({ where: { id: classId }, data: { students: { connect: { id: student.id } } } }),
      prisma.classEnrollment.upsert({
        where: { classId_studentId: { classId, studentId: student.id } },
        create: { classId, studentId: student.id },
        update: { banned: false, bannedAt: null, bannedReason: null },
      }),
    ]);

    return NextResponse.json(student, { status: 201 });
  } catch (err) {
    console.error("[class students POST]", err);
    return NextResponse.json({ error: "Could not add the student" }, { status: 500 });
  }
}
