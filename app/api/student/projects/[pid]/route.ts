// GET project panel data (statement, rubric without answers, my attempt).
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent, visibleTeacherIds } from "@/lib/gamification/access";
import { studentProjectPanel } from "@/lib/gamification/student";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ pid: string }> }) {
  const { user, error } = await requireStudent();
  if (error) return error;
  const { pid } = await params;

  const visible = await prisma.project.findFirst({
    where: { id: pid, status: "PUBLISHED", module: { status: "PUBLISHED", teacherId: { in: await visibleTeacherIds(user.id) } } },
    select: { id: true },
  });
  if (!visible) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const panel = await studentProjectPanel(user.id, pid);
  if (!panel) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  return NextResponse.json(panel);
}
