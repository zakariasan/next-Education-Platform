"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CircuitBoard, Clock, GraduationCap, Zap, ArrowRight } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import EduBackdrop from "@/components/EduBackdrop";
import ProgressOverview from "@/components/gamification/ProgressOverview";
import type { ProgressSummary } from "@/lib/gamification/student";

type StudentModule = {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  teacherName: string;
  projectCount: number;
  coreTotal: number;
  coreValidated: number;
  validatedCount: number;
  totalHours: number;
  totalXp: number;
  earnedXp: number;
};

const StudentModulesList = () => {
  const [modules, setModules] = useState<StudentModule[]>([]);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [m, g] = await Promise.all([fetch("/api/student/modules"), fetch("/api/student/gamification")]);
      if (m.ok) setModules(await m.json());
      if (g.ok) setProgress(await g.json());
      setLoading(false);
    })();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EduBackdrop />
      <div className="relative max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b1020] via-[#111a3a] to-primary p-6 md:p-8 shadow-lg text-white">
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <CircuitBoard className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Holy Graph</h1>
              <p className="text-white/70 text-sm mt-0.5">Pick a module. Validate projects, power the next nodes, close the circuit.</p>
            </div>
          </div>
        </div>

        {progress && (
          <Card className="border border-border shadow-sm p-0">
            <CardContent className="p-4 md:p-5"><ProgressOverview progress={progress} /></CardContent>
          </Card>
        )}

        {!loading && modules.length === 0 && (
          <EmptyState title="No modules yet" quote="Join a class first — your teacher's modules will light up here." />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {modules.map((m) => {
            const corePct = m.coreTotal ? Math.round((m.coreValidated / m.coreTotal) * 100) : 0;
            return (
              <Link key={m.id} href={`/dashboard/student/modules/${m.id}`} className="group">
                <Card className="h-full border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 transition-all duration-200 p-0 overflow-hidden">
                  <div className="h-1.5 bg-muted"><div className="h-full bg-gradient-to-r from-primary to-growth transition-all" style={{ width: `${corePct}%` }} /></div>
                  <CardContent className="p-5">
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">{m.subject}</p>
                    <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">{m.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
                    <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-muted/60 p-2">
                        <p className="text-lg font-bold text-foreground">{corePct}%</p>
                        <p className="text-[10px] uppercase text-muted-foreground">core</p>
                      </div>
                      <div className="rounded-xl bg-muted/60 p-2">
                        <p className="text-lg font-bold text-growth flex items-center justify-center gap-1"><Zap className="w-4 h-4" />{m.earnedXp}</p>
                        <p className="text-[10px] uppercase text-muted-foreground">of {m.totalXp} XP</p>
                      </div>
                      <div className="rounded-xl bg-muted/60 p-2">
                        <p className="text-lg font-bold text-foreground flex items-center justify-center gap-1"><Clock className="w-4 h-4" />{m.totalHours}h</p>
                        <p className="text-[10px] uppercase text-muted-foreground">{m.projectCount} projects</p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" /> {m.teacherName}</span>
                      <span className="flex items-center gap-1 text-primary font-semibold">Open graph <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" /></span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StudentModulesList;
