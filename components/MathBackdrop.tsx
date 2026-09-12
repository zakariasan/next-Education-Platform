import React from "react";

// Fixed, theme-aware layer of drifting equations behind every dashboard.
// Subject-agnostic mix (physics, maths, chemistry). Fewer items on phones.
const EQUATIONS = [
  { text: "E = mc²", top: "8%", left: "6%", rotate: -8, size: "text-3xl md:text-5xl", tint: "text-primary", delay: "0s", duration: "7s", mobile: true },
  { text: "F = ma", top: "84%", left: "8%", rotate: 6, size: "text-2xl md:text-4xl", tint: "text-secondary", delay: "1.2s", duration: "8s", mobile: true },
  { text: "∇ · E = ρ/ε₀", top: "18%", left: "78%", rotate: 5, size: "text-xl md:text-3xl", tint: "text-accent", delay: "0.6s", duration: "9s", mobile: false },
  { text: "PV = nRT", top: "72%", left: "84%", rotate: -5, size: "text-xl md:text-3xl", tint: "text-primary", delay: "1.8s", duration: "7.5s", mobile: true },
  { text: "∫ f(x) dx", top: "46%", left: "92%", rotate: 8, size: "text-lg md:text-2xl", tint: "text-secondary", delay: "0.9s", duration: "8.5s", mobile: false },
  { text: "T = 2π√(L/g)", top: "56%", left: "2%", rotate: -4, size: "text-lg md:text-2xl", tint: "text-growth", delay: "1.4s", duration: "9.5s", mobile: false },
  { text: "λ = h / p", top: "34%", left: "40%", rotate: 3, size: "text-base md:text-xl", tint: "text-accent", delay: "2s", duration: "10s", mobile: false },
  { text: "e^{iπ} + 1 = 0", top: "92%", left: "52%", rotate: -6, size: "text-lg md:text-2xl", tint: "text-primary", delay: "0.3s", duration: "8s", mobile: true },
];

const MathBackdrop = () => (
  <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none">
    <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-primary/10 blur-[120px]" />
    <div className="absolute top-1/2 -right-40 w-[520px] h-[520px] rounded-full bg-secondary/10 blur-[120px]" />
    {EQUATIONS.map((eq) => (
      <span
        key={eq.text}
        className={`absolute font-bold whitespace-nowrap animate-float-slow ${eq.size} ${eq.tint} ${eq.mobile ? "" : "hidden md:block"}`}
        style={{
          top: eq.top,
          left: eq.left,
          opacity: 0.09,
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

export default MathBackdrop;
