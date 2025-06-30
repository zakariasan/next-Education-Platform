"use Client";
import React, { useEffect, useState } from "react";
import LessonsList from "./lessons/LessonsList";
import LessonEditor from "./lessons/LessonsEditor";
type LessonsProps = {
  createLesson: boolean;
  classId: string;
};
import { Lesson } from "@prisma/client";

const Lessons = ({ createLesson, classId }: LessonsProps) => {
  return (
    <div>
      {createLesson ? <LessonEditor /> : <LessonsList  />}
    </div>
  );
};

export default Lessons;
