import { describe, expect, it } from "vitest";
import { HG, layoutNodes, tracePath } from "../layout";
import type { GraphNode } from "../types";

const node = (id: string, depth: number, isCore = true, orderIndex = 0, pin?: { x: number; y: number }): GraphNode => ({
  id,
  title: id,
  isCore,
  status: "PUBLISHED",
  estimatedHours: 1,
  xpReward: 10,
  depth,
  orderIndex,
  pinX: pin?.x ?? null,
  pinY: pin?.y ?? null,
  prerequisiteIds: [],
  state: "available",
  attempt: null,
});

describe("holy graph layout", () => {
  it("is deterministic regardless of input order", () => {
    const nodes = [node("a", 0), node("b", 1), node("c", 1, false, 5), node("d", 2)];
    const a = layoutNodes(nodes).placed.map((p) => [p.id, p.x, p.y]);
    const b = layoutNodes([...nodes].reverse()).placed.map((p) => [p.id, p.x, p.y]);
    expect(a.sort()).toEqual(b.sort());
  });

  it("puts columns by depth and core nodes on the central rail", () => {
    const { placed } = layoutNodes([node("a", 0), node("core", 1, true, 1), node("elec", 1, false, 0)]);
    const by = Object.fromEntries(placed.map((p) => [p.id, p]));
    expect(by.core.x - by.a.x).toBe(HG.colGap);
    expect(by.core.y).toBe(by.a.y); // rail row
    expect(by.elec.y).not.toBe(by.core.y);
  });

  it("honours teacher pins in unit coordinates", () => {
    const { placed, width, height } = layoutNodes([node("a", 0), node("b", 1, true, 0, { x: 0.5, y: 0.25 })]);
    const b = placed.find((p) => p.id === "b")!;
    expect(b.x).toBeCloseTo(width * 0.5);
    expect(b.y).toBeCloseTo(height * 0.25);
  });

  it("draws traces from the right pin to the left pin", () => {
    const { placed } = layoutNodes([node("a", 0), node("b", 1)]);
    const [a, b] = placed;
    const d = tracePath(a, b);
    expect(d.startsWith(`M ${a.x + HG.nodeW} ${a.y + HG.nodeH / 2}`)).toBe(true);
    expect(d.endsWith(`${b.x} ${b.y + HG.nodeH / 2}`)).toBe(true);
  });
});
