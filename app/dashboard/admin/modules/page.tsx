import React from "react";
import ModulesList from "@/app/dashboard/teacher/modules/(components)/ModulesList";

const page = () => (
  <div className="p-3">
    <ModulesList basePath="/dashboard/admin/modules" showTeacher adminMode />
  </div>
);

export default page;
