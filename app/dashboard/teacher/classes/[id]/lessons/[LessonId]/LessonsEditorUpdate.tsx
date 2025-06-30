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
  status: string,
};
type LessonEditorProps =  {
  lesson: Lesson
}
import { toast } from "sonner";
import { Lesson } from "@prisma/client";


export default function LessonEditorUpdate({lesson}:LessonEditorProps) {
  const [blocks, setBlocks] = useState<Block[]>(JSON.parse(lesson?.content) as Block[]);
  const [title, setTitle] = useState<string>(lesson.title ?? '');
  const [descr, setDescr] = useState(lesson.description ?? '');
  const [status, setStatus] = useState(lesson.status === 'PUBLISHED');

  const classId = lesson?.classId;

  const handleSubmit = async () => {
    const res = await fetch(`/api/lessons/${lesson?.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: descr,
        status: status ? "PUBLISHED" : "DRAFT",
        content: JSON.stringify(blocks),
        classId, 
      }),
    });

    if (res.ok) {
      // redirect or show success
 toast.success("✅ Lesson updated successfully");
    } else {
      // handle error
          toast.error(`❌ Something went wrong`);

    }
  };

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
      <div className="flex justify-between items-center">
      <input
        id="title"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Enter the title"
        className="py-3  text-3xl focus:outline-none focus:ring-none focus:border-transparent"
        required
      />
        <div>
      <input
        id="Description"
        type="text"
        value={descr}
        onChange={(e) => setDescr(e.target.value)}
        placeholder="Enter the Description"
        className="py-3  text-xl focus:outline-none text-gray-400 focus:ring-none focus:border-transparent"
        required
      />
        <span  className="text-gray-400">
      <Switch checked={status} onCheckedChange={()=>setStatus(!status)}   className={status ? "bg-green-500" : "bg-gray-300"}
      
 /> {status? "PUBLISH": "DRAFT"}
 </span>
 </div>
</div>
      <Editor
        blocks={blocks}
        setBlocks={setBlocks}
        initialContent={blocks}
        editable={true}
      />
      <div className="flex justify-end mt-6 gap-4">
        <Button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-600 text-semibold text-white cursor-pointer rounded hover:bg-blue-700"
        >
          Update Draft
        </Button>
      </div>
    </div>
  );
}
