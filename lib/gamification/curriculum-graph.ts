// The curriculum graph: the level above a module's own Holy Graph.
//
// Nodes here are whole modules and milestone exams. Edges say which module must
// be finished before the next one opens, so a student sees the shape of the
// whole course: a first ring, an exam that gates it, then the ring behind it.
//
// The graph algorithms in ./graph.ts work on opaque node keys, so this file
// reuses them unchanged. The only thing that differs from a module's inner
// graph is what counts as a node and what counts as finished.
import { prisma } from "@/lib/prisma";
import { computeNodeStates, topologicalDepths, type AttemptSummary, type Edge } from "./graph";
import { nodeKey, parseNodeKey } from "./nodes";
import type { GraphNode, GraphPayload } from "./types";

/**
 * A module is finished when every one of its CORE projects is validated.
 * Electives are optional by design and never block the next module.
 *
 * A module with no published core projects is NOT finished. Treating it as
 * finished would mean a teacher who creates a module and has not written its
 * projects yet sees it light up as complete for every student, which is a lie.
 * It also cannot be completed by working, so anything placed behind it stays
 * shut; `blocksProgress` marks that case so the course map can warn the teacher
 * rather than leaving students silently stuck.
 */
export type ModuleProgress = {
  moduleId: string;
  coreTotal: number;
  coreValidated: number;
  done: boolean;
  /** True when the module has no core projects, so it can never be finished. */
  blocksProgress: boolean;
};

export async function moduleProgressFor(studentId: string, moduleIds: string[]): Promise<Map<string, ModuleProgress>> {
  const out = new Map<string, ModuleProgress>();
  if (moduleIds.length === 0) return out;

  const coreProjects = await prisma.project.findMany({
    where: { moduleId: { in: moduleIds }, isCore: true, status: "PUBLISHED" },
    select: { id: true, moduleId: true },
  });

  const validatedRows = await prisma.projectAttempt.findMany({
    where: {
      studentId,
      state: "VALIDATED",
      projectId: { in: coreProjects.map((p) => p.id) },
    },
    select: { projectId: true },
    distinct: ["projectId"],
  });
  const validated = new Set(validatedRows.map((r) => r.projectId));

  for (const id of moduleIds) {
    const core = coreProjects.filter((p) => p.moduleId === id);
    const done = core.filter((p) => validated.has(p.id)).length;
    out.set(id, {
      moduleId: id,
      coreTotal: core.length,
      coreValidated: done,
      done: core.length > 0 && done === core.length,
      blocksProgress: core.length === 0,
    });
  }
  return out;
}

/** Which state a partially-worked module should show. */
function moduleState(p: ModuleProgress): AttemptSummary["state"] {
  if (p.done) return "VALIDATED";
  if (p.coreValidated > 0) return "IN_PROGRESS";
  return "NOT_STARTED";
}

type BuildOpts = {
  /** Restrict to these modules. Used to show a student only their curriculum. */
  moduleIds: string[];
  /** Milestone exams that belong in this graph. */
  examIds: string[];
  /** Teachers whose edges apply. */
  ownerIds: string[];
  studentId?: string;
  title?: string;
};

/**
 * Assemble the curriculum graph.
 *
 * Edges are loaded for the given owners and then filtered down to edges whose
 * both ends are present, so a student studying only part of a teacher's
 * catalogue sees a coherent subgraph rather than dangling arrows.
 */
export async function buildCurriculumGraph(opts: BuildOpts): Promise<GraphPayload> {
  const { moduleIds, examIds, ownerIds, studentId } = opts;

  const [modules, exams, edgeRows] = await Promise.all([
    moduleIds.length
      ? prisma.module.findMany({
          where: { id: { in: moduleIds } },
          include: {
            projects: { where: { status: "PUBLISHED" }, select: { isCore: true, currentVersion: { select: { estimatedHours: true, xpReward: true } } } },
          },
          orderBy: { orderIndex: "asc" },
        })
      : [],
    examIds.length
      ? prisma.exam.findMany({ where: { id: { in: examIds } }, orderBy: { orderIndex: "asc" } })
      : [],
    ownerIds.length ? prisma.curriculumEdge.findMany({ where: { ownerId: { in: ownerIds } } }) : [],
  ]);

  const progress = studentId ? await moduleProgressFor(studentId, modules.map((m) => m.id)) : new Map();

  const examResults = studentId && exams.length
    ? await prisma.examResult.findMany({
        where: { studentId, examId: { in: exams.map((e) => e.id) } },
        select: { examId: true, score: true },
      })
    : [];

  const keys = new Set<string>([
    ...modules.map((m) => nodeKey("MODULE", m.id)),
    ...exams.map((e) => nodeKey("EXAM", e.id)),
  ]);

  const edges: Edge[] = edgeRows
    .map((r) => ({ from: nodeKey(r.fromKind, r.fromId), to: nodeKey(r.toKind, r.toId) }))
    .filter((e) => keys.has(e.from) && keys.has(e.to));

  const summary: AttemptSummary[] = [];
  for (const m of modules) {
    const p = progress.get(m.id);
    if (p) summary.push({ nodeId: nodeKey("MODULE", m.id), state: moduleState(p) });
  }
  for (const r of examResults) {
    const exam = exams.find((e) => e.id === r.examId);
    if (!exam) continue;
    const percent = exam.maxScore > 0 ? (r.score / exam.maxScore) * 100 : 0;
    summary.push({
      nodeId: nodeKey("EXAM", exam.id),
      state: percent >= exam.passPercent ? "VALIDATED" : "FAILED",
    });
  }

  const nodeIds = [...keys];
  const depths = topologicalDepths(nodeIds, edges);
  const byNode = new Map(summary.map((s) => [s.nodeId, s]));
  const states = computeNodeStates(
    nodeIds,
    edges,
    nodeIds.map((id) => ({ nodeId: id, state: byNode.get(id)?.state ?? "NOT_STARTED" })),
  );

  const prereqsOf = new Map<string, string[]>();
  for (const e of edges) {
    if (!prereqsOf.has(e.to)) prereqsOf.set(e.to, []);
    prereqsOf.get(e.to)!.push(e.from);
  }

  const moduleNodes: GraphNode[] = modules.map((m) => {
    const key = nodeKey("MODULE", m.id);
    const p = progress.get(m.id);
    return {
      id: key,
      kind: "MODULE",
      refId: m.id,
      title: m.title,
      // Every module is part of the common core of this graph.
      isCore: true,
      status: m.status,
      estimatedHours: m.projects.reduce((s, x) => s + (x.currentVersion?.estimatedHours ?? 0), 0),
      xpReward: m.projects.reduce((s, x) => s + (x.currentVersion?.xpReward ?? 0), 0),
      depth: depths.get(key) ?? 0,
      orderIndex: m.orderIndex,
      pinX: m.pinX,
      pinY: m.pinY,
      prerequisiteIds: prereqsOf.get(key) ?? [],
      state: states.get(key) ?? "locked",
      attempt: null,
      progress: p ? { done: p.coreValidated, total: p.coreTotal } : null,
      blocksProgress: p?.blocksProgress ?? false,
    };
  });

  const examNodes: GraphNode[] = exams.map((e) => {
    const key = nodeKey("EXAM", e.id);
    return {
      id: key,
      kind: "EXAM",
      refId: e.id,
      title: e.title,
      isCore: true,
      status: "PUBLISHED",
      estimatedHours: 0,
      xpReward: e.maxXP,
      depth: depths.get(key) ?? 0,
      orderIndex: e.orderIndex,
      pinX: e.pinX,
      pinY: e.pinY,
      prerequisiteIds: prereqsOf.get(key) ?? [],
      state: states.get(key) ?? "locked",
      attempt: null,
      progress: null,
    };
  });

  return {
    module: {
      id: "curriculum",
      title: opts.title ?? "Your course",
      subject: "Curriculum",
      description: "How the modules connect. Finish a module's core projects to open what comes next.",
    },
    nodes: [...moduleNodes, ...examNodes],
    edges,
  };
}

/** Replace the prerequisites of one curriculum node. Returns an error or null. */
export async function setCurriculumPrerequisites(
  ownerId: string,
  targetKey: string,
  prerequisiteKeys: string[],
  knownKeys: Set<string>,
  titleOf: (key: string) => string,
): Promise<string | null> {
  const { wouldCreateCycle } = await import("./graph");

  if (!knownKeys.has(targetKey)) return "Node not found in this curriculum";
  const wanted = [...new Set(prerequisiteKeys)];
  if (wanted.includes(targetKey)) return "A node cannot require itself";
  const unknown = wanted.filter((w) => !knownKeys.has(w));
  if (unknown.length) return "Prerequisites must be modules or milestone exams you own";

  const existingRows = await prisma.curriculumEdge.findMany({ where: { ownerId } });
  const existing: Edge[] = existingRows
    .map((r) => ({ from: nodeKey(r.fromKind, r.fromId), to: nodeKey(r.toKind, r.toId) }))
    .filter((e) => knownKeys.has(e.from) && knownKeys.has(e.to));
  const edges = existing.filter((e) => e.to !== targetKey);

  for (const prereq of wanted) {
    if (wouldCreateCycle(edges, prereq, targetKey)) return `"${titleOf(prereq)}" would create a cycle`;
    edges.push({ from: prereq, to: targetKey });
  }

  const target = parseNodeKey(targetKey);
  await prisma.$transaction([
    prisma.curriculumEdge.deleteMany({ where: { ownerId, toKind: target.kind, toId: target.id } }),
    prisma.curriculumEdge.createMany({
      data: wanted.map((w) => {
        const from = parseNodeKey(w);
        return { ownerId, fromKind: from.kind, fromId: from.id, toKind: target.kind, toId: target.id };
      }),
      skipDuplicates: true,
    }),
  ]);

  return null;
}
