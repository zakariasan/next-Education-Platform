// POST (create a draft project with its first version)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { projectInclude, serializeProject } from "@/lib/gamification/queries";
import { validateProjectContent } from "@/lib/gamification/validate";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id: moduleId } = await params;
  const mod = await manageableModule(user, moduleId);
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const content = validateProjectContent(body.content);
  if (!content.ok) return NextResponse.json({ error: content.error }, { status: 400 });
  const c = content.value;

  const last = await prisma.project.aggregate({ where: { moduleId }, _max: { orderIndex: true } });

  const project = await prisma.$transaction(async (tx) => {
    const p = await tx.project.create({
      data: {
        moduleId,
        teacherId: mod.teacherId,
        isCore: body.isCore !== false,
        orderIndex: (last._max.orderIndex ?? -1) + 1,
      },
    });
    const v = await tx.projectVersion.create({
      data: {
        projectId: p.id,
        versionNumber: 1,
        title: c.title,
        statement: c.statement,
        objectives: c.objectives,
        estimatedHours: c.estimatedHours,
        xpReward: c.xpReward,
        allowedResources: c.allowedResources,
        threshold: c.threshold,
        criteria: {
          create: c.criteria.map((cr, i) => ({
            title: cr.title,
            description: cr.description,
            weight: cr.weight,
            mode: cr.mode,
            orderIndex: i,
            autoConfig: cr.autoConfig ?? undefined,
          })),
        },
      },
    });
    return tx.project.update({ where: { id: p.id }, data: { currentVersionId: v.id }, include: projectInclude });
  });

  return NextResponse.json(serializeProject(project), { status: 201 });
}
