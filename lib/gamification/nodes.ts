// A Holy Graph node used to be a project and nothing else. It can now also be
// an exam or a quiz, so nodes are addressed by a composite key of kind and id.
//
// Graph algorithms in ./graph.ts treat the key as an opaque string, which is
// why they needed no changes when exams and quizzes were added.

export const NODE_KINDS = ["PROJECT", "EXAM", "QUIZ"] as const;
export type NodeKind = (typeof NODE_KINDS)[number];

/** "PROJECT:ckx..." — stable, and safe because cuids contain no colon. */
export function nodeKey(kind: NodeKind, id: string): string {
  return `${kind}:${id}`;
}

export function parseNodeKey(key: string): { kind: NodeKind; id: string } {
  const at = key.indexOf(":");
  const kind = key.slice(0, at) as NodeKind;
  const id = key.slice(at + 1);
  if (!NODE_KINDS.includes(kind) || !id) {
    throw new Error(`Malformed node key: ${key}`);
  }
  return { kind, id };
}

export function isNodeKind(value: unknown): value is NodeKind {
  return typeof value === "string" && (NODE_KINDS as readonly string[]).includes(value);
}

/** How a node's completion is judged, per kind. Used for labels and legends. */
export const KIND_LABEL: Record<NodeKind, string> = {
  PROJECT: "Project",
  EXAM: "Exam",
  QUIZ: "Quiz",
};
