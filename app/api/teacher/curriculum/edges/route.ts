// PUT { nodeId, prerequisiteIds } — rewire one node of the curriculum graph.
// Ids are node keys: "MODULE:x" or "EXAM:y". Cycles are rejected.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireTeacherOrAdmin } from "@/lib/gamification/access";
import { buildCurriculumGraph, setCurriculumPrerequisites } from "@/lib/gamification/curriculum-graph";
import { nodeKey } from "@/lib/gamification/nodes";

export async function PUT(req: NextRequest) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const nodeId = typeof body.nodeId === "string" ? body.nodeId : "";
  if (!nodeId) return NextResponse.json({ error: "Missing nodeId" }, { status: 400 });
  const prerequisiteIds: string[] = Array.isArray(body.prerequisiteIds)
    ? [...new Set<string>(body.prerequisiteIds.map(String))]
    : [];

  // Only nodes this teacher owns may take part, which also stops one teacher
  // wiring their module behind someone else's.
  const [modules, exams] = await Promise.all([
    prisma.module.findMany({ where: { teacherId: user.id }, select: { id: true, title: true } }),
    prisma.exam.findMany({ where: { teacherId: user.id, isMilestone: true }, select: { id: true, title: true } }),
  ]);

  const titles = new Map<string, string>();
  for (const m of modules) titles.set(nodeKey("MODULE", m.id), m.title);
  for (const e of exams) titles.set(nodeKey("EXAM", e.id), e.title);
  const keys = new Set(titles.keys());

  const problem = await setCurriculumPrerequisites(
    user.id,
    nodeId,
    prerequisiteIds,
    keys,
    (k) => titles.get(k) ?? k,
  );
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const graph = await buildCurriculumGraph({
    moduleIds: modules.map((m) => m.id),
    examIds: exams.map((e) => e.id),
    ownerIds: [user.id],
    title: "Course map",
  });
  return NextResponse.json(graph);
}
