// GET graph payload (teacher preview, drafts included, optional ?studentId=)
// PATCH { pins: { [nodeKey]: { x, y } | null } } — pin/unpin node positions.
// Keys are node keys ("PROJECT:x", "EXAM:y", "QUIZ:z"), so exams and quizzes can
// be dragged into place just like projects.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { getModuleGraph } from "@/lib/gamification/queries";
import { parseNodeKey } from "@/lib/gamification/nodes";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const studentId = req.nextUrl.searchParams.get("studentId") ?? undefined;
  const graph = await getModuleGraph(id, { studentId, includeDrafts: true });
  return NextResponse.json(graph);
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const pins = body.pins && typeof body.pins === "object" ? (body.pins as Record<string, { x: number; y: number } | null>) : {};
  const ops = Object.entries(pins).flatMap(([key, pin]) => {
    let node: { kind: "PROJECT" | "EXAM" | "QUIZ" | "MODULE"; id: string };
    try {
      node = parseNodeKey(key);
    } catch {
      return [];
    }
    const data =
      pin && Number.isFinite(pin.x) && Number.isFinite(pin.y)
        ? { pinX: pin.x, pinY: pin.y }
        : { pinX: null, pinY: null };
    const where = { id: node.id, moduleId: id };
    if (node.kind === "EXAM") return [prisma.exam.updateMany({ where, data })];
    if (node.kind === "QUIZ") return [prisma.quiz.updateMany({ where, data })];
    if (node.kind === "PROJECT") return [prisma.project.updateMany({ where, data })];
    // MODULE nodes belong to the curriculum graph, not to a module's own graph.
    return [];
  });
  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
