import React from "react";
import TeacherClasses from "./TeacherClasses";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

async function getClasses() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const res = await fetch(
    `${process.env.NEXTAUTH_URL}/api/teacher/classes?userId=${userId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );

  if (!res.ok) {
    return { classes: [] };
  }
  return res.json();
}
const page = async () => {
  const classesData = await getClasses();

  const classes = classesData || [];

  return (
    <div>
      <TeacherClasses classes={classes} />
    </div>
  );
};

export default page;
