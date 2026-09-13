/**
 * One-off, idempotent backfill.
 *
 * Holy Graph prerequisites used to live in the Project self-relation
 * `_ProjectPrerequisites`, which could only join a project to a project. Edges
 * now live in `GraphEdge`, which can join any node kind. This copies the old
 * rows across. Safe to run more than once: every write is a skipDuplicates
 * insert and nothing is deleted.
 *
 *   npx tsx prisma/backfill-graph-edges.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    select: { id: true, moduleId: true, prerequisites: { select: { id: true, moduleId: true } } },
  });

  const rows = projects.flatMap((p) =>
    p.prerequisites
      // An edge only makes sense inside one module's graph.
      .filter((q) => q.moduleId === p.moduleId)
      .map((q) => ({
        moduleId: p.moduleId,
        fromKind: "PROJECT" as const,
        fromId: q.id,
        toKind: "PROJECT" as const,
        toId: p.id,
      })),
  );

  if (rows.length === 0) {
    console.log("No project prerequisites to copy.");
  } else {
    const res = await prisma.graphEdge.createMany({ data: rows, skipDuplicates: true });
    console.log(`Copied ${res.count} edge(s) into GraphEdge (${rows.length} found, duplicates skipped).`);
  }

  const total = await prisma.graphEdge.count();
  console.log(`GraphEdge now holds ${total} row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
