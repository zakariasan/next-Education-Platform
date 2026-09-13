import { describe, expect, it } from "vitest";
import {
  computeNodeStates,
  hasCycle,
  newlyUnlocked,
  topologicalDepths,
  wouldCreateCycle,
  type Edge,
} from "../graph";

const ids = ["a", "b", "c", "d", "e"];
// a -> b -> c, a -> d, (b,d) -> e
const edges: Edge[] = [
  { from: "a", to: "b" },
  { from: "b", to: "c" },
  { from: "a", to: "d" },
  { from: "b", to: "e" },
  { from: "d", to: "e" },
];

describe("cycle prevention", () => {
  it("rejects self prerequisites", () => {
    expect(wouldCreateCycle(edges, "a", "a")).toBe(true);
  });
  it("rejects edges that close a loop", () => {
    expect(wouldCreateCycle(edges, "c", "a")).toBe(true);
    expect(wouldCreateCycle(edges, "e", "b")).toBe(true);
  });
  it("accepts edges that keep the graph acyclic", () => {
    expect(wouldCreateCycle(edges, "c", "e")).toBe(false);
    expect(wouldCreateCycle(edges, "a", "e")).toBe(false);
  });
  it("detects existing cycles", () => {
    expect(hasCycle(ids, edges)).toBe(false);
    expect(hasCycle(ids, [...edges, { from: "e", to: "a" }])).toBe(true);
  });
});

describe("prerequisite unlocking", () => {
  it("roots are available, everything else locked at start", () => {
    const s = computeNodeStates(ids, edges, []);
    expect(s.get("a")).toBe("available");
    expect(s.get("b")).toBe("locked");
    expect(s.get("e")).toBe("locked");
  });

  it("unlocks direct dependents only when ALL prerequisites are validated", () => {
    const s = computeNodeStates(ids, edges, [
      { nodeId: "a", state: "VALIDATED" },
      { nodeId: "b", state: "VALIDATED" },
    ]);
    expect(s.get("c")).toBe("available");
    expect(s.get("d")).toBe("available");
    expect(s.get("e")).toBe("locked"); // d not validated yet
  });

  it("reflects in-progress and failed attempts", () => {
    const s = computeNodeStates(ids, edges, [
      { nodeId: "a", state: "VALIDATED" },
      { nodeId: "b", state: "IN_PROGRESS" },
      { nodeId: "d", state: "FAILED" },
    ]);
    expect(s.get("b")).toBe("in_progress");
    expect(s.get("d")).toBe("failed");
  });

  it("lists the nodes lit up by a validation", () => {
    const before = [{ nodeId: "a", state: "VALIDATED" as const }, { nodeId: "d", state: "VALIDATED" as const }];
    expect(newlyUnlocked(ids, edges, before, "b").sort()).toEqual(["c", "e"]);
  });

  it("computes deterministic depths", () => {
    const d = topologicalDepths(ids, edges);
    expect(d.get("a")).toBe(0);
    expect(d.get("b")).toBe(1);
    expect(d.get("c")).toBe(2);
    expect(d.get("e")).toBe(2);
  });
});
