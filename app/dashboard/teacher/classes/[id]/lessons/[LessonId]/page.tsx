import React from 'react'
import LessonEditorUpdate from './LessonsEditorUpdate'



async function getLesson(lessonId : string) {
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
  params: {
    lessonId: string
  }
}

const page = async ({ params }:pageLessonProps) => {
  const {LessonId} = await params

  const lesson = await getLesson(LessonId)
  console.log(lesson)
  return (
    <div>
      <LessonEditorUpdate lesson={lesson} />
    </div>
  )
}

export default page
