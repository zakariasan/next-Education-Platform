"use client";
import React from "react";
import useSWR from "swr";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lesson } from "@prisma/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";

const LessonsList = () => {
  const params = useParams();
  const classId = params.id as string;

  const {
    data: lessons,
    error,
    mutate,
    isLoading,
  } = useSWR(`/api/lessons?classId=${classId}`, fetcher);
  const deleteLesson = async (lessonId: string) => {
    try {
      const res = await fetch(`/api/lessons/${lessonId}`, { method: "DELETE" });
      if (res.ok) {
        mutate();
        toast.success("Lesson Deleted successfully");
      }
    } catch (err) {
      toast.error(`Lesson Deletion Failed! ${err}`);
    }
  };

  // useEffect(() => {
  //   const fetchLessons = async () => {
  //     try {
  //       const res = await fetch(`/api/lessons?classId=${classId}`);
  //       const data = await res.json();
  //       setLessons(data || []);
  //     } catch (error) {
  //       console.error("Failed to fetch lessons:", error);
  //       setLessons([]);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //
  //  fetchLessons();
  //}, [classId]);

  if (isLoading) return <div>Loading lessons...</div>;
  if (error) return <div>Error pls wait Loading lessons...</div>;

  return (
    <div>
      {lessons.length ? (
        <Table className="bg-white rounded-lg p-6 mt-3 ">
          <TableCaption>A list of your Lessons.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold w-1/5">Title</TableHead>
              <TableHead className="font-semibold w-1/5">Description</TableHead>
              <TableHead className="font-semibold w-1/5">
                nbr. Quizzes
              </TableHead>
              <TableHead className="font-semibold w-1/5">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {lessons?.map((lesson: Lesson) => (
              <TableRow key={lesson.id} className="group p-7">
                <TableCell className="font-medium ">
                  <Link href={`${lesson.classId}/lessons/${lesson.id}`}>
                    {lesson.title}
                  </Link>
                </TableCell>
                <TableCell>{lesson.description}</TableCell>
                <TableCell>2</TableCell>
                <TableCell>{lesson.status}</TableCell>
                <TableCell>
                  <Trash2
                    onClick={() => deleteLesson(lesson?.id)}
                    className="text-[#ff0f0f] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    size={22}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        "Create a Lesson"
      )}
      he;;
    </div>
  );
};

export default LessonsList;
