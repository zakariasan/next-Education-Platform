// app/api/teacher/classes/route.ts
//GET (list classes), POST (create class)
//
//   GET POST classes by TEACHER
import {  getAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";


export async function POST(req: NextRequest) {
  const user = await getAuthenticated();

  if (!user) {
    return NextResponse.json(
      { error: "User(Teacher) not Authenticated 😭😔💔 Login!!" },
      { status: 401 },
    );
  }
  const key = nanoid(6);
  try {
    const { name, description } = await req.json();
    if (!name) {
      return NextResponse.json(
        { error: "Missing Name of the Class!!" },
        { status: 400 },
      );
    }
    const newClass = await prisma.class.create({
      data: {
        name,
        description,
        key,
        teacherId: user.id,
      },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Error creating Task" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {

  const user = await getAuthenticated();

  const searchParams = req.nextUrl.searchParams
  const userId = searchParams.get('userId')
  console.log("SErver Check session: ", user)
  if(!userId || !user){
    return Response.json({ error: "User ID required by server" }, { status: 400 })
  }
    try {
    const classes = await prisma.class.findMany({
      where: {
        teacherId: userId, // 🔥 Filter only this teacher's classes
      },
      include: { teacher: true,students: true },
      orderBy: { createdAt: "desc" },
    });

    console.log("Check back ++++", classes)
    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.log("Check back ++++ERROR", error)
    return NextResponse.json({ classes: [], error }, { status: 500 });
  }
}
