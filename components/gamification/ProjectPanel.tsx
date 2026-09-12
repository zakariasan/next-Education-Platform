"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Bot, CheckCircle2, Clock, GitBranch, GraduationCap, Lock, Play, RotateCcw, Send, Users, X, XCircle, Zap, Hourglass } from "lucide-react";
import MathMarkdown from "@/components/MathMarkdown";
import type { StudentProjectPanel } from "@/lib/gamification/student";
import type { FinalizeResult } from "@/lib/gamification/pipeline";

export type PanelResult = FinalizeResult & { projectId: string };

type Props = {
  projectId: string;
  onClose?: () => void;
  onChanged?: (panel: StudentProjectPanel, result?: PanelResult) => void;
};

const MODE_META = {
  AUTO: { icon: Bot, label: "Auto-graded", tint: "bg-secondary/20 text-secondary" },
  TEACHER: { icon: GraduationCap, label: "Teacher", tint: "bg-primary/15 text-primary" },
  PEER: { icon: Users, label: "Peer", tint: "bg-accent/25 text-accent-foreground" },
} as const;

const STATE_META = {
  locked: { label: "Locked", icon: Lock, tint: "bg-muted text-muted-foreground" },
  available: { label: "Available", icon: Play, tint: "bg-primary/15 text-primary" },
  in_progress: { label: "In progress", icon: Hourglass, tint: "bg-accent/25 text-accent-foreground" },
  validated: { label: "Validated", icon: CheckCircle2, tint: "bg-growth/15 text-growth" },
  failed: { label: "Failed — retry", icon: XCircle, tint: "bg-destructive/10 text-destructive" },
} as const;

function useCountdown(iso: string | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  if (!iso) return null;
  const ms = new Date(iso).getTime() - now;
  if (ms <= 0) return "now";
  const h = Math.floor(ms / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

const ProjectPanel = ({ projectId, onClose, onChanged }: Props) => {
  const [data, setData] = useState<StudentProjectPanel | null>(null);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [busy, setBusy] = useState(false);
  const countdown = useCountdown(data?.retry.availableAt ?? null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/student/projects/${projectId}`);
    if (res.ok) {
      const d: StudentProjectPanel = await res.json();
      setData(d);
      if (d.attempt?.state === "IN_PROGRESS") setAnswers(d.attempt.answers ?? {});
    } else toast.error("Project not found");
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const elapsed = useMemo(() => {
    if (!data?.attempt?.startedAt || data.attempt.state !== "IN_PROGRESS") return null;
    return Math.round(((Date.now() - new Date(data.attempt.startedAt).getTime()) / 3600_000) * 10) / 10;
  }, [data]);

  const start = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/student/projects/${projectId}/start`, { method: "POST" });
      const d = await res.json();
      if (!res.ok) return toast.error(d.error ?? "Cannot start");
      toast.success("Project started — the clock is running");
      setData(d);
      setAnswers({});
      onChanged?.(d);
    } finally {
      setBusy(false);
    }
  };

  const submit = async () => {
    if (!data) return;
    const missing = data.criteria.filter((c) => {
      const a = answers[c.id];
      if (a == null || a === "") return true;
      if (typeof a === "object" && !Array.isArray(a) && (a as { value?: unknown }).value === "") return true;
      if (Array.isArray(a) && a.length === 0) return true;
      return false;
    });
    if (missing.length && !confirm(`${missing.length} criteria have no answer. Submit anyway?`)) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/student/projects/${projectId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      const d = await res.json();
      if (!res.ok) return toast.error(d.error ?? "Submission failed");
      const r: FinalizeResult = d.result;
      if (r.finalized && r.state === "VALIDATED") toast.success(`Validated! +${r.xpAwarded} XP`);
      else if (r.finalized) toast.error(`Not validated (${r.score}%). You can retry after the cooldown.`);
      else toast.success("Submitted — waiting for review");
      setData(d.panel);
      onChanged?.(d.panel, { ...r, projectId });
    } finally {
      setBusy(false);
    }
  };

  if (!data) return <div className="p-6 text-sm text-muted-foreground animate-pulse">Loading project…</div>;

  const S = STATE_META[data.state];
  const a = data.attempt;
  const canAnswer = data.state === "in_progress" && a?.state === "IN_PROGRESS";
  const waiting = a && (a.state === "SUBMITTED" || a.state === "UNDER_REVIEW");
  const finished = a && (a.state === "VALIDATED" || a.state === "FAILED");

  return (
    <div className="flex flex-col h-full">
      <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-5 py-4">
        <div className="flex items-start gap-3">
          <div className={`w-12 h-12 shrink-0 flex items-center justify-center ${data.isCore ? "rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "rounded-full border-2 border-dashed border-secondary text-secondary"}`}>
            {data.isCore ? <Zap className="w-6 h-6" /> : <GitBranch className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{data.moduleTitle} · {data.isCore ? "common core" : "elective"}</p>
            <h2 className="text-xl font-bold leading-tight text-foreground">{data.title}</h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
              <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${S.tint}`}><S.icon className="w-3 h-3" /> {S.label}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> ~{data.estimatedHours}h</span>
              <span className="flex items-center gap-1 text-growth font-semibold"><Zap className="w-3 h-3" /> {data.xpReward} XP</span>
              <span>v{data.versionNumber}</span>
            </div>
          </div>
          {onClose && (
            <Button size="icon" variant="ghost" onClick={onClose} aria-label="Close"><X className="w-5 h-5" /></Button>
          )}
        </div>
      </div>

      <div className="p-5 space-y-6 flex-1">
        {data.prerequisites.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">Prerequisites</p>
            <div className="flex flex-wrap gap-1.5">
              {data.prerequisites.map((p) => (
                <span key={p.id} className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${p.validated ? "bg-growth/15 text-growth" : "bg-muted text-muted-foreground"}`}>
                  {p.validated ? <CheckCircle2 className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {p.title}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Status block */}
        {data.state === "locked" && (
          <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground flex items-center gap-3">
            <Lock className="w-5 h-5 shrink-0" /> Validate the prerequisites above to power this node.
          </div>
        )}
        {data.state === "available" && (
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="text-sm text-foreground flex-1">Ready. Starting begins time tracking — finish under {data.estimatedHours}h for a speed bonus.</p>
            <Button onClick={start} disabled={busy} className="rounded-xl font-semibold"><Play className="w-4 h-4" /> Start project</Button>
          </div>
        )}
        {data.state === "failed" && a && (
          <div className="rounded-xl bg-destructive/5 border border-destructive/20 p-4 space-y-2">
            <p className="text-sm font-semibold text-destructive flex items-center gap-2"><XCircle className="w-4 h-4" /> Attempt #{a.attemptNumber} scored {a.score}% (needed {data.threshold}%)</p>
            {a.feedback && <p className="text-sm text-foreground/80 italic">“{a.feedback}”</p>}
            <div className="flex items-center gap-3 pt-1">
              <Button onClick={start} disabled={busy || !data.retry.allowed} variant="outline" className="rounded-xl"><RotateCcw className="w-4 h-4" /> Retry</Button>
              {!data.retry.allowed && <span className="text-xs text-muted-foreground">Cooldown — retry in {countdown}</span>}
            </div>
          </div>
        )}
        {waiting && (
          <div className="rounded-xl bg-accent/10 border border-accent/30 p-4 text-sm">
            <p className="font-semibold text-accent-foreground flex items-center gap-2"><Hourglass className="w-4 h-4" /> Submitted after {a?.actualHours ?? "?"}h — under review</p>
            <p className="text-muted-foreground mt-1">Pending: {a?.pendingReviews.filter((r) => r.status === "PENDING").map((r) => r.kind.toLowerCase()).join(", ") || "auto-grading"}.</p>
          </div>
        )}
        {finished && a?.state === "VALIDATED" && (
          <div className="rounded-xl bg-growth/10 border border-growth/30 p-4 text-sm">
            <p className="font-semibold text-growth flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Validated at {a.score}% · +{a.xpAwarded} XP · {a.actualHours ?? "?"}h {a.actualHours != null && a.actualHours < data.estimatedHours && "(speed bonus!)"}</p>
            {a.feedback && <p className="text-foreground/80 italic mt-1">“{a.feedback}”</p>}
          </div>
        )}
        {canAnswer && elapsed != null && (
          <div className="rounded-xl bg-accent/10 border border-accent/30 px-4 py-2.5 text-xs flex items-center gap-2 text-accent-foreground">
            <Clock className="w-3.5 h-3.5" /> In progress for {elapsed}h · estimate {data.estimatedHours}h
          </div>
        )}

        <MathMarkdown source={data.statement} />

        {data.objectives.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">You will learn to</p>
            <ul className="space-y-1">
              {data.objectives.map((o, i) => <li key={i} className="text-sm flex gap-2"><span className="text-primary font-bold">›</span> {o}</li>)}
            </ul>
          </div>
        )}
        {data.allowedResources.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1.5">Allowed resources</p>
            <div className="flex flex-wrap gap-1.5">{data.allowedResources.map((r) => <span key={r} className="rounded-full bg-muted px-2.5 py-1 text-xs">{r}</span>)}</div>
          </div>
        )}

        {/* Rubric / answers */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold">{canAnswer ? "Your answers" : "Rubric"}</p>
            <p className="text-[11px] text-muted-foreground">validate at {data.threshold}%</p>
          </div>
          <div className="space-y-3">
            {data.criteria.map((c) => {
              const M = MODE_META[c.mode];
              const input = c.input as { type?: string; unit?: string | null; choices?: string[]; multiple?: boolean } | null;
              const val = answers[c.id];
              return (
                <div key={c.id} className="rounded-xl border border-border p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase ${M.tint}`}><M.icon className="w-3 h-3" />{M.label}</span>
                        {c.title}
                      </p>
                      {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">w {c.weight}</span>
                  </div>
                  {c.score != null && (
                    <p className={`mt-2 text-sm font-bold ${c.score >= 70 ? "text-growth" : "text-destructive"}`}>{c.score}% {c.comment && <span className="font-normal text-muted-foreground italic">— {c.comment}</span>}</p>
                  )}
                  {canAnswer && (
                    <div className="mt-3">
                      {c.mode === "AUTO" && input?.type === "NUMERIC" && (
                        <div className="flex gap-2">
                          <Input type="number" step="any" placeholder="Value" value={String((val as { value?: unknown })?.value ?? "")} onChange={(e) => setAnswers({ ...answers, [c.id]: { ...(val as object), value: e.target.value === "" ? "" : Number(e.target.value) } })} className="flex-1" />
                          <Input placeholder="Unit" value={String((val as { unit?: unknown })?.unit ?? "")} onChange={(e) => setAnswers({ ...answers, [c.id]: { ...(val as object), unit: e.target.value } })} className="w-28" />
                        </div>
                      )}
                      {c.mode === "AUTO" && input?.type === "MCQ" && (
                        <div className="space-y-1.5">
                          {(input.choices ?? []).map((choice, i) => {
                            const picked = Array.isArray(val) ? (val as number[]) : [];
                            const on = picked.includes(i);
                            return (
                              <label key={i} className={`flex items-center gap-2 rounded-lg border p-2 text-sm cursor-pointer ${on ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
                                <Checkbox checked={on} onCheckedChange={(v) => setAnswers({ ...answers, [c.id]: v ? (input.multiple ? [...picked, i] : [i]) : picked.filter((x) => x !== i) })} />
                                {choice}
                              </label>
                            );
                          })}
                        </div>
                      )}
                      {c.mode === "AUTO" && input?.type === "UNIT" && (
                        <Input placeholder="Unit, e.g. m/s²" value={String(val ?? "")} onChange={(e) => setAnswers({ ...answers, [c.id]: e.target.value })} />
                      )}
                      {c.mode !== "AUTO" && (
                        <Textarea rows={4} placeholder="Your work, reasoning, or a link to your report…" value={String(val ?? "")} onChange={(e) => setAnswers({ ...answers, [c.id]: e.target.value })} className="text-sm" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {canAnswer && (
        <div className="sticky bottom-0 bg-card/95 backdrop-blur border-t border-border px-5 py-3 flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">Auto criteria are graded instantly; the rest go to review.</p>
          <Button onClick={submit} disabled={busy} className="rounded-xl font-semibold"><Send className="w-4 h-4" /> {busy ? "Submitting…" : "Submit for review"}</Button>
        </div>
      )}
    </div>
  );
};

export default ProjectPanel;
