"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Archive,
  Clock,
  Layers,
  Pencil,
  Plus,
  Rocket,
  Trash2,
  Zap,
  GitBranch,
  Undo2,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";
import HolyGraph from "@/components/gamification/HolyGraph";
import type { GraphPayload, ModuleDetailDTO, ProjectDTO } from "@/lib/gamification/types";
import StatusPill from "./StatusPill";
import ModuleAnalytics from "./ModuleAnalytics";

type Props = { basePath?: string; apiBase?: string };

const ModuleDetail = ({ basePath = "/dashboard/teacher/modules", apiBase = "/api/teacher/modules" }: Props) => {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const moduleId = params.id;
  const [mod, setMod] = useState<ModuleDetailDTO | null>(null);
  const [graph, setGraph] = useState<GraphPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [res, g] = await Promise.all([fetch(`${apiBase}/${moduleId}`), fetch(`${apiBase}/${moduleId}/graph`)]);
    if (res.ok) setMod(await res.json());
    else toast.error("Module not found");
    if (g.ok) setGraph(await g.json());
    setLoading(false);
  }, [apiBase, moduleId]);

  const pin = async (id: string, p: { x: number; y: number } | null) => {
    const res = await fetch(`${apiBase}/${moduleId}/graph`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pins: { [id]: p } }),
    });
    if (res.ok) {
      const g = await fetch(`${apiBase}/${moduleId}/graph`);
      if (g.ok) setGraph(await g.json());
    } else toast.error("Could not save position");
  };

  const resetPins = async () => {
    if (!graph) return;
    const pins = Object.fromEntries(graph.nodes.filter((n) => n.pinX != null).map((n) => [n.id, null]));
    if (!Object.keys(pins).length) return;
    await fetch(`${apiBase}/${moduleId}/graph`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ pins }) });
    const g = await fetch(`${apiBase}/${moduleId}/graph`);
    if (g.ok) setGraph(await g.json());
    toast.success("Auto layout restored");
  };

  useEffect(() => {
    load();
  }, [load]);

  const titleOf = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of mod?.projects ?? []) map.set(p.id, p.version?.title ?? "Untitled");
    return (id: string) => map.get(id) ?? "?";
  }, [mod]);

  const stats = useMemo(() => {
    const ps = mod?.projects ?? [];
    return {
      total: ps.length,
      core: ps.filter((p) => p.isCore).length,
      electives: ps.filter((p) => !p.isCore).length,
      hours: ps.reduce((s, p) => s + (p.version?.estimatedHours ?? 0), 0),
      xp: ps.reduce((s, p) => s + (p.version?.xpReward ?? 0), 0),
      published: ps.filter((p) => p.status === "PUBLISHED").length,
    };
  }, [mod]);

  const act = async (key: string, fn: () => Promise<Response>, okMsg: string) => {
    setBusy(key);
    try {
      const res = await fn();
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        toast.success(okMsg);
        await load();
      } else toast.error(data.error ?? "Something went wrong");
    } finally {
      setBusy(null);
    }
  };

  const setModuleStatus = (status: "DRAFT" | "PUBLISHED" | "ARCHIVED") =>
    act(
      "module",
      () => fetch(`${apiBase}/${moduleId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }),
      status === "PUBLISHED" ? "Module published" : status === "ARCHIVED" ? "Module archived" : "Module set to draft",
    );

  const publish = (p: ProjectDTO, action: "publish" | "archive" | "draft") =>
    act(
      p.id,
      () => fetch(`${apiBase}/${moduleId}/projects/${p.id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) }),
      action === "publish" ? "Project published" : action === "archive" ? "Project archived" : "Back to draft",
    );

  const remove = (p: ProjectDTO) =>
    act(p.id, () => fetch(`${apiBase}/${moduleId}/projects/${p.id}`, { method: "DELETE" }), "Project removed");

  const move = async (index: number, dir: -1 | 1) => {
    if (!mod) return;
    const ps = [...mod.projects];
    const j = index + dir;
    if (j < 0 || j >= ps.length) return;
    [ps[index], ps[j]] = [ps[j], ps[index]];
    setMod({ ...mod, projects: ps });
    await Promise.all(
      [index, j].map((k) =>
        fetch(`${apiBase}/${moduleId}/projects/${ps[k].id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderIndex: k }),
        }),
      ),
    );
    load();
  };

  const removeModule = async () => {
    if (!confirm("Delete this module? If students already attempted it, it will be archived instead.")) return;
    const res = await fetch(`${apiBase}/${moduleId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Module removed");
      router.push(basePath);
    } else toast.error("Failed to remove module");
  };

  if (loading) return <div className="p-6 text-muted-foreground animate-pulse">Loading module…</div>;
  if (!mod) return <div className="p-6"><EmptyState title="Module not found" quote="This node has no connection to your circuit." /></div>;

  return (
    <div className="space-y-6">
      <Link href={basePath} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
        <ArrowLeft className="w-4 h-4" /> All modules
      </Link>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-6 md:p-8 shadow-lg text-white">
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <p className="text-xs uppercase tracking-widest text-white/70 font-semibold">{mod.subject}</p>
              <StatusPill status={mod.status} className="bg-white/15 text-white border-white/30" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-1">{mod.title}</h1>
            {mod.description && <p className="text-white/75 text-sm mt-2 max-w-2xl">{mod.description}</p>}
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            {mod.status !== "PUBLISHED" ? (
              <Button onClick={() => setModuleStatus("PUBLISHED")} disabled={busy === "module"} className="bg-white text-primary hover:bg-white/90 font-semibold rounded-xl">
                <Rocket className="w-4 h-4" /> Publish module
              </Button>
            ) : (
              <Button onClick={() => setModuleStatus("DRAFT")} disabled={busy === "module"} variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white rounded-xl">
                <Undo2 className="w-4 h-4" /> Unpublish
              </Button>
            )}
            <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl">
              <Link href={`${basePath}/${moduleId}/projects/new`}>
                <Plus className="w-4 h-4" /> New project
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Projects", value: stats.total, icon: Layers, tint: "bg-primary/15 text-primary" },
          { label: "Common core", value: stats.core, icon: Zap, tint: "bg-accent/25 text-accent-foreground" },
          { label: "Electives", value: stats.electives, icon: GitBranch, tint: "bg-secondary/20 text-secondary" },
          { label: "Total hours", value: `${stats.hours}h`, icon: Clock, tint: "bg-muted text-muted-foreground" },
          { label: "Total XP", value: stats.xp, icon: Rocket, tint: "bg-growth/15 text-growth" },
        ].map((s) => (
          <Card key={s.label} className="border border-border shadow-sm p-0">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>
                <s.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {graph && graph.nodes.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground">Holy Graph preview</h2>
              <p className="text-xs text-muted-foreground">What students see (drafts included). Drag a component to pin it; click to edit.</p>
            </div>
            {graph.nodes.some((n) => n.pinX != null) && (
              <Button size="sm" variant="ghost" onClick={resetPins}><Undo2 className="w-3.5 h-3.5" /> Auto layout</Button>
            )}
          </div>
          <HolyGraph graph={graph} onSelect={(id) => router.push(`${basePath}/${moduleId}/projects/${id}`)} editable onPin={pin} className="h-[420px]" />
        </div>
      )}

      {mod.projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          quote="A module without projects is a circuit with no components. Add the first node of the common core."
          action={
            <Button asChild>
              <Link href={`${basePath}/${moduleId}/projects/new`}><Plus className="w-4 h-4" /> Create the first project</Link>
            </Button>
          }
        />
      ) : (
        <Card className="border border-border shadow-sm p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="font-bold text-foreground">Projects</h2>
              <p className="text-xs text-muted-foreground">{stats.published}/{stats.total} published · order defines the graph column tie-break</p>
            </div>
          </div>
          <ul className="divide-y divide-border">
            {mod.projects.map((p, i) => (
              <li key={p.id} className="px-4 md:px-5 py-4 flex flex-col md:flex-row md:items-center gap-3 hover:bg-muted/40 transition-colors">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ArrowUp className="w-3.5 h-3.5" /></button>
                    <button aria-label="Move down" onClick={() => move(i, 1)} disabled={i === mod.projects.length - 1} className="p-0.5 rounded hover:bg-muted disabled:opacity-30"><ArrowDown className="w-3.5 h-3.5" /></button>
                  </div>
                  <div
                    className={`w-10 h-10 shrink-0 flex items-center justify-center font-bold text-sm ${
                      p.isCore ? "rounded-lg bg-primary text-primary-foreground" : "rounded-full border-2 border-dashed border-secondary text-secondary"
                    }`}
                    title={p.isCore ? "Common core" : "Elective"}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`${basePath}/${moduleId}/projects/${p.id}`} className="font-semibold text-foreground hover:text-primary truncate">
                        {p.version?.title ?? "Untitled"}
                      </Link>
                      <StatusPill status={p.status} />
                      <span className={`text-[11px] font-semibold uppercase tracking-wide ${p.isCore ? "text-primary" : "text-secondary"}`}>
                        {p.isCore ? "core" : "elective"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {p.prerequisiteIds.length ? `Requires: ${p.prerequisiteIds.map(titleOf).join(", ")}` : "Entry point — no prerequisites"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground shrink-0 md:pl-3">
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {p.version?.estimatedHours ?? 0}h</span>
                  <span className="flex items-center gap-1 text-growth font-semibold"><Zap className="w-3.5 h-3.5" /> {p.version?.xpReward ?? 0} XP</span>
                  <span className="hidden sm:inline">v{p.version?.versionNumber ?? 0}</span>
                  <span className="hidden sm:inline">{p.attemptCount} attempts</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button asChild size="icon" variant="ghost" aria-label="Edit">
                    <Link href={`${basePath}/${moduleId}/projects/${p.id}`}><Pencil className="w-4 h-4" /></Link>
                  </Button>
                  {p.status !== "PUBLISHED" ? (
                    <Button size="sm" variant="outline" disabled={busy === p.id} onClick={() => publish(p, "publish")} className="rounded-lg">
                      <Rocket className="w-3.5 h-3.5" /> Publish
                    </Button>
                  ) : (
                    <Button size="sm" variant="ghost" disabled={busy === p.id} onClick={() => publish(p, "archive")} className="rounded-lg" aria-label="Archive">
                      <Archive className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" disabled={busy === p.id} onClick={() => remove(p)} className="text-destructive hover:text-destructive" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {mod.projects.length > 0 && <ModuleAnalytics moduleId={moduleId} apiBase={apiBase} basePath={basePath} />}

      <div className="flex justify-end">
        <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={removeModule}>
          <Trash2 className="w-4 h-4" /> Delete module
        </Button>
      </div>
    </div>
  );
};

export default ModuleDetail;
