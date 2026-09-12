// GET review detail (answers + rubric), POST grades.
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, requireTeacherOrAdmin, type SessionUser } from "@/lib/gamification/access";
import { reviewDetail, submitReview } from "@/lib/gamification/reviews";

type Ctx = { params: Promise<{ assignmentId: string }> };

async function reviewerFor(user: SessionUser, assignmentId: string) {
  if (!isAdmin(user)) return user.id;
  const row = await prisma.reviewAssignment.findUnique({ where: { id: assignmentId }, select: { reviewerId: true } });
  return row?.reviewerId ?? user.id;
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { assignmentId } = await params;
  const detail = await reviewDetail(assignmentId, await reviewerFor(user, assignmentId));
  if (!detail) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json(detail);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { assignmentId } = await params;
  const body = await req.json().catch(() => ({}));
  const out = await submitReview(assignmentId, await reviewerFor(user, assignmentId), { scores: body.scores ?? {}, feedback: body.feedback });
  if ("error" in out) return NextResponse.json(out, { status: 400 });
  return NextResponse.json(out);
}
