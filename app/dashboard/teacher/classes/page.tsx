import React from "react";
import TeacherClasses from "./TeacherClasses";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { headers } from "next/headers";

async function getClasses() {
  const session = await getServerSession(authOptions);
  const headersList = await headers();

  const userId = session?.user?.id;
  const res = await fetch(`/api/teacher/classes?userId=${userId}`, {
    method: "GET",
    headers: {
      // Convert Headers object to plain object
      ...Object.fromEntries(headersList.entries()),
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });
  console.log("Some Check here: ", res);
  if (!res.ok) {
    return { classes: [] };
  }
  return res.json();
}
const page = async () => {
  const classesData = await getClasses();

  let classes;
  if (Array.isArray(classesData)) {
    classes = classesData;
  } else if (classesData?.classes && Array.isArray(classesData.classes)) {
    classes = classesData.classes;
  } else {
    classes = [];
  }

  return (
    <div>
      <TeacherClasses classes={classes} />
    </div>
  );
};

export default page;
