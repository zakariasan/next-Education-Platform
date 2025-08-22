"use Client";
import React from "react";
import LessonsList from "./lessons/LessonsList";
import LessonEditor from "./lessons/LessonsEditor";
type LessonsProps = {
  createLesson: boolean;
  classId: string;
};

const Lessons = ({ createLesson}: LessonsProps) => {
  return (
    <div>
      {createLesson ? <LessonEditor /> : <LessonsList  />}
    </div>
  );
};

export default Lessons;
