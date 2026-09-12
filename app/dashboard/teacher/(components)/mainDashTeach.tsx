"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import CreateClassPOP from "./CreateClassPOP";
import {
  Users,
  BookOpen,
  Calendar,
  TrendingUp,
  Clock,
  Award,
  CalendarDays,
  Plus,
  Eye,
  School2,
  ClipboardList,
} from "lucide-react";

import { User } from "@prisma/client";
import EduBackdrop from "@/components/EduBackdrop";

type ClassSummary = {
  id: string;
  name: string;
  students: number;
  nextSession: string | null;
};

type DashboardData = {
  totalStudents: number;
  totalClasses: number;
  upcomingSessions: number;
  completedSessions: number;
  avgAttendance: number | string;
  leaderboard: User[];
  classes: ClassSummary[];
};

const emptyDashboard: DashboardData = {
  totalStudents: 0,
  totalClasses: 0,
  upcomingSessions: 0,
  completedSessions: 0,
  avgAttendance: 0,
  leaderboard: [],
  classes: [],
};

const MainDashTeach = ({ name_Teacher }: { name_Teacher: string }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>(emptyDashboard);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/teacher/dashboard");
        const data = await res.json();
        setDashboardData({ ...emptyDashboard, ...data });
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const nextSessionDate = dashboardData.classes
    .map((c) => c.nextSession)
    .filter((d): d is string => Boolean(d))
    .sort()[0];

  const quickStats = [
    {
      title: "Total Students",
      value: loading ? "…" : dashboardData.totalStudents,
      icon: Users,
      tint: "bg-primary/15 text-primary",
    },
    {
      title: "Active Classes",
      value: loading ? "…" : dashboardData.totalClasses,
      icon: BookOpen,
      tint: "bg-secondary/20 text-secondary",
    },
    {
      title: "Upcoming Sessions",
      value: loading ? "…" : dashboardData.upcomingSessions,
      icon: Calendar,
      tint: "bg-accent/25 text-accent-foreground",
      note: nextSessionDate
        ? `Next: ${new Date(nextSessionDate).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}`
        : undefined,
    },
    {
      title: "Attendance Rate",
      value: loading ? "…" : `${dashboardData.avgAttendance}%`,
      icon: TrendingUp,
      tint: "bg-growth/15 text-growth",
    },
  ];

  const attendancePct = loading || typeof dashboardData.avgAttendance !== "number"
    ? 0
    : Math.max(0, Math.min(100, dashboardData.avgAttendance));
  const ringCircumference = 2 * Math.PI * 40;

  return (
    <div className="relative min-h-screen bg-background overflow-hidden p-4 md:p-6">
      <EduBackdrop />
      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Teacher Dashboard
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">Manage your classes and track student progress</p>
        </div>

        {/* Welcome Section */}
        <Card className="relative overflow-hidden border-0 bg-primary shadow-sm">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-primary-foreground">
                    Welcome back, {name_Teacher}
                  </h2>
                  <p className="text-primary-foreground/80 mt-2">
                    Ready to inspire the next generation of learners?
                  </p>
                </div>
                <div className="flex gap-3">
                  <CreateClassPOP />
                  <Link href="/dashboard/teacher/classes">
                    <Button variant="outline" className="bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground cursor-pointer">
                      <Calendar className="h-4 w-4 mr-2" />
                      Browse Classes
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-6 py-5 shrink-0">
                <div className="relative w-24 h-24 shrink-0">
                  <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
                    <circle cx="50" cy="50" r="40" stroke="white" strokeOpacity="0.15" strokeWidth="8" fill="none" />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="white"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={ringCircumference}
                      strokeDashoffset={ringCircumference - (attendancePct / 100) * ringCircumference}
                      className="transition-all duration-700 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-primary-foreground leading-none">
                      {loading ? "…" : `${attendancePct}%`}
                    </span>
                    <span className="text-[10px] text-primary-foreground/70 mt-1">Attendance</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-2xl font-bold text-primary-foreground leading-none">
                      {loading ? "…" : dashboardData.totalStudents}
                    </p>
                    <p className="text-xs text-primary-foreground/70 mt-1">Students growing with you</p>
                  </div>
                  <div className="h-px bg-white/15" />
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground leading-none">
                      {loading ? "…" : dashboardData.upcomingSessions} upcoming
                    </p>
                    <p className="text-xs text-primary-foreground/70 mt-1">
                      {nextSessionDate
                        ? `Next: ${new Date(nextSessionDate).toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })}`
                        : "No session scheduled"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat) => (
            <Card key={stat.title} className="border border-border shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                    {stat.note && <p className="text-xs text-muted-foreground mt-1 truncate">{stat.note}</p>}
                  </div>
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${stat.tint}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classes Overview */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Recent Classes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!loading && dashboardData.classes.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center">
                    No classes yet — create one to get started.
                  </p>
                )}
                {dashboardData.classes.slice(0, 5).map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/dashboard/teacher/classes/${cls.id}`}
                    className="flex items-center justify-between p-4 bg-muted/40 rounded-lg border border-border hover:border-primary/30 hover:bg-muted transition-all duration-150 ease-out active:scale-[0.98]"
                  >
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{cls.name}</h3>
                      <p className="text-sm text-muted-foreground">{cls.students} students</p>
                    </div>
                    <Badge variant="outline" className="shrink-0">
                      {cls.nextSession
                        ? new Date(cls.nextSession).toLocaleDateString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })
                        : "No session scheduled"}
                    </Badge>
                  </Link>
                ))}
                <Link href="/dashboard/teacher/classes">
                  <Button variant="outline" className="w-full mt-2 cursor-pointer">
                    <Eye className="h-4 w-4 mr-2" />
                    View All Classes
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Award className="h-5 w-5 text-accent-foreground" />
                  Student Leaderboard
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {!loading && dashboardData.leaderboard.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">
                    No students yet.
                  </p>
                )}
                {dashboardData.leaderboard.map((student, index) => (
                  <div key={student.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <span className="font-medium text-foreground text-sm">
                      #{index + 1} {student.name}
                    </span>
                    <span className="text-primary font-bold text-sm">{student.totalXP} XP</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <CalendarDays className="h-5 w-5 text-secondary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 shrink-0" />
                  Events feature coming soon.
                </div>
                <Link href="/dashboard/events">
                  <Button variant="outline" className="w-full cursor-pointer" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <ClipboardList className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/teacher/schools">
                  <Button variant="outline" className="w-full justify-start cursor-pointer" size="sm">
                    <School2 className="h-4 w-4 mr-2" />
                    Manage Schools
                  </Button>
                </Link>
                <Link href="/dashboard/teacher/classes">
                  <Button variant="outline" className="w-full justify-start cursor-pointer" size="sm">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Classes
                  </Button>
                </Link>
                <Link href="/dashboard/studensprogress">
                  <Button variant="outline" className="w-full justify-start cursor-pointer" size="sm">
                    <Award className="h-4 w-4 mr-2" />
                    View Student Progress
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashTeach;
