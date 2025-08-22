"use client";
import React, { useEffect, useState } from "react";
import CreateLessonPOP from "./(components)/CreateLessonPOP";
import { useParams } from "next/navigation";
import CreateQuizPOP from "./(components)/CreateQuizzPOP";
import CreateStudentPOP from "./(components)/CreateStudentPOP";
type HeaderClassProps = {
  tab: "students" | "lessons" | "quizzes";
  setTab: React.Dispatch<
    React.SetStateAction<"students" | "lessons" | "quizzes">
  >;
  setCreateLesson: React.Dispatch<React.SetStateAction<boolean>>;
  createLesson: boolean;
};

const HeaderClass = ({
  tab,
  setTab,
  setCreateLesson,
  createLesson,
}: HeaderClassProps) => {
  const params = useParams();
  const classId = params.id as string;

  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  // Counts
  const [studentsCount, setStudentsCount] = useState(0);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/teacher/classes/${classId}`);
        const data = await res.json();

        setClassName(data?.name || "Unnamed Class");
        setStudentsCount(data?._count?.students ?? 0);
        setLessonsCount(data?._count?.lessons ?? 0);
        setQuizzesCount(data?._count?.quizzes ?? 0);
      } catch (err) {
        console.log(err)
        setClassName("Unammed Class");
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchClass();
  }, [classId]);

  return (
    <div>
      {/* Top header */}
      <div className="flex gap-20 items-center">
        <h1 className="text-2xl font-semibold ">
          {loading ? "Loading..." : className}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex justify-between items-center bg-white mt-6 rounded-xl shadow-md space-x-6 px-4">
        <div className="flex">
          {/* Students */}
          <button
            onClick={() => setTab("students")}
            className={`rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition ${tab === "students"
                ? "border-b-4 border-[var(--primary-blue)]"
                : ""
              }`}
          >
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              {studentsCount}
            </span>
            <p className="p-2 text-gray-400">Students</p>
          </button>

          {/* Lessons */}
          <button
            onClick={() => setTab("lessons")}
            className={`rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition ${tab === "lessons" ? "border-b-4 border-[var(--primary-blue)]" : ""
              }`}
          >
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              {lessonsCount}
            </span>
            <p className="p-2 text-gray-400">Lessons</p>
          </button>

          {/* Quizzes */}
          <button
            onClick={() => setTab("quizzes")}
            className={`rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition ${tab === "quizzes" ? "border-b-4 border-[var(--primary-blue)]" : ""
              }`}
          >
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              {quizzesCount}
            </span>
            <p className="p-2 text-gray-400">Quizzes</p>
          </button>
        </div>

        {/* Create buttons */}
        {tab === "students" && <CreateStudentPOP />}

        {tab === "lessons" && (
          <CreateLessonPOP
            createLesson={createLesson}
            setCreateLesson={setCreateLesson}
          />
        )}
        {tab === "quizzes" && <CreateQuizPOP />}
      </div>
    </div>
  );
};

export default HeaderClass;
