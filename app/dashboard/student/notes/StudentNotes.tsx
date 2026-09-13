"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import EmptyState from "@/components/EmptyState";
import { NotebookText, Paperclip, School } from "lucide-react";

type Note = {
  id: string;
  title: string;
  description: string | null;
  className: string;
  classId: string;
  teacherName: string;
  materialCount: number;
  updatedAt: string;
};

/** Published notes from every class the student is enrolled in. */
const StudentNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/student/notes");
      if (res.ok) setNotes(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Notes are grouped by class so a student reads them the way they are taught.
  const byClass = notes.reduce<Record<string, Note[]>>((acc, n) => {
    (acc[n.className] ??= []).push(n);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary to-primary p-6 md:p-8 shadow-lg">
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
            <NotebookText className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Notes</h1>
            <p className="text-white/70 text-sm mt-0.5">
              {loading
                ? "Loading…"
                : `${notes.length} note${notes.length === 1 ? "" : "s"} from your teachers`}
            </p>
          </div>
        </div>
      </div>

      {!loading && notes.length === 0 && (
        <EmptyState
          title="No notes yet"
          quote="Nothing written down yet. When a teacher publishes a note for one of your classes, it lands here."
        />
      )}

      {Object.entries(byClass).map(([className, items]) => (
        <div key={className} className="space-y-2">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-1.5">
            <School className="w-3.5 h-3.5" /> {className}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((n) => (
              <Link key={n.id} href={`/dashboard/student/notes/${n.id}`} className="block h-full">
                <Card className="h-full border border-border shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:border-primary/40 p-0">
                  <CardContent className="p-4">
                    <p className="font-semibold text-foreground leading-tight line-clamp-2">{n.title}</p>
                    {n.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.description}</p>
                    )}
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{n.teacherName}</span>
                      {n.materialCount > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-3 h-3" /> {n.materialCount}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudentNotes;
