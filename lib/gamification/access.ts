import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type SessionUser = { id: string; role: string | null; name: string };

export async function currentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return { id: session.user.id, role: session.user.role ?? null, name: session.user.name };
}

type Guard =
  | { user: SessionUser; error: null }
  | { user: null; error: NextResponse };

export async function requireRole(...roles: string[]): Promise<Guard> {
  const user = await currentUser();
  if (!user) {
    return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (roles.length && !roles.includes(user.role ?? "")) {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, error: null };
}

export const requireTeacherOrAdmin = () => requireRole("TEACHER", "ADMIN");
export const requireStudent = () => requireRole("STUDENT");

export function isAdmin(user: SessionUser) {
  return user.role === "ADMIN";
}

/** Module the caller may manage (owner or admin), or null. */
export async function manageableModule(user: SessionUser, moduleId: string) {
  const mod = await prisma.module.findUnique({ where: { id: moduleId } });
  if (!mod) return null;
  if (!isAdmin(user) && mod.teacherId !== user.id) return null;
  return mod;
}

/** Ids of teachers whose modules a student can see (teachers of their classes). */
export async function visibleTeacherIds(studentId: string): Promise<string[]> {
  const classes = await prisma.class.findMany({
    where: { students: { some: { id: studentId } } },
    select: { teacherId: true },
  });
  return [...new Set(classes.map((c) => c.teacherId))];
}
