// GET (module + projects), PATCH (title/description/subject/status), DELETE
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { moduleInclude, projectInclude, serializeModule, serializeProject } from "@/lib/gamification/queries";
import type { ModuleDetailDTO } from "@/lib/gamification/types";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const mod = await prisma.module.findUniqueOrThrow({
    where: { id },
    include: { ...moduleInclude, projects: { include: projectInclude, orderBy: { orderIndex: "asc" } } },
  });
  const payload: ModuleDetailDTO = {
    ...serializeModule({ ...mod, projects: mod.projects.map((p) => ({ isCore: p.isCore })) }),
    projects: mod.projects.map(serializeProject),
  };
  return NextResponse.json(payload);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const data: { title?: string; description?: string | null; subject?: string; status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" } = {};
  if (typeof body.title === "string") {
    if (!body.title.trim()) return NextResponse.json({ error: "Title is required" }, { status: 400 });
    data.title = body.title.trim();
  }
  if (typeof body.description === "string") data.description = body.description.trim() || null;
  if (typeof body.subject === "string" && body.subject.trim()) data.subject = body.subject.trim();
  if (body.status === "DRAFT" || body.status === "PUBLISHED" || body.status === "ARCHIVED") data.status = body.status;

  const mod = await prisma.module.update({ where: { id }, data, include: moduleInclude });
  return NextResponse.json(serializeModule(mod));
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const attempts = await prisma.projectAttempt.count({ where: { project: { moduleId: id } } });
  if (attempts > 0) {
    await prisma.module.update({ where: { id }, data: { status: "ARCHIVED" } });
    return NextResponse.json({ archived: true });
  }
  await prisma.module.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
