import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { AutoConfig } from "./autograde";
import { computeNodeStates, topologicalDepths, type Edge } from "./graph";
import type {
  CriterionDTO,
  GraphNode,
  GraphPayload,
  ModuleDTO,
  ProjectDTO,
  VersionDTO,
} from "./types";

const versionInclude = { criteria: { orderBy: { orderIndex: "asc" as const } } };

export const projectInclude = {
  currentVersion: { include: versionInclude },
  prerequisites: { select: { id: true } },
  _count: { select: { versions: true, attempts: true } },
} satisfies Prisma.ProjectInclude;

type ProjectRow = Prisma.ProjectGetPayload<{ include: typeof projectInclude }>;
type VersionRow = Prisma.ProjectVersionGetPayload<{ include: typeof versionInclude }>;

export function serializeCriterion(c: VersionRow["criteria"][number]): CriterionDTO {
  return {
    id: c.id,
    title: c.title,
    description: c.description,
    weight: c.weight,
    mode: c.mode,
    orderIndex: c.orderIndex,
    autoConfig: (c.autoConfig as AutoConfig | null) ?? null,
  };
}

export function serializeVersion(v: VersionRow): VersionDTO {
  return {
    id: v.id,
    versionNumber: v.versionNumber,
    title: v.title,
    statement: v.statement,
    objectives: (v.objectives as string[]) ?? [],
    estimatedHours: v.estimatedHours,
    xpReward: v.xpReward,
    allowedResources: (v.allowedResources as string[]) ?? [],
    threshold: v.threshold,
    criteria: v.criteria.map(serializeCriterion),
    createdAt: v.createdAt.toISOString(),
  };
}

export function serializeProject(p: ProjectRow): ProjectDTO {
  return {
    id: p.id,
    moduleId: p.moduleId,
    isCore: p.isCore,
    orderIndex: p.orderIndex,
    status: p.status,
    pinX: p.pinX,
    pinY: p.pinY,
    prerequisiteIds: p.prerequisites.map((q) => q.id),
    version: p.currentVersion ? serializeVersion(p.currentVersion) : null,
    versionCount: p._count.versions,
    attemptCount: p._count.attempts,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export const moduleInclude = {
  teacher: { select: { name: true } },
  projects: { select: { isCore: true } },
} satisfies Prisma.ModuleInclude;

type ModuleRow = Prisma.ModuleGetPayload<{ include: typeof moduleInclude }>;

export function serializeModule(m: ModuleRow): ModuleDTO {
  return {
    id: m.id,
    title: m.title,
    description: m.description,
    subject: m.subject,
    status: m.status,
    teacherId: m.teacherId,
    teacherName: m.teacher.name,
    projectCount: m.projects.length,
    coreCount: m.projects.filter((p) => p.isCore).length,
    createdAt: m.createdAt.toISOString(),
    updatedAt: m.updatedAt.toISOString(),
  };
}

/**
 * Graph payload for a module. With a studentId, node states reflect that
 * student's attempts and only PUBLISHED projects are included.
 */
export async function getModuleGraph(
  moduleId: string,
  opts: { studentId?: string; includeDrafts?: boolean },
): Promise<GraphPayload | null> {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    include: {
      projects: {
        where: opts.includeDrafts ? { status: { not: "ARCHIVED" } } : { status: "PUBLISHED" },
        include: { currentVersion: true, prerequisites: { select: { id: true } } },
        orderBy: { orderIndex: "asc" },
      },
    },
  });
  if (!mod) return null;

  const ids = new Set(mod.projects.map((p) => p.id));
  const edges: Edge[] = [];
  for (const p of mod.projects)
    for (const q of p.prerequisites) if (ids.has(q.id)) edges.push({ from: q.id, to: p.id });

  const attempts = opts.studentId
    ? await prisma.projectAttempt.findMany({
        where: { studentId: opts.studentId, projectId: { in: [...ids] } },
        orderBy: { attemptNumber: "desc" },
      })
    : [];
  const latest = new Map<string, (typeof attempts)[number]>();
  for (const a of attempts) if (!latest.has(a.projectId)) latest.set(a.projectId, a);
  const validated = new Set(attempts.filter((a) => a.state === "VALIDATED").map((a) => a.projectId));

  const nodeIds = [...ids];
  const depths = topologicalDepths(nodeIds, edges);
  const states = computeNodeStates(
    nodeIds,
    edges,
    nodeIds.map((id) => ({
      projectId: id,
      state: validated.has(id) ? ("VALIDATED" as const) : (latest.get(id)?.state ?? ("NOT_STARTED" as const)),
    })),
  );

  const nodes: GraphNode[] = mod.projects.map((p) => {
    const a = validated.has(p.id)
      ? attempts.find((x) => x.projectId === p.id && x.state === "VALIDATED")!
      : latest.get(p.id);
    return {
      id: p.id,
      title: p.currentVersion?.title ?? "Untitled",
      isCore: p.isCore,
      status: p.status,
      estimatedHours: p.currentVersion?.estimatedHours ?? 0,
      xpReward: p.currentVersion?.xpReward ?? 0,
      depth: depths.get(p.id) ?? 0,
      orderIndex: p.orderIndex,
      pinX: p.pinX,
      pinY: p.pinY,
      prerequisiteIds: p.prerequisites.map((q) => q.id).filter((id) => ids.has(id)),
      state: states.get(p.id) ?? "locked",
      attempt: a
        ? {
            id: a.id,
            state: a.state,
            attemptNumber: a.attemptNumber,
            score: a.score,
            startedAt: a.startedAt?.toISOString() ?? null,
            submittedAt: a.submittedAt?.toISOString() ?? null,
            reviewedAt: a.reviewedAt?.toISOString() ?? null,
            xpAwarded: a.xpAwarded,
          }
        : null,
    };
  });

  return {
    module: { id: mod.id, title: mod.title, subject: mod.subject, description: mod.description },
    nodes,
    edges,
  };
}
