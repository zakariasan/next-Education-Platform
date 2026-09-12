"use client";

import React, { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ReferenceLine,
} from "recharts";
import {
  Trophy,
  Users,
  LogOut,
  TrendingUp,
  BookOpen,
  Award,
  Calendar,
  Target,
  BarChart3,
  School2,
  GraduationCap
} from "lucide-react";
import EduBackdrop from "@/components/EduBackdrop";

type CustomTooltipProps = {
  active?: boolean;
  label?: string | number;
  payload?: {
    value: number;
    payload: {
      seanceTitle?: string;
      sessionXP?: number;
      attendance?: boolean;
    };
  }[];
};
type LeaderboardEntry = {
  id: string;
  name: string;
  totalXP: number;
};

type ProgressEntry = {
  seance: string;
  seanceTitle?: string;
  xp: number;
  sessionXP?: number;
  attendance: string;
  points : number;
};

type ClassInfoEntry = {
  classId: string;
  className: string;
  teacherName: string;
  schoolName: string | null;
};

const DashContentStudent = ({ name }: { name: string }) => {
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [classesInfo, setClassesInfo] = useState<ClassInfoEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Join class
  async function handleJoin() {
    const res = await fetch("/api/student/join-class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    setMessage(await res.text());
  }

  // Fetch leaderboard and progress
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [resLb, resPr, resCi] = await Promise.all([
          fetch("/api/student/leaderboard"),
          fetch("/api/student/progress"),
          fetch("/api/student/classes-info"),
        ]);

        if (!resLb.ok || !resPr.ok) throw new Error("Failed to fetch data");

        const lbData = await resLb.json();
        const prDataRaw = await resPr.json();
        if (resCi.ok) setClassesInfo(await resCi.json());

        // Map raw progress data into ProgressEntry type with cumulative XP
        const prData: ProgressEntry[] = prDataRaw.map((p: ProgressEntry, index: number) => {
          const cumulativeXP = prDataRaw.slice(0, index + 1).reduce((sum: number, item:ProgressEntry) => sum + item.points, 0);
          return {
            seance: `Session ${index + 1}`,
            seanceTitle: p.seanceTitle,
            xp: cumulativeXP,
            sessionXP: p.points,
            attendance: p.attendance === "PRESENT",
          };
        });

        setLeaderboard(lbData[0].leaderboard);
        setProgress(prData);
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  // Calculate stats
  const totalXP = progress.reduce((sum, p) => sum + (p.sessionXP || 0), 0);
  const attendanceRate = progress.length > 0 
    ? Math.round((progress.filter(p => p.attendance).length / progress.length) * 100) 
    : 0;
  const averageXP = progress.length > 0 
    ? Math.round(totalXP / progress.length) 
    : 0;

  // Custom tooltip for the chart
  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-4 border border-border rounded-xl shadow-lg">
          <p className="font-semibold text-card-foreground">{`${label}`}</p>
          {payload[0].payload.seanceTitle && (
            <p className="text-sm text-muted-foreground mb-1">{`Title: ${payload[0].payload.seanceTitle}`}</p>
          )}
          <p className="text-primary">
            {`Total XP: ${payload[0].value}`}
          </p>
          {payload[0].payload.sessionXP && (
            <p className="text-green-600">
              {`Session XP: +${payload[0].payload.sessionXP}`}
            </p>
          )}
          <p className={`text-sm ${payload[0].payload.attendance ? 'text-green-600' : 'text-red-600'}`}>
            {payload[0].payload.attendance ? '✓ Present' : '✗ Absent'}
          </p>
        </div>
      );
    }
    return null;
  };

  const stats = [
    { label: "Total XP", value: totalXP, icon: Award, tint: "bg-primary/15 text-primary" },
    { label: "Attendance", value: `${attendanceRate}%`, icon: Calendar, tint: "bg-secondary/20 text-secondary" },
    { label: "Avg XP / Session", value: averageXP, icon: Target, tint: "bg-accent/25 text-accent-foreground" },
    { label: "Sessions", value: progress.length, icon: BookOpen, tint: "bg-muted text-muted-foreground" },
  ];

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      <EduBackdrop />
      <div className="relative max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="relative overflow-hidden flex justify-between items-center bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 shadow-sm">
          <div className="relative">
            <h1 className="text-2xl font-bold text-primary-foreground tracking-tight">
              Welcome back, {name}
            </h1>
            <p className="text-primary-foreground/80 mt-1 text-sm">Ready to continue your learning journey?</p>
          </div>
          <Button
            variant="outline"
            className="relative cursor-pointer bg-white/10 backdrop-blur-sm border-white/30 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
            onClick={() => {
              signOut({ callbackUrl: "/auth/login" });
              toast("Logged out successfully");
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* My School & Class */}
        {classesInfo.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classesInfo.map((info) => (
              <Card
                key={info.classId}
                className="border border-border shadow-sm"
              >
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <School2 className="w-6 h-6 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate">
                      {info.schoolName ?? "No school assigned yet"}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      Class: {info.className}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 truncate">
                      <GraduationCap className="w-4 h-4" /> {info.teacherName}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border border-border shadow-sm">
              <CardContent className="p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Join Class Card */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Join a New Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter class key"
                className="flex-1 rounded-xl"
              />
              <Button onClick={handleJoin} className="rounded-xl px-8 cursor-pointer">
                Join Class
              </Button>
            </div>
            {message && (
              <div className="mt-4 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <p className="text-sm text-primary">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Progress Chart */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Learning Progress Analytics
            </CardTitle>
            <p className="text-muted-foreground text-sm">Track your XP growth over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-muted h-10 w-10"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : progress.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progress} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3240CD" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3240CD" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis 
                      dataKey="seance" 
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      stroke="#94A3B8"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#64748B' }}
                      stroke="#94A3B8"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="xp"
                      stroke="#3240CD"
                      strokeWidth={3}
                      fill="url(#xpGradient)"
                      dot={{ fill: '#3240CD', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3240CD', strokeWidth: 2, fill: '#FFFFFF' }}
                    />
                    {/* Average line */}
                    {progress.length > 0 && (
                      <ReferenceLine 
                        y={averageXP} 
                        stroke="#10B981" 
                        strokeDasharray="5 5" 
                        strokeWidth={2}
                        label={{ value: `Avg: ${averageXP} XP`, position: "insideTopRight" }}
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <BarChart3 className="w-16 h-16 mb-4 text-muted-foreground/40" />
                  <p className="text-lg font-medium">No progress data yet</p>
                  <p className="text-sm">Start attending classes to see your progress!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Leaderboard */}
        <Card className="border border-border shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-bold text-foreground flex items-center gap-2">
              <Trophy className="w-5 h-5 text-accent-foreground" />
              Class Leaderboard
            </CardTitle>
            <p className="text-muted-foreground text-sm">See how you rank among your classmates</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
                    <div className="rounded-full bg-muted h-8 w-8"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((student, idx) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-colors duration-150 ${
                      idx === 0
                        ? 'bg-accent/10 border-accent/30'
                        : idx < 3
                        ? 'bg-muted/60 border-border'
                        : 'bg-transparent border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-9 h-9 rounded-full font-bold text-sm ${
                        idx === 0 ? 'bg-accent text-accent-foreground' :
                        idx < 3 ? 'bg-secondary/30 text-secondary-foreground' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-semibold text-foreground">
                          {student.name}
                          {student.name === name && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-primary/15 text-primary rounded-full">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-primary">
                        {student.totalXP}
                      </span>
                      <span className="text-muted-foreground text-sm ml-1">XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Trophy className="w-16 h-16 mb-4 text-muted-foreground/40" />
                <p className="text-lg font-medium">No leaderboard data yet</p>
                <p className="text-sm">Be the first to earn some XP!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashContentStudent;
