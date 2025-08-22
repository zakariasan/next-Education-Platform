import React from "react";
import { BookUser, Fingerprint } from "lucide-react";
import { GiTeacher } from "react-icons/gi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
import { Class, User } from "@prisma/client";

type TeacherClassProps = {
  itemClass: Class & {
    teacher: User;          // 👈 relation
    students: User[];       // 👈 relation
  };
};

const TeacherClass = ({ itemClass }: TeacherClassProps) => {
  return (
    <Link href={`classes/${itemClass.id}`} className="w-full sm:w-1/3">
      <Card className="cursor-pointer hover:scale-105 transition-transform shadow-xl rounded-2xl overflow-hidden bg-gradient-to-br from-white/80 to-white/90 border border-slate-200">
        <CardHeader className="flex justify-between items-center px-4 pt-4">
          <span className="bg-purple-200 p-3 rounded-full text-purple-700 shadow">
            <BookUser className="w-5 h-5" />
          </span>

          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1 text-gray-700 shadow-inner">
            <GiTeacher />
            <span className="text-sm font-medium">{itemClass?.teacher.name}</span>
          </div>
        </CardHeader>

        <CardContent className="px-4 pb-4">
          <p className="font-bold text-2xl text-slate-800 truncate">{itemClass.name}</p>
          <p className="text-sm text-gray-500 border-b border-gray-200 mb-2 pb-2 truncate">{itemClass?.description}</p>

          <div className="flex justify-between items-center mt-2 text-gray-600 text-sm">
            <span>{itemClass?.students.length || 0} Students</span>
            <span className="flex items-center gap-1 cursor-copy">
              <Fingerprint className="w-4 h-4" /> {itemClass.key}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default TeacherClass;

