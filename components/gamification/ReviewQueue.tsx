"use client";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, CheckCircle2, ClipboardCheck, Clock, GraduationCap, Users, X, Zap, Eye } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import MathMarkdown from "@/components/MathMarkdown";
import EduBackdrop from "@/components/EduBackdrop";
import type { QueueItem, ReviewDetail } from "@/lib/gamification/reviews";

type Props = {
  apiBase: string; // /api/teacher/reviews | /api/student/reviews
  title: string;
  subtitle: string;
  peerMode?: boolean;
};

const MODE_ICON = { AUTO: Bot, TEACHER: GraduationCap, PEER: Users } as const;

function AnswerView({ value }: { value: unknown }) {
  if (value == null || value === "") return <span className="italic text-muted-foreground">No answer</span>;
  if (typeof value === "object" && !Array.isArray(value)) {
    const v = value as { value?: unknown; unit?: unknown };
    return <span className="font-mono">{String(v.value ?? "")} {typeof v.unit === "string" ? v.unit : ""}</span>;
  }
  if (Array.isArray(value)) return <span className="font-mono">Choice {value.map((i) => Number(i) + 1).join(", ")}</span>;
  return <span className="whitespace-pre-wrap">{String(value)}</span>;
}

const ReviewQueue = ({ apiBase, title, subtitle, peerMode = false }: Props) => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<ReviewDetail | null>(null);
  const [scores, setScores] = useState<Record<string, { score: number; comment: string }>>({});
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"PENDING" | "DONE">("PENDING");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    load();
  }, [load]);

  const open = async (id: string) => {
    const res = await fetch(`${apiBase}/${id}`);
    if (!res.ok) return toast.error("Could not load this review");
    const d: ReviewDetail = await res.json();
    setActive(d);
    setFeedback("");
    setScores(Object.fromEntries(d.criteria.filter((c) => c.gradable).map((c) => [c.id, { score: c.score ?? 70, comment: c.comment ?? "" }])));
  };

  const submit = async () => {
    if (!active) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/${active.assignmentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores, feedback }),
      });
      const d = await res.json();
      if (!res.ok) return toast.error(d.error ?? "Failed to submit review");
      const r = d.result;
      toast.success(r.finalized ? `Review sent — project ${r.state === "VALIDATED" ? "validated" : "failed"} (${r.score}%)` : "Review sent — waiting for other reviewers");
      setActive(null);
      load();
    } finally {
      setSaving(false);
    }
  };

  const shown = items.filter((i) => i.status === tab);

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <EduBackdrop />
      <div className="relative max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary to-primary p-6 md:p-8 shadow-lg text-white">
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <ClipboardCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>
            </div>
            <div className="ml-auto flex gap-1 rounded-xl bg-white/10 p-1">
              {(["PENDING", "DONE"] as const).map((t) => (
                <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${tab === t ? "bg-white text-primary" : "text-white/80 hover:bg-white/10"}`}>
                  {t === "PENDING" ? `To review (${items.filter((i) => i.status === "PENDING").length})` : "Done"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {!loading && shown.length === 0 && (
          <EmptyState
            title={tab === "PENDING" ? "Queue is empty" : "Nothing reviewed yet"}
            quote={peerMode ? "Peer reviews appear here once a classmate submits a project you have already validated." : "Submissions with teacher-graded criteria land here the moment students submit."}
          />
        )}

        <div className="grid gap-3">
          {shown.map((q) => (
            <Card key={q.assignmentId} className="border border-border shadow-sm p-0 hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-bold flex items-center justify-center shrink-0">
                  {q.attempt.student.name[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">
                    {q.attempt.student.name} · <span className="text-primary">{q.attempt.projectTitle}</span>
                  </p>
                  <p className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
                    <span>{q.attempt.moduleTitle}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {q.attempt.actualHours ?? "?"}h / {q.attempt.estimatedHours}h est.</span>
                    <span className="flex items-center gap-1"><Zap className="w-3 h-3" /> {q.attempt.xpReward} XP</span>
                    <span>attempt #{q.attempt.attemptNumber}</span>
                    <span className={`font-semibold uppercase ${q.kind === "PEER" ? "text-accent-foreground" : "text-primary"}`}>{q.kind} review</span>
                  </p>
                </div>
                {q.status === "PENDING" ? (
                  <Button size="sm" onClick={() => open(q.assignmentId)} className="rounded-lg"><Eye className="w-4 h-4" /> Review</Button>
                ) : (
                  <span className="text-xs font-semibold flex items-center gap-1 text-growth"><CheckCircle2 className="w-4 h-4" /> {q.attempt.state.toLowerCase()} {q.attempt.score != null && `· ${q.attempt.score}%`}</span>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {active && (
        <div className="fixed inset-0 z-40 flex justify-end bg-black/40 backdrop-blur-sm" onClick={() => setActive(null)}>
          <div className="w-full max-w-2xl h-full bg-card border-l border-border shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 z-10 bg-card/95 backdrop-blur border-b border-border px-5 py-4 flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">{active.kind} review · attempt #{active.attempt.attemptNumber}</p>
                <h2 className="font-bold text-lg truncate">{active.attempt.projectTitle} — {active.attempt.student.name}</h2>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setActive(null)} aria-label="Close"><X className="w-5 h-5" /></Button>
            </div>
            <div className="p-5 space-y-6">
              <details className="rounded-xl border border-border p-4">
                <summary className="cursor-pointer text-sm font-semibold">Statement</summary>
                <div className="mt-3"><MathMarkdown source={active.statement} /></div>
              </details>

              <div className="space-y-4">
                {active.criteria.map((c) => {
                  const Icon = MODE_ICON[c.mode];
                  const s = scores[c.id];
                  return (
                    <div key={c.id} className={`rounded-xl border p-4 ${c.gradable ? "border-primary/30 bg-primary/[0.03]" : "border-border"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold flex items-center gap-2"><Icon className="w-4 h-4 text-muted-foreground" /> {c.title} <span className="text-xs text-muted-foreground font-normal">· weight {c.weight}</span></p>
                          {c.description && <p className="text-xs text-muted-foreground mt-0.5">{c.description}</p>}
                        </div>
                        {!c.gradable && c.score != null && (
                          <span className="text-sm font-bold text-growth shrink-0">{c.score}%</span>
                        )}
                      </div>
                      <div className="mt-3 rounded-lg bg-muted/50 p-3 text-sm">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground font-semibold mb-1">Student answer</p>
                        <AnswerView value={active.answers[c.id]} />
                        {c.mode === "AUTO" && c.autoConfig != null && (
                          <p className="text-[11px] text-muted-foreground mt-2">Expected: <span className="font-mono">{JSON.stringify(c.autoConfig)}</span></p>
                        )}
                      </div>
                      {c.gradable && s && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-3">
                            <input type="range" min={0} max={100} value={s.score} onChange={(e) => setScores({ ...scores, [c.id]: { ...s, score: Number(e.target.value) } })} className="flex-1 accent-[var(--primary)]" aria-label={`Score for ${c.title}`} />
                            <span className={`w-14 text-right font-bold ${s.score >= 70 ? "text-growth" : s.score >= 40 ? "text-accent-foreground" : "text-destructive"}`}>{s.score}%</span>
                          </div>
                          <Textarea rows={2} value={s.comment} onChange={(e) => setScores({ ...scores, [c.id]: { ...s, comment: e.target.value } })} placeholder="Comment for the student (optional)" className="text-sm" />
                          {c.mode === "PEER" && !peerMode && <p className="text-[11px] text-accent-foreground">Peer-graded criterion — your score counts as a spot-check override.</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                <p className="text-sm font-semibold">Overall feedback</p>
                <Textarea rows={3} value={feedback} onChange={(e) => setFeedback(e.target.value)} placeholder="What went well, what to fix on a retry…" />
              </div>
              <p className="text-xs text-muted-foreground">Validation threshold: {active.attempt.threshold}% weighted score.</p>
              <div className="flex justify-end gap-2 pb-4">
                <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
                <Button onClick={submit} disabled={saving} className="font-semibold"><ClipboardCheck className="w-4 h-4" /> {saving ? "Sending…" : "Send review"}</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewQueue;
