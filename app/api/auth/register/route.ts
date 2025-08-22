import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  console.log(name, email, password);
  if (!name || !email || !password) {
    return NextResponse.json({ error: "Missing fields!😞" }, { status: 400 });
  }

  const userEx = await prisma.user.findUnique({ where: { email } });

  if (userEx) {
    return NextResponse.json(
      { error: "Email already in use, try to login!🤔" },
      { status: 403 },
    );
  }

  const hashedPass = await bcrypt.hash(password, 10);

  const creat_user = await prisma.user.create({
    data: { name, email, password: hashedPass },
  });

  return NextResponse.json({
    message: "User Registred Successfully ! Congrats!🎉",creat_user
  });
}
