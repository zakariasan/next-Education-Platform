import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import SideBar from "./(components)/SideBar";
export default async function Dashboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  return (
    <div className="flex h-screen bg-[var(--medium-grey)]">
     <SideBar /> 
         <main className="flex-1 p-3 ml-16 md:ml-64 transition-all duration-300">
        <div className="w-full">
          {children}
        </div>
      </main>
    </div>
  );
}
