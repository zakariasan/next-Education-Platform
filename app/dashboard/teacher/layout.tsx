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
    <div className="flex bg-[var(--medium-grey)]">
     <SideBar /> 
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
