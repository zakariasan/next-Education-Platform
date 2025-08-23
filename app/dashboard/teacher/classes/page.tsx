import React from "react";
import TeacherClasses from "./TeacherClasses";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

async function getClasses() {
  const session = await getServerSession(authOptions);


  const userId = session?.user?.id;
  const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
  console.log("API URL:", `${baseUrl}/api/teacher/classes?userId=${userId}`);
  console.log("User ID:", userId);
  const res = await fetch(`${baseUrl}/api/teacher/classes?userId=${userId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  console.log("Some Check here: ",res)
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
  
  console.log("See Classes type", classesData);
  console.log("Final classes:", classes);
console.log("See Classes type",classesData)
  return (
    <div>
      <TeacherClasses classes={classes} />
    </div>
  );
};

export default page;
