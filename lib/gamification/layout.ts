// Deterministic circuit-board layout for the Holy Graph.
// Columns = prerequisite depth. Core nodes sit on the central rails, electives
// branch to the outer rows. Teacher pins (unit coords) override.
import type { GraphNode } from "./types";

export const HG = {
  colGap: 280,
  rowGap: 150,
  nodeW: 168,
  nodeH: 84,
  pad: 80,
} as const;

export type Positioned = GraphNode & { x: number; y: number };

export function layoutNodes(nodes: GraphNode[]): { placed: Positioned[]; width: number; height: number } {
  const byDepth = new Map<number, GraphNode[]>();
  for (const n of nodes) {
    if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
    byDepth.get(n.depth)!.push(n);
  }
  let maxRows = 1;
  const placed: Positioned[] = [];
  for (const [depth, col] of byDepth) {
    // Core first (rail), then electives; stable by orderIndex.
    const sorted = [...col].sort((a, b) => Number(b.isCore) - Number(a.isCore) || a.orderIndex - b.orderIndex || a.id.localeCompare(b.id));
    // Rows alternate around the center: 0, +1, -1, +2, -2 …
    const rows: number[] = sorted.map((_, i) => (i === 0 ? 0 : i % 2 === 1 ? Math.ceil(i / 2) : -i / 2));
    maxRows = Math.max(maxRows, sorted.length);
    sorted.forEach((n, i) => {
      placed.push({ ...n, x: depth * HG.colGap, y: rows[i] * HG.rowGap });
    });
  }
  // Normalize so the min y is 0, then apply pins.
  const minY = Math.min(0, ...placed.map((p) => p.y));
  const maxDepth = Math.max(0, ...nodes.map((n) => n.depth));
  const width = maxDepth * HG.colGap + HG.nodeW + HG.pad * 2;
  const height = (Math.max(1, maxRows) - 1) * HG.rowGap + HG.nodeH + HG.pad * 2;
  for (const p of placed) {
    p.x += HG.pad;
    p.y += HG.pad - minY;
    if (p.pinX != null && p.pinY != null) {
      p.x = p.pinX * width;
      p.y = p.pinY * height;
    }
  }
  return { placed, width, height };
}

/** Orthogonal PCB trace from the right pin of `a` to the left pin of `b`. */
export function tracePath(a: Positioned, b: Positioned): string {
  const x1 = a.x + HG.nodeW;
  const y1 = a.y + HG.nodeH / 2;
  const x2 = b.x;
  const y2 = b.y + HG.nodeH / 2;
  if (Math.abs(y1 - y2) < 1) return `M ${x1} ${y1} L ${x2} ${y2}`;
  const midX = x2 > x1 + 40 ? x1 + Math.max(24, (x2 - x1) / 2) : x1 + 40;
  const r = 14;
  const dy = y2 > y1 ? 1 : -1;
  return [
    `M ${x1} ${y1}`,
    `L ${midX - r} ${y1}`,
    `Q ${midX} ${y1} ${midX} ${y1 + dy * r}`,
    `L ${midX} ${y2 - dy * r}`,
    `Q ${midX} ${y2} ${midX + r} ${y2}`,
    `L ${x2} ${y2}`,
  ].join(" ");
}
