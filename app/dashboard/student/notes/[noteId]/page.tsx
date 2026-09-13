import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/gamification/access";
import NoteReader from "@/components/notes/NoteReader";

type Ctx = { params: Promise<{ noteId: string }> };

export default async function Page({ params }: Ctx) {
  const { noteId } = await params;
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  // A student may read a note only when it is published and belongs to a class
  // they are enrolled in. Both conditions are in the query, so an unrelated or
  // draft note is simply not found.
  const note = await prisma.lesson.findFirst({
    where: {
      id: noteId,
      status: "PUBLISHED",
      class: { students: { some: { id: user.id } } },
    },
    include: {
      class: { select: { name: true } },
      teacher: { select: { name: true } },
      materials: true,
    },
  });
  if (!note) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link
        href="/dashboard/student/notes"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All notes
      </Link>

      <div>
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold">
          {note.class.name} · {note.teacher.name}
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mt-1">{note.title}</h1>
        {note.description && <p className="text-muted-foreground mt-1">{note.description}</p>}
      </div>

      <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
        <NoteReader content={note.content} />
      </div>

      {note.materials.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-4 md:p-5">
          <p className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold mb-3 flex items-center gap-1.5">
            <Paperclip className="w-3.5 h-3.5" /> Attachments
          </p>
          <ul className="space-y-2">
            {note.materials.map((m) => (
              <li key={m.id}>
                <a
                  href={m.compiledUrl ?? m.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  {m.name}
                </a>
                <span className="ml-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {m.format.toLowerCase()}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
