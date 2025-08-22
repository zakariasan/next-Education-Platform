import React from "react";
import LessonEditorUpdate from "./LessonsEditorUpdate";

async function getLesson(lessonId: string) {
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/lessons/${lessonId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    return { lessons: [] };
  }
  return res.json();
}
type pageLessonProps = {
  params: Promise<{ LessonId: string }>;
};

const page = async ({ params }: pageLessonProps) => {
  const { LessonId } = await params;

  const lesson = await getLesson(LessonId);
  return (
    <div>
      <LessonEditorUpdate lesson={lesson} />
    </div>
  );
};

export default page;
