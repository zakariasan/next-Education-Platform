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

type ClassFormValues = {
  name: string;
  description: string;
};

const CreateClassPOP = () => {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<ClassFormValues>();
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
        <Button className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold p-4 rounded transition duration-200">
          + Create a Class
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md w-full">
        <DialogTitle asChild>
          <h2 className="text-xl font-semibold mb-4">Create a New Class</h2>
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Class Name</label>
            <Input
              {...register("name", { required: true })}
              placeholder="e.g. Physics 101"
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
            <Button
              type="submit"
              className="bg-[var(--primary-wild-watermelon)] text-md font-medium "
            >
              Create Class
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateClassPOP;
