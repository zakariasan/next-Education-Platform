import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticated } from "@/lib/auth";
export async function GET(req: NextRequest,
    { params }: { params: Promise<{ id: string }> }  // params is now a Promise

) {
  const param = await params;
  const classId = param.id;
  const user = await getAuthenticated();

  if (!user) {
    return NextResponse.json(
      { error: "User(Teacher) not Authenticated 😭😔💔 Login!!" },
      { status: 401 },
    );
  }

  try {
    const classData = await prisma.class.findUnique({
      where: { id: classId},
      include: {
        students: true
      }
    });

    if (!classData) {
      return new NextResponse("Class not found", { status: 404 });
    }

    console.log("backend fetch", classData)
    return NextResponse.json(classData, {status: 200});
  } catch (error) {
    console.error("[ospyyyy errorrrrrrrrr]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

} 
