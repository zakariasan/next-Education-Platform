"use client";

import React from "react";
import CreateClassPOP from "../(components)/CreateClassPOP";
import TeacherClass from "./TeacherClass";
import { Class, User } from "@prisma/client";

type TeacherClassesProps = {
  classes?: (Class & {
    teacher: User;
    students: User[];
  })[];
};

const TeacherClasses = ({ classes }: TeacherClassesProps) => {


    const safeClasses = Array.isArray(classes) ? classes : [];
  
  console.log("Checking : ", Array.isArray(classes), classes, safeClasses);
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-3xl font-extrabold text-slate-800">My Classes</h1>
      </div>

      {/* Stats & Create */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white shadow-md rounded-2xl px-6 py-4 gap-4">
        <div className="flex gap-6">
          <div className="flex flex-col items-center bg-blue-50 rounded-xl px-4 py-2 shadow-inner">
            <span className="text-xl font-bold text-blue-700">
              {safeClasses.length}
            </span>
            <p className="text-sm text-gray-500">Classes</p>
          </div>
          {/* Optional: Lessons, Quizzes stats */}
        </div>
        <CreateClassPOP />
      </div>

      {/* Classes Grid */}
      <div className="flex  gap-2">
        {safeClasses.map((itemClass) => (
          <TeacherClass key={itemClass.id} itemClass={itemClass} />
        ))}
      </div>
    </div>
  );
};

export default TeacherClasses;
