"use client";
import React from "react";
import { Zap } from "lucide-react";
import type { ProgressSummary } from "@/lib/gamification/student";
import BadgeIcon from "./BadgeIcon";

const ProgressOverview = ({ progress, compact = false }: { progress: ProgressSummary; compact?: boolean }) => {
  const { level } = progress;
  const earned = progress.badges.filter((b) => b.awardedAt);
  const pct = Math.round(level.progress * 100);
  const r = 26;
  const c = 2 * Math.PI * r;

  return (
    <div className={`flex ${compact ? "flex-row items-center gap-4" : "flex-col sm:flex-row sm:items-center gap-5"}`}>
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative w-16 h-16">
          <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
            <circle cx="32" cy="32" r={r} className="stroke-muted" strokeWidth="6" fill="none" />
            <circle cx="32" cy="32" r={r} className="stroke-[var(--growth)] transition-[stroke-dashoffset] duration-700 ease-out" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - level.progress)} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
            <span className="text-[9px] uppercase tracking-wide text-muted-foreground font-semibold">lvl</span>
            <span className="text-xl font-extrabold text-foreground">{level.level}</span>
          </div>
        </div>
        <div className="min-w-[8rem]">
          <p className="text-sm font-bold flex items-center gap-1 text-foreground"><Zap className="w-4 h-4 text-growth" /> {level.totalXp.toLocaleString()} XP</p>
          <p className="text-xs text-muted-foreground">{level.xpToNextLevel > 0 ? `${level.xpToNextLevel} XP to level ${level.level + 1}` : "Max level"}</p>
          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-growth transition-all duration-700" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>

      {progress.coreTotal != null && (
        <div className="shrink-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Common core</p>
          <p className="text-lg font-bold text-foreground">{progress.coreCompletion}% <span className="text-xs font-medium text-muted-foreground">({progress.coreValidated}/{progress.coreTotal})</span></p>
          <div className="mt-1 h-1.5 w-32 rounded-full bg-muted overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${progress.coreCompletion ?? 0}%` }} />
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap sm:ml-auto">
        {progress.badges.map((b) => (
          <span
            key={b.code}
            title={`${b.title} — ${b.description}`}
            className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all ${
              b.awardedAt ? "bg-accent/25 border-accent/50 text-accent-foreground shadow-sm shadow-accent/30" : "bg-muted/40 border-border text-muted-foreground/40 grayscale"
            }`}
          >
            <BadgeIcon name={b.icon} className="w-4 h-4" />
          </span>
        ))}
        <span className="text-xs text-muted-foreground ml-1">{earned.length}/{progress.badges.length}</span>
      </div>
    </div>
  );
};

export default ProgressOverview;
