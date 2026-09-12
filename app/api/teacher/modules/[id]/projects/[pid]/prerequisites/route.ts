// PUT { prerequisiteIds: string[] } — replaces prerequisites, rejects cycles
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { wouldCreateCycle, type Edge } from "@/lib/gamification/graph";
import { projectInclude, serializeProject } from "@/lib/gamification/queries";

type Ctx = { params: Promise<{ id: string; pid: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, pid } = await params;
  if (!(await manageableModule(user, id))) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const wanted: string[] = Array.isArray(body.prerequisiteIds) ? [...new Set<string>(body.prerequisiteIds.map(String))] : [];
  if (wanted.includes(pid)) return NextResponse.json({ error: "A project cannot require itself" }, { status: 400 });

  const projects = await prisma.project.findMany({
    where: { moduleId: id },
    select: { id: true, prerequisites: { select: { id: true } }, currentVersion: { select: { title: true } } },
  });
  const ids = new Set(projects.map((p) => p.id));
  if (!ids.has(pid)) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const unknown = wanted.filter((w) => !ids.has(w));
  if (unknown.length) return NextResponse.json({ error: "Prerequisites must belong to the same module" }, { status: 400 });

  // Existing edges without this project's current incoming ones.
  const edges: Edge[] = [];
  for (const p of projects) if (p.id !== pid) for (const q of p.prerequisites) edges.push({ from: q.id, to: p.id });

  for (const prereq of wanted) {
    if (wouldCreateCycle(edges, prereq, pid)) {
      const title = projects.find((p) => p.id === prereq)?.currentVersion?.title ?? prereq;
      return NextResponse.json({ error: `"${title}" would create a cycle` }, { status: 400 });
    }
    edges.push({ from: prereq, to: pid });
  }

  const updated = await prisma.project.update({
    where: { id: pid },
    data: { prerequisites: { set: wanted.map((w) => ({ id: w })) } },
    include: projectInclude,
  });
  return NextResponse.json(serializeProject(updated));
}
