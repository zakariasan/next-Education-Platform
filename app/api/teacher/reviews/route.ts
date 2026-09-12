// GET review queue for the teacher (admins: every queue).
import { NextRequest, NextResponse } from "next/server";
import { isAdmin, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { reviewQueue } from "@/lib/gamification/reviews";

export async function GET(req: NextRequest) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const status = req.nextUrl.searchParams.get("status");
  const items = await reviewQueue({
    ...(isAdmin(user) ? {} : { reviewerId: user.id }),
    ...(status === "DONE" || status === "PENDING" ? { status } : {}),
  });
  return NextResponse.json(items);
}
