// app/api/student/join-class/route.ts
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";



export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { key } = await req.json();
  if (!key) return new Response("Class key is required", { status: 400 });

  // Find the class by key
  const cls = await prisma.class.findUnique({ where: { key } });
  if (!cls) return new Response("Class not found", { status: 404 });
  // Add student to class
  await prisma.user.findUnique({
  where: { id: session.user.id },
});
  await prisma.class.update({
    where: { id: cls.id },
    data: { 
      students: {
        connect: { id: session.user.id },
      },
    },
  });

  return new Response("Enrolled successfully", { status: 200 });
}
