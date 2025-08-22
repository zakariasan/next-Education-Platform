import { useParams } from "next/navigation";
import React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
type Lesson = {
  id: string;
  title: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  classId: string;
};

const SelectLesson = () => {
  const params = useParams();
  const classId = params.id as string;
  const {
    data: lessons,
    error,
    isLoading,
  } = useSWR<Lesson[]>(`/api/lessons?classId=${classId}`, fetcher);

  if (isLoading) return <div>Loading lessons...</div>;
  if (error) return <div>Error pls wait Loading lessons...</div>;

  return (
    <div>
      {lessons?.map((lesson, index) => (
        <div
          key={lesson.id}
          className="border-1 rounded-2xl flex p-4 justify-between items-center border-gray-200"
        >
          <div className="flex gap-2 flex items-center">
            <span className="text-xl text-white w-12 h-12 bg-gray-400 rounded-full flex justify-center items-center">
              {index + 1}
            </span>
            <div className="">
              <h1 className="text-2xl font-bold ">{lesson.title}</h1>
              <p className="text-gray-600 text-sm ">
                <span>
                  {new Date(lesson.createdAt).toLocaleDateString("en-US", {
                    weekday: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </span>
                <span className="mx-1">•</span>
                <span>
                  {new Date(lesson.createdAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </p>
            </div>
          </div>
          <input type="checkbox" className="w-6 h-6 p-6 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export default SelectLesson;
