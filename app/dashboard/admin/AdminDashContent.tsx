"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { School2, Users, GraduationCap, BookOpenText, Award } from "lucide-react";
import { toast } from "sonner";
import EduBackdrop from "@/components/EduBackdrop";

type Overview = {
  schoolCount: number;
  teacherCount: number;
  studentCount: number;
  classCount: number;
  totalXP: number;
};

type Teacher = { id: string; name: string; email: string };

type SchoolRow = {
  id: string;
  name: string;
  description: string | null;
  createdBy: { name: string };
  teachers: { teacher: Teacher }[];
  classes: { id: string; name: string }[];
};

const AdminDashContent = () => {
  const [overview, setOverview] = useState<Overview | null>(null);
  const [schools, setSchools] = useState<SchoolRow[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const refresh = useCallback(async () => {
    const [ov, sc, tc] = await Promise.all([
      fetch("/api/admin/overview"),
      fetch("/api/admin/schools"),
      fetch("/api/admin/teachers"),
    ]);
    if (ov.ok) setOverview(await ov.json());
    if (sc.ok) setSchools(await sc.json());
    if (tc.ok) setTeachers(await tc.json());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createSchool = async () => {
    if (!name || !teacherId) {
      toast.error("Name and teacher are required");
      return;
    }
    const res = await fetch("/api/admin/schools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, teacherId }),
    });
    if (res.ok) {
      toast.success("School created");
      setName("");
      setDescription("");
      setTeacherId("");
      refresh();
    } else {
      toast.error("Failed to create school");
    }
  };

  const stats = [
    { label: "Schools", value: overview?.schoolCount ?? 0, icon: School2, tint: "bg-primary/15 text-primary" },
    { label: "Teachers", value: overview?.teacherCount ?? 0, icon: GraduationCap, tint: "bg-secondary/20 text-secondary" },
    { label: "Students", value: overview?.studentCount ?? 0, icon: Users, tint: "bg-accent/25 text-accent-foreground" },
    { label: "Classes", value: overview?.classCount ?? 0, icon: BookOpenText, tint: "bg-muted text-muted-foreground" },
    { label: "Total Student XP", value: overview?.totalXP ?? 0, icon: Award, tint: "bg-primary/15 text-primary" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EduBackdrop />
      <div className="relative max-w-6xl mx-auto p-6 space-y-6">
        <div className="relative overflow-hidden bg-gradient-to-br from-primary to-secondary rounded-2xl p-6 shadow-sm">
          <h1 className="relative text-2xl font-bold text-primary-foreground tracking-tight">Admin Dashboard</h1>
          <p className="relative text-primary-foreground/80 text-sm mt-1">Global overview across every school</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {stats.map((s) => (
            <Card key={s.label} className="border border-border shadow-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.tint}`}>
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

        <Card>
          <CardHeader>
            <CardTitle>Create a School</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="School name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Assign a teacher" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} ({t.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <Button onClick={createSchool}>Create School</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>All Schools</CardTitle>
          </CardHeader>
          <CardContent>
            {schools.length === 0 ? (
              <p className="text-muted-foreground text-sm">No schools yet.</p>
            ) : (
              <div className="space-y-3">
                {schools.map((school) => (
                  <div
                    key={school.id}
                    className="p-4 rounded-xl border border-border flex flex-col md:flex-row md:items-center justify-between gap-2"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{school.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Created by {school.createdBy.name}
                      </p>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>
                        {school.teachers.map((t) => t.teacher.name).join(", ") || "No teachers"}
                      </span>
                      <span>{school.classes.length} classes</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashContent;
