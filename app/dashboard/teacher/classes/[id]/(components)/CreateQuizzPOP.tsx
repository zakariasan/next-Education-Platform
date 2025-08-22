"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useParams } from "next/navigation";


const CreateQuizPOP = () => {
    const params = useParams();
  const classId = params.id;
  return (
        <Button  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold p-4 rounded transition duration-200">
      <Link href={`${classId}/quizzes`}>
      Create a New Quiz +
      </Link>
        </Button>
  );
};

export default CreateQuizPOP;
