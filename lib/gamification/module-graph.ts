// Loads one module's Holy Graph: its projects, exams and quizzes as a single
// set of nodes, the prerequisite edges between them, and — when a student is
// given — that student's state on each node.
//
// Both the read API (queries.ts) and the evaluation pipeline (pipeline.ts) go
// through here, so "what unlocks what" is decided in exactly one place.
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { wouldCreateCycle, type AttemptSummary, type Edge } from "./graph";
import { nodeKey, parseNodeKey, type NodeKind } from "./nodes";

type Db = Prisma.TransactionClient | typeof prisma;

export type RawNode = {
  key: string;
  kind: NodeKind;
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  /** Projects can be optional side quests; exams and quizzes always count. */
  isCore: boolean;
  estimatedHours: number;
  xpReward: number;
  orderIndex: number;
  pinX: number | null;
  pinY: number | null;
  /** Percent needed to pass. Projects carry it on their current version. */
  passPercent: number;
};

export type ModuleGraphData = {
  nodes: RawNode[];
  edges: Edge[];
  /** Per-student node state, empty when no student was given. */
  summary: AttemptSummary[];
};

/** Load every node of a module, published only unless drafts are requested. */
export async function loadNodes(db: Db, moduleId: string, includeDrafts = false): Promise<RawNode[]> {
  const projectWhere = includeDrafts ? { status: { not: "ARCHIVED" as const } } : { status: "PUBLISHED" as const };
  const quizWhere = includeDrafts ? { status: { not: "ARCHIVED" as const } } : { status: "PUBLISHED" as const };

  const [projects, exams, quizzes] = await Promise.all([
    db.project.findMany({
      where: { moduleId, ...projectWhere },
      include: { currentVersion: true },
      orderBy: { orderIndex: "asc" },
    }),
    db.exam.findMany({ where: { moduleId }, orderBy: { orderIndex: "asc" } }),
    db.quiz.findMany({ where: { moduleId, ...quizWhere }, orderBy: { orderIndex: "asc" } }),
  ]);

  const projectNodes: RawNode[] = projects.map((p) => ({
    key: nodeKey("PROJECT", p.id),
    kind: "PROJECT",
    id: p.id,
    title: p.currentVersion?.title ?? "Untitled",
    status: p.status,
    isCore: p.isCore,
    estimatedHours: p.currentVersion?.estimatedHours ?? 0,
    xpReward: p.currentVersion?.xpReward ?? 0,
    orderIndex: p.orderIndex,
    pinX: p.pinX,
    pinY: p.pinY,
    passPercent: p.currentVersion?.threshold ?? 70,
  }));

  const examNodes: RawNode[] = exams.map((e) => ({
    key: nodeKey("EXAM", e.id),
    kind: "EXAM",
    id: e.id,
    title: e.title,
    // Exams have no draft state of their own; being placed in a module
    // publishes them into the graph.
    status: "PUBLISHED",
    isCore: true,
    estimatedHours: 0,
    xpReward: e.maxXP,
    orderIndex: e.orderIndex,
    pinX: e.pinX,
    pinY: e.pinY,
    passPercent: e.passPercent,
  }));

  const quizNodes: RawNode[] = quizzes.map((q) => ({
    key: nodeKey("QUIZ", q.id),
    kind: "QUIZ",
    id: q.id,
    title: q.title,
    status: q.status,
    isCore: true,
    estimatedHours: q.duration ? q.duration / 60 : 0,
    xpReward: q.xpReward,
    orderIndex: q.orderIndex,
    pinX: q.pinX,
    pinY: q.pinY,
    passPercent: q.passPercent,
  }));

  return [...projectNodes, ...examNodes, ...quizNodes];
}

/** Prerequisite edges of a module, dropping any that point outside `keys`. */
export async function loadEdges(db: Db, moduleId: string, keys: Set<string>): Promise<Edge[]> {
  const rows = await db.graphEdge.findMany({ where: { moduleId } });
  return rows
    .map((r) => ({ from: nodeKey(r.fromKind, r.fromId), to: nodeKey(r.toKind, r.toId) }))
    .filter((e) => keys.has(e.from) && keys.has(e.to));
}

/**
 * One student's state on every node.
 *
 * A project uses its latest attempt. A quiz counts as validated once an attempt
 * reaches the quiz's pass percent, and as failed below it. An exam counts as
 * validated once a recorded result reaches the exam's pass percent.
 */
export async function loadSummary(db: Db, nodes: RawNode[], studentId: string): Promise<AttemptSummary[]> {
  const projectIds = nodes.filter((n) => n.kind === "PROJECT").map((n) => n.id);
  const examNodes = nodes.filter((n) => n.kind === "EXAM");
  const quizNodes = nodes.filter((n) => n.kind === "QUIZ");

  const [attempts, results, quizAttempts, exams] = await Promise.all([
    projectIds.length
      ? db.projectAttempt.findMany({
          where: { studentId, projectId: { in: projectIds } },
          orderBy: { attemptNumber: "desc" },
          select: { projectId: true, state: true },
        })
      : [],
    examNodes.length
      ? db.examResult.findMany({
          where: { studentId, examId: { in: examNodes.map((n) => n.id) } },
          select: { examId: true, score: true },
        })
      : [],
    quizNodes.length
      ? db.quizAttempt.findMany({
          where: { studentId, quizId: { in: quizNodes.map((n) => n.id) } },
          select: { quizId: true, percent: true, submittedAt: true },
        })
      : [],
    examNodes.length
      ? db.exam.findMany({ where: { id: { in: examNodes.map((n) => n.id) } }, select: { id: true, maxScore: true } })
      : [],
  ]);

  const summary: AttemptSummary[] = [];

  const validatedProjects = new Set(attempts.filter((a) => a.state === "VALIDATED").map((a) => a.projectId));
  const seen = new Set<string>();
  for (const a of attempts) {
    if (seen.has(a.projectId)) continue;
    seen.add(a.projectId);
    summary.push({
      nodeId: nodeKey("PROJECT", a.projectId),
      state: validatedProjects.has(a.projectId) ? "VALIDATED" : a.state,
    });
  }

  const maxById = new Map(exams.map((e) => [e.id, e.maxScore]));
  for (const r of results) {
    const node = examNodes.find((n) => n.id === r.examId);
    if (!node) continue;
    const max = maxById.get(r.examId) ?? 0;
    const percent = max > 0 ? (r.score / max) * 100 : 0;
    summary.push({
      nodeId: node.key,
      state: percent >= node.passPercent ? "VALIDATED" : "FAILED",
    });
  }

  for (const a of quizAttempts) {
    const node = quizNodes.find((n) => n.id === a.quizId);
    if (!node) continue;
    if (!a.submittedAt) {
      summary.push({ nodeId: node.key, state: "IN_PROGRESS" });
      continue;
    }
    summary.push({
      nodeId: node.key,
      state: a.percent >= node.passPercent ? "VALIDATED" : "FAILED",
    });
  }

  return summary;
}

/** Everything the graph needs, in one call. */
export async function loadModuleGraphData(
  db: Db,
  moduleId: string,
  opts: { studentId?: string; includeDrafts?: boolean } = {},
): Promise<ModuleGraphData> {
  const nodes = await loadNodes(db, moduleId, opts.includeDrafts);
  const keys = new Set(nodes.map((n) => n.key));
  const edges = await loadEdges(db, moduleId, keys);
  const summary = opts.studentId ? await loadSummary(db, nodes, opts.studentId) : [];
  return { nodes, edges, summary };
}

/**
 * Replace the incoming prerequisite edges of one node.
 *
 * Rejects anything that would make the graph cyclic, or that points at a node
 * outside this module. Returns an error message, or null on success.
 */
export async function setPrerequisites(
  moduleId: string,
  targetKey: string,
  prerequisiteKeys: string[],
): Promise<string | null> {
  const nodes = await loadNodes(prisma, moduleId, true);
  const keys = new Set(nodes.map((n) => n.key));
  const titleOf = (k: string) => nodes.find((n) => n.key === k)?.title ?? k;

  if (!keys.has(targetKey)) return "Node not found in this module";

  const wanted = [...new Set(prerequisiteKeys)];
  if (wanted.includes(targetKey)) return "A node cannot require itself";

  const unknown = wanted.filter((w) => !keys.has(w));
  if (unknown.length) return "Prerequisites must belong to the same module";

  // Every existing edge except the ones currently pointing at the target.
  const existing = await loadEdges(prisma, moduleId, keys);
  const edges = existing.filter((e) => e.to !== targetKey);

  for (const prereq of wanted) {
    if (wouldCreateCycle(edges, prereq, targetKey)) {
      return `"${titleOf(prereq)}" would create a cycle`;
    }
    edges.push({ from: prereq, to: targetKey });
  }

  const target = parseNodeKey(targetKey);
  const parsed = wanted.map(parseNodeKey);

  await prisma.$transaction([
    prisma.graphEdge.deleteMany({ where: { moduleId, toKind: target.kind, toId: target.id } }),
    prisma.graphEdge.createMany({
      data: parsed.map((from) => ({
        moduleId,
        fromKind: from.kind,
        fromId: from.id,
        toKind: target.kind,
        toId: target.id,
      })),
      skipDuplicates: true,
    }),
    // GraphEdge is the source of truth. The old Project self-relation is kept as
    // a read-only mirror of the project-to-project edges, because the project
    // editor and ProjectDTO still read prerequisites from it. Edges that come
    // from an exam or a quiz have nowhere to go in that relation and appear only
    // in the graph.
    ...(target.kind === "PROJECT"
      ? [
          prisma.project.update({
            where: { id: target.id },
            data: {
              prerequisites: {
                set: parsed.filter((n) => n.kind === "PROJECT").map((n) => ({ id: n.id })),
              },
            },
          }),
        ]
      : []),
  ]);

  return null;
}
