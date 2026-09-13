import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, School2 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { currentUser, isAdmin } from "@/lib/gamification/access";
import SchoolClasses from "./SchoolClasses";

type Ctx = { params: Promise<{ schoolId: string }> };

export default async function Page({ params }: Ctx) {
  const { schoolId } = await params;
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  // A teacher reaches a school by being one of its teachers or its creator.
  const school = await prisma.school.findFirst({
    where: isAdmin(user)
      ? { id: schoolId }
      : {
          id: schoolId,
          OR: [{ createdById: user.id }, { teachers: { some: { teacherId: user.id } } }],
        },
    select: { id: true, name: true, description: true },
  });
  if (!school) notFound();

  // Only the caller's own classes in this school; another teacher's classes in
  // the same school are not theirs to change.
  const classes = await prisma.class.findMany({
    where: { schoolId, ...(isAdmin(user) ? {} : { teacherId: user.id }) },
    select: {
      id: true,
      name: true,
      archived: true,
      _count: { select: { students: true } },
      modules: { select: { module: { select: { id: true, title: true, subject: true, status: true } } } },
    },
    orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/teacher/schools"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> All schools
      </Link>

      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary via-secondary to-primary p-6 md:p-8 shadow-lg">
        <div className="relative flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center shrink-0">
            <School2 className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{school.name}</h1>
            <p className="text-white/70 text-sm mt-0.5">
              {classes.length} class{classes.length === 1 ? "" : "es"}
              {school.description ? ` · ${school.description}` : ""}
            </p>
          </div>
        </div>
      </div>

      <SchoolClasses
        classes={classes.map((c) => ({
          id: c.id,
          name: c.name,
          archived: c.archived,
          studentCount: c._count.students,
          modules: c.modules.map((m) => m.module),
        }))}
      />
    </div>
  );
}
