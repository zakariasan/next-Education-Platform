// PUT { nodeId, prerequisiteIds } — replaces the prerequisites of any node in a
// module's Holy Graph. Ids here are node keys ("PROJECT:x", "EXAM:y", "QUIZ:z"),
// so a quiz can gate a project and an exam can require several projects.
import { NextRequest, NextResponse } from "next/server";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { setPrerequisites } from "@/lib/gamification/module-graph";
import { getModuleGraph } from "@/lib/gamification/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) {
    return NextResponse.json({ error: "Module not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const nodeId = typeof body.nodeId === "string" ? body.nodeId : "";
  if (!nodeId) return NextResponse.json({ error: "Missing nodeId" }, { status: 400 });

  const prerequisiteIds: string[] = Array.isArray(body.prerequisiteIds)
    ? [...new Set<string>(body.prerequisiteIds.map(String))]
    : [];

  const problem = await setPrerequisites(id, nodeId, prerequisiteIds);
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const graph = await getModuleGraph(id, { includeDrafts: true });
  return NextResponse.json(graph);
}
