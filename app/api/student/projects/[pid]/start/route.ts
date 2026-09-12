// POST start (or retry) a project: creates an IN_PROGRESS attempt.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent, visibleTeacherIds } from "@/lib/gamification/access";
import { canRetry, retryAvailableAt } from "@/lib/gamification/scoring";
import { studentProjectPanel } from "@/lib/gamification/student";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ pid: string }> }) {
  const { user, error } = await requireStudent();
  if (error) return error;
  const { pid } = await params;

  const project = await prisma.project.findFirst({
    where: { id: pid, status: "PUBLISHED", module: { status: "PUBLISHED", teacherId: { in: await visibleTeacherIds(user.id) } } },
    include: { prerequisites: { select: { id: true } } },
  });
  if (!project?.currentVersionId) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const validatedPrereqs = await prisma.projectAttempt.count({
    where: { studentId: user.id, state: "VALIDATED", projectId: { in: project.prerequisites.map((p) => p.id) } },
  });
  if (validatedPrereqs < project.prerequisites.length) {
    return NextResponse.json({ error: "Validate the prerequisites first" }, { status: 400 });
  }

  const attempts = await prisma.projectAttempt.findMany({ where: { studentId: user.id, projectId: pid }, orderBy: { attemptNumber: "desc" } });
  if (attempts.some((a) => a.state === "VALIDATED")) return NextResponse.json({ error: "Already validated" }, { status: 400 });
  const latest = attempts[0];
  if (latest && latest.state !== "FAILED") {
    return NextResponse.json({ error: "An attempt is already in progress" }, { status: 400 });
  }
  if (latest?.state === "FAILED" && !canRetry(latest.reviewedAt)) {
    return NextResponse.json(
      { error: "Retry cooldown active", availableAt: retryAvailableAt(latest.reviewedAt!).toISOString() },
      { status: 429 },
    );
  }

  await prisma.projectAttempt.create({
    data: {
      projectId: pid,
      versionId: project.currentVersionId,
      studentId: user.id,
      attemptNumber: (latest?.attemptNumber ?? 0) + 1,
      state: "IN_PROGRESS",
      startedAt: new Date(),
    },
  });
  return NextResponse.json(await studentProjectPanel(user.id, pid), { status: 201 });
}
