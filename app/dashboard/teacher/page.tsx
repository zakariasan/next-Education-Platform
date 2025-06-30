"use client";
import React from "react";
import { useSession } from "next-auth/react"

import MainDashTeach from "./(components)/mainDashTeach";
const DashContentTeacher = ({ name }: { name: string }) => {
  const { data: session, status } = useSession()

  return (
    <div>
      <MainDashTeach />
    </div>
  );
};

export default DashContentTeacher;
