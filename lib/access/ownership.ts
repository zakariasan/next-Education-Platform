// Central "who may change this?" rule for the whole API.
//
// One principle: the user who created a record may update and delete it, and an
// ADMIN may change anything. Records that have no creator column of their own
// (a Question, a Seance, an ExamFile...) inherit the creator of their parent, so
// the rule still holds one level up.
//
// Routes should call `requireManage(...)` instead of hand-rolling checks.
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser, isAdmin, type SessionUser } from "@/lib/gamification/access";

export type ManagedResource =
  | "school"
  | "class"
  | "lesson"
  | "material"
  | "quiz"
  | "question"
  | "seance"
  | "exam"
  | "examFile"
  | "exercise"
  | "module"
  | "project"
  | "projectVersion"
  | "rubricCriterion"
  | "event";

/**
 * For each resource: load the id of the user who created it.
 * Returns `null` when the record does not exist.
 */
const ownerOf: Record<ManagedResource, (id: string) => Promise<string | null>> = {
  // --- records that carry their own creator ---
  school: async (id) =>
    (await prisma.school.findUnique({ where: { id }, select: { createdById: true } }))?.createdById ?? null,
  class: async (id) =>
    (await prisma.class.findUnique({ where: { id }, select: { teacherId: true } }))?.teacherId ?? null,
  lesson: async (id) =>
    (await prisma.lesson.findUnique({ where: { id }, select: { teacherId: true } }))?.teacherId ?? null,
  quiz: async (id) =>
    (await prisma.quiz.findUnique({ where: { id }, select: { teacherId: true } }))?.teacherId ?? null,
  exam: async (id) =>
    (await prisma.exam.findUnique({ where: { id }, select: { teacherId: true } }))?.teacherId ?? null,
  module: async (id) =>
    (await prisma.module.findUnique({ where: { id }, select: { teacherId: true } }))?.teacherId ?? null,
  project: async (id) =>
    (await prisma.project.findUnique({ where: { id }, select: { teacherId: true } }))?.teacherId ?? null,
  event: async (id) =>
    (await prisma.event.findUnique({ where: { id }, select: { createdById: true } }))?.createdById ?? null,

  // --- records that inherit the creator of their parent ---
  question: async (id) =>
    (await prisma.question.findUnique({ where: { id }, select: { quiz: { select: { teacherId: true } } } }))
      ?.quiz.teacherId ?? null,
  material: async (id) =>
    (await prisma.materials.findUnique({ where: { id }, select: { lesson: { select: { teacherId: true } } } }))
      ?.lesson.teacherId ?? null,
  seance: async (id) =>
    (await prisma.seance.findUnique({ where: { id }, select: { class: { select: { teacherId: true } } } }))
      ?.class.teacherId ?? null,
  examFile: async (id) =>
    (await prisma.examFile.findUnique({ where: { id }, select: { exam: { select: { teacherId: true } } } }))
      ?.exam.teacherId ?? null,
  exercise: async (id) =>
    (await prisma.exercise.findUnique({ where: { id }, select: { class: { select: { teacherId: true } } } }))
      ?.class.teacherId ?? null,
  projectVersion: async (id) =>
    (await prisma.projectVersion.findUnique({ where: { id }, select: { project: { select: { teacherId: true } } } }))
      ?.project.teacherId ?? null,
  rubricCriterion: async (id) =>
    (
      await prisma.rubricCriterion.findUnique({
        where: { id },
        select: { version: { select: { project: { select: { teacherId: true } } } } },
      })
    )?.version.project.teacherId ?? null,
};

/** The id of whoever created this record, or null when it does not exist. */
export function creatorOf(resource: ManagedResource, id: string): Promise<string | null> {
  return ownerOf[resource](id);
}

/** True when `user` created this record, or is an admin. */
export async function canManage(user: SessionUser, resource: ManagedResource, id: string): Promise<boolean> {
  if (isAdmin(user)) return true;
  const owner = await creatorOf(resource, id);
  return owner !== null && owner === user.id;
}

type ManageGuard =
  | { user: SessionUser; error: null }
  | { user: null; error: NextResponse };

const notFound = (resource: ManagedResource) =>
  NextResponse.json({ error: `${resource} not found` }, { status: 404 });

/**
 * Guard for any write route: the caller must be signed in and must either have
 * created the record or be an admin.
 *
 * A caller who may not touch the record gets 404, not 403, so the API never
 * confirms that an id they have no business with exists.
 *
 *   const { user, error } = await requireManage("school", schoolId);
 *   if (error) return error;
 */
export async function requireManage(resource: ManagedResource, id: string): Promise<ManageGuard> {
  const user = await currentUser();
  if (!user) return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!id) return { user: null, error: notFound(resource) };
  if (!(await canManage(user, resource, id))) return { user: null, error: notFound(resource) };
  return { user, error: null };
}

/**
 * Guard for create routes and for listing a teacher's own records: the caller
 * must be signed in with a role that is allowed to author content.
 */
export async function requireAuthor(): Promise<ManageGuard> {
  const user = await currentUser();
  if (!user) return { user: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (user.role !== "TEACHER" && user.role !== "ADMIN") {
    return { user: null, error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { user, error: null };
}

/**
 * A prisma `where` fragment that limits a list to the caller's own records.
 * Admins get `{}` so they see everything.
 */
export function ownScope(user: SessionUser, field: "teacherId" | "createdById" = "teacherId") {
  return isAdmin(user) ? {} : { [field]: user.id };
}
