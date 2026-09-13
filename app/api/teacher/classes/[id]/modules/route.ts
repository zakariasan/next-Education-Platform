// GET  — the modules this class studies, and the ones it does not yet.
// PUT  { moduleIds: string[] } — set exactly which modules this class studies.
//
// The mirror image of /api/teacher/modules/[id]/classes. Same join table, seen
// from the class instead of the module, so curriculum can be edited from either
// end.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/gamification/access";
import { requireManage } from "@/lib/access/ownership";

type Ctx = { params: Promise<{ id: string }> };

/** Modules the caller is allowed to put into a class. */
function ownModulesWhere(userId: string, admin: boolean) {
  return admin ? {} : { teacherId: userId };
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { user, error } = await requireManage("class", id);
  if (error) return error;

  const [assignments, mine] = await Promise.all([
    prisma.moduleAssignment.findMany({
      where: { classId: id },
      include: { module: { select: { id: true, title: true, subject: true, status: true } } },
      orderBy: { orderIndex: "asc" },
    }),
    prisma.module.findMany({
      where: ownModulesWhere(user.id, isAdmin(user)),
      select: {
        id: true,
        title: true,
        subject: true,
        status: true,
        _count: { select: { projects: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const assignedIds = new Set(assignments.map((a) => a.moduleId));

  return NextResponse.json({
    assignedModuleIds: [...assignedIds],
    assigned: assignments.map((a) => ({
      id: a.module.id,
      title: a.module.title,
      subject: a.module.subject,
      status: a.module.status,
    })),
    // Everything the teacher owns that this class is not studying yet.
    available: mine
      .filter((m) => !assignedIds.has(m.id))
      .map((m) => ({
        id: m.id,
        title: m.title,
        subject: m.subject,
        status: m.status,
        projectCount: m._count.projects,
      })),
  });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { id } = await params;
  const { user, error } = await requireManage("class", id);
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const wanted: string[] = Array.isArray(body.moduleIds) ? [...new Set<string>(body.moduleIds.map(String))] : [];

  // You can only put your own modules into a class.
  if (wanted.length) {
    const allowed = await prisma.module.findMany({
      where: { id: { in: wanted }, ...ownModulesWhere(user.id, isAdmin(user)) },
      select: { id: true },
    });
    if (allowed.length !== wanted.length) {
      return NextResponse.json({ error: "You can only assign your own modules" }, { status: 403 });
    }
  }

  await prisma.$transaction([
    prisma.moduleAssignment.deleteMany({
      where: { classId: id, moduleId: { notIn: wanted.length ? wanted : [""] } },
    }),
    prisma.moduleAssignment.createMany({
      data: wanted.map((moduleId, i) => ({ moduleId, classId: id, assignedById: user.id, orderIndex: i })),
      skipDuplicates: true,
    }),
  ]);

  return NextResponse.json({ assignedModuleIds: wanted });
}
