// POST { key } — promotes the signed-in user to ADMIN when `key` matches
// ADMIN_SETUP_KEY. The key never leaves the server; without the env var the
// route is disabled.
import { timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function keyMatches(given: string, expected: string) {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: NextRequest) {
  const expected = process.env.ADMIN_SETUP_KEY;
  if (!expected || expected.length < 12) {
    return NextResponse.json({ error: "Admin setup is disabled (ADMIN_SETUP_KEY not configured)" }, { status: 503 });
  }
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in first" }, { status: 401 });

  const { key } = await req.json().catch(() => ({}));
  if (typeof key !== "string" || !keyMatches(key, expected)) {
    return NextResponse.json({ error: "Invalid admin key" }, { status: 403 });
  }

  await prisma.user.update({ where: { id: session.user.id }, data: { role: "ADMIN" } });
  return NextResponse.json({ ok: true });
}
