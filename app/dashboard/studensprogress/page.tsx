import { redirect } from "next/navigation";

// Legacy path kept for old links.
export default function StudentsProgressRedirect() {
  redirect("/dashboard/teacher/students");
}
