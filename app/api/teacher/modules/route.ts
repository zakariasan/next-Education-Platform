// GET (list modules the caller manages; admins see all), POST (create module)
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdmin, requireTeacherOrAdmin } from "@/lib/gamification/access";
import { moduleInclude, serializeModule } from "@/lib/gamification/queries";

export async function GET() {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;

  const modules = await prisma.module.findMany({
    where: isAdmin(user) ? {} : { teacherId: user.id },
    include: moduleInclude,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(modules.map(serializeModule));
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireTeacherOrAdmin();
  if (error) return error;

  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "").trim();
  if (!title) return NextResponse.json({ error: "Title is required" }, { status: 400 });

  let teacherId = user.id;
  if (isAdmin(user) && typeof body.teacherId === "string" && body.teacherId) {
    const teacher = await prisma.user.findUnique({ where: { id: body.teacherId } });
    if (!teacher || teacher.role !== "TEACHER") return NextResponse.json({ error: "Invalid teacherId" }, { status: 400 });
    teacherId = teacher.id;
  }

  const mod = await prisma.module.create({
    data: {
      title,
      description: typeof body.description === "string" ? body.description.trim() || null : null,
      subject: typeof body.subject === "string" && body.subject.trim() ? body.subject.trim() : "Physics",
      teacherId,
    },
    include: moduleInclude,
  });
  return NextResponse.json(serializeModule(mod), { status: 201 });
}
