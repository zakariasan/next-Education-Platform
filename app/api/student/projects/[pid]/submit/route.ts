// POST { answers: { [criterionId]: value } } — submit the in-progress attempt.
// Auto criteria are graded instantly; the rest go to teacher/peer review.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/gamification/access";
import { assignReviewers, autoGradeAttempt, finalizeAttempt, hoursBetween } from "@/lib/gamification/pipeline";
import { studentProjectPanel } from "@/lib/gamification/student";

export async function POST(req: NextRequest, { params }: { params: Promise<{ pid: string }> }) {
  const { user, error } = await requireStudent();
  if (error) return error;
  const { pid } = await params;
  const body = await req.json().catch(() => ({}));
  const answers = body.answers && typeof body.answers === "object" ? (body.answers as Record<string, unknown>) : {};

  const attempt = await prisma.projectAttempt.findFirst({
    where: { studentId: user.id, projectId: pid, state: "IN_PROGRESS" },
    include: { version: { include: { criteria: true } } },
  });
  if (!attempt) return NextResponse.json({ error: "No attempt in progress" }, { status: 400 });

  const allowed = new Set(attempt.version.criteria.map((c) => c.id));
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(answers)) if (allowed.has(k)) clean[k] = v;

  const result = await prisma.$transaction(async (tx) => {
    const now = new Date();
    await tx.projectAttempt.update({
      where: { id: attempt.id },
      data: {
        state: "SUBMITTED",
        submittedAt: now,
        actualHours: attempt.startedAt ? hoursBetween(attempt.startedAt, now) : null,
        answers: clean as object,
      },
    });
    await autoGradeAttempt(tx, attempt.id);
    const needsHuman = attempt.version.criteria.some((c) => c.mode !== "AUTO");
    if (needsHuman) await assignReviewers(tx, attempt.id);
    return finalizeAttempt(tx, attempt.id);
  });

  const panel = await studentProjectPanel(user.id, pid);
  return NextResponse.json({ result, panel });
}
