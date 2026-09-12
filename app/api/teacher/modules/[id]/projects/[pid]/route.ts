// GET (project + all versions), PATCH (content → new version if published; meta), DELETE
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manageableModule, requireTeacherOrAdmin, type SessionUser } from "@/lib/gamification/access";
import { projectInclude, serializeProject, serializeVersion } from "@/lib/gamification/queries";
import { validateProjectContent } from "@/lib/gamification/validate";

type Ctx = { params: Promise<{ id: string; pid: string }> };

async function loadProject(user: SessionUser, moduleId: string, pid: string) {
  if (!(await manageableModule(user, moduleId))) return null;
  return prisma.project.findFirst({ where: { id: pid, moduleId }, include: projectInclude });
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, pid } = await params;
  const project = await loadProject(user, id, pid);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const versions = await prisma.projectVersion.findMany({
    where: { projectId: pid },
    include: { criteria: { orderBy: { orderIndex: "asc" } }, _count: { select: { attempts: true } } },
    orderBy: { versionNumber: "desc" },
  });
  return NextResponse.json({
    ...serializeProject(project),
    versions: versions.map((v) => ({ ...serializeVersion(v), attemptCount: v._count.attempts })),
  });
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, pid } = await params;
  const project = await loadProject(user, id, pid);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const meta: { isCore?: boolean; orderIndex?: number; pinX?: number | null; pinY?: number | null } = {};
  if (typeof body.isCore === "boolean") meta.isCore = body.isCore;
  if (Number.isInteger(body.orderIndex)) meta.orderIndex = body.orderIndex;
  if (body.pinX === null || typeof body.pinX === "number") meta.pinX = body.pinX;
  if (body.pinY === null || typeof body.pinY === "number") meta.pinY = body.pinY;

  let createdNewVersion = false;
  if (body.content !== undefined) {
    const content = validateProjectContent(body.content);
    if (!content.ok) return NextResponse.json({ error: content.error }, { status: 400 });
    const c = content.value;
    const criteriaCreate = c.criteria.map((cr, i) => ({
      title: cr.title,
      description: cr.description,
      weight: cr.weight,
      mode: cr.mode,
      orderIndex: i,
      autoConfig: cr.autoConfig ?? undefined,
    }));
    const versionData = {
      title: c.title,
      statement: c.statement,
      objectives: c.objectives,
      estimatedHours: c.estimatedHours,
      xpReward: c.xpReward,
      allowedResources: c.allowedResources,
      threshold: c.threshold,
    };

    await prisma.$transaction(async (tx) => {
      // Published projects are immutable: edits become a new version so existing
      // attempts keep pointing at the version they were made on.
      if (project.status === "PUBLISHED" || !project.currentVersion) {
        const next = (await tx.projectVersion.aggregate({ where: { projectId: pid }, _max: { versionNumber: true } }))._max.versionNumber ?? 0;
        const v = await tx.projectVersion.create({
          data: { projectId: pid, versionNumber: next + 1, ...versionData, criteria: { create: criteriaCreate } },
        });
        await tx.project.update({ where: { id: pid }, data: { currentVersionId: v.id, ...meta } });
        createdNewVersion = true;
      } else {
        const vid = project.currentVersion.id;
        await tx.rubricCriterion.deleteMany({ where: { versionId: vid } });
        await tx.projectVersion.update({ where: { id: vid }, data: { ...versionData, criteria: { create: criteriaCreate } } });
        await tx.project.update({ where: { id: pid }, data: meta });
      }
    });
  } else if (Object.keys(meta).length) {
    await prisma.project.update({ where: { id: pid }, data: meta });
  }

  const fresh = await prisma.project.findUniqueOrThrow({ where: { id: pid }, include: projectInclude });
  return NextResponse.json({ ...serializeProject(fresh), createdNewVersion });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, pid } = await params;
  const project = await loadProject(user, id, pid);
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  if (project._count.attempts > 0) {
    await prisma.project.update({ where: { id: pid }, data: { status: "ARCHIVED" } });
    return NextResponse.json({ archived: true });
  }
  await prisma.project.delete({ where: { id: pid } });
  return NextResponse.json({ deleted: true });
}
