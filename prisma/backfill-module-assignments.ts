/**
 * One-off, idempotent backfill.
 *
 * Modules used to be visible to a student if any teacher of any of their
 * classes owned the module. Visibility is now an explicit ModuleAssignment per
 * class. This reproduces the old reach exactly: every module is assigned to
 * every non-archived class its own teacher runs.
 *
 * Teachers can then prune each class's curriculum in the UI.
 *
 *   npx tsx prisma/backfill-module-assignments.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.module.findMany({ select: { id: true, title: true, teacherId: true } });

  let created = 0;
  for (const mod of modules) {
    const classes = await prisma.class.findMany({
      where: { teacherId: mod.teacherId, archived: false },
      select: { id: true },
      orderBy: { createdAt: "asc" },
    });
    if (classes.length === 0) {
      console.log(`- "${mod.title}": teacher runs no classes, left unassigned`);
      continue;
    }
    const res = await prisma.moduleAssignment.createMany({
      data: classes.map((c, i) => ({
        moduleId: mod.id,
        classId: c.id,
        assignedById: mod.teacherId,
        orderIndex: i,
      })),
      skipDuplicates: true,
    });
    created += res.count;
    console.log(`- "${mod.title}": ${res.count} new assignment(s) across ${classes.length} class(es)`);
  }

  const total = await prisma.moduleAssignment.count();
  console.log(`\nCreated ${created}. ModuleAssignment now holds ${total} row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
