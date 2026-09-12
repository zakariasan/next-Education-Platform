"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type SchoolFormValues = {
  name: string;
  description: string;
};

const CreateSchoolPOP = ({ onCreated }: { onCreated?: () => void }) => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<SchoolFormValues>();

  const onSubmit = async (data: SchoolFormValues) => {
    const res = await fetch("/api/teacher/schools", {
      method: "POST",
      body: JSON.stringify({ ...data }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      toast.success("School created!");
      reset();
      setOpen(false);
      onCreated?.();
    } else {
      toast.error("Failed to create school");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-2.5 h-auto rounded-xl shadow-sm transition-colors duration-200">
          + Create a School
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full">
        <DialogTitle asChild>
          <h2 className="text-xl font-semibold mb-4">Create a New School</h2>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">School Name</label>
            <Input
              {...register("name", { required: true })}
              placeholder="e.g. Greenwood High"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <Textarea
              {...register("description")}
              placeholder="Optional description..."
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="font-semibold">
              Create School
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSchoolPOP;
