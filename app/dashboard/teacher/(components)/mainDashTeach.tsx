import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import CreateClassPOP from "./CreateClassPOP";
import SearchBar from "../../(components)/SearchBar";
const MainDashTeach = () => {

    const [search, setSearch] = useState("")

  return (
    <div>
      <div className="flex gap-20 items-center">
      <h1 className="text-2xl font-semibold ">Teacher DashBoard</h1>
      <SearchBar onSearch={setSearch}/>
      </div>
      <div className="relative flex items-center bg-[var(--light-yellow)] p-6 mt-12 rounded-xl shadow-md space-x-6 w-fit">
        <div>
          <h2 className="text-xl font-semibold ">
            Welcome, Teacher! 👋 
          </h2>
          <p className="text-gray-700 mt-2">
            We're glad to have you here. Ready to inspire your students?
          </p>

          <CreateClassPOP />
 
        </div>
        <div className="w-[250px] hidden md:block">
        <Image
          src="/Teacher.svg"
          alt="Welcome Teacher"
          width={300}
          height={300}
          className="-top-12 rounded absolute "
        />

</div>
      </div>
      <div>Classes statistics here..</div>
      <div> Reports here..</div>
      <div>
        Trainer Info shere(Events- Activity- calendar and futur thingy Internal
        messaging or announcements )..
      </div>
    </div>
  );
};

export default MainDashTeach;
