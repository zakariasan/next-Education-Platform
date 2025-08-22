"use client";
import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { 
  Users, 
  Trophy, 
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";


type StudentAttendance = {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  attendance: string;          // e.g. "8/10"
  attendancePercentage: number;
  xp: number;
  level: number;
  xpPercent: number;
  status: "Excellent" | "Good" | "At Risk" | "Critical"; // enforce only allowed values
};

const StudentsList = () => {
  const params = useParams();
  const classId = params.id as string;
  const [studentsList, setStudentsList] = useState<StudentAttendance[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/teacher/classes/${classId}/g-attendance`);
        const data = await res.json();
        setStudentsList(data);
      } catch (err) {
        console.log(err)
        setStudentsList([]);
      } finally {
        setLoading(false);
      }
    };
    if (classId) {
      fetchClass();
    }
  }, [classId]);

  
const getStatusConfig = (status: string) => {
    const configs : Record<string, { color: string; icon: React.ReactElement}>= {
      "Excellent": {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <Trophy className="h-3 w-3" />
      },
      "Good": {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <CheckCircle className="h-3 w-3" />
      },
      "At Risk": {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <AlertTriangle className="h-3 w-3" />
      },
      "Critical": {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <XCircle className="h-3 w-3" />
      }
    };
    return configs[status] || configs["Good"];
  };

  const getAttendanceColor = (percentage: number) => {
    const num = percentage || 0;
    if (num >= 90) return "text-green-600";
    if (num >= 75) return "text-blue-600";
    if (num >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) return (
    <Card className="mt-3">
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading attendance...</p>
      </CardContent>
    </Card>
  );

  return (
    <Card className="bg-white rounded-lg mt-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Students List
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="text-sm text-gray-500 mb-4 text-left">A list of your Students.</caption>
            <thead>
              <tr className="border-b bg-gray-50/50">
                <th className="font-semibold text-left p-4 w-1/4">Full name</th>
                <th className="font-semibold text-center p-4 w-1/4">Attendance</th>
                <th className="font-semibold text-center p-4 w-1/4">XP</th>
                <th className="font-semibold text-center p-4 w-1/4">Status</th>
              </tr>
            </thead>
            <tbody>
              {studentsList?.map((student ) => {
                const statusConfig = getStatusConfig(student.status);
                
                return (
                  <tr key={student?.id} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="font-medium p-4">
                      <div className="flex gap-2 items-center">
                        <Avatar>
                          <AvatarImage src={student?.avatar || "https://github.com/shadcn.png"} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                            {student?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900">{student?.name}</p>
                          <p className="text-sm text-muted-foreground">{student?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-lg font-bold ${getAttendanceColor(student.attendancePercentage)}`}>
                          {student.attendancePercentage}%
                        </span>
                        <div className="text-xs text-gray-500">
                          {student.attendance} sessions
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-purple-600">lvl: {student.level} ({student.xpPercent} %) </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm text-gray-600">({student.xp} xp)</span>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <Badge 
                        variant="outline" 
                        className={`${statusConfig.color} flex items-center gap-1 w-fit mx-auto`}
                      >
                        {statusConfig.icon}
                        {student.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {studentsList.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No students enrolled in this class yet.</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsList;
