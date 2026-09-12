"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ArrowUp, ArrowDown, Users, GraduationCap } from "lucide-react";

type Student = {
  id: string;
  name: string;
  className: string;
  totalXp: number;
  level: number;
  rank: number;
  rankChange: number;
};

const StudentsProgressPage = () => {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch("/api/teacher/studentsprogress");
        if (res.status === 401 || res.status === 403) {
          router.replace("/dashboard");
          return;
        }
        if (!res.ok) {
          setError("Failed to load student progress.");
          return;
        }
        const data = await res.json();
        setStudents(Array.isArray(data) ? data : []);
      } catch {
        setError("Failed to load student progress.");
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [router]);

  if (loading) return <p className="text-center mt-20 text-muted-foreground">Loading...</p>;
  if (error) return <p className="text-center mt-20 text-destructive">{error}</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/10 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Students Leaderboard
          </h1>
          <p className="text-muted-foreground">Track student XP, level, and progress across your classes</p>
        </div>

        <Card className="shadow-xl rounded-2xl overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Leaderboard
            </CardTitle>
          </CardHeader>

          <CardContent className="p-0 divide-y divide-border">
            {students.map((s, index) => (
              <div
                key={s.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-muted/50 transition"
              >
                {/* Rank + Medal */}
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 text-xl font-bold text-foreground/80">{s.rank}</div>

                  {index === 0 && <Trophy className="text-yellow-500 w-6 h-6" />}
                  {index === 1 && <Trophy className="text-slate-400 w-6 h-6" />}
                  {index === 2 && <Trophy className="text-amber-600 w-6 h-6" />}

                  <div>
                    <p className="font-semibold text-foreground">{s.name}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <GraduationCap className="w-4 h-4" /> {s.className}
                    </p>
                  </div>
                </div>

                {/* XP & Level */}
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="font-bold text-foreground/80">{s.totalXp} XP</p>
                    <p className="text-xs text-muted-foreground">Level {s.level}</p>
                  </div>

                  {/* Rank change */}
                  <div>
                    {s.rankChange > 0 ? (
                      <Badge className="bg-green-100 text-green-700 flex items-center gap-1">
                        <ArrowUp className="w-4 h-4" /> +{s.rankChange}
                      </Badge>
                    ) : s.rankChange < 0 ? (
                      <Badge className="bg-red-100 text-red-700 flex items-center gap-1">
                        <ArrowDown className="w-4 h-4" /> {s.rankChange}
                      </Badge>
                    ) : (
                      <Badge className="bg-muted text-muted-foreground">—</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentsProgressPage;

