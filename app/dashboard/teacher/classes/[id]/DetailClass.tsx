"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HeaderClass from "./HeaderClass";

import StudentsList from "./(components)/StudentsList";
import QuizzesList from "./(components)/QuizzesList";
import { Block, PartialBlock } from "@blocknote/core";
import Lessons from "./(components)/Lessons";
import { useParams } from "next/navigation";

const TeacherClasses = () => {
  const params = useParams();
  const classId = params.id as string;
  const [tab, setTab] = useState<"students" | "lessons" | "quizzes">(
    "students",
  );

  const [createLesson, setCreateLesson] = useState(false);
  return (
    <div>
      <HeaderClass
        tab={tab}
        setTab={setTab}
        createLesson={createLesson}
        setCreateLesson={setCreateLesson}
      />
      {tab === "students" && <StudentsList />}
      {tab === "lessons" && (
        <Lessons createLesson={createLesson} classId={classId} />
      )}
      {tab === "quizzes" && <QuizzesList />}
    </div>
  );
};

export default TeacherClasses;
