"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { Block, PartialBlock } from "@blocknote/core";

// The editor pulls in the whole BlockNote bundle and touches the DOM on mount,
// so it is loaded client-side only, exactly as the teacher editor does.
const Editor = dynamic(() => import("@/app/dashboard/teacher/classes/[id]/(components)/Editor"), {
  ssr: false,
  loading: () => <p className="text-sm text-muted-foreground animate-pulse">Opening the note…</p>,
});

/**
 * Read-only view of a note's body.
 *
 * Notes are written in BlockNote, which stores an array of blocks as JSON. The
 * same component renders them for students with `editable` off, so the two
 * views can never drift apart.
 */
const NoteReader = ({ content }: { content: string | null }) => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  let parsed: PartialBlock[] | undefined;
  if (content) {
    try {
      const value = JSON.parse(content);
      if (Array.isArray(value) && value.length > 0) parsed = value as PartialBlock[];
    } catch {
      // Older notes may hold plain text or HTML rather than block JSON.
      return (
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{content}</div>
      );
    }
  }

  if (!parsed) {
    return <p className="text-sm text-muted-foreground">This note is empty.</p>;
  }

  return (
    <div className="note-reader -mx-4">
      <Editor initialContent={parsed} blocks={blocks} setBlocks={setBlocks} editable={false} />
    </div>
  );
};

export default NoteReader;
