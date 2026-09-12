// GET peer reviews assigned to the student.
import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/gamification/access";
import { reviewQueue } from "@/lib/gamification/reviews";

export async function GET() {
  const { user, error } = await requireStudent();
  if (error) return error;
  return NextResponse.json(await reviewQueue({ reviewerId: user.id, kind: "PEER" }));
}
