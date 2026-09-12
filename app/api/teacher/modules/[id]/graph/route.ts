// GET graph payload (teacher preview, drafts included, optional ?studentId=)
// PATCH { pins: { [projectId]: { x, y } | null } } — pin/unpin node positions
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { getModuleGraph } from "@/lib/gamification/queries";

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
  const ops = Object.entries(pins).map(([projectId, pin]) =>
    prisma.project.updateMany({
      where: { id: projectId, moduleId: id },
      data: pin && Number.isFinite(pin.x) && Number.isFinite(pin.y) ? { pinX: pin.x, pinY: pin.y } : { pinX: null, pinY: null },
    }),
  );
  await prisma.$transaction(ops);
  return NextResponse.json({ ok: true });
}
