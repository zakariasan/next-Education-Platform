"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Users,
  Trophy,
  AlertTriangle,
  CheckCircle,
  XCircle,
  KeyRound,
  Mail,
  Pencil,
  Trash2,
  UserPlus,
  ArrowRightLeft,
} from "lucide-react";
import EmptyState from "@/components/EmptyState";


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

type StudentDetail = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string | null;
  totalXP: number;
  createdAt: string;
  provider: string | null;
  hasPassword: boolean;
  presentCount: number;
  sessionCount: number;
  studentClasses: { id: string; name: string }[];
  participations: { attendance: string; points: number; seance: { id: string; title: string | null; startsAt: string } }[];
};

type TeacherClass = { id: string; name: string };

const StudentsList = () => {
  const params = useParams();
  const classId = params.id as string;
  const [studentsList, setStudentsList] = useState<StudentAttendance[]>([]);

  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState<TeacherClass[]>([]);

  // Add-a-student dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addForm, setAddForm] = useState({ email: "", name: "", password: "" });
  const [adding, setAdding] = useState(false);

  // Manage-one-student dialog
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", password: "", moveToClassId: "" });
  const [saving, setSaving] = useState(false);

  const fetchClass = useCallback(async () => {
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/g-attendance`);
      const data = await res.json();
      setStudentsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err)
      setStudentsList([]);
    } finally {
      setLoading(false);
    }
  }, [classId]);

  useEffect(() => {
    if (classId) {
      fetchClass();
    }
  }, [classId, fetchClass]);

  // The other classes this teacher owns, for the "move to" picker.
  useEffect(() => {
    fetch("/api/teacher/classes")
      .then((r) => (r.ok ? r.json() : []))
      .then((d: TeacherClass[]) => setClasses(Array.isArray(d) ? d.map((c) => ({ id: c.id, name: c.name })) : []))
      .catch(() => setClasses([]));
  }, []);

  const addStudent = async () => {
    setAdding(true);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(addForm),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(d.error ?? "Could not add the student");
      toast.success(`${d.name} added to the class`);
      setAddOpen(false);
      setAddForm({ email: "", name: "", password: "" });
      fetchClass();
    } finally {
      setAdding(false);
    }
  };

  const openStudent = async (id: string) => {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/teacher/classes/${classId}/students/${id}`);
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(d.error ?? "Could not load the student");
      setDetail(d);
      setEditForm({ name: d.name, email: d.email, password: "", moveToClassId: "" });
    } finally {
      setDetailLoading(false);
    }
  };

  const saveStudent = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const body: Record<string, string> = { name: editForm.name, email: editForm.email };
      if (editForm.password) body.password = editForm.password;
      if (editForm.moveToClassId && editForm.moveToClassId !== classId) body.moveToClassId = editForm.moveToClassId;
      const res = await fetch(`/api/teacher/classes/${classId}/students/${detail.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(d.error ?? "Could not save");
      toast.success(d.movedTo ? `${d.name} moved to another class` : "Student updated");
      setDetail(null);
      fetchClass();
    } finally {
      setSaving(false);
    }
  };

  const removeStudent = async (student: { id: string; name: string }) => {
    if (!confirm(`Remove ${student.name} from this class? Their account and past attendance stay; only the enrolment goes.`)) return;
    const res = await fetch(`/api/teacher/classes/${classId}/students/${student.id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) return toast.error(d.error ?? "Could not remove the student");
    toast.success(`${student.name} removed from the class`);
    setDetail(null);
    fetchClass();
  };

  
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
    <Card className="mt-3 border border-border shadow-sm">
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading attendance...</p>
      </CardContent>
    </Card>
  );

  return (
    <Card className="border border-border shadow-sm mt-3">
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Students List
        </CardTitle>
        <Button onClick={() => setAddOpen(true)} className="rounded-xl font-semibold">
          <UserPlus className="h-4 w-4" /> Add student
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        {studentsList.length === 0 ? (
          <EmptyState
            title="No students yet"
            quote="An empty roster has nothing to hold together. Share your class key and watch it fill with mass."
          />
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <caption className="text-sm text-muted-foreground mb-4 text-left">A list of your Students. Click one to see and edit their details.</caption>
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="font-semibold text-left p-4 w-1/4">Full name</th>
                <th className="font-semibold text-center p-4 w-1/5">Attendance</th>
                <th className="font-semibold text-center p-4 w-1/5">XP</th>
                <th className="font-semibold text-center p-4 w-1/5">Status</th>
                <th className="font-semibold text-center p-4 w-[120px]">Manage</th>
              </tr>
            </thead>
            <tbody>
              {studentsList?.map((student ) => {
                const statusConfig = getStatusConfig(student.status);

                return (
                  <tr
                    key={student?.id}
                    onClick={() => openStudent(student.id)}
                    className="border-b border-border hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <td className="font-medium p-4">
                      <div className="flex gap-2 items-center">
                        <Avatar>
                          <AvatarImage src={student?.avatar || "https://github.com/shadcn.png"} />
                          <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                            {student?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'ST'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-foreground">{student?.name}</p>
                          <p className="text-sm text-muted-foreground">{student?.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className={`text-lg font-bold ${getAttendanceColor(student.attendancePercentage)}`}>
                          {student.attendancePercentage}%
                        </span>
                        <div className="text-xs text-muted-foreground">
                          {student.attendance} sessions
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-secondary">lvl: {student.level} ({student.xpPercent} %) </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="h-4 w-4 text-accent-foreground" />
                          <span className="text-sm text-muted-foreground">({student.xp} xp)</span>
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

                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button size="icon" variant="ghost" aria-label={`Edit ${student.name}`} onClick={() => openStudent(student.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          aria-label={`Remove ${student.name}`}
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeStudent(student)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        )}
      </CardContent>

      {/* Add a student to this class */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-md">
          <DialogTitle asChild><h2 className="text-xl font-semibold">Add a student</h2></DialogTitle>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} placeholder="student@school.com" />
              <p className="text-xs text-muted-foreground">An existing account joins the class straight away.</p>
            </div>
            <div className="rounded-xl border border-border p-3 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">No account yet? Create one</p>
              <div className="space-y-1.5">
                <Label>Full name</Label>
                <Input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} placeholder="Amina Haddad" />
              </div>
              <div className="space-y-1.5">
                <Label>First password</Label>
                <Input type="password" value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} placeholder="At least 6 characters" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={addStudent} disabled={adding || !addForm.email.trim()} className="font-semibold">{adding ? "Adding…" : "Add to class"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* One student: profile, password, move, removal */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogTitle asChild><h2 className="text-xl font-semibold">{detail?.name}</h2></DialogTitle>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={detail.avatar || "https://github.com/shadcn.png"} />
                  <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                    {detail.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "ST"}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-sm">
                  <p className="flex items-center gap-1 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {detail.email}</p>
                  <p className="text-muted-foreground">
                    {detail.totalXP} XP · present at {detail.presentCount}/{detail.sessionCount} sessions of this class · joined {new Date(detail.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Full name</Label>
                  <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                </div>
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><KeyRound className="h-3.5 w-3.5" /> New password</Label>
                <Input type="password" value={editForm.password} onChange={(e) => setEditForm({ ...editForm, password: e.target.value })} placeholder="Leave empty to keep the current one" />
                <p className="text-xs text-muted-foreground">
                  {detail.provider === "google"
                    ? "This student signs in with Google, so they have no password here."
                    : "Passwords are stored hashed and cannot be read back — you can only set a new one."}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1"><ArrowRightLeft className="h-3.5 w-3.5" /> Move to another class</Label>
                <Select value={editForm.moveToClassId} onValueChange={(v) => setEditForm({ ...editForm, moveToClassId: v })}>
                  <SelectTrigger><SelectValue placeholder="Stay in this class" /></SelectTrigger>
                  <SelectContent>
                    {classes.filter((c) => c.id !== classId).map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Currently in: {detail.studentClasses.map((c) => c.name).join(", ") || "no class"}</p>
              </div>

              {detail.participations.length > 0 && (
                <div className="space-y-1.5">
                  <Label>Recent attendance in this class</Label>
                  <div className="rounded-xl border border-border divide-y divide-border max-h-40 overflow-y-auto">
                    {detail.participations.map((p) => (
                      <div key={p.seance.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="truncate">{p.seance.title || "Session"} · {new Date(p.seance.startsAt).toLocaleDateString()}</span>
                        <span className={p.attendance === "PRESENT" ? "text-green-600 font-medium" : "text-destructive font-medium"}>{p.attendance.toLowerCase()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between gap-2 pt-1">
                <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => removeStudent(detail)}>
                  <Trash2 className="h-4 w-4" /> Remove from class
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setDetail(null)}>Cancel</Button>
                  <Button onClick={saveStudent} disabled={saving} className="font-semibold">{saving ? "Saving…" : "Save"}</Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {detailLoading && !detail && (
        <p className="sr-only" role="status">Loading student…</p>
      )}
    </Card>
  );
};

export default StudentsList;
