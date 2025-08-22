"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";


const CreateStudentPOP= () => {
    const params = useParams();
  const classId = params.id;
  return (
        <Button  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold p-4 rounded transition duration-200">
      <Link href={`${classId}/seances`}>
      Create a New Session +
      </Link>
        </Button>
  );
};

export default CreateStudentPOP;
