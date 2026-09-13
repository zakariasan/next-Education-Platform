// GET — the big graph: how the student's modules connect, and the milestone
// exams that gate the step from one ring of modules to the next.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent, visibleModuleIds } from "@/lib/gamification/access";
import { buildCurriculumGraph } from "@/lib/gamification/curriculum-graph";

export async function GET() {
  const { user, error } = await requireStudent();
  if (error) return error;

  // Only modules assigned to a class this student is in, and only published.
  const assigned = await visibleModuleIds(user.id);
  const modules = await prisma.module.findMany({
    where: { id: { in: assigned }, status: "PUBLISHED" },
    select: { id: true, teacherId: true },
  });

  // Milestone exams belong to a class, so the student sees those of their own
  // classes.
  // An exam can be shared with several classes, so visibility goes through the
  // audience join rather than the single owning class.
  const exams = await prisma.exam.findMany({
    where: {
      isMilestone: true,
      audiences: { some: { class: { students: { some: { id: user.id } } } } },
    },
    select: { id: true, teacherId: true },
  });

  const ownerIds = [...new Set([...modules.map((m) => m.teacherId), ...exams.map((e) => e.teacherId)])];

  const graph = await buildCurriculumGraph({
    moduleIds: modules.map((m) => m.id),
    examIds: exams.map((e) => e.id),
    ownerIds,
    studentId: user.id,
    title: "Your course",
  });

  return NextResponse.json(graph);
}
