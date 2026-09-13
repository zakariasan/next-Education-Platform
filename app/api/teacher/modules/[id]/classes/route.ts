// GET  — which classes study this module, plus the classes it could be added to.
// PUT  { classIds: string[] } — set exactly which classes study it.
//
// This is the curriculum link. A module is authored once and assigned to as
// many classes as the teacher wants, across schools.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";

type Ctx = { params: Promise<{ id: string }> };

/** Classes the caller is allowed to put a module into. */
function ownClassesWhere(userId: string, admin: boolean) {
  return admin ? { archived: false } : { teacherId: userId, archived: false };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const [assigned, candidates] = await Promise.all([
    prisma.moduleAssignment.findMany({
      where: { moduleId: id },
      include: { class: { select: { id: true, name: true, school: { select: { name: true } } } } },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.class.findMany({
      where: ownClassesWhere(user.id, isAdmin(user)),
      select: { id: true, name: true, school: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return NextResponse.json({
    assignedClassIds: assigned.map((a) => a.classId),
    assigned: assigned.map((a) => ({
      classId: a.classId,
      name: a.class.name,
      school: a.class.school?.name ?? null,
      orderIndex: a.orderIndex,
    })),
    candidates: candidates.map((c) => ({
      id: c.id,
      name: c.name,
      school: c.school?.name ?? null,
    })),
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const wanted: string[] = Array.isArray(body.classIds) ? [...new Set<string>(body.classIds.map(String))] : [];

  // You can only assign a module to a class you run, so a teacher cannot push
  // their module into someone else's classroom.
  if (wanted.length) {
    const allowed = await prisma.class.findMany({
      where: { id: { in: wanted }, ...ownClassesWhere(user.id, isAdmin(user)) },
      select: { id: true },
    });
    if (allowed.length !== wanted.length) {
      return NextResponse.json({ error: "You can only assign a module to your own classes" }, { status: 403 });
    }
  }

  await prisma.$transaction([
    prisma.moduleAssignment.deleteMany({ where: { moduleId: id, classId: { notIn: wanted.length ? wanted : ["" ] } } }),
    prisma.moduleAssignment.createMany({
      data: wanted.map((classId, i) => ({ moduleId: id, classId, assignedById: user.id, orderIndex: i })),
      skipDuplicates: true,
    }),
  ]);

  const assigned = await prisma.moduleAssignment.findMany({
    where: { moduleId: id },
    include: { class: { select: { id: true, name: true, school: { select: { name: true } } } } },
    orderBy: { orderIndex: "asc" },
  });
  return NextResponse.json({
    assignedClassIds: assigned.map((a) => a.classId),
    assigned: assigned.map((a) => ({
      classId: a.classId,
      name: a.class.name,
      school: a.class.school?.name ?? null,
      orderIndex: a.orderIndex,
    })),
  });
}
