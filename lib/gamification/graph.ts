// Pure graph helpers shared by the API, the teacher builder and the Holy Graph.

export type Edge = { from: string; to: string }; // prerequisite -> dependent

export type NodeState =
  | "locked"
  | "available"
  | "in_progress"
  | "validated"
  | "failed";

export type AttemptSummary = {
  projectId: string;
  state:
    | "NOT_STARTED"
    | "IN_PROGRESS"
    | "SUBMITTED"
    | "UNDER_REVIEW"
    | "VALIDATED"
    | "FAILED";
};

function adjacency(edges: Edge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>();
  for (const e of edges) {
    if (!adj.has(e.from)) adj.set(e.from, []);
    adj.get(e.from)!.push(e.to);
  }
  return adj;
}

/** True if `target` is reachable from `start` following edges. */
export function reaches(edges: Edge[], start: string, target: string): boolean {
  if (start === target) return true;
  const adj = adjacency(edges);
  const seen = new Set<string>();
  const stack = [start];
  while (stack.length) {
    const cur = stack.pop()!;
    if (cur === target) return true;
    if (seen.has(cur)) continue;
    seen.add(cur);
    for (const next of adj.get(cur) ?? []) stack.push(next);
  }
  return false;
}

/** Adding prerequisite -> dependent creates a cycle iff dependent already reaches prerequisite. */
export function wouldCreateCycle(
  edges: Edge[],
  prerequisiteId: string,
  dependentId: string,
): boolean {
  if (prerequisiteId === dependentId) return true;
  return reaches(edges, dependentId, prerequisiteId);
}

export function hasCycle(nodeIds: string[], edges: Edge[]): boolean {
  const adj = adjacency(edges);
  const color = new Map<string, 0 | 1 | 2>();
  const visit = (n: string): boolean => {
    const c = color.get(n) ?? 0;
    if (c === 1) return true;
    if (c === 2) return false;
    color.set(n, 1);
    for (const m of adj.get(n) ?? []) if (visit(m)) return true;
    color.set(n, 2);
    return false;
  };
  return nodeIds.some((n) => visit(n));
}

/** Longest-path depth per node (0 for roots). Deterministic; ignores cycles. */
export function topologicalDepths(
  nodeIds: string[],
  edges: Edge[],
): Map<string, number> {
  const preds = new Map<string, string[]>();
  for (const id of nodeIds) preds.set(id, []);
  for (const e of edges) preds.get(e.to)?.push(e.from);
  const depth = new Map<string, number>();
  const visiting = new Set<string>();
  const get = (id: string): number => {
    if (depth.has(id)) return depth.get(id)!;
    if (visiting.has(id)) return 0;
    visiting.add(id);
    const p = preds.get(id) ?? [];
    const d = p.length ? Math.max(...p.map((q) => get(q) + 1)) : 0;
    visiting.delete(id);
    depth.set(id, d);
    return d;
  };
  for (const id of nodeIds) get(id);
  return depth;
}

/**
 * Compute the Holy Graph state of every project for one student.
 * A project is available when every prerequisite is validated.
 */
export function computeNodeStates(
  nodeIds: string[],
  edges: Edge[],
  attempts: AttemptSummary[],
): Map<string, NodeState> {
  const latest = new Map<string, AttemptSummary>();
  for (const a of attempts) latest.set(a.projectId, a);
  const validated = new Set(
    attempts.filter((a) => a.state === "VALIDATED").map((a) => a.projectId),
  );
  const preds = new Map<string, string[]>();
  for (const id of nodeIds) preds.set(id, []);
  for (const e of edges) preds.get(e.to)?.push(e.from);

  const out = new Map<string, NodeState>();
  for (const id of nodeIds) {
    if (validated.has(id)) {
      out.set(id, "validated");
      continue;
    }
    const unlocked = (preds.get(id) ?? []).every((p) => validated.has(p));
    if (!unlocked) {
      out.set(id, "locked");
      continue;
    }
    const a = latest.get(id);
    if (!a || a.state === "NOT_STARTED") out.set(id, "available");
    else if (a.state === "FAILED") out.set(id, "failed");
    else out.set(id, "in_progress");
  }
  return out;
}

/** Ids newly unlocked by validating `projectId` (given states before validation). */
export function newlyUnlocked(
  nodeIds: string[],
  edges: Edge[],
  attemptsBefore: AttemptSummary[],
  projectId: string,
): string[] {
  const before = computeNodeStates(nodeIds, edges, attemptsBefore);
  const after = computeNodeStates(nodeIds, edges, [
    ...attemptsBefore.filter((a) => a.projectId !== projectId),
    { projectId, state: "VALIDATED" },
  ]);
  return nodeIds.filter(
    (id) => before.get(id) === "locked" && after.get(id) === "available",
  );
}
