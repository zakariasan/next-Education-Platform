"use client";

import React, { useState } from "react";
import CreateClassPOP from "../(components)/CreateClassPOP";
import TeacherClass from "./TeacherClass";
import { BookOpenText, Eye, EyeOff } from "lucide-react";
import { Class, User } from "@prisma/client";
import EmptyState from "@/components/EmptyState";

type TeacherClassesProps = {
  classes?: (Class & {
    teacher: User;
    students: User[];
  })[];
};

const TeacherClasses = ({ classes }: TeacherClassesProps) => {
  const [showArchived, setShowArchived] = useState(false);

  const all = Array.isArray(classes) ? classes : [];
  const archivedCount = all.filter((c) => c.archived).length;
  const safeClasses = showArchived ? all : all.filter((c) => !c.archived);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-secondary p-6 md:p-8 shadow-lg">
        <svg className="absolute -top-10 -right-10 w-48 h-48 text-white/10 pointer-events-none" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <BookOpenText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">My Classes</h1>
              <p className="text-white/70 text-sm mt-0.5">
                {all.length - archivedCount} active classroom
                {all.length - archivedCount === 1 ? "" : "s"}
                {archivedCount > 0 ? ` · ${archivedCount} archived` : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {archivedCount > 0 && (
              <button
                type="button"
                onClick={() => setShowArchived((v) => !v)}
                className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              >
                {showArchived ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {showArchived ? "Hide archived" : `Show archived (${archivedCount})`}
              </button>
            )}
            <CreateClassPOP />
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      {safeClasses.length === 0 ? (
        <EmptyState
          title="No classes yet"
          quote="An empty class has no mass — nothing to orbit, nothing to pull toward. Create one and give it gravity."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {safeClasses.map((itemClass, i) => (
            <TeacherClass key={itemClass.id} itemClass={itemClass} index={i} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
