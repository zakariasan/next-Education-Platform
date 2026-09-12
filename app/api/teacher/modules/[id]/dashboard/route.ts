// GET module analytics: attempts, validation rate, hours vs estimate, hardest criteria.
import { NextRequest, NextResponse } from "next/server";
import { manageableModule, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { moduleAnalytics } from "@/lib/gamification/analytics";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;
  const { id } = await params;
  if (!(await manageableModule(user, id))) return NextResponse.json({ error: "Module not found" }, { status: 404 });
  return NextResponse.json(await moduleAnalytics(id));
}
