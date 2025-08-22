import { NextResponse } from "next/server";
import {prisma} from "@/lib/prisma";

export async function GET(
  req: Request,
   context: { params: Promise<{ id: string }>  }
) {
  try {
        const { id } = await context.params;
    const classData = await prisma.class.findUnique({
      where: { id },
      include: { students: true }, // fetch users related as students
    });

    if (!classData) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    return NextResponse.json(classData.students);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
