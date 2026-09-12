import React from "react";

/**
 * Empty-state visual: a small "black hole" (accretion glow + event horizon)
 * with a physics-flavored line underneath. Used wherever a list has nothing
 * to show yet (no classes, no schools, ...).
 */
type EmptyStateProps = {
  title: string;
  quote: string;
  action?: React.ReactNode;
  className?: string;
};

const EmptyState = ({ title, quote, action, className = "" }: EmptyStateProps) => {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-border bg-gradient-to-b from-card to-muted/40 py-16 px-6 text-center ${className}`}
    >
      {/* faint orbiting equations, kept subtle behind the hole */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none select-none">
        <span className="absolute top-6 left-8 text-xs font-semibold text-primary/20 rotate-[-8deg]">E = mc²</span>
        <span className="absolute bottom-8 right-10 text-xs font-semibold text-secondary/20 rotate-[6deg]">F = ma</span>
      </div>

      <div className="relative mx-auto w-32 h-32 mb-6">
        {/* accretion disk glow */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/40 via-secondary/25 to-accent/25 blur-2xl animate-pulse" />
        {/* orbit rings */}
        <div className="absolute inset-2 rounded-full border border-primary/25 animate-[spin_18s_linear_infinite]" style={{ borderStyle: "dashed" }} />
        <div className="absolute inset-6 rounded-full border border-secondary/30" />
        {/* event horizon */}
        <div className="absolute inset-10 rounded-full bg-[#05060f] shadow-[0_0_36px_8px_rgba(50,64,205,0.35)]" />
      </div>

      <h3 className="relative text-lg font-bold text-foreground">{title}</h3>
      <p className="relative mt-2 text-sm text-muted-foreground italic max-w-sm mx-auto">{quote}</p>

      {action && <div className="relative mt-6 flex justify-center">{action}</div>}
    </div>
  );
};

export default EmptyState;
