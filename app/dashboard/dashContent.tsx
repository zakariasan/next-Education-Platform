"use client";
import React from "react";
import { signOut } from "next-auth/react";

import { toast } from "sonner";
const DashContent = ({ name }: { name: string }) => {
  return (
    <div>
      <h1 className="text-xl mb-4">Welcome, {name}</h1>
      <button
        onClick={() => {
        signOut({ callbackUrl: "/auth/login" })

      toast("LogOut successfully ");
        }}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default DashContent;
