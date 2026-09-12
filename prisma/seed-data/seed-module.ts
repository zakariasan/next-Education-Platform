// Reusable module seeder: creates (or rebuilds) a module and its projects
// from a SeedModule definition. Used by prisma/seed.ts; call it from any
// script to add another subject.
import type { PrismaClient } from "@prisma/client";
import { GAMIFICATION } from "../../lib/gamification/config";
import type { SeedModule } from "./physics-mechanics";

export async function seedModule(
  prisma: PrismaClient,
  def: SeedModule,
  teacherId: string,
  opts: { moduleId?: string; idPrefix?: string } = {},
) {
  const moduleId = opts.moduleId ?? def.id;
  const pid = (id: string) => (opts.idPrefix ? `${opts.idPrefix}:${id}` : id);

  await prisma.xpEvent.deleteMany({ where: { moduleId } });
  await prisma.module.deleteMany({ where: { id: moduleId } });

  const created = await prisma.module.create({
    data: { id: moduleId, title: def.title, subject: def.subject, description: def.description, status: "PUBLISHED", teacherId },
  });

  for (const [i, p] of def.projects.entries()) {
    const project = await prisma.project.create({
      data: { id: pid(p.id), moduleId: created.id, teacherId, isCore: p.isCore, orderIndex: i, status: "PUBLISHED" },
    });
    const version = await prisma.projectVersion.create({
      data: {
        projectId: project.id,
        versionNumber: 1,
        title: p.title,
        statement: p.statement,
        objectives: p.objectives,
        estimatedHours: p.estimatedHours,
        xpReward: p.xpReward,
        allowedResources: p.allowedResources,
        threshold: p.threshold ?? GAMIFICATION.validation.defaultThresholdPercent,
        criteria: {
          create: p.criteria.map((c, j) => ({
            title: c.title,
            description: c.description,
            weight: c.weight,
            mode: c.mode,
            orderIndex: j,
            autoConfig: c.autoConfig ?? undefined,
          })),
        },
      },
    });
    await prisma.project.update({ where: { id: project.id }, data: { currentVersionId: version.id } });
  }
  for (const p of def.projects) {
    if (!p.prerequisites.length) continue;
    await prisma.project.update({
      where: { id: pid(p.id) },
      data: { prerequisites: { connect: p.prerequisites.map((id) => ({ id: pid(id) })) } },
    });
  }
  return created;
}
