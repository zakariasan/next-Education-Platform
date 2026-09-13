// app/api/teacher/classes/route.ts
//GET (list classes), POST (create class)
//
//   GET POST classes by TEACHER
import { requireAuthor } from "@/lib/access/ownership";
import { isAdmin } from "@/lib/gamification/access";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";


export async function POST(req: NextRequest) {
  const { user, error } = await requireAuthor();
  if (error) return error;

  const key = nanoid(6);
  try {
    const { name, description, schoolId } = await req.json();
    if (!name) {
      return NextResponse.json(
        { error: "Missing Name of the Class!!" },
        { status: 400 },
      );
    }
    if (!schoolId) {
      return NextResponse.json(
        { error: "Missing schoolId" },
        { status: 400 },
      );
    }
    const membership = isAdmin(user)
      ? true
      : await prisma.schoolTeacher.findUnique({
          where: { schoolId_teacherId: { schoolId, teacherId: user.id } },
        });
    if (!membership) {
      return NextResponse.json(
        { error: "You are not a member of this school" },
        { status: 403 },
      );
    }
    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        key,
        teacherId: user.id,
        schoolId,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error creating Task" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuthor();
  if (error) return error;

  // The owner comes from the session. It used to come from a `userId` query
  // parameter, which let any signed-in user list another teacher's classes.
  const searchParams = req.nextUrl.searchParams;
  const includeArchived = searchParams.get("includeArchived") === "1";

  try {
    const classes = await prisma.class.findMany({
      where: {
        teacherId: user.id,
        ...(includeArchived ? {} : { archived: false }),
      },
      include: { teacher: true, students: true },
      orderBy: [{ archived: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (err) {
    console.error("[teacher/classes GET]", err);
    return NextResponse.json({ classes: [], error: "Failed to load classes" }, { status: 500 });
  }
}
