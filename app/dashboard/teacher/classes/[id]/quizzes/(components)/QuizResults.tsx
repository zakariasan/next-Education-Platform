"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, RotateCcw, Users, Zap, BarChart3 } from "lucide-react";

type Row = {
  student: { id: string; name: string; email: string; avatar: string | null };
  attempted: boolean;
  score: number | null;
  maxScore: number | null;
  percent: number | null;
  xpAwarded: number;
  submittedAt: string | null;
};
type Data = {
  quiz: { id: string; title: string; questions: { id: string; text: string; points: number }[] };
  stats: { students: number; attempted: number; avgPercent: number | null };
  rows: Row[];
};

const QuizResults = ({ basePath = "/dashboard/teacher/classes", apiBase = "/api/teacher/classes" }: { basePath?: string; apiBase?: string }) => {
  const params = useParams<{ id: string; Quiz_id: string }>();
  const [data, setData] = useState<Data | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`${apiBase}/${params.id}/quizzes/${params.Quiz_id}/results`);
    if (res.ok) setData(await res.json());
  }, [apiBase, params.id, params.Quiz_id]);

  useEffect(() => {
    load();
  }, [load]);

  const reset = async (r: Row) => {
    if (!confirm(`Reset ${r.student.name}'s attempt? Their XP for this quiz will be removed and they can retake it.`)) return;
    const res = await fetch(`${apiBase}/${params.id}/quizzes/${params.Quiz_id}/results?studentId=${r.student.id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Attempt reset");
      load();
    } else toast.error("Failed to reset");
  };

  if (!data) return <div className="p-6 text-muted-foreground animate-pulse">Loading results…</div>;

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <Link href={`${basePath}/${params.id}/quizzes/${params.Quiz_id}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="w-4 h-4" /> {data.quiz.title}</Link>
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart3 className="w-6 h-6 text-primary" /> Results</h1>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Students", value: data.stats.students, icon: Users },
          { label: "Submitted", value: data.stats.attempted, icon: BarChart3 },
          { label: "Average", value: data.stats.avgPercent == null ? "—" : `${data.stats.avgPercent}%`, icon: Zap },
        ].map((s) => (
          <Card key={s.label} className="p-0 border border-border"><CardContent className="p-4"><p className="text-xl font-bold">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></CardContent></Card>
        ))}
      </div>
      <Card className="p-0 border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-[11px] uppercase tracking-wide text-muted-foreground">
            <tr><th className="text-left px-4 py-2.5">Student</th><th className="text-right px-3 py-2.5">Score</th><th className="text-right px-3 py-2.5">%</th><th className="text-right px-3 py-2.5">XP</th><th className="text-left px-3 py-2.5">Submitted</th><th className="px-3 py-2.5" /></tr>
          </thead>
          <tbody className="divide-y divide-border">
            {data.rows.map((r) => (
              <tr key={r.student.id} className="hover:bg-muted/40">
                <td className="px-4 py-3"><p className="font-semibold">{r.student.name}</p><p className="text-xs text-muted-foreground">{r.student.email}</p></td>
                <td className="px-3 py-3 text-right tabular-nums">{r.attempted ? `${r.score} / ${r.maxScore}` : <span className="text-muted-foreground">—</span>}</td>
                <td className="px-3 py-3 text-right tabular-nums">{r.percent != null ? <span className={`font-bold ${r.percent >= 70 ? "text-growth" : r.percent >= 40 ? "text-accent-foreground" : "text-destructive"}`}>{r.percent}%</span> : <span className="text-muted-foreground">not yet</span>}</td>
                <td className="px-3 py-3 text-right tabular-nums text-growth font-semibold">{r.attempted ? `+${r.xpAwarded}` : ""}</td>
                <td className="px-3 py-3 text-xs text-muted-foreground">{r.submittedAt ? new Date(r.submittedAt).toLocaleString() : ""}</td>
                <td className="px-3 py-3 text-right">{r.attempted && <Button size="sm" variant="ghost" onClick={() => reset(r)}><RotateCcw className="w-3.5 h-3.5" /> Reset</Button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
};

export default QuizResults;
