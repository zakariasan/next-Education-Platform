"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { Users, BookOpen, ClipboardList, FileText, CalendarClock } from "lucide-react";
import CreateLessonPOP from "./(components)/CreateLessonPOP";
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
  const pathname = usePathname();
  const classId = params.id as string;

  const [className, setClassName] = useState("");
  const [loading, setLoading] = useState(true);

  const [studentsCount, setStudentsCount] = useState(0);
  const [lessonsCount, setLessonsCount] = useState(0);
  const [quizzesCount, setQuizzesCount] = useState(0);
  const [examsCount, setExamsCount] = useState(0);
  const [seancesCount, setSeancesCount] = useState(0);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const res = await fetch(`/api/teacher/classes/${classId}`);
        const data = await res.json();

        setClassName(data?.name || "Unnamed Class");
        setStudentsCount(data?._count?.students ?? 0);
        setLessonsCount(data?._count?.lessons ?? 0);
        setQuizzesCount(data?._count?.quizzes ?? 0);
        setExamsCount(data?._count?.exams ?? 0);
        setSeancesCount(data?._count?.seances ?? 0);
      } catch (err) {
        console.log(err)
        setClassName("Unammed Class");
      } finally {
        setLoading(false);
      }
    };
    if (classId) fetchClass();
  }, [classId]);

  const isOverviewRoute = pathname === `/dashboard/teacher/classes/${classId}`;

  const tabButtonClass = (active: boolean) =>
    `relative rounded-lg px-4 py-3 flex items-center gap-2 transition-all duration-150 ease-out active:scale-[0.97] ${
      active
        ? "bg-primary/15 shadow-sm"
        : "hover:bg-muted hover:-translate-y-0.5"
    }`;

  const activeDot = (active: boolean) =>
    active && (
      <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-primary" />
    );

  const countBadge = (count: number, tint: string) => (
    <span className={`text-sm font-bold rounded-lg px-2 py-0.5 ${tint}`}>{count}</span>
  );

  return (
    <div>
      {/* Top header */}
      <div className="flex gap-20 items-center">
        <h1 className="text-2xl font-semibold text-foreground">
          {loading ? "Loading..." : className}
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-between items-center bg-card border border-border mt-6 rounded-xl shadow-sm gap-2 px-2 py-2">
        <div className="flex flex-wrap gap-1">
          {/* Students */}
          <button
            onClick={() => setTab("students")}
            className={tabButtonClass(isOverviewRoute && tab === "students")}
          >
            <Users className="w-4 h-4 text-primary" />
            {countBadge(studentsCount, "bg-primary/15 text-primary")}
            <p className="text-sm font-medium text-foreground">Students</p>
            {activeDot(isOverviewRoute && tab === "students")}
          </button>

          {/* Notes (stored as Lesson rows) */}
          <button
            onClick={() => setTab("lessons")}
            className={tabButtonClass(isOverviewRoute && tab === "lessons")}
          >
            <BookOpen className="w-4 h-4 text-secondary" />
            {countBadge(lessonsCount, "bg-secondary/20 text-secondary")}
            <p className="text-sm font-medium text-foreground">Notes</p>
            {activeDot(isOverviewRoute && tab === "lessons")}
          </button>

          {/* Quizzes */}
          <button
            onClick={() => setTab("quizzes")}
            className={tabButtonClass(isOverviewRoute && tab === "quizzes")}
          >
            <ClipboardList className="w-4 h-4 text-accent-foreground" />
            {countBadge(quizzesCount, "bg-accent/25 text-accent-foreground")}
            <p className="text-sm font-medium text-foreground">Quizzes</p>
            {activeDot(isOverviewRoute && tab === "quizzes")}
          </button>

          {/* Exams — real page */}
          <Link
            href={`/dashboard/teacher/classes/${classId}/exams`}
            className={tabButtonClass(pathname?.includes("/exams") ?? false)}
          >
            <FileText className="w-4 h-4 text-[var(--primary-wild-watermelon)]" />
            {countBadge(examsCount, "bg-[var(--primary-wild-watermelon)]/15 text-[var(--primary-wild-watermelon)]")}
            <p className="text-sm font-medium text-foreground">Exams</p>
            {activeDot(pathname?.includes("/exams") ?? false)}
          </Link>

          {/* Seances — real page */}
          <Link
            href={`/dashboard/teacher/classes/${classId}/seances`}
            className={tabButtonClass(pathname?.includes("/seances") ?? false)}
          >
            <CalendarClock className="w-4 h-4 text-growth" />
            {countBadge(seancesCount, "bg-growth/15 text-growth")}
            <p className="text-sm font-medium text-foreground">Sessions</p>
            {activeDot(pathname?.includes("/seances") ?? false)}
          </Link>
        </div>

        {/* Create buttons */}
        {isOverviewRoute && tab === "students" && <CreateStudentPOP />}

        {isOverviewRoute && tab === "lessons" && (
          <CreateLessonPOP
            createLesson={createLesson}
            setCreateLesson={setCreateLesson}
          />
        )}
        {isOverviewRoute && tab === "quizzes" && <CreateQuizPOP />}
      </div>
    </div>
  );
};

export default HeaderClass;
