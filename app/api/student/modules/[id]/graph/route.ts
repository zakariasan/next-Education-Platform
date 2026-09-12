// GET Holy Graph payload + progress summary for the current student.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent, visibleTeacherIds } from "@/lib/gamification/access";
import { getModuleGraph } from "@/lib/gamification/queries";
import { progressSummary } from "@/lib/gamification/student";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireStudent();
  if (error) return error;
  const { id } = await params;

  const mod = await prisma.module.findFirst({
    where: { id, status: "PUBLISHED", teacherId: { in: await visibleTeacherIds(user.id) } },
    select: { id: true },
  });
  if (!mod) return NextResponse.json({ error: "Module not found" }, { status: 404 });

  const [graph, progress] = await Promise.all([getModuleGraph(id, { studentId: user.id }), progressSummary(user.id, id)]);
  return NextResponse.json({ ...graph, progress });
}
