"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import HolyGraph from "@/components/gamification/HolyGraph";
import type { GraphPayload } from "@/lib/gamification/types";
import { KIND_LABEL } from "@/lib/gamification/nodes";
import { CircuitBoard, Check, AlertTriangle } from "lucide-react";

/**
 * Wires the course map: which module comes after which, and which milestone
 * exam gates the step to the next ring.
 *
 * Selecting a node shows every other node as a prerequisite toggle. Cycles are
 * rejected by the server, which names the node that would close the loop.
 */
const CourseMapBuilder = () => {
  const [graph, setGraph] = useState<GraphPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/curriculum");
      if (res.ok) setGraph(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const node = graph?.nodes.find((n) => n.id === selected) ?? null;

  const togglePrereq = async (prereqKey: string) => {
    if (!node) return;
    const next = node.prerequisiteIds.includes(prereqKey)
      ? node.prerequisiteIds.filter((p) => p !== prereqKey)
      : [...node.prerequisiteIds, prereqKey];

    setSaving(true);
    try {
      const res = await fetch("/api/teacher/curriculum/edges", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nodeId: node.id, prerequisiteIds: next }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(body?.error ?? "Could not save that link");
      setGraph(body);
      toast.success("Course map updated");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-6 text-muted-foreground animate-pulse">Loading your course map…</div>;

  if (!graph || graph.nodes.length === 0) {
    return (
      <EmptyState
        title="Nothing to wire yet"
        quote="Create a module or two first. The course map is where you say which one opens the next."
      />
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Curriculum</p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <CircuitBoard className="w-7 h-7 text-primary" /> Course map
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          How your modules connect. A student finishes every core project in a module to light it up and
          open what comes next. Click a node to choose what must come before it.
        </p>
      </div>

      {(() => {
        // A module with no core projects can never be completed, so anything
        // wired behind it would leave students permanently stuck.
        const blocking = graph.nodes.filter(
          (n) => n.blocksProgress && graph.edges.some((e) => e.from === n.id),
        );
        if (blocking.length === 0) return null;
        return (
          <div className="rounded-2xl border-2 border-destructive/40 bg-destructive/5 p-4">
            <p className="text-sm font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" /> Students would get stuck
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {blocking.map((n) => `"${n.title}"`).join(", ")}{" "}
              {blocking.length === 1 ? "has" : "have"} no published core projects, so{" "}
              {blocking.length === 1 ? "it" : "they"} can never be finished. Anything placed
              behind {blocking.length === 1 ? "it" : "them"} will stay locked. Add a core
              project, or remove the link.
            </p>
          </div>
        );
      })()}

      <HolyGraph
        graph={graph}
        selectedId={selected}
        onSelect={setSelected}
        className="h-[46vh] min-h-[360px]"
      />

      {node ? (
        <Card className="border border-border shadow-sm p-0">
          <CardContent className="p-4 md:p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                  {KIND_LABEL[node.kind]} · ring {node.depth + 1}
                </p>
                <h2 className="font-bold text-foreground">{node.title}</h2>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>
                Done
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Must be finished before &ldquo;{node.title}&rdquo; opens:
            </p>
            <div className="flex flex-wrap gap-2">
              {graph.nodes
                .filter((n) => n.id !== node.id)
                .map((n) => {
                  const on = node.prerequisiteIds.includes(n.id);
                  return (
                    <button
                      key={n.id}
                      type="button"
                      disabled={saving}
                      onClick={() => togglePrereq(n.id)}
                      className={`flex items-center gap-2 rounded-xl border-2 px-3 py-1.5 text-sm transition-colors ${
                        on
                          ? "border-primary bg-primary/10 text-foreground font-semibold"
                          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
                      {on && <Check className="w-3.5 h-3.5 text-primary" />}
                      {n.title}
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {KIND_LABEL[n.kind]}
                      </span>
                    </button>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          Select a module or exam above to set what must come before it.
        </p>
      )}
    </div>
  );
};

export default CourseMapBuilder;
