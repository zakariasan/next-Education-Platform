"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CircuitBoard, Lock } from "lucide-react";
import { toast } from "sonner";
import HolyGraph from "@/components/gamification/HolyGraph";
import EmptyState from "@/components/EmptyState";
import type { GraphPayload } from "@/lib/gamification/types";
import { parseNodeKey } from "@/lib/gamification/nodes";

/**
 * The big graph: modules as nodes, linked to each other, with milestone exams
 * gating the step from one ring to the next. Clicking an unlocked module opens
 * that module's own Holy Graph of projects, quizzes and exams.
 */
const CourseMap = () => {
  const router = useRouter();
  const [graph, setGraph] = useState<GraphPayload | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/curriculum");
      if (res.ok) setGraph(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <div className="p-6 text-muted-foreground animate-pulse">Mapping your course…</div>;
  }

  if (!graph || graph.nodes.length === 0) {
    return (
      <EmptyState
        title="No modules yet"
        quote="Nothing to map until a teacher puts a module in one of your classes."
      />
    );
  }

  const open = (key: string) => {
    const node = graph.nodes.find((n) => n.id === key);
    if (!node) return;

    if (node.state === "locked") {
      const names = node.prerequisiteIds
        .map((p) => graph.nodes.find((n) => n.id === p)?.title ?? "")
        .filter(Boolean);
      toast.info(names.length ? `Finish ${names.join(" and ")} first.` : "Not open yet.");
      return;
    }

    const { kind, id } = parseNodeKey(key);
    if (kind === "MODULE") router.push(`/dashboard/student/modules/${id}`);
    else toast.info("Your teacher will tell you when this exam is sat.");
  };

  const done = graph.nodes.filter((n) => n.state === "validated").length;
  const locked = graph.nodes.filter((n) => n.state === "locked").length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
            Course map
          </p>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <CircuitBoard className="w-7 h-7 text-primary" /> How your modules connect
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Finish every core project in a module to light it up and open what comes next.
          </p>
        </div>
        <div className="flex gap-4 text-sm shrink-0">
          <span className="text-growth font-semibold">{done} done</span>
          {locked > 0 && (
            <span className="text-muted-foreground flex items-center gap-1">
              <Lock className="w-3.5 h-3.5" /> {locked} locked
            </span>
          )}
        </div>
      </div>

      <HolyGraph graph={graph} onSelect={open} className="h-[58vh] min-h-[400px]" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[...graph.nodes]
          .sort((a, b) => a.depth - b.depth || a.orderIndex - b.orderIndex)
          .map((n) => (
            <button
              key={n.id}
              onClick={() => open(n.id)}
              className={`text-left rounded-2xl border-2 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${
                n.state === "validated"
                  ? "border-growth/60"
                  : n.state === "locked"
                    ? "border-border opacity-70"
                    : "border-primary/50"
              }`}
            >
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">
                Ring {n.depth + 1} · {n.kind === "MODULE" ? "module" : "exam"}
              </p>
              <p className="font-semibold text-foreground leading-tight mt-1">{n.title}</p>
              {n.progress && n.progress.total > 0 && (
                <div className="mt-2">
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-growth transition-all"
                      style={{ width: `${(n.progress.done / n.progress.total) * 100}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {n.progress.done} of {n.progress.total} core projects
                  </p>
                </div>
              )}
              {n.state === "locked" && n.prerequisiteIds.length > 0 && (
                <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> after{" "}
                  {n.prerequisiteIds
                    .map((p) => graph.nodes.find((x) => x.id === p)?.title ?? "?")
                    .join(", ")}
                </p>
              )}
            </button>
          ))}
      </div>
    </div>
  );
};

export default CourseMap;
