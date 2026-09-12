"use client";
import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, XCircle } from "lucide-react";
import type { QuestionDTO } from "@/lib/quiz/queries";
import type { QuestionResult } from "@/lib/quiz/grade";

export type Answers = Record<string, unknown>;

type Props = {
  questions: QuestionDTO[];
  answers: Answers;
  onChange?: (next: Answers) => void;
  readOnly?: boolean;
  results?: QuestionResult[] | null; // when reviewing
};

const bullet = (multi: boolean, on: boolean, correct?: boolean | null) =>
  `w-5 h-5 shrink-0 border-2 flex items-center justify-center transition-colors ${multi ? "rounded-md" : "rounded-full"} ${
    correct === true ? "border-growth bg-growth text-white" : correct === false ? "border-destructive bg-destructive text-white" : on ? "border-primary bg-primary" : "border-muted-foreground/40 bg-card"
  }`;

const QuizForm = ({ questions, answers, onChange, readOnly = false, results }: Props) => {
  const set = (id: string, v: unknown) => onChange?.({ ...answers, [id]: v });
  const resultOf = (id: string) => results?.find((r) => r.questionId === id) ?? null;

  return (
    <div className="space-y-4">
      {questions.map((q, i) => {
        const r = resultOf(q.id);
        const val = answers[q.id];
        const multi = q.type === "CHECKBOXES";
        const choice = q.type === "MULTIPLE_CHOICE" || q.type === "TRUE_FALSE" || multi;
        const picked = new Set(Array.isArray(val) ? val.map(Number) : typeof val === "number" ? [val] : []);
        return (
          <div key={q.id} className={`rounded-2xl border bg-card p-5 shadow-sm ${r ? (r.correct ? "border-growth/50" : "border-destructive/40") : "border-border"}`}>
            <div className="flex items-start gap-3">
              <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground leading-snug">
                  {q.text} {q.required && !readOnly && <span className="text-destructive">*</span>}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {q.points} pt{q.points === 1 ? "" : "s"}{multi ? " · select all that apply" : ""}
                  {r && <span className={`ml-2 font-semibold ${r.correct ? "text-growth" : "text-destructive"}`}>· {r.earned}/{r.points}</span>}
                </p>
              </div>
              {r && (r.correct ? <CheckCircle2 className="w-5 h-5 text-growth shrink-0" /> : <XCircle className="w-5 h-5 text-destructive shrink-0" />)}
            </div>
            {q.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={q.imageUrl} alt="" className="mt-3 max-h-64 rounded-xl border border-border object-contain" />
            )}
            <div className="mt-4 pl-10 space-y-2">
              {choice &&
                q.options.map((opt, j) => {
                  const on = picked.has(j);
                  const isCorrect = q.correctIndexes.length ? q.correctIndexes.includes(j) : null;
                  const mark = results && isCorrect != null ? (isCorrect ? true : on ? false : null) : null;
                  return (
                    <label key={j} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors ${readOnly ? "" : "cursor-pointer hover:bg-muted/50"} ${on ? "border-primary/60 bg-primary/5" : "border-border"}`}>
                      <input
                        type={multi ? "checkbox" : "radio"}
                        name={q.id}
                        className="sr-only"
                        checked={on}
                        disabled={readOnly}
                        onChange={() => {
                          if (readOnly) return;
                          if (multi) set(q.id, on ? [...picked].filter((x) => x !== j) : [...picked, j]);
                          else set(q.id, j);
                        }}
                      />
                      <span className={bullet(multi, on, mark)} aria-hidden>
                        {(on || mark === true) && <span className={`${multi ? "w-2.5 h-2.5 rounded-sm" : "w-2 h-2 rounded-full"} bg-white`} />}
                      </span>
                      <span className={mark === true ? "font-semibold text-growth" : mark === false ? "text-destructive" : ""}>{opt}</span>
                    </label>
                  );
                })}
              {q.type === "SHORT_ANSWER" && (
                <Textarea rows={2} value={String(val ?? "")} readOnly={readOnly} onChange={(e) => set(q.id, e.target.value)} placeholder="Your answer" className="text-sm" />
              )}
              {q.type === "NUMERIC" && (
                <Input type="number" step="any" value={String(val ?? "")} readOnly={readOnly} onChange={(e) => set(q.id, e.target.value === "" ? "" : Number(e.target.value))} placeholder="Numeric answer" className="max-w-xs" />
              )}
              {results && q.type === "SHORT_ANSWER" && q.correctText && (
                <p className="text-xs text-muted-foreground">Accepted: <span className="font-medium text-growth">{q.correctText.split("|").join(" / ")}</span></p>
              )}
              {results && q.type === "NUMERIC" && q.correctNumber != null && (
                <p className="text-xs text-muted-foreground">Expected: <span className="font-medium text-growth">{q.correctNumber}{q.tolerance ? ` ± ${q.tolerance}` : ""}</span></p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuizForm;
