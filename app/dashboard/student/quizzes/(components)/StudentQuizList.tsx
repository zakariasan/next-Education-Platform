"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarClock, CheckCircle2, CircuitBoard, ClipboardList, Play, Zap } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import EduBackdrop from "@/components/EduBackdrop";

export type StudentQuiz = {
  id: string;
  title: string;
  description: string | null;
  className: string;
  lessonTitle: string | null;
  moduleTitle: string | null;
  projectTitle: string | null;
  dueDate: string | null;
  duration: number | null;
  xpReward: number;
  questionCount: number;
  maxScore: number;
  attempt: { percent: number; score: number; xpAwarded: number; submittedAt: string | null } | null;
};

const StudentQuizList = () => {
  const [quizzes, setQuizzes] = useState<StudentQuiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/student/quizzes").then(async (r) => {
      if (r.ok) setQuizzes(await r.json());
      setLoading(false);
    });
  }, []);

  const todo = quizzes.filter((q) => !q.attempt);
  const done = quizzes.filter((q) => q.attempt);

  const row = (q: StudentQuiz) => {
    const overdue = !q.attempt && q.dueDate && new Date(q.dueDate).getTime() < Date.now();
    return (
      <Card key={q.id} className="border border-border shadow-sm p-0 hover:border-primary/40 transition-colors">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${q.attempt ? "bg-growth/15 text-growth" : "bg-accent/25 text-accent-foreground"}`}>
            {q.attempt ? <CheckCircle2 className="w-5 h-5" /> : <ClipboardList className="w-5 h-5" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{q.title}</p>
            <p className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mt-0.5">
              <span>{q.className}</span>
              <span>{q.questionCount} questions</span>
              <span className="flex items-center gap-1 text-growth font-semibold"><Zap className="w-3 h-3" /> {q.xpReward} XP</span>
              {q.duration && <span>{q.duration} min</span>}
              {q.dueDate && <span className={`flex items-center gap-1 ${overdue ? "text-destructive font-semibold" : ""}`}><CalendarClock className="w-3 h-3" /> {overdue ? "overdue" : `due ${new Date(q.dueDate).toLocaleString()}`}</span>}
              {q.moduleTitle && <span className="flex items-center gap-1 text-primary"><CircuitBoard className="w-3 h-3" /> {q.projectTitle ?? q.moduleTitle}</span>}
            </p>
          </div>
          {q.attempt ? (
            <div className="text-right shrink-0">
              <p className={`text-lg font-bold ${q.attempt.percent >= 70 ? "text-growth" : "text-accent-foreground"}`}>{q.attempt.percent}%</p>
              <Link href={`/dashboard/student/quizzes/${q.id}`} className="text-xs text-primary hover:underline">Review · +{q.attempt.xpAwarded} XP</Link>
            </div>
          ) : (
            <Button asChild size="sm" className="rounded-lg" disabled={!!overdue}>
              <Link href={`/dashboard/student/quizzes/${q.id}`}><Play className="w-4 h-4" /> {overdue ? "Closed" : "Take quiz"}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EduBackdrop />
      <div className="relative max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent to-primary p-6 md:p-8 shadow-lg text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0"><ClipboardList className="w-7 h-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Quizzes</h1>
              <p className="text-white/80 text-sm mt-0.5">{todo.length} to do · {done.length} done</p>
            </div>
          </div>
        </div>
        {!loading && quizzes.length === 0 && <EmptyState title="No quizzes yet" quote="Your teachers haven't published a quiz. When they do, it lands here." />}
        {todo.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">To do</p>
            <div className="grid gap-3">{todo.map(row)}</div>
          </div>
        )}
        {done.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">Done</p>
            <div className="grid gap-3">{done.map(row)}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentQuizList;
