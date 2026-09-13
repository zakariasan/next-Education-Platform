"use client";

import React, { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GraduationCap, Check } from "lucide-react";

type ClassOption = { id: string; name: string; school: string | null };

type Payload = {
  assignedClassIds: string[];
  candidates?: ClassOption[];
};

/**
 * Curriculum control: which classes study this module.
 *
 * A module is authored once and can sit in the curriculum of several classes,
 * including classes in different schools. Students only ever see modules
 * assigned to a class they are enrolled in.
 */
const ModuleClasses = ({ moduleId, apiBase }: { moduleId: string; apiBase: string }) => {
  const [candidates, setCandidates] = useState<ClassOption[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [initial, setInitial] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/${moduleId}/classes`);
      if (!res.ok) return;
      const data: Payload = await res.json();
      setCandidates(data.candidates ?? []);
      setSelected(new Set(data.assignedClassIds));
      setInitial([...data.assignedClassIds].sort());
    } finally {
      setLoading(false);
    }
  }, [apiBase, moduleId]);

  useEffect(() => {
    load();
  }, [load]);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const dirty = JSON.stringify([...selected].sort()) !== JSON.stringify(initial);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/${moduleId}/classes`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classIds: [...selected] }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(body?.error ?? "Could not save the curriculum");
      setInitial([...selected].sort());
      toast.success(
        selected.size === 0
          ? "Module removed from every class"
          : `Module assigned to ${selected.size} class${selected.size === 1 ? "" : "es"}`,
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border border-border shadow-sm p-0">
      <CardContent className="p-4 md:p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-foreground flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-primary" /> Classes studying this module
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Only students in a selected class can open this module. One module can serve several
              classes, in different schools.
            </p>
          </div>
          {dirty && (
            <Button size="sm" disabled={saving} onClick={save} className="shrink-0 font-semibold">
              {saving ? "Saving..." : "Save"}
            </Button>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground animate-pulse">Loading your classes…</p>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            You have no classes yet. Create one first, then come back to put this module in its
            curriculum.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {candidates.map((c) => {
              const on = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggle(c.id)}
                  aria-pressed={on}
                  className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 text-sm transition-colors ${
                    on
                      ? "border-primary bg-primary/10 text-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span
                    className={`flex h-4 w-4 items-center justify-center rounded border ${
                      on ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40"
                    }`}
                  >
                    {on && <Check className="h-3 w-3" />}
                  </span>
                  <span className="truncate max-w-[14rem]">
                    {c.name}
                    {c.school ? <span className="text-muted-foreground"> · {c.school}</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ModuleClasses;
