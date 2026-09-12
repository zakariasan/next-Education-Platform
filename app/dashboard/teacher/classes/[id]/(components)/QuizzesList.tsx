"use client";
import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const QuizzesList = () => {
  const params = useParams();
  const classId = params.id as string;

  return (
    <Card className="border border-border shadow-sm mt-3">
      <CardContent className="py-12 flex flex-col items-center text-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent/25 text-accent-foreground flex items-center justify-center">
          <ClipboardList className="w-7 h-7" />
        </div>
        <h3 className="font-semibold text-foreground">Quiz list coming soon</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          A full quiz list view isn&apos;t built yet — for now you can create a new quiz directly.
        </p>
        <Link href={`${classId}/quizzes`}>
          <Button className="cursor-pointer mt-1">
            <Plus className="w-4 h-4 mr-2" />
            Create a Quiz
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default QuizzesList;
