"use client";
import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const QuizzesList = () => {
  return (
    <div>
   <Table className="bg-white rounded-lg p-6 mt-3 ">
        <TableCaption>A list of your Quizzes.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold w-1/5">Quiz Title</TableHead>
            <TableHead className="font-semibold w-1/5">Linked Lesson</TableHead>
            <TableHead className="font-semibold w-1/5">Due Date</TableHead>
            <TableHead className="font-semibold w-1/5">Questions</TableHead>
            <TableHead className="font-semibold w-1/5"> Attempts</TableHead>
            <TableHead className="font-semibold w-1/5"> Avg Score</TableHead>
            <TableHead className="font-semibold w-1/5"> Status  </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium ">
               Forces Quiz           </TableCell>
            <TableCell>Newton  Laws</TableCell>
            <TableCell>10</TableCell>
            <TableCell>2025-06-17</TableCell>
            <TableCell className="">12 / 15</TableCell>
            <TableCell className="">78%</TableCell>
            <TableCell className="">Published</TableCell>
          </TableRow>
        </TableBody>
      </Table>


    </div>
  )
}

export default QuizzesList
