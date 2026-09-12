"use client";
import { useEffect } from "react";

// Tiny particle burst wherever the user clicks/taps. Pure DOM + CSS, no
// re-renders; skipped for reduced-motion users and text inputs.
const COLORS = ["var(--primary)", "var(--secondary)", "var(--accent)", "var(--growth)"];

const ClickSparks = () => {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layer = document.createElement("div");
    layer.className = "pointer-events-none fixed inset-0 z-[100] overflow-hidden";
    layer.setAttribute("aria-hidden", "true");
    document.body.appendChild(layer);

    const burst = (e: PointerEvent) => {
      if (e.button !== 0) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable]")) return;
      const count = 10;
      for (let i = 0; i < count; i++) {
        const s = document.createElement("span");
        const angle = (i / count) * Math.PI * 2 + Math.random() * 0.6;
        const dist = 28 + Math.random() * 34;
        s.className = "spark";
        s.style.left = `${e.clientX}px`;
        s.style.top = `${e.clientY}px`;
        s.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
        s.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
        s.style.setProperty("--c", COLORS[i % COLORS.length]);
        s.style.setProperty("--s", `${4 + Math.random() * 4}px`);
        layer.appendChild(s);
        s.addEventListener("animationend", () => s.remove(), { once: true });
      }
    };
    document.addEventListener("pointerdown", burst);
    return () => {
      document.removeEventListener("pointerdown", burst);
      layer.remove();
    };
  }, []);
  return null;
};

export default ClickSparks;
