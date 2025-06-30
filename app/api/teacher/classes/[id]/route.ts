import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function GET(req: NextRequest, {params}: {params: {id: string}}) {
  const param = await params;
  const classId = param.id;

  try {
    const classData = await prisma.class.findUnique({
      where: { id: classId},
    });

    if (!classData) {
      return new NextResponse("Class not found", { status: 404 });
    }

    return NextResponse.json(classData);
  } catch (error) {
    console.error("[GET_CLASS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

} 
