"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CheckCircle2, Clock, GitBranch, Hourglass, List, Lock, Play, XCircle, Zap, CircuitBoard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProgressOverview from "@/components/gamification/ProgressOverview";
import ProjectPanel, { type PanelResult } from "@/components/gamification/ProjectPanel";
import type { GraphPayload } from "@/lib/gamification/types";
import type { ProgressSummary, StudentProjectPanel } from "@/lib/gamification/student";
import type { NodeState } from "@/lib/gamification/graph";

export type JourneyData = GraphPayload & { progress: ProgressSummary };

const STATE_META: Record<NodeState, { label: string; icon: React.ElementType; tint: string; ring: string }> = {
  locked: { label: "Locked", icon: Lock, tint: "bg-muted text-muted-foreground", ring: "border-border" },
  available: { label: "Available", icon: Play, tint: "bg-primary/15 text-primary", ring: "border-primary/50" },
  in_progress: { label: "In progress", icon: Hourglass, tint: "bg-accent/25 text-accent-foreground", ring: "border-accent" },
  validated: { label: "Validated", icon: CheckCircle2, tint: "bg-growth/15 text-growth", ring: "border-growth" },
  failed: { label: "Retry", icon: XCircle, tint: "bg-destructive/10 text-destructive", ring: "border-destructive/60" },
};

const ModuleJourney = () => {
  const params = useParams<{ id: string }>();
  const [data, setData] = useState<JourneyData | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<PanelResult | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/student/modules/${params.id}/graph`);
    if (res.ok) setData(await res.json());
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  const stages = useMemo(() => {
    if (!data) return [];
    const byDepth = new Map<number, typeof data.nodes>();
    for (const n of data.nodes) {
      if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
      byDepth.get(n.depth)!.push(n);
    }
    return [...byDepth.entries()].sort((a, b) => a[0] - b[0]).map(([depth, nodes]) => ({ depth, nodes: nodes.sort((a, b) => Number(b.isCore) - Number(a.isCore) || a.orderIndex - b.orderIndex) }));
  }, [data]);

  const onChanged = (_panel: StudentProjectPanel, result?: PanelResult) => {
    if (result) setLastResult(result);
    load();
  };

  if (!data) return <div className="p-6 text-muted-foreground animate-pulse">Charging the circuit…</div>;

  const titleOf = (id: string) => data.nodes.find((n) => n.id === id)?.title ?? id;

  return (
    <div className="relative min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-5">
        <Link href="/dashboard/student/modules" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> All modules
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{data.module.subject}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2"><CircuitBoard className="w-7 h-7 text-primary" /> {data.module.title}</h1>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1"><List className="w-3.5 h-3.5" /> List view — graph view coming next</span>
        </div>

        <Card className="border border-border shadow-sm p-0">
          <CardContent className="p-4 md:p-5"><ProgressOverview progress={data.progress} /></CardContent>
        </Card>

        {lastResult?.finalized && lastResult.state === "VALIDATED" && (
          <div className="rounded-2xl border border-growth/40 bg-growth/10 p-4 text-sm">
            <p className="font-bold text-growth flex items-center gap-2"><Zap className="w-4 h-4" /> +{lastResult.xpAwarded} XP · {titleOf(lastResult.projectId)} validated</p>
            {lastResult.newlyUnlocked.length > 0 && <p className="text-foreground/80 mt-1">Unlocked: {lastResult.newlyUnlocked.map(titleOf).join(", ")}</p>}
          </div>
        )}

        <div className="space-y-6">
          {stages.map(({ depth, nodes }) => (
            <div key={depth}>
              <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Stage {depth + 1}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {nodes.map((n) => {
                  const S = STATE_META[n.state];
                  return (
                    <button
                      key={n.id}
                      onClick={() => setSelected(n.id)}
                      className={`text-left rounded-2xl border-2 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${S.ring} ${n.state === "locked" ? "opacity-70" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 shrink-0 flex items-center justify-center ${n.isCore ? "rounded-xl" : "rounded-full border-2 border-dashed"} ${S.tint}`}>
                          <S.icon className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground leading-tight truncate">{n.title}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                            <span className={n.isCore ? "text-primary font-semibold" : "text-secondary font-semibold"}>{n.isCore ? "core" : "elective"}</span>
                            <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{n.estimatedHours}h</span>
                            <span className="flex items-center gap-0.5 text-growth"><Zap className="w-3 h-3" />{n.xpReward}</span>
                          </p>
                        </div>
                      </div>
                      {n.prerequisiteIds.length > 0 && (
                        <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1 truncate"><GitBranch className="w-3 h-3" /> after {n.prerequisiteIds.map(titleOf).join(", ")}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full sm:max-w-xl h-full bg-card border-l border-border shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <ProjectPanel projectId={selected} onClose={() => setSelected(null)} onChanged={onChanged} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleJourney;
