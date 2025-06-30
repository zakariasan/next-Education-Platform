"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Block} from "@blocknote/core";
type ClassFormValues = {
  name: string;
  description: string;
};

type CreateLessonProps = {
  createLesson: boolean,
  setCreateLesson: React.Dispatch<React.SetStateAction<boolean>>
}
const CreateLessonPOP = ({setCreateLesson, createLesson}: CreateLessonProps) => {
  const { register, handleSubmit, reset } = useForm<ClassFormValues>();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState("");


  const onSubmit = async (data: ClassFormValues) => {
    const res = await fetch("/api/teacher/classes", {
      method: "POST",
      body: JSON.stringify({ ...data }),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) { 
      toast.success("Class created!");

      reset();
    } else {
      toast.success("Failed to create class");
    }
  };

  return (
        <Button onClick={()=>setCreateLesson(!createLesson)} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold p-4 rounded transition duration-200">
      {createLesson? 'View lessons': 'Create Lesson +'}
        </Button>
  );
};

export default CreateLessonPOP;
