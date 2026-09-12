import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import StudentSideBar from "./(components)/StudentSideBar";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  return (
    <div className="flex h-screen bg-background">
      <StudentSideBar name={session.user?.name} />
      <main className="flex-1 ml-16 md:ml-64 transition-all duration-300 overflow-y-auto">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
