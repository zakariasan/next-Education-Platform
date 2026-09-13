import React from "react";
import { redirect } from "next/navigation";
import TeacherClasses from "./TeacherClasses";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@/lib/gamification/access";

// Queries the database directly. This page used to fetch its own API over HTTP
// and rebuild the base URL from NEXTAUTH_URL / VERCEL_URL, which is both slower
// and wrong on Vercel (VERCEL_URL has no protocol).
export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/auth/login");

  const classes = await prisma.class.findMany({
    where: { teacherId: user.id },
    include: { teacher: true, students: true },
    orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
  });

  return <TeacherClasses classes={classes} />;
}
