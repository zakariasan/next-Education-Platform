"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Clock, GitBranch, Hourglass, List, Lock, Play, XCircle, Zap, CircuitBoard, Map as MapIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import ProgressOverview from "@/components/gamification/ProgressOverview";
import ProjectPanel, { type PanelResult } from "@/components/gamification/ProjectPanel";
import HolyGraph, { type Surge } from "@/components/gamification/HolyGraph";
import type { GraphPayload } from "@/lib/gamification/types";
import type { ProgressSummary, StudentProjectPanel } from "@/lib/gamification/student";
import type { NodeState } from "@/lib/gamification/graph";
import { KIND_LABEL, nodeKey, parseNodeKey } from "@/lib/gamification/nodes";

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
  const [view, setView] = useState<"graph" | "list">("graph");
  const [surge, setSurge] = useState<Surge | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/student/modules/${params.id}/graph`);
    if (res.ok) {
      const d: JourneyData = await res.json();
      setData(d);
      return d;
    }
    return null;
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    try {
      const v = localStorage.getItem("hg-view");
      if (v === "list" || v === "graph") setView(v);
    } catch {}
  }, []);
  const switchView = (v: "graph" | "list") => {
    setView(v);
    try {
      localStorage.setItem("hg-view", v);
    } catch {}
  };

  const stages = useMemo(() => {
    if (!data) return [];
    const byDepth = new Map<number, typeof data.nodes>();
    for (const n of data.nodes) {
      if (!byDepth.has(n.depth)) byDepth.set(n.depth, []);
      byDepth.get(n.depth)!.push(n);
    }
    return [...byDepth.entries()].sort((a, b) => a[0] - b[0]).map(([depth, nodes]) => ({ depth, nodes: nodes.sort((a, b) => Number(b.isCore) - Number(a.isCore) || a.orderIndex - b.orderIndex) }));
  }, [data]);

  const onChanged = async (_panel: StudentProjectPanel, result?: PanelResult) => {
    const prevLevel = data?.progress.level.level ?? 1;
    const fresh = await load();
    if (result?.finalized && result.state === "VALIDATED") {
      setSelected(null);
      setSurge({ nodeId: nodeKey("PROJECT", result.projectId), xp: result.xpAwarded, unlocked: result.newlyUnlocked, at: Date.now() });
      setTimeout(() => setSurge(null), 4200);
      if (fresh && fresh.progress.level.level > prevLevel) toast.success(`Level up! You reached level ${fresh.progress.level.level}`, { duration: 6000 });
      for (const code of result.newBadges) {
        const b = fresh?.progress.badges.find((x) => x.code === code);
        if (b) toast(`Badge unlocked: ${b.title}`, { description: b.description, duration: 6000 });
      }
    }
  };

  if (!data) return <div className="p-6 text-muted-foreground animate-pulse">Charging the circuit…</div>;

  const titleOf = (id: string) => data.nodes.find((n) => n.id === id)?.title ?? id;

  return (
    <div className="relative min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-4">
        <Link href="/dashboard/student/modules" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> All modules
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{data.module.subject}</p>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2"><CircuitBoard className="w-7 h-7 text-primary" /> {data.module.title}</h1>
          </div>
          <div className="flex gap-1 rounded-xl bg-muted p-1 self-start md:self-auto">
            {([["graph", MapIcon, "Circuit"], ["list", List, "List"]] as const).map(([v, Icon, label]) => (
              <button key={v} onClick={() => switchView(v)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${view === v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Icon className="w-3.5 h-3.5" /> {label}
              </button>
            ))}
          </div>
        </div>

        <Card className="border border-border shadow-sm p-0">
          <CardContent className="p-4 md:p-5"><ProgressOverview progress={data.progress} /></CardContent>
        </Card>

        {view === "graph" ? (
          <HolyGraph graph={data} selectedId={selected} onSelect={setSelected} surge={surge} className="h-[62vh] min-h-[420px]" />
        ) : (
          <div className="space-y-6">
            {stages.map(({ depth, nodes }) => (
              <div key={depth}>
                <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">Stage {depth + 1}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {nodes.map((n) => {
                    const S = STATE_META[n.state];
                    return (
                      <button key={n.id} onClick={() => setSelected(n.id)} className={`text-left rounded-2xl border-2 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-lg ${S.ring} ${n.state === "locked" ? "opacity-70" : ""}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 shrink-0 flex items-center justify-center ${n.isCore ? "rounded-xl" : "rounded-full border-2 border-dashed"} ${S.tint}`}><S.icon className="w-5 h-5" /></div>
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground leading-tight truncate">{n.title}</p>
                            <p className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                              <span className={n.isCore ? "text-primary font-semibold" : "text-secondary font-semibold"}>{n.isCore ? "core" : "elective"}</span>
                              <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{n.estimatedHours}h</span>
                              <span className="flex items-center gap-0.5 text-growth"><Zap className="w-3 h-3" />{n.xpReward}</span>
                            </p>
                          </div>
                        </div>
                        {n.prerequisiteIds.length > 0 && <p className="mt-2 text-[11px] text-muted-foreground flex items-center gap-1 truncate"><GitBranch className="w-3 h-3" /> after {n.prerequisiteIds.map(titleOf).join(", ")}</p>}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-stretch sm:justify-end bg-black/40 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div
            className="w-full h-[88vh] rounded-t-3xl sm:h-full sm:rounded-none sm:max-w-xl bg-card border-t sm:border-t-0 sm:border-l border-border shadow-2xl overflow-y-auto animate-in slide-in-from-bottom sm:slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden sticky top-0 z-20 flex justify-center pt-2 bg-card"><span className="w-10 h-1.5 rounded-full bg-muted-foreground/30" /></div>
            {(() => {
              const { kind, id } = parseNodeKey(selected);
              if (kind === "PROJECT") {
                return <ProjectPanel projectId={id} onClose={() => setSelected(null)} onChanged={onChanged} />;
              }
              // Exams and quizzes live on the class pages; the graph links out
              // to them rather than duplicating their whole UI here.
              const node = data.nodes.find((n) => n.id === selected);
              const href = kind === "QUIZ" ? `/dashboard/student/quizzes/${id}` : `/dashboard/student/exams/${id}`;
              return (
                <div className="p-6 space-y-4">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
                    {KIND_LABEL[kind]}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight">{node?.title ?? "Untitled"}</h2>
                  <p className="text-sm text-muted-foreground">
                    {node ? STATE_META[node.state].label : ""}
                    {node && node.xpReward > 0 ? ` · worth ${node.xpReward} XP` : ""}
                  </p>
                  {node && node.prerequisiteIds.length > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <GitBranch className="w-3 h-3" /> after {node.prerequisiteIds.map(titleOf).join(", ")}
                    </p>
                  )}
                  {node?.state === "locked" ? (
                    <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
                      Finish what this depends on to unlock it.
                    </p>
                  ) : (
                    <Link href={href} className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                      Open {KIND_LABEL[kind].toLowerCase()}
                    </Link>
                  )}
                  <button onClick={() => setSelected(null)} className="block text-sm text-muted-foreground hover:text-foreground">
                    Close
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModuleJourney;
