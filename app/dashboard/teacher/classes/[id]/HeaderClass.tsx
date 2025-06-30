"use client";
import React, { useEffect, useState } from "react";
import SearchBar from "@/app/dashboard/(components)/SearchBar";
import CreateLessonPOP from "./(components)/CreateLessonPOP";
import { useParams } from "next/navigation";

type HeaderClassProps ={
  tab: String
  setTab: React.Dispatch<React.SetStateAction<"students" | "lessons" | "quizzes">>
  setCreateLesson: React.Dispatch<React.SetStateAction<boolean>>
  createLesson: boolean
}
const HeaderClass = ({ tab, setTab, setCreateLesson, createLesson }: HeaderClassProps) => {
  const [search, setSearch] = useState("");
  const params = useParams();
  const classId = params.id as string;
    const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/teacher/classes/${classId}`);
        const data = await res.json();
        setClassName(data?.name || "Unnamed Class");

      } catch (err) {
        setClassName("Error loading name");
      } finally {
        setLoading(false);
      }
    };

    if (classId) {
      fetchClass();
    }
  }, [classId]);

  return (
    <div>
      <div className="flex gap-20 items-center">
        <h1 className="text-2xl font-semibold ">{className}</h1>
        <SearchBar onSearch={setSearch} />
      </div>

      <div className="flex justify-between items-center bg-white  mt-6 rounded-xl shadow-md space-x-6  px-4">
        <div className="flex">
          <button
            onClick={() => setTab("students")}
            className={`rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition ${tab === "students" ? "border-b-4 border-[var(--primary-blue)]" : ""}`}
          >
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              22
            </span>
            <p className="p-2 text-gray-400">Students</p>
          </button>

          <button
            onClick={() => {
              setTab("lessons");
              //setCreateLesson(false);
            }}
            className={`rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition ${tab === "lessons" ? "border-b-4 border-[var(--primary-blue)]" : ""}`}
          >
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              22
            </span>
            <p className="p-2 text-gray-400">Lessons</p>
          </button>

          <button
            onClick={() => setTab("quizzes")}
            className={`rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition ${tab === "quizzes" ? "border-b-4 border-[var(--primary-blue)]" : ""}`}
          >
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              22
            </span>
            <p className="p-2 text-gray-400">Quizzes</p>
          </button>
        </div>
        {tab === "lessons" && (
          <CreateLessonPOP
            createLesson={createLesson}
            setCreateLesson={setCreateLesson}
          />
        )}
      </div>
    </div>
  );
};

export default HeaderClass;
