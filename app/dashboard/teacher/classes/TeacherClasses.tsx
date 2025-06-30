"use client";
import React, { useState } from "react";
import SearchBar from "../../(components)/SearchBar";
import CreateClassPOP from "../(components)/CreateClassPOP";
import TeacherClass from "./TeacherClass";
import { useSession } from "next-auth/react";
import { Class } from "@prisma/client";
type TeacherClassesProps = {
  classes: Class[];
};
const TeacherClasses = ({ classes }: TeacherClassesProps) => {
  const [search, setSearch] = useState("");

  return (
    <div>
      <div className="flex gap-20 items-center">
        <h1 className="text-2xl font-semibold ">Teacher Classes</h1>
        <SearchBar onSearch={setSearch} />
      </div>

      <div className="flex justify-between items-center bg-white  mt-6 rounded-xl shadow-md space-x-6  px-4">
        <div className=" flex justify-between  text-xl   w-2/6">
          <div className=" rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition">
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              22
            </span>
            <p className="p-2 text-gray-400">Students</p>
          </div>

          <div className=" rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition">
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              22
            </span>
            <p className="p-2 text-gray-400">Lessons</p>
          </div>

          <div className=" rounded p-4 flex gap-1 hover:border-b-3 hover:border-[var(--primary-blue)] transition">
            <span className="rounded bg-[var(--primary-light-blue)] p-2 text-[var(--primary-blue)]">
              22
            </span>
            <p className="p-2 text-gray-400">Quizzes</p>
          </div>
        </div>
        <CreateClassPOP />
      </div>

      <div className="flex gap-3 flex-col  sm:flex-row  ">
        {classes?.map((itemClass) => (
          <TeacherClass key={itemClass.id} itemClass={itemClass} />
        ))}
      </div>
    </div>
  );
};

export default TeacherClasses;
