"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Boxes, Check, ClipboardList, FileBadge, Hourglass, Lock, Maximize2, Minus, Play, Plus, Pin, Puzzle, X as XIcon } from "lucide-react";
import type { GraphPayload } from "@/lib/gamification/types";
import type { NodeState } from "@/lib/gamification/graph";
import { KIND_LABEL, type NodeKind } from "@/lib/gamification/nodes";
import { HG, layoutNodes, tracePath, type Positioned } from "@/lib/gamification/layout";

/** `nodeId` is a node key such as "PROJECT:ckx...", matching GraphNode.id. */
export type Surge = { nodeId: string; xp: number; unlocked: string[]; at: number };

type Props = {
  graph: GraphPayload;
  selectedId?: string | null;
  onSelect: (id: string) => void;
  surge?: Surge | null;
  editable?: boolean;
  onPin?: (id: string, pin: { x: number; y: number } | null) => void;
  className?: string;
};

const STATE_LABEL: Record<NodeState, string> = {
  locked: "locked",
  available: "available",
  in_progress: "in progress",
  validated: "validated",
  failed: "failed — retry available",
};

const STATE_ICON: Record<NodeState, React.ElementType> = {
  locked: Lock,
  available: Play,
  in_progress: Hourglass,
  validated: Check,
  failed: XIcon,
};

const STATE_COLOR: Record<NodeState, string> = {
  locked: "var(--hg-locked)",
  available: "var(--hg-available)",
  in_progress: "var(--hg-progress)",
  validated: "var(--hg-power)",
  failed: "var(--hg-failed)",
};

// Each node kind gets its own silhouette and marker so a glance tells a project
// from an exam from a quiz, independently of the state colour.
const KIND_ICON: Record<NodeKind, React.ElementType> = {
  PROJECT: Puzzle,
  EXAM: FileBadge,
  QUIZ: ClipboardList,
  MODULE: Boxes,
};

/** Corner radius of a node body. Exams are sharp, quizzes are pill-shaped. */
function bodyRadius(kind: NodeKind, isCore: boolean, h: number) {
  if (kind === "EXAM") return 4;
  if (kind === "QUIZ") return h / 2;
  // Modules are the heaviest thing on a board, so they get the boldest corners.
  if (kind === "MODULE") return 20;
  return isCore ? 14 : h / 2;
}

const HolyGraph = ({ graph, selectedId, onSelect, surge, editable = false, onPin, className = "" }: Props) => {
  const { placed, width, height } = useMemo(() => layoutNodes(graph.nodes), [graph.nodes]);
  const byId = useMemo(() => new Map(placed.map((p) => [p.id, p])), [placed]);
  const validated = useMemo(() => new Set(placed.filter((p) => p.state === "validated").map((p) => p.id)), [placed]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const view = useRef({ x: 0, y: 0, k: 1 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const drag = useRef<{ kind: "pan"; sx: number; sy: number; ox: number; oy: number } | { kind: "node"; id: string; sx: number; sy: number; ox: number; oy: number; moved: boolean } | null>(null);
  const pinch = useRef<{ d: number; k: number } | null>(null);
  const [localPos, setLocalPos] = useState<Record<string, { x: number; y: number }>>({});
  const [zoomLabel, setZoomLabel] = useState(100);

  const apply = useCallback(() => {
    const v = view.current;
    if (gRef.current) gRef.current.setAttribute("transform", `translate(${v.x} ${v.y}) scale(${v.k})`);
    setZoomLabel(Math.round(v.k * 100));
  }, []);

  const fit = useCallback(() => {
    const el = wrapRef.current;
    if (!el) return;
    const { clientWidth: w, clientHeight: h } = el;
    const k = Math.min(1.15, Math.max(0.25, Math.min(w / width, h / height)));
    view.current = { x: (w - width * k) / 2, y: (h - height * k) / 2, k };
    apply();
  }, [width, height, apply]);

  useEffect(() => {
    fit();
    const ro = new ResizeObserver(() => fit());
    if (wrapRef.current) ro.observe(wrapRef.current);
    return () => ro.disconnect();
  }, [fit]);

  const zoomBy = (factor: number, cx?: number, cy?: number) => {
    const el = wrapRef.current;
    if (!el) return;
    const v = view.current;
    const px = cx ?? el.clientWidth / 2;
    const py = cy ?? el.clientHeight / 2;
    const k = Math.min(2.5, Math.max(0.2, v.k * factor));
    view.current = { k, x: px - ((px - v.x) * k) / v.k, y: py - ((py - v.y) * k) / v.k };
    apply();
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = wrapRef.current!.getBoundingClientRect();
    zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - rect.left, e.clientY - rect.top);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { d: Math.hypot(a.x - b.x, a.y - b.y), k: view.current.k };
      drag.current = null;
      return;
    }
    const target = (e.target as Element).closest("[data-node-id]") as Element | null;
    if (editable && target) {
      const id = target.getAttribute("data-node-id")!;
      const p = byId.get(id)!;
      const cur = localPos[id] ?? { x: p.x, y: p.y };
      drag.current = { kind: "node", id, sx: e.clientX, sy: e.clientY, ox: cur.x, oy: cur.y, moved: false };
    } else {
      drag.current = { kind: "pan", sx: e.clientX, sy: e.clientY, ox: view.current.x, oy: view.current.y };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (pointers.current.has(e.pointerId)) pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      const rect = wrapRef.current!.getBoundingClientRect();
      const cx = (a.x + b.x) / 2 - rect.left;
      const cy = (a.y + b.y) / 2 - rect.top;
      const k = Math.min(2.5, Math.max(0.2, (pinch.current.k * d) / pinch.current.d));
      const v = view.current;
      view.current = { k, x: cx - ((cx - v.x) * k) / v.k, y: cy - ((cy - v.y) * k) / v.k };
      apply();
      return;
    }
    const d = drag.current;
    if (!d) return;
    if (d.kind === "pan") {
      view.current = { ...view.current, x: d.ox + (e.clientX - d.sx), y: d.oy + (e.clientY - d.sy) };
      apply();
    } else {
      const dx = (e.clientX - d.sx) / view.current.k;
      const dy = (e.clientY - d.sy) / view.current.k;
      if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
      setLocalPos((lp) => ({ ...lp, [d.id]: { x: d.ox + dx, y: d.oy + dy } }));
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    const d = drag.current;
    drag.current = null;
    if (d?.kind === "node" && d.moved && onPin) {
      const pos = localPos[d.id];
      if (pos) onPin(d.id, { x: pos.x / width, y: pos.y / height });
    }
  };

  const posOf = (p: Positioned) => localPos[p.id] ?? { x: p.x, y: p.y };

  const isSurging = surge && Date.now() - surge.at < 4000;
  const surgeEdges = new Set<string>();
  if (isSurging) for (const e of graph.edges) if (e.from === surge!.nodeId && surge!.unlocked.includes(e.to)) surgeEdges.add(`${e.from}->${e.to}`);

  return (
    <div
      ref={wrapRef}
      className={`hg-board relative w-full overflow-hidden rounded-3xl border border-border select-none touch-none ${className}`}
      style={{
        background: "var(--hg-substrate)",
        backgroundImage: "linear-gradient(var(--hg-grid) 1px, transparent 1px), linear-gradient(90deg, var(--hg-grid) 1px, transparent 1px)",
        backgroundSize: "28px 28px",
        cursor: editable ? "grab" : "grab",
      }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <svg className="absolute inset-0 w-full h-full" role="group" aria-label={`Holy Graph of ${graph.module.title}`}>
        <defs>
          <filter id="hg-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g ref={gRef}>
          {/* Traces */}
          {graph.edges.map((e) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            const pa = { ...a, ...posOf(a) };
            const pb = { ...b, ...posOf(b) };
            const d = tracePath(pa, pb);
            const core = a.isCore && b.isCore;
            const powered = validated.has(e.from) && (b.state === "available" || b.state === "in_progress" || b.state === "validated" || b.state === "failed");
            const key = `${e.from}->${e.to}`;
            const surging = surgeEdges.has(key);
            return (
              <g key={key}>
                <path d={d} fill="none" stroke={core ? "var(--hg-trace)" : "var(--hg-trace-elective)"} strokeWidth={core ? 6 : 3} strokeLinecap="round" strokeDasharray={core ? undefined : "10 8"} opacity={b.state === "locked" && !surging ? 0.55 : 0.9} />
                {(powered || surging) && (
                  <path d={d} fill="none" stroke="var(--hg-power)" strokeWidth={core ? 3 : 2} strokeLinecap="round" className={surging ? "hg-edge-surge" : "hg-edge-powered"} filter={surging ? "url(#hg-glow)" : undefined} />
                )}
              </g>
            );
          })}

          {/* Components */}
          {placed.map((p) => {
            const { x, y } = posOf(p);
            const color = STATE_COLOR[p.state];
            const Icon = STATE_ICON[p.state];
            const selected = selectedId === p.id;
            const ignite = isSurging && (surge!.unlocked.includes(p.id) || surge!.nodeId === p.id);
            const pinned = p.pinX != null;
            return (
              <g
                key={p.id}
                data-node-id={p.id}
                transform={`translate(${x} ${y})`}
                role="button"
                tabIndex={0}
                aria-label={`${KIND_LABEL[p.kind]}: ${p.title}, ${p.isCore ? "core" : "elective"}, ${STATE_LABEL[p.state]}`}
                onClick={() => {
                  if (drag.current?.kind === "node" && drag.current.moved) return;
                  onSelect(p.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onSelect(p.id);
                  }
                }}
                className={`cursor-pointer outline-none focus-visible:[&>rect:first-of-type]:stroke-[var(--ring)] ${ignite ? "hg-ignite" : ""} ${p.state === "failed" ? "hg-failed-flicker" : ""}`}
                style={{ opacity: p.state === "locked" ? 0.72 : 1 }}
              >
                {/* Glow for lit components */}
                {p.state === "validated" && (
                  <rect x={-6} y={-6} width={HG.nodeW + 12} height={HG.nodeH + 12} rx={bodyRadius(p.kind, p.isCore, HG.nodeH) + 4} fill={color} opacity={0.25} filter="url(#hg-glow)" />
                )}
                {p.state === "available" && (
                  <circle cx={HG.nodeW / 2} cy={HG.nodeH / 2} r={30} fill="none" stroke={color} strokeWidth={2} className="hg-ring-pulse" />
                )}
                {/* Chip pins (core) */}
                {p.kind === "PROJECT" && p.isCore && (
                  <g fill="var(--hg-chip-stroke)" opacity={0.8}>
                    {[0.25, 0.5, 0.75].map((t) => (
                      <React.Fragment key={t}>
                        <rect x={-8} y={HG.nodeH * t - 3} width={8} height={6} rx={1} />
                        <rect x={HG.nodeW} y={HG.nodeH * t - 3} width={8} height={6} rx={1} />
                      </React.Fragment>
                    ))}
                  </g>
                )}
                {/* Body */}
                <rect
                  width={HG.nodeW}
                  height={HG.nodeH}
                  rx={bodyRadius(p.kind, p.isCore, HG.nodeH)}
                  fill="var(--hg-chip)"
                  stroke={selected ? "var(--hg-available)" : p.state === "locked" ? "var(--hg-locked)" : color}
                  strokeWidth={selected ? 4 : 2.5}
                  strokeDasharray={p.state === "locked" ? "6 5" : undefined}
                  className={p.state === "in_progress" ? "hg-progress-dash" : ""}
                />
                {/* State badge */}
                <g transform={`translate(14 ${HG.nodeH / 2 - 16})`}>
                  <rect width={32} height={32} rx={p.isCore ? 8 : 16} fill={color} opacity={p.state === "locked" ? 0.35 : 1} />
                  <foreignObject x={0} y={0} width={32} height={32}>
                    <div className="w-8 h-8 flex items-center justify-center text-white">
                      <Icon className="w-4 h-4" strokeWidth={3} />
                    </div>
                  </foreignObject>
                </g>
                {/* Labels */}
                <foreignObject x={54} y={10} width={HG.nodeW - 62} height={HG.nodeH - 20}>
                  <div className="h-full flex flex-col justify-center pr-1">
                    <p className="text-[13px] font-bold leading-tight line-clamp-2" style={{ color: "var(--hg-text)" }}>{p.title}</p>
                    <p className="text-[10px] font-semibold mt-1 tracking-wide" style={{ color: "var(--hg-muted)" }}>
                      {KIND_LABEL[p.kind].toLowerCase()}
                      {p.estimatedHours > 0 ? ` · ${p.estimatedHours}h` : ""} · {p.xpReward} XP
                      {p.kind === "PROJECT" && !p.isCore ? " · elective" : ""}
                    </p>
                  </div>
                </foreignObject>
                {/* Kind marker */}
                <g transform={`translate(${HG.nodeW - 26} 8)`}>
                  <foreignObject x={0} y={0} width={18} height={18}>
                    <div className="w-[18px] h-[18px] flex items-center justify-center" style={{ color: "var(--hg-muted)" }}>
                      {React.createElement(KIND_ICON[p.kind], { className: "w-3.5 h-3.5" })}
                    </div>
                  </foreignObject>
                </g>
                {editable && pinned && (
                  <foreignObject x={HG.nodeW - 22} y={-10} width={20} height={20}>
                    <div className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center shadow"><Pin className="w-3 h-3" /></div>
                  </foreignObject>
                )}
                {/* XP float on validation */}
                {isSurging && surge!.nodeId === p.id && surge!.xp > 0 && (
                  <text x={HG.nodeW / 2} y={-8} textAnchor="middle" fontSize={20} fontWeight={800} fill="var(--hg-power)" className="hg-xp-float" style={{ paintOrder: "stroke", stroke: "var(--hg-substrate)", strokeWidth: 4 }}>
                    +{surge!.xp} XP
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>

      {/* Controls */}
      <div className="absolute right-3 top-3 flex flex-col gap-1 rounded-xl bg-card/90 backdrop-blur border border-border p-1 shadow-sm">
        <button aria-label="Zoom in" onClick={() => zoomBy(1.25)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><Plus className="w-4 h-4" /></button>
        <button aria-label="Zoom out" onClick={() => zoomBy(0.8)} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><Minus className="w-4 h-4" /></button>
        <button aria-label="Fit to view" onClick={fit} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center"><Maximize2 className="w-4 h-4" /></button>
        <span className="text-[10px] text-center text-muted-foreground font-mono">{zoomLabel}%</span>
      </div>

      {/* Legend */}
      <div className="absolute left-3 bottom-3 flex flex-wrap gap-x-3 gap-y-1 rounded-xl bg-card/90 backdrop-blur border border-border px-3 py-2 text-[11px] text-muted-foreground shadow-sm max-w-[calc(100%-1.5rem)]">
        {(Object.keys(STATE_LABEL) as NodeState[]).map((s) => {
          const Icon = STATE_ICON[s];
          return (
            <span key={s} className="flex items-center gap-1">
              <span className="w-4 h-4 rounded flex items-center justify-center text-white" style={{ background: STATE_COLOR[s] }}><Icon className="w-2.5 h-2.5" strokeWidth={3} /></span>
              {STATE_LABEL[s].split(" — ")[0]}
            </span>
          );
        })}
        {(Object.keys(KIND_LABEL) as NodeKind[]).map((k) => {
          const Icon = KIND_ICON[k];
          return (
            <span key={k} className="flex items-center gap-1">
              <Icon className="w-3 h-3" /> {KIND_LABEL[k].toLowerCase()}
            </span>
          );
        })}
        <span className="flex items-center gap-1"><span className="w-5 h-1.5 rounded bg-[var(--hg-trace)]" /> core rail</span>
        <span className="flex items-center gap-1"><span className="w-5 h-0.5 border-t-2 border-dashed border-[var(--hg-trace-elective)]" /> elective</span>
        {editable && <span className="flex items-center gap-1"><Pin className="w-3 h-3" /> drag to pin</span>}
      </div>
    </div>
  );
};

export default HolyGraph;
