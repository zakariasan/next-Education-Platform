"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CircuitBoard, Layers, Zap, User } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import CreateModulePOP from "./CreateModulePOP";
import type { ModuleDTO } from "@/lib/gamification/types";
import StatusPill from "./StatusPill";

type Props = { basePath?: string; apiBase?: string; showTeacher?: boolean; adminMode?: boolean };

const ModulesList = ({ basePath = "/dashboard/teacher/modules", apiBase = "/api/teacher/modules", showTeacher = false, adminMode = false }: Props) => {
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(apiBase);
      if (res.ok) setModules(await res.json());
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-6 md:p-8 shadow-lg">
        <svg className="absolute -top-8 -right-8 w-56 h-56 text-white/10 pointer-events-none" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <path d="M10 50 H35 V20 H65 V50 H90" stroke="currentColor" strokeWidth="2" />
          <path d="M10 70 H30 V85 H70 V70 H90" stroke="currentColor" strokeWidth="2" />
          <circle cx="35" cy="50" r="4" fill="currentColor" />
          <circle cx="65" cy="50" r="4" fill="currentColor" />
          <circle cx="30" cy="70" r="4" fill="currentColor" />
          <circle cx="70" cy="70" r="4" fill="currentColor" />
        </svg>
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <CircuitBoard className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Modules</h1>
              <p className="text-white/70 text-sm mt-0.5">Project tracks with XP, prerequisites and a Holy Graph</p>
            </div>
          </div>
          <CreateModulePOP apiBase={apiBase} onCreated={load} adminMode={adminMode} />
        </div>
      </div>

      {!loading && modules.length === 0 && (
        <EmptyState
          title="No modules yet"
          quote="Every circuit starts with one node. Create a module, add its common core, and let students close the loop."
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {modules.map((m) => (
          <Link key={m.id} href={`${basePath}/${m.id}`} className="group">
            <Card className="h-full overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 hover:-translate-y-1 active:scale-[0.98] transition-all duration-200 ease-out p-0 gap-0">
              <div className="h-1.5 w-full bg-gradient-to-r from-primary via-secondary to-accent" />
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <span className="w-10 h-10 rounded-xl bg-primary/15 text-primary flex items-center justify-center shrink-0">
                    <CircuitBoard className="w-5 h-5" />
                  </span>
                  <StatusPill status={m.status} />
                </div>
                <p className="mt-3 font-bold text-lg text-foreground leading-tight group-hover:text-primary transition-colors">{m.title}</p>
                <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mt-1">{m.subject}</p>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2 min-h-10">{m.description}</p>
                <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-primary font-medium">
                    <Layers className="w-4 h-4" /> {m.projectCount} projects
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Zap className="w-4 h-4" /> {m.coreCount} core
                  </span>
                </div>
                {showTeacher && (
                  <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
                    <User className="w-3 h-3" /> {m.teacherName}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ModulesList;
