// app/teacher/classes/[id]/exams/[examId]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import ResultsTable from "./results-table";
import ExamFiles from "./exam-files";

type ExamFile = {
  id: string;
  name: string;
  url: string;
  kind: string;
  createdAt: string;
};

type ExamResult = {
  id: string;
  examId: string;
  studentId: string;
  score: number;
  xpAwarded: number;
  notes: string | null;
  student: {
    id: string;
    name: string;
    email: string;
  };
};

type Exam = {
  id: string;
  title: string;
  description: string;
  type: string;
  date: string | null;
  maxScore: number;
  maxXP: number;
  files: ExamFile[];
  results: ExamResult[];
};

export default function ExamDetails() {
  const params = useParams<{ id: string; examId: string }>();
  const classId = params.id;
  const examId = params.examId;

  const [exam, setExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchExamDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/teacher/classes/${classId}/exams/${examId}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch exam details");
      }

      const data = await response.json();
      setExam(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExamDetails();
  }, [classId, examId, fetchExamDetails]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading exam details...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">Error: {error || "Exam not found"}</p>
          <Button onClick={fetchExamDetails} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "FINAL":
        return "destructive";
      case "MIDTERM":
        return "default";
      case "LOCAL":
        return "secondary";
      case "CUSTOM":
        return "outline";
      default:
        return "secondary";
    }
  };

  return (
    <div className="p-6 bg-white h-screen p-4 md:p-6">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          <Badge variant={getTypeColor(exam.type)}>{exam.type}</Badge>
        </div>
        {exam.description && (
          <p className="text-muted-foreground">{exam.description}</p>
        )}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="files">
            Files ({exam.files?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="results">
            Results ({exam.results?.length || 0})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Exam Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Type:</span>
                  <Badge variant={getTypeColor(exam.type)} className="ml-2">
                    {exam.type}
                  </Badge>
                </div>
                {exam.date && (
                  <div>
                    <span className="font-medium">Date:</span>
                    <span className="ml-2">
                      {format(new Date(exam.date), "PPP")}
                    </span>
                  </div>
                )}
                <div>
                  <span className="font-medium">Max Score:</span>
                  <span className="ml-2">{exam.maxScore} points</span>
                </div>
                <div>
                  <span className="font-medium">Max XP:</span>
                  <span className="ml-2">{exam.maxXP} XP</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Total Students:</span>
                  <span className="ml-2">{exam.results?.length || 0}</span>
                </div>
                <div>
                  <span className="font-medium">Graded:</span>
                  <span className="ml-2">
                    {exam.results?.filter((r) => r.score > 0).length || 0}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Average Score:</span>
                  <span className="ml-2">
                    {exam.results?.length
                      ? Math.round(
                          (exam.results.reduce((sum, r) => sum + r.score, 0) /
                            exam.results.length) *
                            100,
                        ) / 100
                      : 0}{" "}
                    / {exam.maxScore}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Files Attached:</span>
                  <span className="ml-2">{exam.files?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="files">
          <ExamFiles
            examId={exam.id}
            classId={classId}
            files={exam.files || []}
            onFilesUpdate={fetchExamDetails}
          />
        </TabsContent>

        <TabsContent value="results">
          <ResultsTable
            examId={exam.id}
            classId={classId}
            exam={exam}
            onResultsUpdate={fetchExamDetails}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
