// One-off backfill: run manually after `prisma db push` picks up the new
// School/Class.schoolId columns. Not wired into the build — run by hand:
//   npx tsx prisma/backfill-schools.ts
//
// For every teacher with classes that have no schoolId yet, creates one
// default School owned by that teacher and attaches all of their orphan
// classes to it. Class.schoolId stays nullable in the DB (see the comment
// on Class.schoolId in schema.prisma) since this project uses `db push`
// against a live database rather than versioned migrations — going
// forward, class-creation APIs must require schoolId at the application
// layer even though the column itself isn't NOT NULL.
import { prisma } from "../lib/prisma";

async function main() {
  const orphanClasses = await prisma.class.findMany({
    where: { schoolId: null },
    select: { id: true, teacherId: true },
  });

  const teacherIds = [...new Set(orphanClasses.map((c) => c.teacherId))];

  for (const teacherId of teacherIds) {
    const teacher = await prisma.user.findUnique({ where: { id: teacherId } });
    if (!teacher) continue;

    const school = await prisma.school.create({
      data: {
        name: `${teacher.name}'s School`,
        createdById: teacher.id,
        teachers: { create: { teacherId: teacher.id } },
      },
    });

    const result = await prisma.class.updateMany({
      where: { teacherId: teacher.id, schoolId: null },
      data: { schoolId: school.id },
    });

    console.log(
      `Created school "${school.name}" (${school.id}) for teacher ${teacher.id}, attached ${result.count} class(es).`,
    );
  }

  console.log(`Done. Backfilled ${teacherIds.length} teacher(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
