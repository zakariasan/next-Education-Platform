// GET peer review detail, POST peer scores.
import { NextRequest, NextResponse } from "next/server";
import { requireStudent } from "@/lib/gamification/access";
import { reviewDetail, submitReview } from "@/lib/gamification/reviews";

type Ctx = { params: Promise<{ assignmentId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireStudent();
  if (error) return error;
  const { assignmentId } = await params;
  const detail = await reviewDetail(assignmentId, user.id);
  if (!detail) return NextResponse.json({ error: "Review not found" }, { status: 404 });
  return NextResponse.json(detail);
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { user, error } = await requireStudent();
  if (error) return error;
  const { assignmentId } = await params;
  const body = await req.json().catch(() => ({}));
  const out = await submitReview(assignmentId, user.id, { scores: body.scores ?? {}, feedback: body.feedback });
  if ("error" in out) return NextResponse.json(out, { status: 400 });
  return NextResponse.json(out);
}
