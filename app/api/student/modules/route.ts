// GET published modules visible to the student, with per-module progress.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent, visibleTeacherIds } from "@/lib/gamification/access";

export async function GET() {
  const { user, error } = await requireStudent();
  if (error) return error;

  const teacherIds = await visibleTeacherIds(user.id);
  const modules = await prisma.module.findMany({
    where: { status: "PUBLISHED", teacherId: { in: teacherIds } },
    include: {
      teacher: { select: { name: true } },
      projects: {
        where: { status: "PUBLISHED" },
        select: { id: true, isCore: true, currentVersion: { select: { estimatedHours: true, xpReward: true } } },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  const validated = await prisma.projectAttempt.findMany({
    where: { studentId: user.id, state: "VALIDATED" },
    select: { projectId: true },
    distinct: ["projectId"],
  });
  const xp = await prisma.xpEvent.groupBy({ by: ["moduleId"], where: { userId: user.id }, _sum: { amount: true } });
  const xpByModule = new Map(xp.map((x) => [x.moduleId, x._sum.amount ?? 0]));
  const done = new Set(validated.map((v) => v.projectId));

  return NextResponse.json(
    modules.map((m) => {
      const core = m.projects.filter((p) => p.isCore);
      return {
        id: m.id,
        title: m.title,
        subject: m.subject,
        description: m.description,
        teacherName: m.teacher.name,
        projectCount: m.projects.length,
        coreTotal: core.length,
        coreValidated: core.filter((p) => done.has(p.id)).length,
        validatedCount: m.projects.filter((p) => done.has(p.id)).length,
        totalHours: m.projects.reduce((s, p) => s + (p.currentVersion?.estimatedHours ?? 0), 0),
        totalXp: m.projects.reduce((s, p) => s + (p.currentVersion?.xpReward ?? 0), 0),
        earnedXp: xpByModule.get(m.id) ?? 0,
      };
    }),
  );
}
