import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SideBar from "./(components)/SideBar";
import MathBackdrop from "@/components/MathBackdrop";
import ClickSparks from "@/components/ClickSparks";
export default async function Dashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  return (
    <div className="flex h-screen bg-background">
      <MathBackdrop />
      <ClickSparks />
      <SideBar />
      <main className="relative z-10 flex-1 p-3 ml-16 md:ml-64 transition-all duration-300 overflow-y-auto">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
