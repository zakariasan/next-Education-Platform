// app/teacher/classes/[id]/exams/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Plus,
  FileText,
  Users,
  Trophy,
  Calendar,
  MoreHorizontal,
  Eye,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Exam = {
  id: string;
  title: string;
  description: string | null;
  type: string;
  date: string | null;
  maxScore: number;
  maxXP: number;
  files: Array<{ id: string }>;
  results: Array<{ id: string; score: number }>;
  createdAt: string;
};

export default function ExamsList() {
  const params = useParams<{ id: string }>();
  const classId = params.id;
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/teacher/classes/${classId}/exams`);

      if (!response.ok) {
        throw new Error("Failed to fetch exams");
      }

      const data = await response.json();
      setExams(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exams");
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchExams();
  }, [classId, fetchExams]);

  const handleDeleteExam = async (examId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this exam? This action cannot be undone.",
      )
    ) {
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/classes/${classId}/exams/${examId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Failed to delete exam");
      }

      // Refresh the list
      fetchExams();
      alert("Exam deleted successfully!");
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete exam");
    }
  };

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

  const getStatusBadge = (exam: Exam) => {
    const gradedCount = exam.results.filter((r) => r.score > 0).length;
    const totalResults = exam.results.length;

    if (totalResults === 0) {
      return <Badge variant="outline">No Students</Badge>;
    }

    if (gradedCount === 0) {
      return <Badge variant="outline">Not Graded</Badge>;
    }

    if (gradedCount === totalResults) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Completed
        </Badge>
      );
    }

    return (
      <Badge variant="default" className="bg-yellow-100 text-yellow-800">
        In Progress ({gradedCount}/{totalResults})
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading exams...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button onClick={fetchExams} className="mt-2">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6 bg-background">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-destructive" />
            Exams
          </h1>
          <p className="text-muted-foreground">
            Manage exams and track student performance
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/dashboard/teacher/classes/${classId}/exams/new`)
          }
          className="flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Exam
        </Button>
      </div>

      {/* Statistics Cards */}
      {exams.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">Total Exams</p>
                  <p className="text-2xl font-bold">{exams.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-secondary" />
                <div>
                  <p className="text-sm font-medium">Total Results</p>
                  <p className="text-2xl font-bold">
                    {exams.reduce((sum, exam) => sum + exam.results.length, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm font-medium">Total XP Available</p>
                  <p className="text-2xl font-bold">
                    {exams.reduce((sum, exam) => sum + exam.maxXP, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Upcoming</p>
                  <p className="text-2xl font-bold">
                    {
                      exams.filter(
                        (exam) => exam.date && new Date(exam.date) > new Date(),
                      ).length
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Exams Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Exams</CardTitle>
        </CardHeader>
        <CardContent>
          {exams.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No exams yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first exam to get started with student assessment.
              </p>
              <Button
                onClick={() =>
                  router.push(`/dashboard/teacher/classes/${classId}/exams/new`)
                }
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create First Exam
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Files</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {exams.map((exam) => (
                    <TableRow
                      key={exam.id}
                      className="cursor-pointer hover:bg-muted/50"
                    >
                      <TableCell
                        onClick={() =>
                          router.push(
                            `/dashboard/teacher/classes/${classId}/exams/${exam.id}`,
                          )
                        }
                      >
                        <div>
                          <p className="font-medium">{exam.title}</p>
                          {exam.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {exam.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() =>
                          router.push(
                            `/dashboard/teacher/classes/${classId}/exams/${exam.id}`,
                          )
                        }
                      >
                        <Badge variant={getTypeColor(exam.type)}>
                          {exam.type}
                        </Badge>
                      </TableCell>
                      <TableCell
                        onClick={() =>
                          router.push(
                            `/dashboard/teacher/classes/${classId}/exams/${exam.id}`,
                          )
                        }
                      >
                        {exam.date ? (
                          <div>
                            <p className="font-medium">
                              {format(new Date(exam.date), "MMM d, yyyy")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(exam.date), "h:mm a")}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            No date set
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        onClick={() =>
                          router.push(
                            `/dashboard/teacher/classes/${classId}/exams/${exam.id}`,
                          )
                        }
                      >
                        <div>
                          <p className="font-medium">{exam.maxScore} pts</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Trophy className="h-3 w-3" />
                            {exam.maxXP} XP
                          </p>
                        </div>
                      </TableCell>
                      <TableCell
                        onClick={() =>
                          router.push(
                            `/dashboard/teacher/classes/${classId}/exams/${exam.id}`,
                          )
                        }
                      >
                        <Badge variant="outline">
                          {exam.files.length} files
                        </Badge>
                      </TableCell>
                      <TableCell
                        onClick={() =>
                          router.push(
                            `/dashboard/teacher/classes/${classId}/exams/${exam.id}`,
                          )
                        }
                      >
                        {getStatusBadge(exam)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/teacher/classes/${classId}/exams/${exam.id}`,
                                )
                              }
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                router.push(
                                  `/dashboard/teacher/classes/${classId}/exams/${exam.id}?tab=results`,
                                )
                              }
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Grade Results
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteExam(exam.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
