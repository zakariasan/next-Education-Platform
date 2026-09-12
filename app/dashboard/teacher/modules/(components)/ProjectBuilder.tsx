"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Bot,
  Clock,
  Eye,
  GitBranch,
  GraduationCap,
  Plus,
  Rocket,
  Save,
  Trash2,
  Users,
  X,
  Zap,
  Lock,
  Pencil,
} from "lucide-react";
import MathMarkdown from "@/components/MathMarkdown";
import { wouldCreateCycle, type Edge } from "@/lib/gamification/graph";
import { GAMIFICATION } from "@/lib/gamification/config";
import type { CriterionDTO, CriterionInput, CriterionMode, ModuleDetailDTO, ProjectDTO } from "@/lib/gamification/types";
import StatusPill from "./StatusPill";

type AutoType = "NUMERIC" | "MCQ" | "UNIT";

type CriterionDraft = {
  key: string;
  id?: string;
  title: string;
  description: string;
  weight: number;
  mode: CriterionMode;
  autoType: AutoType;
  numeric: { answer: string; tolerance: string; unit: string };
  mcq: { choices: string; correct: string };
  unit: string;
};

const RESOURCE_SUGGESTIONS = ["Formula sheet", "Scientific calculator", "PhET simulator", "Spreadsheet", "Phone camera (video)", "Textbook"];

const MODE_META: Record<CriterionMode, { label: string; icon: React.ElementType; tint: string; hint: string }> = {
  AUTO: { label: "Auto", icon: Bot, tint: "bg-secondary/20 text-secondary", hint: "Scored instantly on submission" },
  TEACHER: { label: "Teacher", icon: GraduationCap, tint: "bg-primary/15 text-primary", hint: "Goes to your review queue" },
  PEER: { label: "Peer", icon: Users, tint: "bg-accent/25 text-accent-foreground", hint: "Reviewed by a student who validated this project" },
};

let keySeq = 0;
const newKey = () => `c${Date.now()}-${keySeq++}`;

const emptyCriterion = (): CriterionDraft => ({
  key: newKey(),
  title: "",
  description: "",
  weight: 25,
  mode: "TEACHER",
  autoType: "NUMERIC",
  numeric: { answer: "", tolerance: "0", unit: "" },
  mcq: { choices: "", correct: "" },
  unit: "",
});

function toDraft(c: CriterionDTO): CriterionDraft {
  const d = emptyCriterion();
  d.id = c.id;
  d.title = c.title;
  d.description = c.description ?? "";
  d.weight = c.weight;
  d.mode = c.mode;
  const a = c.autoConfig;
  if (a?.type === "NUMERIC") {
    d.autoType = "NUMERIC";
    d.numeric = { answer: String(a.answer), tolerance: String(a.tolerance), unit: a.unit ?? "" };
  } else if (a?.type === "MCQ") {
    d.autoType = "MCQ";
    d.mcq = { choices: a.choices.join("\n"), correct: a.correctIndexes.map((i) => i + 1).join(",") };
  } else if (a?.type === "UNIT") {
    d.autoType = "UNIT";
    d.unit = a.expectedUnit;
  }
  return d;
}

function toInput(d: CriterionDraft): CriterionInput {
  let autoConfig: CriterionInput["autoConfig"] = null;
  if (d.mode === "AUTO") {
    if (d.autoType === "NUMERIC") autoConfig = { type: "NUMERIC", answer: Number(d.numeric.answer), tolerance: Number(d.numeric.tolerance || 0), unit: d.numeric.unit || undefined };
    else if (d.autoType === "MCQ")
      autoConfig = {
        type: "MCQ",
        choices: d.mcq.choices.split("\n").map((s) => s.trim()).filter(Boolean),
        correctIndexes: d.mcq.correct.split(/[,\s]+/).map((s) => Number(s) - 1).filter((n) => Number.isInteger(n) && n >= 0),
      };
    else autoConfig = { type: "UNIT", expectedUnit: d.unit };
  }
  return { id: d.id, title: d.title, description: d.description || null, weight: d.weight, mode: d.mode, autoConfig };
}

type Props = { basePath?: string; apiBase?: string };

const ProjectBuilder = ({ basePath = "/dashboard/teacher/modules", apiBase = "/api/teacher/modules" }: Props) => {
  const params = useParams<{ id: string; pid?: string }>();
  const router = useRouter();
  const moduleId = params.id;
  const pid = params.pid;
  const isNew = !pid;

  const [mod, setMod] = useState<ModuleDetailDTO | null>(null);
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");

  const [title, setTitle] = useState("");
  const [isCore, setIsCore] = useState(true);
  const [hours, setHours] = useState("4");
  const [xp, setXp] = useState("150");
  const [threshold, setThreshold] = useState<number>(GAMIFICATION.validation.defaultThresholdPercent);
  const [statement, setStatement] = useState("");
  const [objectives, setObjectives] = useState("");
  const [resources, setResources] = useState<string[]>([]);
  const [resourceInput, setResourceInput] = useState("");
  const [criteria, setCriteria] = useState<CriterionDraft[]>([emptyCriterion()]);
  const [prereqIds, setPrereqIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    const res = await fetch(`${apiBase}/${moduleId}`);
    if (!res.ok) {
      toast.error("Module not found");
      setLoading(false);
      return;
    }
    const m: ModuleDetailDTO = await res.json();
    setMod(m);
    if (pid) {
      const p = m.projects.find((x) => x.id === pid) ?? null;
      setProject(p);
      if (p?.version) {
        setTitle(p.version.title);
        setIsCore(p.isCore);
        setHours(String(p.version.estimatedHours));
        setXp(String(p.version.xpReward));
        setThreshold(p.version.threshold);
        setStatement(p.version.statement);
        setObjectives(p.version.objectives.join("\n"));
        setResources(p.version.allowedResources);
        setCriteria(p.version.criteria.map(toDraft));
        setPrereqIds(p.prerequisiteIds);
      }
    }
    setLoading(false);
  }, [apiBase, moduleId, pid]);

  useEffect(() => {
    load();
  }, [load]);

  // Edges of the module without this project's incoming ones — the base for cycle checks.
  const edges = useMemo<Edge[]>(() => {
    const out: Edge[] = [];
    for (const p of mod?.projects ?? []) if (p.id !== pid) for (const q of p.prerequisiteIds) out.push({ from: q, to: p.id });
    return out;
  }, [mod, pid]);

  const candidates = useMemo(
    () =>
      (mod?.projects ?? [])
        .filter((p) => p.id !== pid)
        .map((p) => ({ p, cycle: pid ? wouldCreateCycle(edges, p.id, pid) : false })),
    [mod, pid, edges],
  );

  const weightSum = criteria.reduce((s, c) => s + (Number(c.weight) || 0), 0);
  const objectiveList = objectives.split("\n").map((s) => s.trim()).filter(Boolean);

  const updateCriterion = (key: string, patch: Partial<CriterionDraft>) =>
    setCriteria((cs) => cs.map((c) => (c.key === key ? { ...c, ...patch } : c)));

  const addResource = (r: string) => {
    const v = r.trim();
    if (!v || resources.includes(v)) return;
    setResources([...resources, v]);
    setResourceInput("");
  };

  const buildContent = () => ({
    title,
    statement,
    objectives: objectiveList,
    estimatedHours: Number(hours),
    xpReward: Number(xp),
    allowedResources: resources,
    threshold,
    criteria: criteria.map(toInput),
  });

  const save = async () => {
    if (!title.trim()) return toast.error("Title is required");
    if (!statement.trim()) return toast.error("Statement is required");
    if (criteria.some((c) => !c.title.trim())) return toast.error("Every criterion needs a title");
    setSaving(true);
    try {
      let id = pid;
      let createdNewVersion = false;
      if (isNew) {
        const res = await fetch(`${apiBase}/${moduleId}/projects`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: buildContent(), isCore }),
        });
        const data = await res.json();
        if (!res.ok) return toast.error(data.error ?? "Failed to create project");
        id = data.id;
      } else {
        const res = await fetch(`${apiBase}/${moduleId}/projects/${pid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: buildContent(), isCore }),
        });
        const data = await res.json();
        if (!res.ok) return toast.error(data.error ?? "Failed to save project");
        createdNewVersion = data.createdNewVersion;
      }
      const pr = await fetch(`${apiBase}/${moduleId}/projects/${id}/prerequisites`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prerequisiteIds: prereqIds }),
      });
      if (!pr.ok) {
        const d = await pr.json().catch(() => ({}));
        toast.error(d.error ?? "Prerequisites not saved");
      }
      toast.success(isNew ? "Project created as draft" : createdNewVersion ? "Saved as a new version — existing attempts keep the previous one" : "Project saved");
      if (isNew) router.push(`${basePath}/${moduleId}/projects/${id}`);
      else load();
    } finally {
      setSaving(false);
    }
  };

  const publish = async (action: "publish" | "archive" | "draft") => {
    if (!pid) return;
    const res = await fetch(`${apiBase}/${moduleId}/projects/${pid}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success(action === "publish" ? "Project published — students can see it now" : action === "archive" ? "Project archived" : "Back to draft");
      load();
    } else toast.error(data.error ?? "Action failed");
  };

  if (loading) return <div className="p-6 text-muted-foreground animate-pulse">Loading builder…</div>;
  if (!mod) return null;

  const preview = (
    <div className="space-y-4">
      {/* Node preview — how it appears on the Holy Graph */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-[#0b1020] p-5 text-white shadow-inner">
        <div aria-hidden className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(50,200,189,0.35),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(50,64,205,0.45),transparent_45%)]" />
        <div className="relative flex items-center gap-4">
          <div className={`relative w-16 h-16 flex items-center justify-center shrink-0 ${isCore ? "rounded-xl bg-primary shadow-[0_0_24px_rgba(50,64,205,0.7)]" : "rounded-full border-2 border-dashed border-secondary text-secondary"}`}>
            {isCore ? <Zap className="w-7 h-7" /> : <GitBranch className="w-6 h-6" />}
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-white/10 backdrop-blur px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              {isCore ? "core" : "elective"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-bold text-lg leading-tight truncate">{title || "Untitled project"}</p>
            <p className="text-white/60 text-xs mt-1 flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {hours || 0}h</span>
              <span className="flex items-center gap-1 text-growth"><Zap className="w-3 h-3" /> {xp || 0} XP</span>
              <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> {prereqIds.length} prereq</span>
            </p>
          </div>
        </div>
      </div>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-5">
          {statement.trim() ? <MathMarkdown source={statement} /> : <p className="text-sm text-muted-foreground italic">The statement preview renders here — with $LaTeX$.</p>}
          {objectiveList.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Learning objectives</p>
              <ul className="space-y-1.5">
                {objectiveList.map((o, i) => (
                  <li key={i} className="flex gap-2 text-sm"><span className="text-primary font-bold">›</span>{o}</li>
                ))}
              </ul>
            </div>
          )}
          {resources.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Allowed resources</p>
              <div className="flex flex-wrap gap-1.5">
                {resources.map((r) => (
                  <span key={r} className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">{r}</span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border border-border shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Rubric</p>
            <p className="text-xs text-muted-foreground">Validate at <span className="font-bold text-foreground">{threshold}%</span></p>
          </div>
          <div className="space-y-2.5">
            {criteria.map((c) => {
              const M = MODE_META[c.mode];
              const pct = weightSum ? Math.round((c.weight / weightSum) * 100) : 0;
              return (
                <div key={c.key}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${M.tint}`}><M.icon className="w-3 h-3" />{M.label}</span>
                      {c.title || "Untitled criterion"}
                    </span>
                    <span className="text-muted-foreground text-xs">{pct}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="relative mt-4 h-2 rounded-full bg-muted">
            <div className="absolute inset-y-0 left-0 rounded-full bg-growth/40" style={{ width: `${threshold}%` }} />
            <div className="absolute -top-1 h-4 w-0.5 bg-growth" style={{ left: `${threshold}%` }} title="Validation threshold" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-5 pb-28">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link href={`${basePath}/${moduleId}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" /> {mod.title}
        </Link>
        <Tabs value={mobileTab} onValueChange={(v) => setMobileTab(v as "edit" | "preview")} className="lg:hidden">
          <TabsList>
            <TabsTrigger value="edit"><Pencil className="w-3.5 h-3.5" /> Edit</TabsTrigger>
            <TabsTrigger value="preview"><Eye className="w-3.5 h-3.5" /> Preview</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex items-start gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{isNew ? "New project" : "Edit project"}</h1>
          <p className="text-sm text-muted-foreground">
            {isNew ? "Saved as a draft until you publish it." : project?.status === "PUBLISHED" ? `Published · v${project.version?.versionNumber}. Saving creates a new version.` : `Draft · v${project?.version?.versionNumber ?? 1}`}
          </p>
        </div>
        {project && <StatusPill status={project.status} className="mt-2" />}
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] gap-5 items-start">
        <div className={`space-y-5 ${mobileTab === "preview" ? "hidden lg:block" : ""}`}>
          <Card className="border border-border shadow-sm">
            <CardHeader><CardTitle className="text-base">Basics</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Newton's Laws" />
              </div>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="hours">Estimated hours</Label>
                  <Input id="hours" type="number" min="0.5" step="0.5" value={hours} onChange={(e) => setHours(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="xp">XP reward</Label>
                  <Input id="xp" type="number" min="0" step="10" value={xp} onChange={(e) => setXp(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="threshold">Validation threshold · {threshold}%</Label>
                  <input id="threshold" type="range" min={1} max={100} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} className="w-full accent-[var(--primary)] mt-2" />
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border p-3">
                <div>
                  <p className="text-sm font-medium">{isCore ? "Common core" : "Elective"}</p>
                  <p className="text-xs text-muted-foreground">{isCore ? "Mandatory — part of the module's main circuit." : "Optional — a branch off the main circuit."}</p>
                </div>
                <Switch checked={isCore} onCheckedChange={setIsCore} aria-label="Common core" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader><CardTitle className="text-base">Statement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="statement">Problem statement</Label>
                <Textarea id="statement" rows={10} value={statement} onChange={(e) => setStatement(e.target.value)} className="font-mono text-sm" placeholder={"## Title\n\nDescribe the task. Inline math like $F = ma$, display math on its own line: $$E = mc^2$$\n\n1. First question\n2. Second question"} />
                <p className="text-xs text-muted-foreground">Markdown headings, lists, **bold** and $LaTeX$ are rendered in the preview.</p>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="objectives">Learning objectives (one per line)</Label>
                <Textarea id="objectives" rows={3} value={objectives} onChange={(e) => setObjectives(e.target.value)} placeholder={"Apply Newton's second law to systems\nDraw free-body diagrams"} />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader><CardTitle className="text-base">Allowed resources</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {resources.map((r) => (
                  <span key={r} className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-1 text-xs font-medium">
                    {r}
                    <button type="button" aria-label={`Remove ${r}`} onClick={() => setResources(resources.filter((x) => x !== r))} className="hover:text-destructive"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={resourceInput} onChange={(e) => setResourceInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addResource(resourceInput); } }} placeholder="Type and press Enter" />
                <Button type="button" variant="outline" onClick={() => addResource(resourceInput)}><Plus className="w-4 h-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {RESOURCE_SUGGESTIONS.filter((s) => !resources.includes(s)).map((s) => (
                  <button key={s} type="button" onClick={() => addResource(s)} className="rounded-full border border-dashed border-border px-2.5 py-1 text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors">+ {s}</button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Rubric</CardTitle>
              <span className={`text-xs font-semibold ${weightSum > 0 ? "text-muted-foreground" : "text-destructive"}`}>Total weight {weightSum}</span>
            </CardHeader>
            <CardContent className="space-y-3">
              {criteria.map((c, i) => {
                const M = MODE_META[c.mode];
                return (
                  <div key={c.key} className="rounded-xl border border-border p-3 space-y-3 bg-card">
                    <div className="flex gap-2 items-start">
                      <span className="mt-2 w-6 h-6 rounded-md bg-muted text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                      <div className="flex-1 grid sm:grid-cols-[minmax(0,1fr)_88px_130px] gap-2">
                        <Input value={c.title} onChange={(e) => updateCriterion(c.key, { title: e.target.value })} placeholder="Criterion title" />
                        <Input type="number" min="1" value={c.weight} onChange={(e) => updateCriterion(c.key, { weight: Number(e.target.value) })} aria-label="Weight" />
                        <Select value={c.mode} onValueChange={(v) => updateCriterion(c.key, { mode: v as CriterionMode })}>
                          <SelectTrigger aria-label="Evaluation mode"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(MODE_META) as CriterionMode[]).map((m) => (
                              <SelectItem key={m} value={m}>{MODE_META[m].label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="button" size="icon" variant="ghost" aria-label="Remove criterion" disabled={criteria.length === 1} onClick={() => setCriteria(criteria.filter((x) => x.key !== c.key))} className="text-destructive hover:text-destructive shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="pl-8 space-y-2">
                      <p className="text-xs text-muted-foreground flex items-center gap-1"><M.icon className="w-3 h-3" /> {M.hint}</p>
                      <Input value={c.description} onChange={(e) => updateCriterion(c.key, { description: e.target.value })} placeholder="What does a full score look like? (optional)" className="text-sm" />
                      {c.mode === "AUTO" && (
                        <div className="rounded-lg bg-muted/50 p-2.5 space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Answer type</Label>
                            <Select value={c.autoType} onValueChange={(v) => updateCriterion(c.key, { autoType: v as AutoType })}>
                              <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="NUMERIC">Numeric ± tolerance</SelectItem>
                                <SelectItem value="MCQ">Multiple choice</SelectItem>
                                <SelectItem value="UNIT">Unit check</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {c.autoType === "NUMERIC" && (
                            <div className="grid grid-cols-3 gap-2">
                              <Input type="number" step="any" value={c.numeric.answer} onChange={(e) => updateCriterion(c.key, { numeric: { ...c.numeric, answer: e.target.value } })} placeholder="Answer" className="h-8 text-sm" />
                              <Input type="number" step="any" min="0" value={c.numeric.tolerance} onChange={(e) => updateCriterion(c.key, { numeric: { ...c.numeric, tolerance: e.target.value } })} placeholder="± tolerance" className="h-8 text-sm" />
                              <Input value={c.numeric.unit} onChange={(e) => updateCriterion(c.key, { numeric: { ...c.numeric, unit: e.target.value } })} placeholder="Unit (optional)" className="h-8 text-sm" />
                            </div>
                          )}
                          {c.autoType === "MCQ" && (
                            <div className="grid sm:grid-cols-[minmax(0,1fr)_140px] gap-2">
                              <Textarea rows={3} value={c.mcq.choices} onChange={(e) => updateCriterion(c.key, { mcq: { ...c.mcq, choices: e.target.value } })} placeholder={"One choice per line"} className="text-sm" />
                              <Input value={c.mcq.correct} onChange={(e) => updateCriterion(c.key, { mcq: { ...c.mcq, correct: e.target.value } })} placeholder="Correct: 1,3" className="h-8 text-sm" />
                            </div>
                          )}
                          {c.autoType === "UNIT" && (
                            <Input value={c.unit} onChange={(e) => updateCriterion(c.key, { unit: e.target.value })} placeholder="Expected unit, e.g. m/s²" className="h-8 text-sm" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <Button type="button" variant="outline" onClick={() => setCriteria([...criteria, emptyCriterion()])} className="w-full border-dashed">
                <Plus className="w-4 h-4" /> Add criterion
              </Button>
            </CardContent>
          </Card>

          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Prerequisites</CardTitle>
              <p className="text-xs text-muted-foreground">Students must validate these first. Options that would create a loop are disabled.</p>
            </CardHeader>
            <CardContent>
              {candidates.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">No other projects in this module yet — this will be an entry point.</p>
              ) : (
                <ul className="grid sm:grid-cols-2 gap-2">
                  {candidates.map(({ p, cycle }) => {
                    const checked = prereqIds.includes(p.id);
                    return (
                      <li key={p.id}>
                        <label className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${cycle ? "opacity-50 cursor-not-allowed border-dashed" : checked ? "border-primary bg-primary/5 cursor-pointer" : "border-border hover:bg-muted/50 cursor-pointer"}`}>
                          <Checkbox checked={checked} disabled={cycle} onCheckedChange={(v) => setPrereqIds(v ? [...prereqIds, p.id] : prereqIds.filter((x) => x !== p.id))} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium truncate">{p.version?.title ?? "Untitled"}</span>
                            <span className="block text-[11px] text-muted-foreground">
                              {cycle ? "Would create a cycle" : `${p.isCore ? "Core" : "Elective"} · ${p.version?.estimatedHours ?? 0}h · ${p.version?.xpReward ?? 0} XP`}
                            </span>
                          </span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className={`lg:sticky lg:top-4 ${mobileTab === "edit" ? "hidden lg:block" : ""}`}>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 flex items-center gap-1.5"><Eye className="w-3.5 h-3.5" /> Live preview</p>
          {preview}
        </div>
      </div>

      <div className="fixed bottom-0 left-16 md:left-64 right-0 z-20 border-t border-border bg-background/85 backdrop-blur px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground hidden sm:block">
            {isNew ? "Draft — not visible to students until published." : project?.status === "PUBLISHED" ? "Live for students. Edits create a new version." : "Draft — publish when the rubric is ready."}
          </p>
          <div className="flex items-center gap-2 ml-auto">
            {!isNew && project?.status !== "PUBLISHED" && (
              <Button variant="outline" onClick={() => publish("publish")} className="rounded-xl"><Rocket className="w-4 h-4" /> Publish</Button>
            )}
            {!isNew && project?.status === "PUBLISHED" && (
              <Button variant="ghost" onClick={() => publish("archive")} className="rounded-xl">Archive</Button>
            )}
            <Button onClick={save} disabled={saving} className="rounded-xl font-semibold">
              <Save className="w-4 h-4" /> {saving ? "Saving…" : isNew ? "Create draft" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBuilder;
