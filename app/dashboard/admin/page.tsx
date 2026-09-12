import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import AdminDashContent from "./AdminDashContent";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");

  return <AdminDashContent />;
}
