"use client";
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";



const StudentsList = () => {
  return (
    <div>
      <Table className="bg-white rounded-lg p-6 mt-3 ">
        <TableCaption>A list of your Students.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold w-1/5">Full name</TableHead>
            <TableHead className="font-semibold w-1/5">Attendance</TableHead>
            <TableHead className="font-semibold w-1/5">Average Quiz Score</TableHead>
            <TableHead className="font-semibold w-1/5">Status</TableHead>
            <TableHead className="font-semibold w-1/5"> Last Quiz Result</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium ">
              <div className="flex gap-2 items-center">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>hello</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">soufian ait rahou</p>
                  <p className="text-sm text-muted-foreground">
                    soufian@test.com
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>15/20</TableCell>
            <TableCell>85%</TableCell>
            <TableCell><span>Good</span></TableCell>
            <TableCell className="">16.25/20</TableCell>
          </TableRow>
        </TableBody>
      </Table>

    </div>
  )
}

export default StudentsList
