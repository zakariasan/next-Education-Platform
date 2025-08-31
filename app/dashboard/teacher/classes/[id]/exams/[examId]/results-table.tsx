// app/teacher/classes/[id]/exams/[examId]/results-table.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Save, UserCheck, Trophy } from "lucide-react";

type ExamResultWithStudent = {
  id: string | null;
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
  maxScore: number;
  maxXP: number;
};

interface ResultsTableProps {
  examId: string;
  classId: string;
  exam: Exam;
  onResultsUpdate?: () => void;
}

export default function ResultsTable({
  examId,
  classId,
  exam,
  onResultsUpdate,
}: ResultsTableProps) {
  const [results, setResults] = useState<ExamResultWithStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fetchResults = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(
        `/api/teacher/classes/${classId}/exams/${examId}/results`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load results");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchResults();
  }, [examId, classId, fetchResults]);

  const handleScoreChange = (studentId: string, newScore: number) => {
    if (newScore < 0 || newScore > exam.maxScore) return;

    setResults((prev) =>
      prev.map((result) => {
        if (result.studentId === studentId) {
          // Calculate XP based on score percentage
          const xpAwarded = Math.round((newScore / exam.maxScore) * exam.maxXP);
          return {
            ...result,
            score: newScore,
            xpAwarded,
          };
        }
        return result;
      }),
    );
  };

  const handleNotesChange = (studentId: string, notes: string) => {
    setResults((prev) =>
      prev.map((result) =>
        result.studentId === studentId ? { ...result, notes } : result,
      ),
    );
  };

  const saveResults = async () => {
    try {
      setSaving(true);
      setError(null);

      // Prepare results for API
      const resultsToSave = results.map((result) => ({
        studentId: result.studentId,
        score: result.score,
        notes: result.notes,
        oldXP: result.id ? result.xpAwarded : 0, // For XP calculation
      }));

      const response = await fetch(
        `/api/teacher/classes/${classId}/exams/${examId}/results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ results: resultsToSave }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to save results");
      }

      const updatedResults = await response.json();
      setResults(updatedResults);

      if (onResultsUpdate) {
        onResultsUpdate();
      }

      // Show success message
      alert("Results saved successfully!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save results");
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-blue-600";
    if (percentage >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90)
      return (
        <Badge variant="default" className="bg-green-100 text-green-800">
          Excellent
        </Badge>
      );
    if (percentage >= 75)
      return (
        <Badge variant="default" className="bg-blue-100 text-blue-800">
          Good
        </Badge>
      );
    if (percentage >= 60)
      return (
        <Badge variant="default" className="bg-yellow-100 text-yellow-800">
          Average
        </Badge>
      );
    if (score > 0) return <Badge variant="destructive">Poor</Badge>;
    return <Badge variant="outline">Not Graded</Badge>;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading results...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={fetchResults} className="mt-2">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const gradedCount = results.filter((r) => r.score > 0).length;
  const averageScore =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 0;

  return (
    <div className="space-y-4">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium">Students</p>
                <p className="text-2xl font-bold">{results.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium">Graded</p>
                <p className="text-2xl font-bold">{gradedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div>
              <p className="text-sm font-medium">Average Score</p>
              <p
                className={`text-2xl font-bold ${getScoreColor(averageScore, exam.maxScore)}`}
              >
                {Math.round(averageScore * 100) / 100} / {exam.maxScore}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Student Results</CardTitle>
          <Button
            onClick={saveResults}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Results"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Student</TableHead>
                  <TableHead className="w-[120px]">Score</TableHead>
                  <TableHead className="w-[100px]">XP</TableHead>
                  <TableHead className="w-[120px]">Grade</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {results.map((result) => (
                  <TableRow key={result.studentId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{result.student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {result.student.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={exam.maxScore}
                          value={result.score}
                          onChange={(e) =>
                            handleScoreChange(
                              result.studentId,
                              parseInt(e.target.value) || 0,
                            )
                          }
                          className="w-16"
                        />
                        <span className="text-sm text-muted-foreground">
                          / {exam.maxScore}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{result.xpAwarded}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getScoreBadge(result.score, exam.maxScore)}
                    </TableCell>
                    <TableCell>
                      <Textarea
                        value={result.notes || ""}
                        onChange={(e) =>
                          handleNotesChange(result.studentId, e.target.value)
                        }
                        placeholder="Optional notes..."
                        className="min-h-[60px] resize-none"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {results.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                No students enrolled in this class yet.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
