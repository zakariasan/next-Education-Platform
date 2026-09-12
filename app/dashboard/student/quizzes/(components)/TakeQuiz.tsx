"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Send, Timer, Zap } from "lucide-react";
import QuizForm, { type Answers } from "@/components/quiz/QuizForm";
import type { QuizDTO } from "@/lib/quiz/queries";
import type { QuestionResult } from "@/lib/quiz/grade";

type Data = QuizDTO & {
  attempt: { score: number; maxScore: number; percent: number; xpAwarded: number; submittedAt: string | null; answers: Answers | null; results: QuestionResult[] | null } | null;
};

const TakeQuiz = () => {
  const params = useParams<{ quizId: string }>();
  const [data, setData] = useState<Data | null>(null);
  const [answers, setAnswers] = useState<Answers>({});
  const [busy, setBusy] = useState(false);
  const [startedAt] = useState(() => Date.now());
  const [left, setLeft] = useState<number | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/student/quizzes/${params.quizId}`);
    if (res.ok) setData(await res.json());
    else toast.error("Quiz not found");
  }, [params.quizId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(async () => {
    if (!data || busy) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/student/quizzes/${params.quizId}/submit`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ answers }) });
      const d = await res.json();
      if (!res.ok) return toast.error(d.error ?? "Submission failed");
      toast.success(`Submitted: ${d.percent}% · +${d.xpAwarded} XP`);
      load();
    } finally {
      setBusy(false);
    }
  }, [answers, busy, data, load, params.quizId]);

  // Countdown for timed quizzes; auto-submit at zero.
  useEffect(() => {
    if (!data?.duration || data.attempt) return;
    const total = data.duration * 60_000;
    const tick = () => {
      const remaining = Math.max(0, total - (Date.now() - startedAt));
      setLeft(remaining);
      if (remaining === 0) submit();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [data, startedAt, submit]);

  if (!data) return <div className="p-6 text-muted-foreground animate-pulse">Loading quiz…</div>;

  const done = !!data.attempt;
  const missingRequired = data.questions.filter((q) => q.required && (answers[q.id] == null || answers[q.id] === "" || (Array.isArray(answers[q.id]) && (answers[q.id] as unknown[]).length === 0)));

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4 pb-28">
      <Link href="/dashboard/student/quizzes" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="w-4 h-4" /> Quizzes</Link>
      <Card className="border-t-8 border-t-primary shadow-sm">
        <CardContent className="p-6">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{data.className}{data.lessonTitle ? ` · ${data.lessonTitle}` : ""}{data.projectTitle ? ` · ${data.projectTitle}` : data.moduleTitle ? ` · ${data.moduleTitle}` : ""}</p>
          <h1 className="text-2xl font-bold mt-1">{data.title}</h1>
          {data.description && <p className="text-muted-foreground mt-2 whitespace-pre-wrap">{data.description}</p>}
          <p className="text-xs text-muted-foreground mt-3 flex flex-wrap gap-3">
            <span>{data.questions.length} questions · {data.maxScore} pts</span>
            <span className="flex items-center gap-1 text-growth font-semibold"><Zap className="w-3 h-3" /> up to {data.xpReward} XP</span>
            {data.dueDate && <span>due {new Date(data.dueDate).toLocaleString()}</span>}
            {left != null && <span className={`flex items-center gap-1 font-semibold ${left < 60_000 ? "text-destructive" : "text-accent-foreground"}`}><Timer className="w-3 h-3" /> {Math.floor(left / 60000)}:{String(Math.floor((left % 60000) / 1000)).padStart(2, "0")}</span>}
          </p>
          {done && data.attempt && (
            <div className="mt-4 rounded-xl bg-growth/10 border border-growth/30 p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-growth shrink-0" />
              <div>
                <p className="font-bold text-growth">{data.attempt.percent}% · {data.attempt.score}/{data.attempt.maxScore} pts · +{data.attempt.xpAwarded} XP</p>
                <p className="text-xs text-muted-foreground">Submitted {data.attempt.submittedAt ? new Date(data.attempt.submittedAt).toLocaleString() : ""}{data.showAnswers ? " — correct answers highlighted below." : "."}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <QuizForm questions={data.questions} answers={done ? (data.attempt?.answers ?? {}) : answers} onChange={setAnswers} readOnly={done} results={done ? data.attempt?.results : null} />

      {!done && (
        <div className="fixed bottom-0 left-16 md:left-64 right-0 z-20 border-t border-border bg-background/85 backdrop-blur px-4 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">{missingRequired.length ? `${missingRequired.length} required question${missingRequired.length > 1 ? "s" : ""} left` : "All required questions answered"} · one attempt only</p>
            <Button onClick={submit} disabled={busy || missingRequired.length > 0} className="rounded-xl font-semibold"><Send className="w-4 h-4" /> {busy ? "Submitting…" : "Submit"}</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeQuiz;
