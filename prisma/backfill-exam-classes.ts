/**
 * One-off, idempotent backfill.
 *
 * An exam used to be sat by exactly one class, its `classId`. Exams can now be
 * shared with several classes through ExamClass. This gives every existing exam
 * a row for its own class, so visibility only ever has to consult the join.
 *
 *   npx tsx prisma/backfill-exam-classes.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const exams = await prisma.exam.findMany({ select: { id: true, classId: true } });
  if (exams.length === 0) {
    console.log("No exams to backfill.");
  } else {
    const res = await prisma.examClass.createMany({
      data: exams.map((e) => ({ examId: e.id, classId: e.classId })),
      skipDuplicates: true,
    });
    console.log(`Linked ${res.count} exam(s) to their own class (${exams.length} found).`);
  }
  console.log(`ExamClass now holds ${await prisma.examClass.count()} row(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
