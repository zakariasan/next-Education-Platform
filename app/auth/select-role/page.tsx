
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import SelectRoleClient from "./SelectRoleClient";
import { authOptions } from "@/lib/auth";

export default async function SelectRolePage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to login if no session
  if (!session) {
    redirect("/auth/signin");
  }
  if(session.user.role) redirect(`/dashboard/${session.user.role.toLowerCase()}`)

  return <SelectRoleClient session={session} />;
}
