// types/exam.ts
export type ExamType = "MIDTERM" | "FINAL" | "LOCAL" | "CUSTOM";
export type ExamFileKind = "STATEMENT" | "CORRECTION" | "RUBRIC" | "OTHER";

export interface ExamFile {
  id: string;
  name: string;
  url: string;
  kind: ExamFileKind;
  createdAt: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ExamResult {
  id: string | null;
  examId: string;
  studentId: string;
  score: number;
  xpAwarded: number;
  notes: string | null;
  student: Student;
  createdAt?: string;
  updatedAt?: string;
}

export interface Exam {
  id: string;
  title: string;
  description: string | null;
  type: ExamType;
  date: string | null;
  maxScore: number;
  maxXP: number;
  classId: string;
  teacherId: string;
  files: ExamFile[];
  results: ExamResult[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateExamData {
  title: string;
  description?: string;
  type: ExamType;
  date?: string;
  maxScore?: number;
  maxXP?: number;
}

export interface UpdateExamData extends Partial<CreateExamData> {
  id: string;
}

export interface ExamStats {
  totalExams: number;
  totalResults: number;
  totalXP: number;
  upcomingExams: number;
  completedExams: number;
  averageScore: number;
}
