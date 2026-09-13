"use client";

import React, { useState } from "react";
import { Map as MapIcon, List } from "lucide-react";
import StudentModulesList from "./(components)/StudentModulesList";
import CourseMap from "./CourseMap";

/**
 * Two ways to see the same curriculum: the map, which shows how modules link
 * into rings, and the plain list of modules with their progress.
 */
const ModulesView = () => {
  const [view, setView] = useState<"map" | "list">("map");

  return (
    <div className="space-y-4">
      <div className="flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {([["map", MapIcon, "Course map"], ["list", List, "All modules"]] as const).map(
          ([v, Icon, label]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                view === v
                  ? "bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-3.5 h-3.5" /> {label}
            </button>
          ),
        )}
      </div>

      {view === "map" ? <CourseMap /> : <StudentModulesList />}
    </div>
  );
};

export default ModulesView;
