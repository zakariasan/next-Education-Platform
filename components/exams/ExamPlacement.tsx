"use client";

import React, { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Boxes, FileBadge, Waypoints } from "lucide-react";

export type Placement = "CLASS" | "MODULE" | "MILESTONE";

export type PlacementValue = {
  placement: Placement;
  moduleId: string | null;
  passPercent: number;
  /** Extra classes that sit this exam. The owning class is always included. */
  classIds: string[];
};

type ModuleOption = { id: string; title: string; subject?: string };
type ClassOption = { id: string; name: string; school?: { name: string } | null };

/**
 * Where an exam appears in the graphs.
 *
 * An exam is always sat by one class. This control decides whether it ALSO
 * shows up as a node students can see coming:
 *
 *   CLASS      nowhere; an ordinary class exam
 *   MODULE     inside one module's Holy Graph, beside its projects and quizzes
 *   MILESTONE  in the course map, between two rings of modules, where it gates
 *              the step from one ring to the next
 *
 * A graph node has to know what counts as passing before it can unlock what is
 * behind it, which is what `passPercent` is for.
 */
const ExamPlacement = ({
  value,
  onChange,
  ownerClassId,
}: {
  value: PlacementValue;
  onChange: (next: PlacementValue) => void;
  /** The class the exam was created in. Always sits it, and cannot be removed. */
  ownerClassId?: string;
}) => {
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/teacher/modules").then(async (r) => (r.ok ? setModules(await r.json()) : null)),
      fetch("/api/teacher/classes").then(async (r) => (r.ok ? setClasses(await r.json()) : null)),
    ])
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleClass = (id: string) => {
    if (id === ownerClassId) return;
    const on = value.classIds.includes(id);
    onChange({
      ...value,
      classIds: on ? value.classIds.filter((c) => c !== id) : [...value.classIds, id],
    });
  };

  const set = (patch: Partial<PlacementValue>) => onChange({ ...value, ...patch });

  const OPTIONS: { key: Placement; label: string; hint: string; icon: React.ElementType }[] = [
    {
      key: "CLASS",
      label: "Class exam only",
      hint: "Does not appear in any graph.",
      icon: FileBadge,
    },
    {
      key: "MODULE",
      label: "Inside a module",
      hint: "A node in that module's graph, next to its projects.",
      icon: Boxes,
    },
    {
      key: "MILESTONE",
      label: "Milestone in the course map",
      hint: "Sits between rings of modules and gates the next ring.",
      icon: Waypoints,
    },
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-muted/30 p-4">
      <div>
        <Label className="text-sm font-semibold">Where this exam appears</Label>
        <p className="text-xs text-muted-foreground mt-0.5">
          Students always sit it with their class. This decides whether they also see it coming in a
          graph.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const on = value.placement === o.key;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => set({ placement: o.key, moduleId: o.key === "MODULE" ? value.moduleId : null })}
              aria-pressed={on}
              className={`text-left rounded-xl border-2 p-3 transition-colors ${
                on
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <o.icon className={`w-4 h-4 mb-1.5 ${on ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-semibold text-foreground leading-tight">{o.label}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{o.hint}</p>
            </button>
          );
        })}
      </div>

      {value.placement === "MODULE" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Module</Label>
          <Select
            value={value.moduleId ?? ""}
            onValueChange={(v) => set({ moduleId: v || null })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={loading ? "Loading your modules…" : "Choose a module"} />
            </SelectTrigger>
            <SelectContent>
              {modules.map((m) => (
                <SelectItem key={m.id} value={m.id}>
                  {m.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!loading && modules.length === 0 && (
            <p className="text-[11px] text-muted-foreground">
              You have no modules yet. Create one first.
            </p>
          )}
        </div>
      )}

      {value.placement !== "CLASS" && (
        <div className="space-y-1.5">
          <Label htmlFor="passPercent" className="text-xs">
            Pass mark
          </Label>
          <div className="flex items-center gap-2">
            <Input
              id="passPercent"
              type="number"
              min={0}
              max={100}
              value={value.passPercent}
              onChange={(e) => set({ passPercent: Number(e.target.value) })}
              className="w-24"
            />
            <span className="text-xs text-muted-foreground">
              percent of the max score needed to unlock what comes after
            </span>
          </div>
        </div>
      )}

      <div className="space-y-1.5 border-t border-border pt-3">
        <Label className="text-xs">Classes sitting this exam</Label>
        <p className="text-[11px] text-muted-foreground">
          One exam can be shared with several classes, which is what lets every class studying a
          module take the same paper. The class it was created in always sits it.
        </p>
        {classes.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">
            {loading ? "Loading your classes…" : "You have no other classes."}
          </p>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1">
            {classes.map((c) => {
              const owner = c.id === ownerClassId;
              const on = owner || value.classIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => toggleClass(c.id)}
                  disabled={owner}
                  aria-pressed={on}
                  className={`rounded-xl border-2 px-3 py-1.5 text-sm transition-colors ${
                    on
                      ? "border-primary bg-primary/10 text-foreground font-medium"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  } ${owner ? "cursor-default opacity-90" : ""}`}
                >
                  {c.name}
                  {owner && <span className="ml-1.5 text-[10px] text-muted-foreground">owner</span>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {value.placement === "MILESTONE" && (
        <p className="text-[11px] text-muted-foreground">
          Wire it between modules on the{" "}
          <span className="font-semibold text-foreground">Course map</span> page after saving.
        </p>
      )}
    </div>
  );
};

export default ExamPlacement;
