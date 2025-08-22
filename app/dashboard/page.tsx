import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";


export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  console.log("sessionUi", session)
  if (!session) redirect("/auth/login");
   const role = session.user?.role 
    if (!role) {
      redirect("/auth/select-role")
    } else if (role === "TEACHER") {
      redirect("/dashboard/teacher")
    } else if (role === "STUDENT") {
      redirect("/dashboard/student")
    } else {
      redirect("/")
    }
}
