// PUT { prerequisiteIds: string[] } — replaces a project's prerequisites.
//
// Prerequisites now live in the GraphEdge table so that a project can also
// depend on an exam or a quiz. This route keeps its project-shaped body for the
// existing builder UI and converts the ids to node keys; the generic editor for
// every node kind is at ../../graph/edges.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { setPrerequisites } from "@/lib/gamification/module-graph";
import { nodeKey } from "@/lib/gamification/nodes";
import { projectInclude, serializeProject } from "@/lib/gamification/queries";

type Ctx = { params: Promise<{ id: string; pid: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, pid } = await params;
  if (!(await manageableModule(user, id))) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const wanted: string[] = Array.isArray(body.prerequisiteIds)
    ? [...new Set<string>(body.prerequisiteIds.map(String))]
    : [];

  const problem = await setPrerequisites(
    id,
    nodeKey("PROJECT", pid),
    wanted.map((w) => nodeKey("PROJECT", w)),
  );
  if (problem) return NextResponse.json({ error: problem }, { status: 400 });

  const updated = await prisma.project.findUniqueOrThrow({ where: { id: pid }, include: projectInclude });
  return NextResponse.json(serializeProject(updated));
}
