import { prisma } from "@/lib/prisma";
import { isAdmin, type SessionUser } from "@/lib/gamification/access";

/** Class the caller may manage (its teacher or an admin). */
export async function manageableClass(user: SessionUser, classId: string) {
  const cls = await prisma.class.findUnique({ where: { id: classId }, select: { id: true, teacherId: true, name: true } });
  if (!cls) return null;
  if (!isAdmin(user) && cls.teacherId !== user.id) return null;
  return cls;
}

export async function studentClassIds(studentId: string): Promise<string[]> {
  const rows = await prisma.class.findMany({ where: { students: { some: { id: studentId } } }, select: { id: true } });
  return rows.map((r) => r.id);
}
