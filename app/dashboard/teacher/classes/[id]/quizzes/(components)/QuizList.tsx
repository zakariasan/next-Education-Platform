"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, CalendarClock, ClipboardList, Pencil, Plus, Rocket, Trash2, Users, Zap, CircuitBoard } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import StatusPill from "@/app/dashboard/teacher/modules/(components)/StatusPill";
import type { QuizDTO } from "@/lib/quiz/queries";

type Props = { basePath?: string; apiBase?: string; compact?: boolean };

const QuizList = ({ basePath = "/dashboard/teacher/classes", apiBase = "/api/teacher/classes", compact = false }: Props) => {
  const params = useParams<{ id: string }>();
  const classId = params.id;
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`${apiBase}/${classId}/quizzes`);
    if (res.ok) setQuizzes(await res.json());
    setLoading(false);
  }, [apiBase, classId]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (q: QuizDTO, status: "PUBLISHED" | "DRAFT") => {
    const res = await fetch(`${apiBase}/${classId}/quizzes/${q.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success(status === "PUBLISHED" ? "Quiz published" : "Quiz unpublished");
      load();
    } else toast.error(d.error ?? "Failed");
  };

  const remove = async (q: QuizDTO) => {
    if (!confirm(`Delete "${q.title}"? Student attempts will be lost.`)) return;
    const res = await fetch(`${apiBase}/${classId}/quizzes/${q.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Quiz deleted");
      load();
    } else toast.error("Failed to delete");
  };

  return (
    <div className={`space-y-4 ${compact ? "mt-3" : ""}`}>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="font-bold text-foreground text-lg flex items-center gap-2"><ClipboardList className="w-5 h-5 text-accent-foreground" /> Quizzes</h2>
          <p className="text-xs text-muted-foreground">Google-Forms style quizzes. Publish to make them visible; link one to a Holy Graph project to use it as a rubric criterion.</p>
        </div>
        <Button asChild className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl">
          <Link href={`${basePath}/${classId}/quizzes/new`}><Plus className="w-4 h-4" /> New quiz</Link>
        </Button>
      </div>

      {!loading && quizzes.length === 0 && (
        <EmptyState title="No quizzes yet" quote="A quiz is a quick measurement — build one with bullets, checkboxes or numeric answers and publish it." />
      )}

      <div className="grid gap-3">
        {quizzes.map((q) => (
          <Card key={q.id} className="border border-border shadow-sm p-0 hover:border-primary/40 transition-colors">
            <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/25 text-accent-foreground flex items-center justify-center shrink-0"><ClipboardList className="w-5 h-5" /></div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link href={`${basePath}/${classId}/quizzes/${q.id}`} className="font-semibold text-foreground hover:text-primary truncate">{q.title}</Link>
                  <StatusPill status={q.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                  <span>{q.questionCount} questions · {q.maxScore} pts</span>
                  <span className="flex items-center gap-1 text-growth font-semibold"><Zap className="w-3 h-3" /> {q.xpReward} XP</span>
                  {q.dueDate && <span className="flex items-center gap-1"><CalendarClock className="w-3 h-3" /> due {new Date(q.dueDate).toLocaleString()}</span>}
                  {q.moduleTitle && <span className="flex items-center gap-1 text-primary"><CircuitBoard className="w-3 h-3" /> {q.projectTitle ?? q.moduleTitle}</span>}
                  <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {q.attemptCount} submitted</span>
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button asChild size="sm" variant="outline"><Link href={`${basePath}/${classId}/quizzes/${q.id}/results`}><BarChart3 className="w-3.5 h-3.5" /> Results</Link></Button>
                <Button asChild size="icon" variant="ghost" aria-label="Edit"><Link href={`${basePath}/${classId}/quizzes/${q.id}`}><Pencil className="w-4 h-4" /></Link></Button>
                {q.status === "PUBLISHED" ? (
                  <Button size="sm" variant="ghost" onClick={() => setStatus(q, "DRAFT")}>Unpublish</Button>
                ) : (
                  <Button size="sm" variant="outline" onClick={() => setStatus(q, "PUBLISHED")}><Rocket className="w-3.5 h-3.5" /> Publish</Button>
                )}
                <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(q)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizList;
