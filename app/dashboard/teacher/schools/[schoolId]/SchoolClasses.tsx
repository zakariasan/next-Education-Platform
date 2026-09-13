"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EmptyState from "@/components/EmptyState";
import { BookOpenText, Check, ChevronDown, ChevronUp, Plus, Users } from "lucide-react";

type ModuleRef = { id: string; title: string; subject: string; status: string };

type ClassRow = {
  id: string;
  name: string;
  archived: boolean;
  studentCount: number;
  modules: ModuleRef[];
};

type Available = ModuleRef & { projectCount: number };

/**
 * Every class in this school with its curriculum: the modules a teacher has
 * assigned to it, and the ones they own but have not assigned yet.
 */
const SchoolClasses = ({ classes }: { classes: ClassRow[] }) => {
  const router = useRouter();
  const [open, setOpen] = useState<string | null>(null);
  const [available, setAvailable] = useState<Record<string, Available[]>>({});
  const [assigned, setAssigned] = useState<Record<string, ModuleRef[]>>(
    Object.fromEntries(classes.map((c) => [c.id, c.modules])),
  );
  const [busy, setBusy] = useState<string | null>(null);

  const toggleOpen = async (classId: string) => {
    if (open === classId) return setOpen(null);
    setOpen(classId);
    if (available[classId]) return;
    const res = await fetch(`/api/teacher/classes/${classId}/modules`);
    if (!res.ok) return toast.error("Could not load this class's curriculum");
    const data = await res.json();
    setAvailable((prev) => ({ ...prev, [classId]: data.available }));
    setAssigned((prev) => ({ ...prev, [classId]: data.assigned }));
  };

  const save = async (classId: string, moduleIds: string[]) => {
    setBusy(classId);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/modules`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleIds }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(body?.error ?? "Could not update the curriculum");
        return false;
      }
      const fresh = await fetch(`/api/teacher/classes/${classId}/modules`);
      if (fresh.ok) {
        const data = await fresh.json();
        setAvailable((prev) => ({ ...prev, [classId]: data.available }));
        setAssigned((prev) => ({ ...prev, [classId]: data.assigned }));
      }
      router.refresh();
      return true;
    } finally {
      setBusy(null);
    }
  };

  const add = async (classId: string, moduleId: string) => {
    const ids = [...(assigned[classId] ?? []).map((m) => m.id), moduleId];
    if (await save(classId, ids)) toast.success("Added to this class");
  };

  const remove = async (classId: string, moduleId: string) => {
    const ids = (assigned[classId] ?? []).map((m) => m.id).filter((x) => x !== moduleId);
    if (await save(classId, ids)) toast.success("Removed from this class");
  };

  if (classes.length === 0) {
    return (
      <EmptyState
        title="No classes in this school yet"
        quote="A school with no classes is just a building. Create a class to give it something to teach."
      />
    );
  }

  return (
    <div className="space-y-3">
      {classes.map((c) => {
        const isOpen = open === c.id;
        const mine = assigned[c.id] ?? [];
        const rest = available[c.id];
        return (
          <Card key={c.id} className="border border-border shadow-sm p-0 overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <Link
                    href={`/dashboard/teacher/classes/${c.id}`}
                    className="font-semibold text-foreground hover:text-primary truncate"
                  >
                    {c.name}
                  </Link>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {c.studentCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpenText className="w-3 h-3" /> {mine.length} module
                      {mine.length === 1 ? "" : "s"}
                    </span>
                    {c.archived && <span className="text-muted-foreground/70">archived</span>}
                  </p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => toggleOpen(c.id)} className="shrink-0">
                  Curriculum
                  {isOpen ? <ChevronUp className="w-4 h-4 ml-1" /> : <ChevronDown className="w-4 h-4 ml-1" />}
                </Button>
              </div>

              {isOpen && (
                <div className="border-t border-border bg-muted/30 p-4 space-y-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                      Studying now
                    </p>
                    {mine.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Nothing assigned yet. Pick from below.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {mine.map((m) => (
                          <span
                            key={m.id}
                            className="flex items-center gap-2 rounded-xl border-2 border-primary bg-primary/10 px-3 py-1.5 text-sm font-medium"
                          >
                            <Check className="w-3.5 h-3.5 text-primary" />
                            {m.title}
                            {m.status !== "PUBLISHED" && (
                              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                {m.status.toLowerCase()}
                              </span>
                            )}
                            <button
                              type="button"
                              disabled={busy === c.id}
                              onClick={() => remove(c.id, m.id)}
                              className="text-muted-foreground hover:text-destructive"
                              aria-label={`Remove ${m.title}`}
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
                      Not assigned yet
                    </p>
                    {rest === undefined ? (
                      <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
                    ) : rest.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Every module you own is already in this class.
                      </p>
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {rest.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            disabled={busy === c.id}
                            onClick={() => add(c.id, m.id)}
                            className="flex items-center gap-2 rounded-xl border-2 border-border bg-card px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            {m.title}
                            <span className="text-[10px] text-muted-foreground">
                              {m.projectCount} project{m.projectCount === 1 ? "" : "s"}
                              {m.status !== "PUBLISHED" ? ` · ${m.status.toLowerCase()}` : ""}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SchoolClasses;
