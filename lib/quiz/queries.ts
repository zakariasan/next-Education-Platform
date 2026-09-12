import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { QuestionType } from "./grade";

export const quizInclude = {
  questions: { orderBy: { orderIndex: "asc" as const } },
  lesson: { select: { id: true, title: true } },
  module: { select: { id: true, title: true } },
  project: { select: { id: true, currentVersion: { select: { title: true } } } },
  class: { select: { id: true, name: true } },
  _count: { select: { attempts: true, questions: true } },
} satisfies Prisma.QuizInclude;

type QuizRow = Prisma.QuizGetPayload<{ include: typeof quizInclude }>;

export type QuestionDTO = {
  id: string;
  type: QuestionType;
  text: string;
  imageUrl: string | null;
  points: number;
  required: boolean;
  orderIndex: number;
  options: string[];
  correctIndexes: number[];
  correctText: string | null;
  correctNumber: number | null;
  tolerance: number | null;
};

export type QuizDTO = {
  id: string;
  title: string;
  description: string | null;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  classId: string;
  className: string;
  lessonId: string | null;
  lessonTitle: string | null;
  moduleId: string | null;
  moduleTitle: string | null;
  projectId: string | null;
  projectTitle: string | null;
  dueDate: string | null;
  duration: number | null;
  xpReward: number;
  showAnswers: boolean;
  questionCount: number;
  attemptCount: number;
  maxScore: number;
  questions: QuestionDTO[];
  createdAt: string;
  updatedAt: string;
};

export function serializeQuestion(q: QuizRow["questions"][number], withAnswers: boolean): QuestionDTO {
  return {
    id: q.id,
    type: q.type,
    text: q.text,
    imageUrl: q.imageUrl,
    points: q.points,
    required: q.required,
    orderIndex: q.orderIndex,
    options: (q.options as string[] | null) ?? [],
    correctIndexes: withAnswers ? q.correctIndexes : [],
    correctText: withAnswers ? q.correctText : null,
    correctNumber: withAnswers ? q.correctNumber : null,
    tolerance: withAnswers ? q.tolerance : null,
  };
}

export function serializeQuiz(q: QuizRow, withAnswers: boolean): QuizDTO {
  return {
    id: q.id,
    title: q.title,
    description: q.description,
    status: q.status,
    classId: q.class.id,
    className: q.class.name,
    lessonId: q.lessonId,
    lessonTitle: q.lesson?.title ?? null,
    moduleId: q.moduleId,
    moduleTitle: q.module?.title ?? null,
    projectId: q.projectId,
    projectTitle: q.project?.currentVersion?.title ?? null,
    dueDate: q.dueDate?.toISOString() ?? null,
    duration: q.duration,
    xpReward: q.xpReward,
    showAnswers: q.showAnswers,
    questionCount: q._count.questions,
    attemptCount: q._count.attempts,
    maxScore: q.questions.reduce((s, x) => s + Math.max(0, x.points), 0),
    questions: q.questions.map((x) => serializeQuestion(x, withAnswers)),
    createdAt: q.createdAt.toISOString(),
    updatedAt: q.updatedAt.toISOString(),
  };
}

export async function teacherQuiz(quizId: string, classId: string) {
  return prisma.quiz.findFirst({ where: { id: quizId, classId }, include: quizInclude });
}
