import React from "react";
import TeacherClasses from "./TeacherClasses";
import { authOptions } from "@/lib/auth";
import { getServerSession } from "next-auth";

async function getClasses() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const res = await fetch(`/api/teacher/classes?userId=${userId}`,
    {
      method: "GET",
      credentials: "include",
    },
  );
  if (!res.ok) {
    return { classes: [] };
  }
  console.log("Some Check here: ",res)
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
