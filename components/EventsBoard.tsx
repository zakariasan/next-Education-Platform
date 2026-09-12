"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, CheckCircle2, Clock, GraduationCap, Globe, Pencil, Plus, Radio, School2, Trash2, Users, Zap, XCircle } from "lucide-react";
import EmptyState from "@/components/EmptyState";
import EduBackdrop from "@/components/EduBackdrop";
import type { EventDTO } from "@/lib/sessions";

type StudentEvent = EventDTO & { myAttendance?: string | null; myPoints?: number };

type Props = {
  apiBase: string; // /api/teacher/events | /api/student/events
  editable?: boolean;
  seanceLink?: (e: EventDTO) => string | null;
  classes?: { id: string; name: string; schoolId: string | null }[];
  schools?: { id: string; name: string }[];
  allowGlobal?: boolean;
};

const TYPE_META = {
  SESSION: { label: "Class session", icon: Users, tint: "bg-primary/15 text-primary" },
  EXAM: { label: "Exam", icon: GraduationCap, tint: "bg-destructive/10 text-destructive" },
  OTHER: { label: "Event", icon: CalendarDays, tint: "bg-secondary/20 text-secondary" },
} as const;

const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

const emptyForm = { title: "", description: "", type: "SESSION" as "SESSION" | "EXAM" | "OTHER", scope: "CLASS" as "CLASS" | "SCHOOL" | "GLOBAL", classId: "", schoolId: "", startsAt: "", endsAt: "" };

const EventsBoard = ({ apiBase, editable = false, seanceLink, classes = [], schools = [], allowGlobal = false }: Props) => {
  const [events, setEvents] = useState<StudentEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EventDTO | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const load = useCallback(async () => {
    const res = await fetch(apiBase);
    if (res.ok) setEvents(await res.json());
    setLoading(false);
  }, [apiBase]);

  useEffect(() => {
    load();
  }, [load]);

  const startCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, classId: classes[0]?.id ?? "", startsAt: toLocal(new Date(Date.now() + 86_400_000).toISOString()) });
    setOpen(true);
  };
  const startEdit = (e: EventDTO) => {
    setEditing(e);
    setForm({ title: e.title, description: e.description ?? "", type: e.type, scope: e.scope, classId: e.classId ?? "", schoolId: e.schoolId ?? "", startsAt: toLocal(e.startsAt), endsAt: toLocal(e.endsAt) });
    setOpen(true);
  };

  const save = async () => {
    setSaving(true);
    try {
      const body = { ...form, startsAt: form.startsAt ? new Date(form.startsAt).toISOString() : "", endsAt: form.endsAt ? new Date(form.endsAt).toISOString() : null };
      const res = await fetch(editing ? `${apiBase}/${editing.id}` : apiBase, { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) return toast.error(d.error ?? "Could not save event");
      toast.success(editing ? "Event updated" : form.type === "SESSION" ? "Session planned — attendance will be recorded automatically when it ends" : "Event created");
      setOpen(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (e: EventDTO) => {
    if (!confirm(`Delete "${e.title}"?`)) return;
    const res = await fetch(`${apiBase}/${e.id}`, { method: "DELETE" });
    const d = await res.json().catch(() => ({}));
    if (res.ok) {
      toast.success("Event deleted");
      load();
    } else toast.error(d.error ?? "Could not delete");
  };

  const groups = useMemo(() => {
    const list = events.filter((e) => (tab === "past" ? e.status === "past" : e.status !== "past"));
    const byDay = new Map<string, StudentEvent[]>();
    for (const e of list) {
      const k = new Date(e.startsAt).toDateString();
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k)!.push(e);
    }
    const days = [...byDay.entries()];
    return tab === "past" ? days.reverse() : days;
  }, [events, tab]);

  const upcomingCount = events.filter((e) => e.status !== "past").length;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <EduBackdrop />
      <div className="relative max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-primary to-primary p-6 md:p-8 shadow-lg text-white">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0"><CalendarDays className="w-7 h-7" /></div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">Events & sessions</h1>
              <p className="text-white/75 text-sm mt-0.5">{upcomingCount} upcoming. {editable ? "Plan a class session: every enrolled student is marked present (+1 XP) when it ends; fix exceptions on the séance page." : "Sessions credit +1 XP for attendance once they end."}</p>
            </div>
            <div className="flex gap-2">
              <div className="flex gap-1 rounded-xl bg-white/10 p-1">
                {(["upcoming", "past"] as const).map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize ${tab === t ? "bg-white text-primary" : "text-white/80 hover:bg-white/10"}`}>{t}</button>
                ))}
              </div>
              {editable && <Button onClick={startCreate} className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl"><Plus className="w-4 h-4" /> Plan</Button>}
            </div>
          </div>
        </div>

        {!loading && groups.length === 0 && <EmptyState title={tab === "past" ? "Nothing happened yet" : "Nothing planned"} quote={editable ? "Plan the next class session — attendance and XP take care of themselves." : "No upcoming sessions or events in your classes."} />}

        {groups.map(([day, list]) => (
          <div key={day}>
            <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">{new Date(day).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" })}</p>
            <div className="grid gap-3">
              {list.map((e) => {
                const T = TYPE_META[e.type];
                const link = seanceLink?.(e);
                return (
                  <Card key={e.id} className={`border shadow-sm p-0 ${e.status === "live" ? "border-growth/60" : "border-border"}`}>
                    <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${T.tint}`}><T.icon className="w-5 h-5" /></div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-foreground">{e.title}</p>
                          {e.status === "live" && <span className="inline-flex items-center gap-1 rounded-full bg-growth/15 text-growth px-2 py-0.5 text-[10px] font-semibold uppercase"><Radio className="w-3 h-3 animate-pulse" /> live</span>}
                          {e.settled && <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase text-muted-foreground"><CheckCircle2 className="w-3 h-3" /> attendance recorded</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-x-3 gap-y-1">
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(e.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}{e.endsAt ? ` – ${new Date(e.endsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : ""}</span>
                          <span className="flex items-center gap-1">{e.scope === "GLOBAL" ? <Globe className="w-3 h-3" /> : e.scope === "SCHOOL" ? <School2 className="w-3 h-3" /> : <Users className="w-3 h-3" />} {e.scope === "GLOBAL" ? "Everyone" : e.scope === "SCHOOL" ? e.schoolName : e.className}</span>
                          <span>{T.label}</span>
                          {e.type === "SESSION" && e.settled && <span>{e.participants} attendance rows</span>}
                        </p>
                        {e.description && <p className="text-sm text-foreground/80 mt-1">{e.description}</p>}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {e.myAttendance !== undefined && e.myAttendance !== null && (
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${e.myAttendance === "PRESENT" ? "text-growth" : "text-destructive"}`}>
                            {e.myAttendance === "PRESENT" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />} {e.myAttendance.toLowerCase()} {e.myPoints ? <span className="flex items-center"><Zap className="w-3 h-3" />+{e.myPoints}</span> : null}
                          </span>
                        )}
                        {link && <Button asChild size="sm" variant="outline"><Link href={link}>Attendance</Link></Button>}
                        {editable && <Button size="icon" variant="ghost" aria-label="Edit" onClick={() => startEdit(e)}><Pencil className="w-4 h-4" /></Button>}
                        {editable && !e.settled && <Button size="icon" variant="ghost" aria-label="Delete" onClick={() => remove(e)} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogTitle asChild><h2 className="text-xl font-semibold">{editing ? "Edit event" : "Plan an event"}</h2></DialogTitle>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Mechanics — lecture 4" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as typeof form.type, scope: v === "SESSION" ? "CLASS" : form.scope })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SESSION">Class session (auto attendance)</SelectItem>
                    <SelectItem value="EXAM">Exam</SelectItem>
                    <SelectItem value="OTHER">Other event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Audience</Label>
                <Select value={form.scope} onValueChange={(v) => setForm({ ...form, scope: v as typeof form.scope })} disabled={form.type === "SESSION"}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CLASS">One class</SelectItem>
                    {schools.length > 0 && <SelectItem value="SCHOOL">Whole school</SelectItem>}
                    {allowGlobal && <SelectItem value="GLOBAL">Everyone</SelectItem>}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {form.scope === "CLASS" && (
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => setForm({ ...form, classId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick a class" /></SelectTrigger>
                  <SelectContent>{classes.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            {form.scope === "SCHOOL" && (
              <div className="space-y-1.5">
                <Label>School</Label>
                <Select value={form.schoolId} onValueChange={(v) => setForm({ ...form, schoolId: v })}>
                  <SelectTrigger><SelectValue placeholder="Pick a school" /></SelectTrigger>
                  <SelectContent>{schools.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label>Starts</Label><Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></div>
              <div className="space-y-1.5"><Label>Ends {form.type === "SESSION" && <span className="text-muted-foreground font-normal">(default +2h)</span>}</Label><Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></div>
            </div>
            <div className="space-y-1.5"><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional" /></div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={save} disabled={saving} className="font-semibold">{saving ? "Saving…" : editing ? "Save" : "Plan it"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventsBoard;
