"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Users, Calendar, Award } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
const statuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"];

type StudentParticipation = {
  id:string,
  student: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
  attendance?: string;
  points?: number;
  xp?: number;
  status?: string;
};



function getStatusColor(status: string) {
  switch (status) {
    case "PRESENT":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100";
    case "ABSENT":
      return "bg-red-50 text-red-700 border-red-200 hover:bg-red-100";
    case "LATE":
      return "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100";
    case "EXCUSED":
      return "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100";
  }
}

export default function SeancePage() {
  const params = useParams();
  const classId = params?.id as string;
  const seanceId = params?.seanceId as string;

  const [students, setStudents] = useState<StudentParticipation[]>([]);

const router = useRouter();

async function handleDeleteSeance() {
  if (!confirm("Are you sure you want to delete this session? This action cannot be undone.")) {
    return;
  }
  try {
    const res = await fetch(`/api/teacher/classes/${classId}/seances/${seanceId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      toast.success("Seance deleted ✅");
      router.push(`/dashboard/teacher/classes/${classId}/seances`); // redirect back to class page
    } else {
      const data = await res.json();
      toast.error(data.error || "Failed to delete seance ❌");
    }
  } catch (err) {
      console.log(err)
    toast.error("Failed to delete seance ❌");
  }
}

  // Fetch students and their participation for this seance
  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await fetch(
          `/api/teacher/classes/${classId}/seances/${seanceId}/attendance`
        );
        const data = await res.json();
        setStudents(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load students ❌");
      }
    }
    if (classId && seanceId) fetchStudents();
  }, [classId, seanceId]);

  // --- Save participation (attendance + xp) ---
  async function updateParticipation(
    studentId: string,
    updates: { attendance?: string; xp?: number }
  ) {
    try {
      await fetch(
        `/api/teacher/classes/${classId}/seances/${seanceId}/attendance`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studentId, ...updates }),
        }
      );
      toast.success("Participation updated ✅");
    } catch (err) {
      toast.error(`Failed to update participation ❌${err}`);
    }
  }

  const presentCount = students.filter(s => s.attendance === "PRESENT").length;
  const totalStudents = students.length;

  return (
    <div className="min-h-screen bg-white from-slate-50 via-blue-50 to-indigo-50  md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
            <Calendar className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">Session Management</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Attendance & Performance Tracking
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Track student attendance and award experience points for active participation
          </p>
        </div>



        <div className="flex justify-end">
  <Button
    variant="destructive"
    onClick={handleDeleteSeance}
    className="flex items-center gap-2"
  >
    <Trash2 className="w-4 h-4" />
    Delete Session
  </Button>
</div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Total Students</p>
                  <p className="text-2xl font-bold text-slate-900">{totalStudents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Users className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Present Today</p>
                  <p className="text-2xl font-bold text-slate-900">{presentCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Award className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Attendance Rate</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Student Roster
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 border-slate-200/50">
                    <TableHead className="font-semibold text-slate-700 py-4 px-6">
                      Student Name
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 py-4">
                      Attendance Status
                    </TableHead>
                    <TableHead className="text-center font-semibold text-slate-700 py-4">
                      Experience Points
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student, index) => (
                    <TableRow 
                      key={student.id} 
                      className="hover:bg-slate-50/50 transition-colors border-slate-200/30"
                    >
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            {student?.student.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <span className="font-medium text-slate-800">
                            {student?.student.name}
                          </span>
                        </div>
                      </TableCell>

                      {/* Attendance */}
                      <TableCell className="text-center py-4">
                        <Select
                          value={student.attendance || ""}
                          onValueChange={(value) => {
                            setStudents((prev) =>
                              prev.map((s, i) =>
                                i === index ? { ...s, attendance: value } : s
                              )
                            );
                            updateParticipation(student.student.id, { attendance: value });
                          }}
                        >
                          <SelectTrigger className="w-36 mx-auto bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all">
                            <SelectValue>
                              <Badge
                                variant="outline"
                                className={`${getStatusColor(student?.attendance || "DEFAULT")} font-medium px-3 py-1 transition-all`}
                              >
                                {student.attendance || "Select Status"}
                              </Badge>
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent className="bg-white/95 backdrop-blur-sm border-slate-200/50 shadow-xl">
                            {statuses.map((status) => (
                              <SelectItem key={status} value={status} className="hover:bg-slate-50/80">
                                <Badge
                                  variant="outline"
                                  className={`${getStatusColor(status)} font-medium px-3 py-1`}
                                >
                                  {status}
                                </Badge>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>

                      {/* XP input */}
                      <TableCell className="text-center py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Award className="h-4 w-4 text-amber-500" />
                          <Input
                            type="number"
                            value={student.points || 0}
                            className="w-20 text-center bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                            min="0"
                            max="100"
                            onChange={(e) => {
                              const xp = Number(e.target.value);
                              setStudents((prev) =>
                                prev.map((s, i) => (i === index ? { ...s, points: xp } : s))
                              );
                            }}
                            onBlur={(e) => {
                              const xp = Number(e.target.value);
                              updateParticipation(student.student.id, { xp });
                            }}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {students.length === 0 && (
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-lg">
            <CardContent className="p-8 text-center">
              <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">No Students Found</h3>
              <p className="text-slate-500">
                Students will appear here once they are enrolled in this session.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
