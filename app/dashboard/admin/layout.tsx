import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminSideBar from "./(components)/AdminSideBar";
import MathBackdrop from "@/components/MathBackdrop";
import ClickSparks from "@/components/ClickSparks";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex h-screen bg-background">
      <MathBackdrop />
      <ClickSparks />
      <AdminSideBar />
      <main className="relative z-10 flex-1 ml-16 md:ml-64 transition-all duration-300 overflow-y-auto">
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
