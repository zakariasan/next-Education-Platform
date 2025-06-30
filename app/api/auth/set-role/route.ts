import {NextRequest, NextResponse} from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req:NextRequest) {
  const {email, role}  = await req.json();

  if (!email || !role) {
    return NextResponse.json({error: "Missing role or email."}, {status:400});
  }
    // Prevent role update if already set
  const existingUser = await prisma.user.findUnique({
    where: { email: email! },
  });
 if (existingUser?.role) {
    return NextResponse.json({ error: "Role already set" }, { status: 403 });
  }

  await prisma.user.update({
    where: {email},
    data: {role},
  })
  return NextResponse.json({sucess: true})
}

