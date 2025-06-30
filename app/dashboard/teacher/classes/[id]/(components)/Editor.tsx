"use client";
import { Block, BlockNoteEditor, PartialBlock } from "@blocknote/core";
import {
  useCreateBlockNote,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import React from "react";
import { uploadFiles } from "@/lib/uploadthing";
import { Dispatch, SetStateAction } from "react";



interface EditorProps {
  initialContent?: PartialBlock[];
  blocks: Block[];
  setBlocks: Dispatch<SetStateAction<Block[]>>;
  editable?: boolean;
}
const Editor: React.FC<EditorProps> = ({
  initialContent,
  blocks,
  setBlocks,
  editable,
}) => {
  const editor: BlockNoteEditor = useCreateBlockNote({
    initialContent: initialContent
      ? initialContent as PartialBlock[]
      : undefined,
    uploadFile: async (file: File) => {
      const [res] = await uploadFiles('imageUploader', {files:[file]})
      return res.url
    },
  });
  return <BlockNoteView editor={editor} editable={editable} onChange={ ()=> {setBlocks(editor.document)}} theme='light'/>;
};

export default Editor;
