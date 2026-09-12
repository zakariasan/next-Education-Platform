import React from "react";
import { BookOpen, Calculator, FlaskConical, Globe, PenTool, Atom } from "lucide-react";

/**
 * Decorative, non-interactive layer of gently floating subject icons
 * (math, science, language, reading...). Drop inside a `relative` container
 * sized to taste. Purely visual — aria-hidden, never intercepts clicks.
 * Kept to the outer edges so it never collides with centered content.
 */
const ICONS = [
  { Icon: BookOpen, top: "4%", left: "2%", tint: "text-primary/25", size: "w-9 h-9", delay: "0s", rotate: "-8deg" },
  { Icon: Calculator, top: "82%", left: "4%", tint: "text-secondary/25", size: "w-8 h-8", delay: "1.2s", rotate: "6deg" },
  { Icon: FlaskConical, top: "10%", left: "94%", tint: "text-accent/30", size: "w-9 h-9", delay: "0.6s", rotate: "10deg" },
  { Icon: Globe, top: "88%", left: "92%", tint: "text-primary/20", size: "w-8 h-8", delay: "1.8s", rotate: "-6deg" },
  { Icon: PenTool, top: "45%", left: "-2%", tint: "text-secondary/20", size: "w-7 h-7", delay: "0.9s", rotate: "12deg" },
  { Icon: Atom, top: "50%", left: "100%", tint: "text-accent/25", size: "w-8 h-8", delay: "1.5s", rotate: "-10deg" },
];

const FloatingIcons = ({ className = "" }: { className?: string }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-visible select-none ${className}`}
    >
      {ICONS.map(({ Icon, top, left, tint, size, delay, rotate }, i) => (
        <Icon
          key={i}
          className={`absolute animate-float-slow ${size} ${tint}`}
          style={{
            top,
            left,
            animationDelay: delay,
            ["--float-rotate" as string]: rotate,
          }}
        />
      ))}
    </div>
  );
};

export default FloatingIcons;
