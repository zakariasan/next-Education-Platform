"use client";
import React from "react";
import katex from "katex";
import "katex/dist/katex.min.css";

// Tiny markdown subset (headings, lists, paragraphs, bold, code) with
// $inline$ and $$display$$ KaTeX. Enough for project statements without
// pulling in a markdown dependency.

function tex(src: string, displayMode: boolean) {
  return katex.renderToString(src, { throwOnError: false, displayMode, output: "html" });
}

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /(\$[^$\n]+?\$)|(\*\*[^*]+?\*\*)|(`[^`]+?`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const k = `${keyPrefix}-${i++}`;
    if (tok.startsWith("$")) {
      out.push(<span key={k} dangerouslySetInnerHTML={{ __html: tex(tok.slice(1, -1), false) }} />);
    } else if (tok.startsWith("**")) {
      out.push(<strong key={k}>{tok.slice(2, -2)}</strong>);
    } else {
      out.push(
        <code key={k} className="rounded bg-muted px-1 py-0.5 text-[0.85em] font-mono">
          {tok.slice(1, -1)}
        </code>,
      );
    }
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

type Block =
  | { type: "h"; level: number; text: string }
  | { type: "p"; text: string }
  | { type: "ol" | "ul"; items: string[] }
  | { type: "math"; text: string };

function parseBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n");
  const blocks: Block[] = [];
  let para: string[] = [];
  const flush = () => {
    if (para.length) blocks.push({ type: "p", text: para.join(" ") });
    para = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const t = line.trim();
    if (!t) {
      flush();
      continue;
    }
    const h = /^(#{1,3})\s+(.*)$/.exec(t);
    if (h) {
      flush();
      blocks.push({ type: "h", level: h[1].length, text: h[2] });
      continue;
    }
    if (t.startsWith("$$") && t.endsWith("$$") && t.length > 4) {
      flush();
      blocks.push({ type: "math", text: t.slice(2, -2) });
      continue;
    }
    const ol = /^\d+[.)]\s+(.*)$/.exec(t);
    const ul = /^[-*]\s+(.*)$/.exec(t);
    if (ol || ul) {
      flush();
      const type = ol ? "ol" : "ul";
      const last = blocks[blocks.length - 1];
      const item = (ol ?? ul)![1];
      if (last && last.type === type) last.items.push(item);
      else blocks.push({ type, items: [item] });
      continue;
    }
    para.push(t);
  }
  flush();
  return blocks;
}

const MathMarkdown = ({ source, className = "" }: { source: string; className?: string }) => {
  const blocks = React.useMemo(() => parseBlocks(source), [source]);
  return (
    <div className={`space-y-3 text-[15px] leading-relaxed text-foreground ${className}`}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h": {
            const cls =
              b.level === 1
                ? "text-2xl font-bold tracking-tight"
                : b.level === 2
                  ? "text-xl font-bold tracking-tight"
                  : "text-base font-semibold";
            return (
              <p key={i} className={`${cls} mt-2`}>
                {renderInline(b.text, `h${i}`)}
              </p>
            );
          }
          case "math":
            return <div key={i} className="overflow-x-auto py-1" dangerouslySetInnerHTML={{ __html: tex(b.text, true) }} />;
          case "ol":
          case "ul": {
            const Tag = b.type;
            return (
              <Tag key={i} className={`${b.type === "ol" ? "list-decimal" : "list-disc"} pl-6 space-y-1.5 marker:text-primary marker:font-semibold`}>
                {b.items.map((it, j) => (
                  <li key={j}>{renderInline(it, `l${i}-${j}`)}</li>
                ))}
              </Tag>
            );
          }
          default:
            return <p key={i}>{renderInline(b.text, `p${i}`)}</p>;
        }
      })}
    </div>
  );
};

export default MathMarkdown;
