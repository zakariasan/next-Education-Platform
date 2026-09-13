// GET — the teacher's own curriculum graph: every module they own plus their
// milestone exams, wired together. Drafts included, since this is the builder.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/gamification/access";
import { buildCurriculumGraph } from "@/lib/gamification/curriculum-graph";

export async function GET() {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;

  const [modules, exams] = await Promise.all([
    prisma.module.findMany({ where: { teacherId: user.id }, select: { id: true } }),
    prisma.exam.findMany({ where: { teacherId: user.id, isMilestone: true }, select: { id: true } }),
  ]);

  const graph = await buildCurriculumGraph({
    moduleIds: modules.map((m) => m.id),
    examIds: exams.map((e) => e.id),
    ownerIds: [user.id],
    title: "Course map",
  });

  return NextResponse.json(graph);
}
