"use client"

import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarPlus, Clock, Users, BookOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {User} from "@prisma/client"
const statuses = ["PRESENT", "ABSENT", "LATE", "EXCUSED"]

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

export default function CreateSeancePage() {
  const params = useParams()
  const router = useRouter()
  const classId = params.id as string

  const [title, setTitle] = useState("")
  const [startsAt, setStartsAt] = useState("")
  const [endsAt, setEndsAt] = useState("")
  const [students, setStudents] = useState<User[]>([])
  const [attendance, setAttendance] = useState<{ [id: string]: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!classId) return
    
    fetch(`/api/teacher/classes/${classId}/students`)
      .then((res) => res.json())
      .then((data) => {
        setStudents(data)
        // Initialize all students as PRESENT by default
        const initialAttendance: { [id: string]: string } = {}
        data.forEach((student: User) => {
          initialAttendance[student.id] = "PRESENT"  // Set default for ALL students
        })
        setAttendance(initialAttendance)
        console.log("🎯 Initialized attendance for students:", initialAttendance);
      })
      .catch((err) => {
        console.error("Failed to fetch students:", err)
        alert("Failed to load students")
      })
  }, [classId])

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title")
      return
    }

    if (!startsAt) {
      alert("Please select start time")
      return
    }
    setLoading(true)

    try {
            // 1️⃣ Create the seance first
      const resSeance = await fetch(`/api/teacher/classes/${classId}/seances`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title: title.trim(), 
          startsAt: new Date(startsAt).toISOString(),
          endsAt: endsAt ? new Date(endsAt).toISOString() : null
        }),
      })

      if (!resSeance.ok) {
        throw new Error("Failed to create seance")
      }

      const newSeance = await resSeance.json()

        // 2️⃣ Create attendance records for the new seance
      const resAttendance = await fetch(`/api/teacher/classes/${classId}/seances/parte`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seanceId: newSeance.id, // Pass the seanceId
          attendance: attendance   // Pass the attendance data
        }),
      })

      if (!resAttendance.ok) {
        const errorData = await resAttendance.json();
        console.error("❌ Attendance creation failed:", errorData);
        throw new Error("Failed to create attendance records")
      }

      router.push(`/dashboard/teacher/classes/${classId}/seances`)
      toast.success(" Seance created and attendance saved ✅")

    } catch (error) {
      console.error("Error:", error)
      toast(" Failed to create seance ❌")
    } finally {
      setLoading(false)
    }
  }

  const presentCount = Object.values(attendance).filter(status => status === "PRESENT").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm rounded-full border border-white/20 shadow-sm">
            <CalendarPlus className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-slate-600">New Session</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
            Create Session
          </h1>
          <p className="text-slate-600 max-w-2xl mx-auto">
            Set up a new learning session and pre-configure student attendance
          </p>
        </div>

        {/* Session Details Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              Session Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Session Title *</Label>
                <Input 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  placeholder="Enter session title (e.g., Introduction to Programming)" 
                  required
                  className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  Start Time *
                </Label>
                <Input 
                  type="datetime-local" 
                  value={startsAt} 
                  onChange={(e) => setStartsAt(e.target.value)}
                  required
                  className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>
              
              <div className="space-y-2 md:col-span-1">
                <Label className="text-slate-700 font-medium flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  End Time (Optional)
                </Label>
                <Input 
                  type="datetime-local" 
                  value={endsAt} 
                  onChange={(e) => setEndsAt(e.target.value)} 
                  className="bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                />
              </div>

              {/* Quick Stats */}
              <div className="space-y-2">
                <Label className="text-slate-700 font-medium">Quick Overview</Label>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                    {students.length} Students Enrolled
                  </Badge>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                    {presentCount} Marked Present
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Student Attendance Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold text-slate-800 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              Pre-Configure Attendance
            </CardTitle>
            <p className="text-sm text-slate-600 mt-1">
              Set initial attendance status for all students (defaults to Present)
            </p>
          </CardHeader>
          <CardContent>
            {students.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-600 mb-2">Loading Students...</h3>
                <p className="text-slate-500">
                  Please wait while we load the student roster.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-4 bg-slate-50/50 rounded-lg border border-slate-200/50 hover:bg-slate-100/50 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {student.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-slate-800">{student.name}</span>
                    </div>
                    
                    <Select
                      value={attendance[student.id] || "PRESENT"}
                      onValueChange={(value) =>
                        setAttendance((prev) => ({ ...prev, [student.id]: value }))
                      }
                    >
                      <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-slate-200/50 shadow-sm hover:shadow-md transition-all">
                        <SelectValue>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(attendance[student.id] || "PRESENT")} font-medium px-3 py-1 transition-all`}
                          >
                            {attendance[student.id] || "PRESENT"}
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
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Button */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-6">
            <Button 
              onClick={handleSave} 
              disabled={loading || !title.trim() || !startsAt}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Session...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <CalendarPlus className="h-5 w-5" />
                  Create Session & Save Attendance
                </div>
              )}
            </Button>
            
            {(!title.trim() || !startsAt) && (
              <p className="text-sm text-amber-600 mt-2 text-center">
                Please fill in the required fields (title and start time) to continue
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
