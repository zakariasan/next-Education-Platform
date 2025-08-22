import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import DashContentStudent from "./dashContentStudent";
export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");

  return <DashContentStudent name={session?.user?.name || "User"} />;
}
