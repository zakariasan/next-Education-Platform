"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { School2, Users, BookOpenText } from "lucide-react";
import CreateSchoolPOP from "../(components)/CreateSchoolPOP";
import EmptyState from "@/components/EmptyState";
import EditSchoolPOP from "./EditSchoolPOP";
import Link from "next/link";
import { useSession } from "next-auth/react";

type SchoolEntry = {
  id: string;
  name: string;
  description: string | null;
  createdById: string;
  classes: { id: string }[];
  teachers: { teacherId: string }[];
};

const SchoolsList = () => {
  const { data: session } = useSession();
  const me = session?.user?.id;
  const isAdmin = session?.user?.role === "ADMIN";
  const [schools, setSchools] = useState<SchoolEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/teacher/schools");
      if (res.ok) setSchools(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const TINTS = [
    { grad: "from-secondary to-secondary/70", text: "text-secondary" },
    { grad: "from-primary to-primary/70", text: "text-primary" },
    { grad: "from-accent to-accent/70", text: "text-accent-foreground" },
    { grad: "from-growth to-growth/70", text: "text-growth" },
  ];

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary to-primary p-6 md:p-8 shadow-lg">
        <svg className="absolute -top-10 -right-10 w-48 h-48 text-white/10 pointer-events-none" viewBox="0 0 100 100" fill="none" aria-hidden="true">
          <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
          <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
        </svg>
        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
              <School2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">My Schools</h1>
              <p className="text-white/70 text-sm mt-0.5">
                {schools.length} school{schools.length === 1 ? "" : "s"} anchoring your classes
              </p>
            </div>
          </div>
          <CreateSchoolPOP onCreated={fetchSchools} />
        </div>
      </div>

      {!loading && schools.length === 0 && (
        <EmptyState
          title="No schools yet"
          quote="Without a school there's no gravity well for classes to orbit. Create one to anchor everything else."
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {schools.map((school, i) => {
          const tint = TINTS[i % TINTS.length];
          return (
            <Card
              key={school.id}
              className="overflow-hidden border border-border shadow-sm hover:shadow-xl hover:shadow-secondary/10 hover:border-secondary/30 hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 transition-all duration-200 ease-out p-0 gap-0"
            >
              <div className={`h-1.5 w-full bg-gradient-to-r ${tint.grad}`} />
              <CardHeader className="px-4 pt-4">
                <div className="flex items-start justify-between">
                  <span className={`w-10 h-10 rounded-xl bg-gradient-to-br ${tint.grad} text-white shadow-sm flex items-center justify-center`}>
                    <School2 className="w-5 h-5" />
                  </span>
                  {/* Only the creator (or an admin) can rename or delete it. */}
                  {(isAdmin || school.createdById === me) && (
                    <EditSchoolPOP school={school} onChanged={fetchSchools} />
                  )}
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 pt-3">
                <Link
                  href={`/dashboard/teacher/schools/${school.id}`}
                  className="font-bold text-xl text-foreground truncate block hover:text-secondary transition-colors"
                >
                  {school.name}
                </Link>
                <p className="text-sm text-muted-foreground border-b border-border mb-3 pb-3 truncate min-h-5">
                  {school.description}
                </p>
                <div className="flex justify-between items-center text-sm">
                  <span className={`flex items-center gap-1.5 font-medium ${tint.text}`}>
                    <BookOpenText className="w-4 h-4" /> {school.classes.length} Classes
                  </span>
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Users className="w-4 h-4" /> {school.teachers.length} Teachers
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-border">
                  <Link
                    href={`/dashboard/teacher/schools/${school.id}`}
                    className={`text-sm font-semibold ${tint.text} hover:underline`}
                  >
                    View classes and curriculum →
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SchoolsList;
