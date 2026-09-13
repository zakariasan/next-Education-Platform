import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { loadModuleGraphData } from "./module-graph";
import type { AutoConfig } from "./autograde";
import { computeNodeStates, topologicalDepths } from "./graph";
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
 * Graph payload for a module: its projects, exams and quizzes as one node set,
 * with the prerequisite edges between them. With a studentId, node states
 * reflect that student's attempts and results, and drafts are excluded.
 */
export async function getModuleGraph(
  moduleId: string,
  opts: { studentId?: string; includeDrafts?: boolean },
): Promise<GraphPayload | null> {
  const mod = await prisma.module.findUnique({
    where: { id: moduleId },
    select: { id: true, title: true, subject: true, description: true },
  });
  if (!mod) return null;

  // Projects, exams and quizzes all come back as nodes of one graph.
  const { nodes: raw, edges, summary } = await loadModuleGraphData(prisma, moduleId, opts);

  const nodeIds = raw.map((n) => n.key);
  const depths = topologicalDepths(nodeIds, edges);
  const byNode = new Map(summary.map((a) => [a.nodeId, a]));
  const states = computeNodeStates(
    nodeIds,
    edges,
    nodeIds.map((id) => ({ nodeId: id, state: byNode.get(id)?.state ?? ("NOT_STARTED" as const) })),
  );

  // Attempt detail is only meaningful for projects; exams and quizzes expose
  // their own result rows through their own pages.
  const projectIds = raw.filter((n) => n.kind === "PROJECT").map((n) => n.id);
  const attempts =
    opts.studentId && projectIds.length
      ? await prisma.projectAttempt.findMany({
          where: { studentId: opts.studentId, projectId: { in: projectIds } },
          orderBy: { attemptNumber: "desc" },
        })
      : [];
  const latest = new Map<string, (typeof attempts)[number]>();
  for (const a of attempts) if (!latest.has(a.projectId)) latest.set(a.projectId, a);
  const validated = new Set(attempts.filter((a) => a.state === "VALIDATED").map((a) => a.projectId));

  const prereqsOf = new Map<string, string[]>();
  for (const e of edges) {
    if (!prereqsOf.has(e.to)) prereqsOf.set(e.to, []);
    prereqsOf.get(e.to)!.push(e.from);
  }

  const nodes: GraphNode[] = raw.map((n) => {
    const a =
      n.kind === "PROJECT"
        ? validated.has(n.id)
          ? attempts.find((x) => x.projectId === n.id && x.state === "VALIDATED")
          : latest.get(n.id)
        : undefined;
    return {
      id: n.key,
      kind: n.kind,
      refId: n.id,
      title: n.title,
      isCore: n.isCore,
      status: n.status,
      estimatedHours: n.estimatedHours,
      xpReward: n.xpReward,
      depth: depths.get(n.key) ?? 0,
      orderIndex: n.orderIndex,
      pinX: n.pinX,
      pinY: n.pinY,
      prerequisiteIds: prereqsOf.get(n.key) ?? [],
      state: states.get(n.key) ?? "locked",
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
