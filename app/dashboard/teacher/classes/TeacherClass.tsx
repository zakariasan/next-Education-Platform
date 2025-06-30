import React from "react";
import { BookUser, Fingerprint } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { GiTeacher } from "react-icons/gi";
import Link from "next/link";
import { Class } from "@prisma/client";
type TeacherClassProps = {
  itemClass: Class
}
const TeacherClass = ({itemClass}:TeacherClassProps) => {
  return (
    <Card className="w-1/4 mt-4 bg-white cursor-pointer sm:w-full">
      <CardHeader className="flex justify-between  items-center">
        <span className="bg-purple-200 p-2 rounded-full text-purple-700">
          <BookUser className="" />
        </span>

        <div className=" flex items-center gap-1 bg-gray-200 rounded-lg p-2 text-gray-700">
          <GiTeacher />
          <span>{itemClass?.teacher.name}</span>
        </div>
      </CardHeader>
<Link href={`classes/${itemClass.id}`}>
      <CardContent>
        <p className="font-semibold text-3xl">{itemClass.name}</p>
          <span className="border-b-2">{itemClass?.description}</span>
        <div className="flex justify-between ">
          <span className="text-gray-400">{itemClass?.students?.length() || 0} Students</span>
          <span className="text-gray-400 flex items-center gap-2 cursor-copy">
            <Fingerprint /> {itemClass.key}
          </span>
        </div>
      </CardContent>
      </Link>
    </Card>
  );
};

export default TeacherClass;
