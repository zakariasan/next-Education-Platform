import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Legacy path: events now live under each role's dashboard.
export default async function EventsRedirect() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  redirect(role === "STUDENT" ? "/dashboard/student/events" : role === "ADMIN" ? "/dashboard/admin/events" : "/dashboard/teacher/events");
}
