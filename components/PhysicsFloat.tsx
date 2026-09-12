import React from "react";

/**
 * Decorative, animated layer of physics equations drifting/pulsing in the
 * background — the "vibing" modern-tech backdrop. Purely visual: aria-hidden,
 * pointer-events-none, kept to the outer edges so it never collides with
 * centered content.
 */
const EQUATIONS = [
  { text: "E = mc²", top: "6%", left: "4%", rotate: -8, size: "text-3xl md:text-4xl", tint: "text-primary", delay: "0s", duration: "6s" },
  { text: "F = ma", top: "82%", left: "6%", rotate: 6, size: "text-2xl md:text-3xl", tint: "text-secondary", delay: "1s", duration: "7s" },
  { text: "λ = h / p", top: "14%", left: "88%", rotate: 5, size: "text-2xl md:text-3xl", tint: "text-accent", delay: "0.5s", duration: "5.5s" },
  { text: "PV = nRT", top: "78%", left: "90%", rotate: -5, size: "text-xl md:text-2xl", tint: "text-primary", delay: "1.6s", duration: "6.5s" },
  { text: "a² + b² = c²", top: "46%", left: "94%", rotate: 8, size: "text-xl md:text-2xl", tint: "text-secondary", delay: "0.8s", duration: "7.5s" },
  { text: "∇ × E = -∂B/∂t", top: "40%", left: "-2%", rotate: -4, size: "text-lg md:text-xl", tint: "text-accent", delay: "1.2s", duration: "6s" },
];

const PhysicsFloat = ({ className = "" }: { className?: string }) => {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-visible select-none ${className}`}
    >
      {EQUATIONS.map((eq) => (
        <span
          key={eq.text}
          className={`absolute font-bold whitespace-nowrap animate-float-slow ${eq.size} ${eq.tint}`}
          style={{
            top: eq.top,
            left: eq.left,
            opacity: 0.35,
            textShadow: "0 0 24px currentColor",
            animationDelay: eq.delay,
            animationDuration: eq.duration,
            ["--float-rotate" as string]: `${eq.rotate}deg`,
          }}
        >
          {eq.text}
        </span>
      ))}
    </div>
  );
};

export default PhysicsFloat;
