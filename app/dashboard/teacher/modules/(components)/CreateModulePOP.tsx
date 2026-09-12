"use client";
import React, { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus } from "lucide-react";

type ModuleFormValues = { title: string; subject: string; description: string };

const CreateModulePOP = ({ apiBase, onCreated }: { apiBase: string; onCreated?: () => void }) => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<ModuleFormValues>({ defaultValues: { subject: "Physics" } });

  const onSubmit = async (data: ModuleFormValues) => {
    const res = await fetch(apiBase, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      toast.success("Module created");
      reset({ subject: "Physics" });
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
