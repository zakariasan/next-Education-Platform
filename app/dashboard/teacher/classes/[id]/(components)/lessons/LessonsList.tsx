"use client";
import React from "react";
import useSWR from "swr";
import { Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Lesson } from "@prisma/client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { fetcher } from "@/lib/fetcher";
import EmptyState from "@/components/EmptyState";

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

  if (isLoading) return <p className="text-sm text-muted-foreground mt-3">Loading lessons...</p>;
  if (error) return <p className="text-sm text-destructive mt-3">Failed to load lessons.</p>;

  return (
    <div className="mt-3">
      {lessons?.length ? (
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Description</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {lessons?.map((lesson: Lesson) => (
                <TableRow key={lesson.id} className="group">
                  <TableCell className="font-medium">
                    <Link
                      href={`${lesson.classId}/lessons/${lesson.id}`}
                      className="text-primary hover:underline"
                    >
                      {lesson.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground truncate max-w-xs">
                    {lesson.description}
                  </TableCell>
                  <TableCell>
                    <Badge variant={lesson.status === "PUBLISHED" ? "default" : "outline"}>
                      {lesson.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Trash2
                      onClick={() => deleteLesson(lesson?.id)}
                      className="text-destructive opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                      size={18}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <EmptyState
          title="No lessons yet"
          quote="A lesson plan with nothing in it has no pull. Use “Create Lesson” above to give this class its first one."
        />
      )}
    </div>
  );
};

export default LessonsList;
