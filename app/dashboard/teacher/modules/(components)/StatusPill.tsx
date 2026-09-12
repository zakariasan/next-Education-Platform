import React from "react";
import type { ProjectStatus } from "@/lib/gamification/types";

const STYLES: Record<ProjectStatus, string> = {
  DRAFT: "bg-muted text-muted-foreground border-border",
  PUBLISHED: "bg-growth/15 text-growth border-growth/30",
  ARCHIVED: "bg-destructive/10 text-destructive border-destructive/30",
};

const StatusPill = ({ status, className = "" }: { status: ProjectStatus; className?: string }) => (
  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${STYLES[status]} ${className}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${status === "PUBLISHED" ? "bg-growth animate-pulse" : status === "ARCHIVED" ? "bg-destructive" : "bg-muted-foreground"}`} />
    {status.toLowerCase()}
  </span>
);

export default StatusPill;
