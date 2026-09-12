"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Users,
  BookOpen,
  TrendingUp,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type DashboardStats = {
  totalStudents: number;
  totalClasses: number;
  avgAttendance: number | string;
};

const emptyStats: DashboardStats = {
  totalStudents: 0,
  totalClasses: 0,
  avgAttendance: 0,
};

export default function TeacherProfilePage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/teacher/dashboard");
        const data = await res.json();
        setStats({ ...emptyStats, ...data });
      } catch {
        // keep defaults
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const name = session?.user?.name ?? "Teacher";
  const email = session?.user?.email ?? "";
  const initial = name.charAt(0).toUpperCase();

  const pills = [
    { label: "Classes", value: loading ? "…" : stats.totalClasses, icon: BookOpen, bg: "bg-[var(--primary-turquoise)]" },
    { label: "Students", value: loading ? "…" : stats.totalStudents, icon: Users, bg: "bg-[var(--selective-yellow)]" },
    { label: "Attendance", value: loading ? "…" : `${stats.avgAttendance}%`, icon: TrendingUp, bg: "bg-[var(--primary-wild-watermelon)]" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/dashboard/teacher"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Dark spotlight profile card */}
      <div className="relative overflow-hidden rounded-3xl p-8 md:p-10 bg-gradient-to-br from-[#151a3d] via-[#1c1b4d] to-[#1f2f5c] text-white shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[var(--primary-turquoise)]/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-[var(--selective-yellow)]/15 blur-3xl" aria-hidden="true" />

        <div className="relative grid md:grid-cols-[1fr_auto] gap-8 items-start">
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--primary-turquoise)] to-[var(--primary-blue)] flex items-center justify-center text-2xl font-bold shrink-0">
                {initial}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">{name}</h1>
                <p className="text-white/60 text-sm flex items-center gap-1.5 mt-1">
                  <ShieldCheck className="w-4 h-4" /> Teacher
                </p>
              </div>
            </div>

            {/* Glowing highlight number */}
            <div className="relative inline-flex flex-col items-start mb-2">
              <div className="absolute -inset-6 bg-[var(--primary-turquoise)]/20 blur-2xl rounded-full" aria-hidden="true" />
              <p className="relative text-6xl md:text-7xl font-extrabold tracking-tight">
                {loading ? "…" : stats.totalStudents}
              </p>
              <p className="relative text-white/60 text-sm mt-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> Students taught across all classes
              </p>
            </div>
          </div>

          {/* Stat pills */}
          <div className="grid grid-cols-3 md:grid-cols-1 gap-3 w-full md:w-44">
            {pills.map(({ label, value, icon: Icon, bg }) => (
              <div key={label} className={`rounded-2xl p-4 ${bg} text-[#151a3d] shadow-lg`}>
                <Icon className="w-5 h-5 mb-2 opacity-80" />
                <p className="text-xl font-bold leading-none">{value}</p>
                <p className="text-xs font-medium opacity-80 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Info tiles */}
        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/10">
          <div className="rounded-xl bg-white/5 px-4 py-3">
            <p className="text-xs text-white/50">Role</p>
            <p className="text-sm font-semibold mt-0.5">Teacher</p>
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3 col-span-2 md:col-span-2 min-w-0">
            <p className="text-xs text-white/50 flex items-center gap-1"><Mail className="w-3 h-3" /> Email</p>
            <p className="text-sm font-semibold mt-0.5 truncate">{email || "—"}</p>
          </div>
          <div className="rounded-xl bg-white/5 px-4 py-3">
            <p className="text-xs text-white/50">Platform</p>
            <p className="text-sm font-semibold mt-0.5">PhysiClub</p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          More profile insights — activity history, badges and settings — are on the way.
        </CardContent>
      </Card>
    </div>
  );
}
