"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, BarChart3, CheckCircle2, Clock, Hourglass, Users, Zap } from "lucide-react";
import type { ModuleAnalytics as Analytics } from "@/lib/gamification/analytics";

const ModuleAnalytics = ({ moduleId, apiBase, basePath }: { moduleId: string; apiBase: string; basePath: string }) => {
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    fetch(`${apiBase}/${moduleId}/dashboard`).then(async (r) => r.ok && setData(await r.json()));
  }, [apiBase, moduleId]);

  if (!data) return null;

  const stats = [
    { label: "Students engaged", value: data.studentsEngaged, icon: Users, tint: "bg-primary/15 text-primary" },
    { label: "Core completed", value: data.studentsCoreComplete, icon: CheckCircle2, tint: "bg-growth/15 text-growth" },
    { label: "Attempts", value: data.totalAttempts, icon: BarChart3, tint: "bg-secondary/20 text-secondary" },
    { label: "Awaiting review", value: data.pendingReviews, icon: Hourglass, tint: "bg-accent/25 text-accent-foreground" },
    { label: "Hours to recalibrate", value: data.flagged, icon: AlertTriangle, tint: data.flagged ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground" },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-bold text-foreground">Analytics</h2>
        <p className="text-xs text-muted-foreground">Validation rate, real time spent vs your estimate, and the criteria students fail most.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="border border-border shadow-sm p-0">
            <CardContent className="p-3 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}><s.icon className="w-4 h-4" /></div>
              <div className="min-w-0">
                <p className="text-lg font-bold text-foreground leading-tight">{s.value}</p>
                <p className="text-[11px] text-muted-foreground truncate">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border border-border shadow-sm p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/60 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold">Project</th>
                <th className="text-right px-3 py-2.5 font-semibold">Attempts</th>
                <th className="text-right px-3 py-2.5 font-semibold">Validation</th>
                <th className="text-left px-3 py-2.5 font-semibold min-w-[180px]">Hours: actual vs est.</th>
                <th className="text-left px-3 py-2.5 font-semibold">Hardest criteria</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {data.projects.map((p) => {
                const ratio = p.hoursRatio ?? 0;
                const barPct = Math.min(100, Math.round(ratio * 50));
                return (
                  <tr key={p.id} className={`hover:bg-muted/40 ${p.hoursFlag ? "bg-destructive/[0.03]" : ""}`}>
                    <td className="px-4 py-3">
                      <Link href={`${basePath}/${moduleId}/projects/${p.id}`} className="font-semibold text-foreground hover:text-primary">{p.title}</Link>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                        <span className={p.isCore ? "text-primary" : "text-secondary"}>{p.isCore ? "core" : "elective"}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{p.estimatedHours}h</span>
                        <span className="flex items-center gap-0.5 text-growth"><Zap className="w-3 h-3" />{p.xpReward}</span>
                      </p>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <span className="font-semibold">{p.attempts}</span>
                      <span className="text-muted-foreground text-xs"> / {p.students} stu.</span>
                      {p.pending > 0 && <p className="text-[11px] text-accent-foreground">{p.pending} pending</p>}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      {p.validationRate == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <>
                          <span className={`font-bold ${p.validationRate >= 70 ? "text-growth" : p.validationRate >= 40 ? "text-accent-foreground" : "text-destructive"}`}>{p.validationRate}%</span>
                          <p className="text-[11px] text-muted-foreground">{p.validated}✓ {p.failed}✗ · avg {p.avgScore}%</p>
                        </>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {p.avgActualHours == null ? (
                        <span className="text-muted-foreground">no data</span>
                      ) : (
                        <div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="font-semibold tabular-nums">{p.avgActualHours}h</span>
                            <span className="text-muted-foreground">vs {p.estimatedHours}h · ×{p.hoursRatio}</span>
                            {p.hoursFlag && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-semibold uppercase">
                                <AlertTriangle className="w-3 h-3" /> {p.hoursFlag === "over" ? "raise hours/XP" : "lower hours/XP"}
                              </span>
                            )}
                          </div>
                          <div className="relative mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden w-40">
                            <div className={`h-full rounded-full ${p.hoursFlag ? "bg-destructive" : "bg-primary"}`} style={{ width: `${barPct}%` }} />
                            <div className="absolute top-0 bottom-0 w-0.5 bg-foreground/60" style={{ left: "50%" }} title="estimate" />
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {p.hardestCriteria.length === 0 ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <ul className="space-y-0.5 text-xs">
                          {p.hardestCriteria.map((c) => (
                            <li key={c.id} className="flex items-center gap-2">
                              <span className={`w-9 text-right font-semibold tabular-nums ${c.avgScore < 50 ? "text-destructive" : c.avgScore < 70 ? "text-accent-foreground" : "text-growth"}`}>{c.avgScore}%</span>
                              <span className="truncate max-w-[220px]">{c.title}</span>
                              {c.failRate > 0 && <span className="text-[10px] text-muted-foreground">{c.failRate}% fail</span>}
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ModuleAnalytics;
