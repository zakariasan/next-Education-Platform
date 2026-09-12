import React from "react";
import { BookOpen, GraduationCap, Lightbulb, PenTool, Sparkles } from "lucide-react";

/**
 * Decorative, non-interactive layer of faint subject-agnostic education
 * iconography + soft orbit rings. Drop inside a `relative overflow-hidden`
 * container. Purely visual — aria-hidden, never intercepts clicks.
 */
const ICONS = [
  { Icon: BookOpen, top: "90%", left: "3%", rotate: -10, size: "w-10 h-10" },
  { Icon: PenTool, top: "78%", left: "6%", rotate: 12, size: "w-8 h-8" },
  { Icon: GraduationCap, top: "16%", left: "84%", rotate: 8, size: "w-12 h-12" },
  { Icon: Lightbulb, top: "78%", left: "94%", rotate: -6, size: "w-9 h-9" },
  { Icon: Sparkles, top: "45%", left: "95%", rotate: 4, size: "w-7 h-7" },
];

const EduBackdrop = ({ className = "" }: { className?: string }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden select-none ${className}`}
    >
      {ICONS.map(({ Icon, top, left, rotate, size }, i) => (
        <Icon
          key={i}
          className={`absolute text-primary/[0.08] ${size}`}
          style={{ top, left, transform: `rotate(${rotate}deg)` }}
        />
      ))}
      <svg
        className="absolute -top-16 -right-16 w-72 h-72 text-secondary/10"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      <svg
        className="absolute -bottom-20 -left-20 w-64 h-64 text-accent/10"
        viewBox="0 0 100 100"
        fill="none"
      >
        <circle cx="50" cy="50" r="45" stroke="currentColor" strokeWidth="1.5" strokeDasharray="6 6" />
        <circle cx="50" cy="50" r="30" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    </div>
  );
};

export default EduBackdrop;
