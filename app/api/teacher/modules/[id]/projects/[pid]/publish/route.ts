// POST { action: "publish" | "archive" | "draft" }
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { projectInclude, serializeProject } from "@/lib/gamification/queries";

type Ctx = { params: Promise<{ id: string; pid: string }> };

export async function POST(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id, pid } = await params;
  if (!(await manageableModule(user, id))) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  const project = await prisma.project.findFirst({ where: { id: pid, moduleId: id }, include: projectInclude });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { action } = await req.json().catch(() => ({}));
  let status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  if (action === "publish") {
    if (!project.currentVersion || project.currentVersion.criteria.length === 0) {
      return NextResponse.json({ error: "Add a statement and at least one rubric criterion before publishing" }, { status: 400 });
    }
    status = "PUBLISHED";
  } else if (action === "archive") {
    status = "ARCHIVED";
  } else if (action === "draft") {
    if (project._count.attempts > 0) return NextResponse.json({ error: "Students already attempted this project; archive it instead" }, { status: 400 });
    status = "DRAFT";
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const updated = await prisma.project.update({ where: { id: pid }, data: { status }, include: projectInclude });
  return NextResponse.json(serializeProject(updated));
}
