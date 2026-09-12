"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import Link from "next/link";

type ClassFormValues = {
  name: string;
  description: string;
  schoolId: string;
};

type SchoolOption = { id: string; name: string };

const CreateClassPOP = () => {
  const [open, setOpen] = useState(false);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const { register, handleSubmit, reset, control } =
    useForm<ClassFormValues>();

  useEffect(() => {
    if (!open) return;
    setLoadingSchools(true);
    fetch("/api/teacher/schools")
      .then((res) => (res.ok ? res.json() : []))
      .then(setSchools)
      .finally(() => setLoadingSchools(false));
  }, [open]);

  const onSubmit = async (data: ClassFormValues) => {
    const res = await fetch("/api/teacher/classes", {
      method: "POST",
      body: JSON.stringify({ ...data }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      toast.success("Class created!");

      reset();
      setOpen(false);
    } else {
      toast.success("Failed to create class");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-5 py-2.5 h-auto rounded-xl shadow-sm transition-colors duration-200">
          + Create a Class
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full">
        <DialogTitle asChild>
          <h2 className="text-xl font-semibold mb-4">Create a New Class</h2>
        </DialogTitle>
        {!loadingSchools && schools.length === 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              You need a school before you can create a class.
            </p>
            <Link href="/dashboard/teacher/schools">
              <Button className="w-full">Create a School</Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">School</label>
              <Controller
                name="schoolId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a school" />
                    </SelectTrigger>
                    <SelectContent>
                      {schools.map((school) => (
                        <SelectItem key={school.id} value={school.id}>
                          {school.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Class Name</label>
              <Input
                {...register("name", { required: true })}
                placeholder="e.g. Grade 10 - Section A"
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
                Create Class
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassPOP;
