"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Block, PartialBlock } from "@blocknote/core";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
type editorProps = {
  blocks: Block[];
  setBlocksAction: React.Dispatch<React.SetStateAction<Block[]>>;
  title: string;
  setTitleAction: React.Dispatch<React.SetStateAction<string>>;
};
import { useParams } from "next/navigation";
import { toast } from "sonner";

export default function LessonEditor() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [title, setTitle] = useState("");
  const [descr, setDescr] = useState("");
  const [status, setStatus] = useState(false);
  const params = useParams();
  const classId = params.id as string;

  const handleSubmit = async () => {
    const res = await fetch("/api/lessons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: descr,
        status: status ? "PUBLISHED" : "DRAFT",
        content: JSON.stringify(blocks),
        classId, // from context, session, or props
      }),
    });

    console.log(res);
    if (res.ok) {
      // redirect or show success
      toast.success("Lesson Created ");
    } else {
      // handle error
      toast.error("Lesson Creation failed ");
    }
  };

  const initialContent: PartialBlock[] = [
    {
      type: "heading",
      content: "Welcome Teacher to this demo!",
    },
    {
      type: "heading",
      content: "This is a heading block",
    },
    {
      type: "paragraph",
      content: "This is a paragraph block",
    },
    {
      type: "paragraph",

      content: "Try Write your lesson here",
    },
  ];

  const Editor = useMemo(
    () =>
      dynamic(
        () =>
          import("@/app/dashboard/teacher/classes/[id]/(components)/Editor"),
        { ssr: false },
      ),
    [],
  );
  return (
    <div className="w-full mx-auto p-6 mt-4 bg-white shadow-xl rounded-xl ">
      <div className="flex justify-between">
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter the title"
          className="py-3 py-2 text-3xl focus:outline-none focus:ring-none focus:border-transparent"
          required
        />
        <div>
          <input
            id="Description"
            type="text"
            value={descr}
            onChange={(e) => setDescr(e.target.value)}
            placeholder="Enter the Description"
            className="py-3 text-gray-400 text-xl focus:outline-none focus:ring-none focus:border-transparent"
            required
          />
          <span className="text-gray-400">
            <Switch checked={status} onCheckedChange={() => setStatus(!status)} className={status ? "bg-green-500" : "bg-gray-300"}
            /> {status ? "PUBLISH" : "DRAFT"}
          </span>
        </div>
      </div>
      <Editor
        blocks={blocks}
        setBlocks={setBlocks}
        initialContent={initialContent}
        editable={true}
      />
      <div className="flex justify-end mt-6 gap-4">
        <Button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-semibold text-white cursor-pointer rounded hover:bg-blue-700"
        >
          Save Draft
        </Button>
      </div>
    </div>
  );
}
