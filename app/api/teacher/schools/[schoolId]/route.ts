// GET / PATCH / DELETE one school.
//
// Authorisation is the shared creator rule: whoever created the school may edit
// or delete it, and an admin may act on any school. One route therefore serves
// both teachers and admins.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireManage } from "@/lib/access/ownership";

type Ctx = { params: Promise<{ schoolId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { schoolId } = await params;
  const { error } = await requireManage("school", schoolId);
  if (error) return error;

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      createdBy: { select: { id: true, name: true } },
      teachers: { include: { teacher: { select: { id: true, name: true, email: true } } } },
      classes: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(school, { status: 200 });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { schoolId } = await params;
  const { error } = await requireManage("school", schoolId);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const data: { name?: string; description?: string | null } = {};

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      return NextResponse.json({ error: "Name cannot be empty" }, { status: 400 });
    }
    data.name = body.name.trim();
  }
  if (body.description !== undefined) {
    data.description = typeof body.description === "string" && body.description.trim()
      ? body.description.trim()
      : null;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const school = await prisma.school.update({ where: { id: schoolId }, data });
  return NextResponse.json(school, { status: 200 });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { schoolId } = await params;
  const { error } = await requireManage("school", schoolId);
  if (error) return error;

  // Classes and events point at the school, so refuse rather than cascade a
  // delete through a teacher's real content.
  const [classes, events] = await Promise.all([
    prisma.class.count({ where: { schoolId } }),
    prisma.event.count({ where: { schoolId } }),
  ]);
  if (classes > 0 || events > 0) {
    return NextResponse.json(
      { error: `This school still has ${classes} class(es) and ${events} event(s). Remove them first.` },
      { status: 409 },
    );
  }

  await prisma.schoolTeacher.deleteMany({ where: { schoolId } });
  await prisma.school.delete({ where: { id: schoolId } });
  return NextResponse.json({ deleted: true }, { status: 200 });
}
