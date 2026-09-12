// GET level, XP, badges, correction points and recent XP events.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireStudent } from "@/lib/gamification/access";
import { progressSummary } from "@/lib/gamification/student";

export async function GET() {
  const { user, error } = await requireStudent();
  if (error) return error;

  const [summary, events] = await Promise.all([
    progressSummary(user.id),
    prisma.xpEvent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { project: { select: { currentVersion: { select: { title: true } } } }, module: { select: { title: true } } },
    }),
  ]);
  return NextResponse.json({
    ...summary,
    recent: events.map((e) => ({
      id: e.id,
      amount: e.amount,
      reason: e.reason,
      projectTitle: e.project?.currentVersion?.title ?? null,
      moduleTitle: e.module?.title ?? null,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
