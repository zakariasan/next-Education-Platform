import React from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import MainDashTeach from "./(components)/mainDashTeach";
const DashContentTeacher = async () => {
 const session = await getServerSession(authOptions);

  if (!session) redirect("/auth/login");


  return (
    <div>
      <MainDashTeach name_Teacher={session?.user?.name}/>
    </div>
  );
};

export default DashContentTeacher;
