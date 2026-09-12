"use client";
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type ModuleFormValues = { title: string; subject: string; description: string };
type Teacher = { id: string; name: string; email: string };

const CreateModulePOP = ({ apiBase, onCreated, adminMode = false }: { apiBase: string; onCreated?: () => void; adminMode?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherId, setTeacherId] = useState("");
  const { register, handleSubmit, reset } = useForm<ModuleFormValues>({ defaultValues: { subject: "Physics" } });

  useEffect(() => {
    if (!adminMode || !open) return;
    fetch("/api/admin/teachers").then(async (r) => r.ok && setTeachers(await r.json()));
  }, [adminMode, open]);

  const onSubmit = async (data: ModuleFormValues) => {
    if (adminMode && !teacherId) return toast.error("Pick the owning teacher");
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, teacherId: adminMode ? teacherId : undefined }),
    });
    if (res.ok) {
      toast.success("Module created");
      reset({ subject: "Physics" });
      setTeacherId("");
      setOpen(false);
      onCreated?.();
    } else {
      const err = await res.json().catch(() => ({}));
      toast.error(err.error ?? "Failed to create module");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-2.5 h-auto rounded-xl shadow-sm">
          <Plus className="w-4 h-4" /> New Module
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-full">
        <DialogTitle asChild>
          <h2 className="text-xl font-semibold mb-1">Create a Module</h2>
        </DialogTitle>
        <p className="text-sm text-muted-foreground mb-3">A subject track: a common core of projects plus electives, mapped on the Holy Graph.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <Input {...register("title", { required: true })} placeholder="e.g. Physics – Mechanics" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject</label>
            <Input {...register("subject")} placeholder="Physics" />
          </div>
          {adminMode && (
            <div>
              <label className="block text-sm font-medium mb-1">Owning teacher</label>
              <Select value={teacherId} onValueChange={setTeacherId}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Assign a teacher" /></SelectTrigger>
                <SelectContent>
                  {teachers.map((t) => (
                    <SelectItem key={t.id} value={t.id}>{t.name} ({t.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea {...register("description")} placeholder="What will students master by closing this circuit?" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" className="font-semibold">Create Module</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModulePOP;
