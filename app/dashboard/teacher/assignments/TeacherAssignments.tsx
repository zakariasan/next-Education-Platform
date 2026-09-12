"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, ClipboardCheck, ClipboardList, Pencil, Users, Zap, CircuitBoard } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import EduBackdrop from "@/components/EduBackdrop";
import StatusPill from "@/app/dashboard/teacher/modules/(components)/StatusPill";
import type { QuizDTO } from "@/lib/quiz/queries";
import type { QueueItem } from "@/lib/gamification/reviews";

const TeacherAssignments = () => {
  const [quizzes, setQuizzes] = useState<QuizDTO[]>([]);
  const [reviews, setReviews] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [q, r] = await Promise.all([fetch("/api/teacher/quizzes"), fetch("/api/teacher/reviews?status=PENDING")]);
      if (q.ok) setQuizzes(await q.json());
      if (r.ok) setReviews(await r.json());
      setLoading(false);
    })();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EduBackdrop />
      <div className="relative max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-accent via-accent to-secondary p-6 md:p-8 shadow-lg text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0"><ClipboardList className="w-7 h-7" /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Assignments & Quizzes</h1>
              <p className="text-white/80 text-sm mt-0.5">{quizzes.length} quizzes across your classes · {reviews.length} project reviews waiting</p>
            </div>
          </div>
        </div>

        {reviews.length > 0 && (
          <Card className="border border-primary/30 bg-primary/5 p-0">
            <CardContent className="p-4 flex items-center gap-3">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              <p className="text-sm flex-1"><span className="font-semibold">{reviews.length}</span> project submission{reviews.length > 1 ? "s" : ""} waiting for your review.</p>
              <Button asChild size="sm"><Link href="/dashboard/teacher/reviews">Open review queue</Link></Button>
            </CardContent>
          </Card>
        )}

        {!loading && quizzes.length === 0 && <EmptyState title="No quizzes yet" quote="Open a class and create a quiz — bullets, checkboxes, numeric answers — then publish it." />}

        <div className="grid gap-3">
          {quizzes.map((q) => (
            <Card key={q.id} className="border border-border shadow-sm p-0 hover:border-primary/40 transition-colors">
              <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent/25 text-accent-foreground flex items-center justify-center shrink-0"><ClipboardList className="w-5 h-5" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/dashboard/teacher/classes/${q.classId}/quizzes/${q.id}`} className="font-semibold text-foreground hover:text-primary">{q.title}</Link>
                    <StatusPill status={q.status} />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                    <span>{q.className}</span>
                    <span>{q.questionCount} questions</span>
                    <span className="flex items-center gap-1 text-growth font-semibold"><Zap className="w-3 h-3" /> {q.xpReward} XP</span>
                    <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {q.attemptCount} submitted</span>
                    {q.moduleTitle && <span className="flex items-center gap-1 text-primary"><CircuitBoard className="w-3 h-3" /> {q.projectTitle ?? q.moduleTitle}</span>}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button asChild size="sm" variant="outline"><Link href={`/dashboard/teacher/classes/${q.classId}/quizzes/${q.id}/results`}><BarChart3 className="w-3.5 h-3.5" /> Results</Link></Button>
                  <Button asChild size="icon" variant="ghost" aria-label="Edit"><Link href={`/dashboard/teacher/classes/${q.classId}/quizzes/${q.id}`}><Pencil className="w-4 h-4" /></Link></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherAssignments;
