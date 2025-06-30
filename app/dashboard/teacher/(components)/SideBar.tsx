"use client";
import React from "react";
import { LayoutDashboard, BookOpenText, LogOut, Quote, CalendarDays } from "lucide-react";

import Link from "next/link";

import { signOut } from "next-auth/react";
const navItems = [
  { label: "Home", icon: <LayoutDashboard />, href: "/dashboard/teacher" },
  { label: "Classes", icon: <BookOpenText />, href: "/dashboard/teacher/classes" },
  { label: "Assignments & Quizzes", icon: <Quote />, href: "/dashboard/assignments" },
  { label: "Students", icon: <Quote />, href: "/dashboard/studensprogress" },
  { label: "Events", icon: <CalendarDays />, href: "/dashboard/events" },
];

const SideBar = () => {
  return (
    <aside className=" h-screen md:w-64 bg-white border-r shadow-sm transition-all duration-300 flex flex-col">
      <div className="md:items-start gap-4 p-4">
        <h1 className="hidden md:block text-2xl p-6 font-bold">PhysiClub</h1>
      </div>

      <nav className=" flex flex-col gap-5 pt-12">
        {navItems.map((item) => (
          <Link
            key={item.label}
            className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-200 transition  font-semibold"
            href={item.href}
          >
            <div className="w-6 h-6">{item.icon}</div>
            <span className="hidden md:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
      <button
        onClick={() => {
          signOut({ callbackUrl: "/auth/login" });
        }}
        className=" mt-auto text-gray-700 p-4 my-8 rounded font-semibold flex items-center gap-3 px-4 py-3 hover:bg-red-200  cursor-pointer
"
      >
        <div className="w-6 h-6">
          <LogOut />
        </div>
        <span className="hidden md:inline">LogOut</span>
      </button>
    </aside>
  );
};

export default SideBar;
