"use client";
import React from "react";
import { Button } from "@/components/ui/button";
type CreateLessonProps = {
  createLesson: boolean,
  setCreateLesson: React.Dispatch<React.SetStateAction<boolean>>
}
const CreateLessonPOP = ({setCreateLesson, createLesson}: CreateLessonProps) => {

  return (
        <Button onClick={()=>setCreateLesson(!createLesson)} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold p-4 rounded transition duration-200">
      {createLesson? 'View lessons': 'Create Lesson +'}
        </Button>
  );
};

export default CreateLessonPOP;
