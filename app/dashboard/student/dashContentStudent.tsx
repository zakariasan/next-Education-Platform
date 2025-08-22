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
  BarChart3
} from "lucide-react";

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

const DashContentStudent = ({ name }: { name: string }) => {
  const [key, setKey] = useState("");
  const [message, setMessage] = useState("");
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
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
        const [resLb, resPr] = await Promise.all([
          fetch("/api/student/leaderboard"),
          fetch("/api/student/progress"),
        ]);

        if (!resLb.ok || !resPr.ok) throw new Error("Failed to fetch data");

        const lbData = await resLb.json();
        const prDataRaw = await resPr.json();

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
        <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-lg">
          <p className="font-semibold text-slate-800">{`${label}`}</p>
          {payload[0].payload.seanceTitle && (
            <p className="text-sm text-slate-600 mb-1">{`Title: ${payload[0].payload.seanceTitle}`}</p>
          )}
          <p className="text-blue-600">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-blue-800 bg-clip-text text-transparent">
              Welcome back, {name}! 👋
            </h1>
            <p className="text-slate-600 mt-1">Ready to continue your learning journey?</p>
          </div>
          <Button
            variant="destructive"
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={() => {
              signOut({ callbackUrl: "/auth/login" });
              toast("Logged out successfully");
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total XP</p>
                  <p className="text-3xl font-bold">{totalXP}</p>
                </div>
                <Award className="w-10 h-10 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Attendance</p>
                  <p className="text-3xl font-bold">{attendanceRate}%</p>
                </div>
                <Calendar className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Avg XP/Session</p>
                  <p className="text-3xl font-bold">{averageXP}</p>
                </div>
                <Target className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Sessions</p>
                  <p className="text-3xl font-bold">{progress.length}</p>
                </div>
                <BookOpen className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Join Class Card */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Join a New Class
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter class key"
                className="flex-1 border-slate-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
              />
              <Button 
                onClick={handleJoin}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-8"
              >
                Join Class
              </Button>
            </div>
            {message && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800">{message}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Progress Chart */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-green-600" />
              Learning Progress Analytics
            </CardTitle>
            <p className="text-slate-600 text-sm">Track your XP growth over time</p>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse flex space-x-4">
                    <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ) : progress.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progress} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
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
                      stroke="#3B82F6"
                      strokeWidth={3}
                      fill="url(#xpGradient)"
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 6 }}
                      activeDot={{ r: 8, stroke: '#3B82F6', strokeWidth: 2, fill: '#FFFFFF' }}
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
                <div className="flex flex-col items-center justify-center h-full text-slate-500">
                  <BarChart3 className="w-16 h-16 mb-4 text-slate-300" />
                  <p className="text-lg font-medium">No progress data yet</p>
                  <p className="text-sm">Start attending classes to see your progress!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Leaderboard */}
        <Card className="bg-white/70 backdrop-blur-sm border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Class Leaderboard
            </CardTitle>
            <p className="text-slate-600 text-sm">See how you rank among your classmates</p>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse flex items-center space-x-4 p-3">
                    <div className="rounded-full bg-slate-200 h-8 w-8"></div>
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    </div>
                    <div className="h-4 bg-slate-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((student, idx) => (
                  <div
                    key={student.id}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] ${
                      idx === 0 
                        ? 'bg-gradient-to-r from-yellow-50 to-yellow-100 border-2 border-yellow-200' 
                        : idx === 1
                        ? 'bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200'
                        : idx === 2
                        ? 'bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200'
                        : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                        idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' :
                        idx === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-600' :
                        idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' :
                        'bg-gradient-to-br from-slate-300 to-slate-500'
                      }`}>
                        {idx + 1}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800">
                          {student.name}
                          {student.name === name && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              You
                            </span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-lg text-blue-600">
                        {student.totalXP}
                      </span>
                      <span className="text-slate-500 text-sm ml-1">XP</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                <Trophy className="w-16 h-16 mb-4 text-slate-300" />
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
