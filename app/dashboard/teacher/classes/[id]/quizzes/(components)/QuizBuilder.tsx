"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowDown, ArrowLeft, ArrowUp, BarChart3, CheckSquare, CircleDot, Copy, Eye, Hash, ImageIcon, Pencil, Plus, Rocket, Save, ToggleLeft, Trash2, Type, X } from "lucide-react";
import QuizForm from "@/components/quiz/QuizForm";
import type { QuestionDTO, QuizDTO } from "@/lib/quiz/queries";
import type { QuestionType } from "@/lib/quiz/grade";
import type { ModuleDTO, ProjectDTO } from "@/lib/gamification/types";
import StatusPill from "@/app/dashboard/teacher/modules/(components)/StatusPill";

type Draft = Omit<QuestionDTO, "id" | "orderIndex"> & { key: string; id?: string };

const TYPE_META: Record<QuestionType, { label: string; icon: React.ElementType }> = {
  MULTIPLE_CHOICE: { label: "Multiple choice", icon: CircleDot },
  CHECKBOXES: { label: "Checkboxes", icon: CheckSquare },
  TRUE_FALSE: { label: "True / False", icon: ToggleLeft },
  SHORT_ANSWER: { label: "Short answer", icon: Type },
  NUMERIC: { label: "Numeric", icon: Hash },
};

let seq = 0;
const newQuestion = (type: QuestionType = "MULTIPLE_CHOICE"): Draft => ({
  key: `q${Date.now()}-${seq++}`,
  type,
  text: "",
  imageUrl: null,
  points: 1,
  required: true,
  options: type === "TRUE_FALSE" ? ["True", "False"] : ["Option 1", "Option 2"],
  correctIndexes: [],
  correctText: null,
  correctNumber: null,
  tolerance: null,
});

const toLocal = (iso: string | null) => (iso ? new Date(new Date(iso).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");

type Props = { basePath?: string; apiBase?: string };

const QuizBuilder = ({ basePath = "/dashboard/teacher/classes", apiBase = "/api/teacher/classes" }: Props) => {
  const params = useParams<{ id: string; Quiz_id?: string }>();
  const router = useRouter();
  const classId = params.id;
  const quizId = params.Quiz_id;
  const isNew = !quizId;

  const [quiz, setQuiz] = useState<QuizDTO | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, unknown>>({});

  const [title, setTitle] = useState("Untitled quiz");
  const [description, setDescription] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [duration, setDuration] = useState("");
  const [xpReward, setXpReward] = useState("50");
  const [showAnswers, setShowAnswers] = useState(true);
  const [questions, setQuestions] = useState<Draft[]>([newQuestion()]);

  const [lessons, setLessons] = useState<{ id: string; title: string }[]>([]);
  const [modules, setModules] = useState<ModuleDTO[]>([]);
  const [projects, setProjects] = useState<ProjectDTO[]>([]);

  useEffect(() => {
    fetch(`/api/lessons?classId=${classId}`).then(async (r) => r.ok && setLessons(await r.json())).catch(() => {});
    fetch("/api/teacher/modules").then(async (r) => r.ok && setModules(await r.json())).catch(() => {});
  }, [classId]);

  useEffect(() => {
    if (!moduleId) return setProjects([]);
    fetch(`/api/teacher/modules/${moduleId}`).then(async (r) => r.ok && setProjects((await r.json()).projects)).catch(() => {});
  }, [moduleId]);

  const load = useCallback(async () => {
    if (!quizId) return;
    const res = await fetch(`${apiBase}/${classId}/quizzes/${quizId}`);
    if (!res.ok) {
      toast.error("Quiz not found");
      setLoading(false);
      return;
    }
    const q: QuizDTO = await res.json();
    setQuiz(q);
    setTitle(q.title);
    setDescription(q.description ?? "");
    setLessonId(q.lessonId ?? "");
    setModuleId(q.moduleId ?? "");
    setProjectId(q.projectId ?? "");
    setDueDate(toLocal(q.dueDate));
    setDuration(q.duration ? String(q.duration) : "");
    setXpReward(String(q.xpReward));
    setShowAnswers(q.showAnswers);
    setQuestions(q.questions.map((x) => ({ ...x, key: x.id })));
    setLoading(false);
  }, [apiBase, classId, quizId]);

  useEffect(() => {
    load();
  }, [load]);

  const update = (key: string, patch: Partial<Draft>) => setQuestions((qs) => qs.map((q) => (q.key === key ? { ...q, ...patch } : q)));
  const move = (i: number, d: -1 | 1) =>
    setQuestions((qs) => {
      const j = i + d;
      if (j < 0 || j >= qs.length) return qs;
      const c = [...qs];
      [c[i], c[j]] = [c[j], c[i]];
      return c;
    });
  const changeType = (q: Draft, type: QuestionType) => {
    const patch: Partial<Draft> = { type, correctIndexes: [] };
    if (type === "TRUE_FALSE") patch.options = ["True", "False"];
    else if ((type === "MULTIPLE_CHOICE" || type === "CHECKBOXES") && q.options.length < 2) patch.options = ["Option 1", "Option 2"];
    update(q.key, patch);
  };

  const payload = () => ({
    title, description, lessonId: lessonId || null, moduleId: moduleId || null, projectId: projectId || null,
    dueDate: dueDate ? new Date(dueDate).toISOString() : null, duration: duration || null, xpReward: Number(xpReward), showAnswers,
    questions: questions.map((q) => ({ ...q, key: undefined })),
  });

  const save = async (publish = false) => {
    if (!title.trim()) return toast.error("Give the quiz a title");
    setSaving(true);
    try {
      let id = quizId;
      if (isNew) {
        const res = await fetch(`${apiBase}/${classId}/quizzes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload()) });
        const d = await res.json();
        if (!res.ok) return toast.error(d.error ?? "Could not create quiz");
        id = d.id;
      } else {
        const res = await fetch(`${apiBase}/${classId}/quizzes/${quizId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ quiz: payload() }) });
        const d = await res.json();
        if (!res.ok) return toast.error(d.error ?? "Could not save quiz");
      }
      if (publish) {
        const res = await fetch(`${apiBase}/${classId}/quizzes/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "PUBLISHED" }) });
        const d = await res.json();
        if (!res.ok) return toast.error(d.error ?? "Could not publish");
        toast.success("Quiz published — students can take it now");
      } else toast.success(isNew ? "Quiz created as draft" : "Quiz saved");
      if (isNew) router.push(`${basePath}/${classId}/quizzes/${id}`);
      else load();
    } finally {
      setSaving(false);
    }
  };

  const setStatus = async (status: "DRAFT" | "ARCHIVED") => {
    const res = await fetch(`${apiBase}/${classId}/quizzes/${quizId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (res.ok) {
      toast.success(status === "DRAFT" ? "Quiz unpublished" : "Quiz archived");
      load();
    } else toast.error("Action failed");
  };

  const previewQuestions = useMemo<QuestionDTO[]>(() => questions.map((q, i) => ({ ...q, id: q.id ?? q.key, orderIndex: i })), [questions]);
  const totalPoints = questions.reduce((s, q) => s + (Number(q.points) || 0), 0);

  if (loading) return <div className="p-6 text-muted-foreground animate-pulse">Loading quiz…</div>;

  return (
    <div className="space-y-5 pb-28 max-w-4xl mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Link href={`${basePath}/${classId}/quizzes`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"><ArrowLeft className="w-4 h-4" /> Quizzes</Link>
        <div className="flex items-center gap-2">
          {quiz && <StatusPill status={quiz.status} />}
          {quiz && (
            <Button asChild size="sm" variant="outline"><Link href={`${basePath}/${classId}/quizzes/${quiz.id}/results`}><BarChart3 className="w-4 h-4" /> Results ({quiz.attemptCount})</Link></Button>
          )}
          <Button size="sm" variant={preview ? "default" : "outline"} onClick={() => setPreview(!preview)}>
            {preview ? <Pencil className="w-4 h-4" /> : <Eye className="w-4 h-4" />} {preview ? "Edit" : "Preview"}
          </Button>
        </div>
      </div>

      {preview ? (
        <div className="space-y-4">
          <Card className="border-t-8 border-t-primary shadow-sm">
            <CardContent className="p-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && <p className="text-muted-foreground mt-1 whitespace-pre-wrap">{description}</p>}
              <p className="text-xs text-muted-foreground mt-3">{questions.length} questions · {totalPoints} pts · {xpReward} XP{duration ? ` · ${duration} min` : ""}</p>
            </CardContent>
          </Card>
          <QuizForm questions={previewQuestions} answers={previewAnswers} onChange={setPreviewAnswers} />
        </div>
      ) : (
        <>
          <Card className="border-t-8 border-t-primary shadow-sm">
            <CardContent className="p-6 space-y-4">
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-transparent text-3xl font-bold tracking-tight outline-none border-b border-transparent focus:border-primary pb-1" placeholder="Quiz title" aria-label="Quiz title" />
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description / instructions (optional)" rows={2} className="border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Due date</Label>
                  <Input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Time limit (min)</Label>
                  <Input type="number" min="1" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="untimed" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">XP at 100 %</Label>
                  <Input type="number" min="0" step="10" value={xpReward} onChange={(e) => setXpReward(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Reveal answers after submit</Label>
                  <div className="h-9 flex items-center"><Switch checked={showAnswers} onCheckedChange={setShowAnswers} /></div>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Lesson (optional)</Label>
                  <Select value={lessonId || "none"} onValueChange={(v) => setLessonId(v === "none" ? "" : v)}>
                    <SelectTrigger><SelectValue placeholder="No lesson" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No lesson</SelectItem>
                      {lessons.map((l) => <SelectItem key={l.id} value={l.id}>{l.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Holy Graph module (optional)</Label>
                  <Select value={moduleId || "none"} onValueChange={(v) => { setModuleId(v === "none" ? "" : v); setProjectId(""); }}>
                    <SelectTrigger><SelectValue placeholder="No module" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No module</SelectItem>
                      {modules.map((m) => <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Project node (optional)</Label>
                  <Select value={projectId || "none"} onValueChange={(v) => setProjectId(v === "none" ? "" : v)} disabled={!moduleId}>
                    <SelectTrigger><SelectValue placeholder="Whole module" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Whole module</SelectItem>
                      {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.version?.title ?? "Untitled"}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {questions.map((q, i) => {
            const choice = q.type === "MULTIPLE_CHOICE" || q.type === "CHECKBOXES" || q.type === "TRUE_FALSE";
            const multi = q.type === "CHECKBOXES";
            return (
              <Card key={q.key} className="shadow-sm border-l-4 border-l-secondary">
                <CardContent className="p-5 space-y-4">
                  <div className="flex gap-3 items-start">
                    <span className="mt-2 w-7 h-7 rounded-lg bg-muted text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
                    <Textarea rows={1} value={q.text} onChange={(e) => update(q.key, { text: e.target.value })} placeholder="Question" className="flex-1 text-base font-medium min-h-10" />
                    <Select value={q.type} onValueChange={(v) => changeType(q, v as QuestionType)}>
                      <SelectTrigger className="w-44 shrink-0"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(TYPE_META) as QuestionType[]).map((t) => {
                          const M = TYPE_META[t];
                          return <SelectItem key={t} value={t}><span className="flex items-center gap-2"><M.icon className="w-4 h-4" /> {M.label}</span></SelectItem>;
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="pl-10 space-y-2">
                    {choice && (
                      <>
                        {q.options.map((opt, j) => {
                          const correct = q.correctIndexes.includes(j);
                          return (
                            <div key={j} className="flex items-center gap-2 group">
                              <button
                                type="button"
                                aria-label={correct ? "Correct answer" : "Mark as correct"}
                                title="Click to mark correct"
                                onClick={() => update(q.key, { correctIndexes: multi ? (correct ? q.correctIndexes.filter((x) => x !== j) : [...q.correctIndexes, j]) : [j] })}
                                className={`w-5 h-5 shrink-0 border-2 flex items-center justify-center ${multi ? "rounded-md" : "rounded-full"} ${correct ? "border-growth bg-growth" : "border-muted-foreground/40 hover:border-primary"}`}
                              >
                                {correct && <span className={`${multi ? "w-2.5 h-2.5 rounded-sm" : "w-2 h-2 rounded-full"} bg-white`} />}
                              </button>
                              <Input
                                value={opt}
                                readOnly={q.type === "TRUE_FALSE"}
                                onChange={(e) => update(q.key, { options: q.options.map((o, k) => (k === j ? e.target.value : o)) })}
                                className={`border-0 border-b rounded-none px-1 focus-visible:ring-0 focus-visible:border-primary ${correct ? "text-growth font-semibold" : ""}`}
                              />
                              {q.type !== "TRUE_FALSE" && q.options.length > 2 && (
                                <button type="button" aria-label="Remove option" onClick={() => update(q.key, { options: q.options.filter((_, k) => k !== j), correctIndexes: q.correctIndexes.filter((x) => x !== j).map((x) => (x > j ? x - 1 : x)) })} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><X className="w-4 h-4" /></button>
                              )}
                            </div>
                          );
                        })}
                        {q.type !== "TRUE_FALSE" && (
                          <button type="button" onClick={() => update(q.key, { options: [...q.options, `Option ${q.options.length + 1}`] })} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary pl-7"><Plus className="w-4 h-4" /> Add option</button>
                        )}
                        <p className="text-[11px] text-muted-foreground pl-7">Click the {multi ? "box" : "bullet"} to mark the correct answer{multi ? "s" : ""}.</p>
                      </>
                    )}
                    {q.type === "SHORT_ANSWER" && (
                      <div className="space-y-1">
                        <Input value={q.correctText ?? ""} onChange={(e) => update(q.key, { correctText: e.target.value })} placeholder="Accepted answer(s), separate alternatives with |" />
                        <p className="text-[11px] text-muted-foreground">Case and spacing are ignored.</p>
                      </div>
                    )}
                    {q.type === "NUMERIC" && (
                      <div className="grid grid-cols-2 gap-2 max-w-sm">
                        <Input type="number" step="any" value={q.correctNumber ?? ""} onChange={(e) => update(q.key, { correctNumber: e.target.value === "" ? null : Number(e.target.value) })} placeholder="Correct value" />
                        <Input type="number" step="any" min="0" value={q.tolerance ?? ""} onChange={(e) => update(q.key, { tolerance: e.target.value === "" ? null : Number(e.target.value) })} placeholder="± tolerance" />
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-1">
                      <ImageIcon className="w-4 h-4 text-muted-foreground" />
                      <Input value={q.imageUrl ?? ""} onChange={(e) => update(q.key, { imageUrl: e.target.value || null })} placeholder="Image URL (optional)" className="h-8 text-xs max-w-md" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-border pt-3 pl-10 flex-wrap gap-2">
                    <div className="flex items-center gap-3 text-sm">
                      <Label className="text-xs">Points</Label>
                      <Input type="number" min="0" value={q.points} onChange={(e) => update(q.key, { points: Number(e.target.value) })} className="w-20 h-8" />
                      <Label className="text-xs flex items-center gap-2 ml-2"><Switch checked={q.required} onCheckedChange={(v) => update(q.key, { required: v })} /> Required</Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)}><ArrowUp className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Move down" disabled={i === questions.length - 1} onClick={() => move(i, 1)}><ArrowDown className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Duplicate" onClick={() => setQuestions((qs) => [...qs.slice(0, i + 1), { ...q, key: `q${Date.now()}-${seq++}`, id: undefined }, ...qs.slice(i + 1)])}><Copy className="w-4 h-4" /></Button>
                      <Button size="icon" variant="ghost" aria-label="Delete" disabled={questions.length === 1} onClick={() => setQuestions((qs) => qs.filter((x) => x.key !== q.key))} className="text-destructive hover:text-destructive"><Trash2 className="w-4 h-4" /></Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="flex flex-wrap gap-2">
            {(Object.keys(TYPE_META) as QuestionType[]).map((t) => {
              const M = TYPE_META[t];
              return (
                <Button key={t} variant="outline" className="border-dashed" onClick={() => setQuestions((qs) => [...qs, newQuestion(t)])}><M.icon className="w-4 h-4" /> {M.label}</Button>
              );
            })}
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-16 md:left-64 right-0 z-20 border-t border-border bg-background/85 backdrop-blur px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-muted-foreground">{questions.length} questions · {totalPoints} pts · {quiz?.status === "PUBLISHED" ? "Live for students" : "Draft — students can't see it yet"}</p>
          <div className="flex items-center gap-2 ml-auto">
            {quiz?.status === "PUBLISHED" && <Button variant="ghost" onClick={() => setStatus("DRAFT")}>Unpublish</Button>}
            <Button variant="outline" onClick={() => save(false)} disabled={saving} className="rounded-xl"><Save className="w-4 h-4" /> {isNew ? "Create draft" : "Save"}</Button>
            <Button onClick={() => save(true)} disabled={saving} className="rounded-xl font-semibold"><Rocket className="w-4 h-4" /> {quiz?.status === "PUBLISHED" ? "Save & republish" : "Publish"}</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizBuilder;
