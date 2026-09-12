import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Legacy path: assignments = quizzes + reviews, now under each role's dashboard.
export default async function AssignmentsRedirect() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  redirect(role === "STUDENT" ? "/dashboard/student/quizzes" : role === "ADMIN" ? "/dashboard/admin/reviews" : "/dashboard/teacher/assignments");
}
