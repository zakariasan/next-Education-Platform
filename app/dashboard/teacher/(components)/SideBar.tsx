"use client";
import React, { useState } from "react";
import { LayoutDashboard, BookOpenText, LogOut, Quote, CalendarDays, Atom, Zap } from "lucide-react";
import Link from "next/link";
import { signOut } from "next-auth/react";

const navItems = [
  { label: "Home", icon: <LayoutDashboard />, href: "/dashboard/teacher", color: "from-slate-600 to-slate-700" },
  { label: "Classes", icon: <BookOpenText />, href: "/dashboard/teacher/classes", color: "from-emerald-600 to-emerald-700" },
  { label: "Assignments & Quizzes", icon: <Quote />, href: "/dashboard/assignments", color: "from-indigo-600 to-indigo-700" },
  { label: "Students", icon: <Quote />, href: "/dashboard/studensprogress", color: "from-amber-600 to-amber-700" },
  { label: "Events", icon: <CalendarDays />, href: "/dashboard/events", color: "from-purple-600 to-purple-700" },
];

const SideBar = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="fixed left-0 top-0 h-full md:w-64 w-16 bg-white border-r border-slate-200 shadow-sm transition-all duration-300 flex flex-col z-30">
      {/* Header Section */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-md">
              <Atom className="h-6 w-6 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
              <Zap className="h-2 w-2 text-white" />
            </div>
          </div>
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-slate-800">
              PhysiClub
            </h1>
            <p className="text-xs text-slate-500 font-medium">Physics Education Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 pt-6 px-3 flex-grow">
        {navItems.map((item) => (
          <Link
            key={item.label}
            className="group relative"
            href={item.href}
            onMouseEnter={() => setHoveredItem(item.label)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <div className={`
              flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 relative
              ${hoveredItem === item.label 
                ? 'bg-slate-50 border border-slate-200 shadow-sm transform translate-x-1' 
                : 'hover:bg-slate-50'
              }
            `}>
              {/* Icon container */}
              <div className={`
                relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200
                ${hoveredItem === item.label 
                  ? `bg-gradient-to-br ${item.color} shadow-md` 
                  : 'bg-slate-100 group-hover:bg-slate-200'
                }
              `}>
                <div className={`
                  w-5 h-5 transition-colors duration-200
                  ${hoveredItem === item.label ? 'text-white' : 'text-slate-600'}
                `}>
                  {item.icon}
                </div>
              </div>
              
              {/* Label */}
              <span className={`
                hidden md:inline font-medium transition-all duration-200
                ${hoveredItem === item.label 
                  ? 'text-slate-800 translate-x-1' 
                  : 'text-slate-600 group-hover:text-slate-800'
                }
              `}>
                {item.label}
              </span>

              {/* Active indicator */}
              <div className={`
                absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-6 rounded-l-full transition-all duration-200
                ${hoveredItem === item.label 
                  ? `bg-gradient-to-b ${item.color} opacity-100` 
                  : 'bg-slate-300 opacity-0'
                }
              `}></div>
            </div>
          </Link>
        ))}
      </nav>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-slate-200 mt-auto">
        {/* User info */}
        <div className="hidden md:flex items-center gap-3 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-800 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            T
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 truncate">Physics Teacher</p>
            <p className="text-xs text-slate-500 truncate">Online</p>
          </div>
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            signOut({ callbackUrl: "/auth/login" });
          }}
          className="group w-full flex items-center gap-4 px-3 py-3 rounded-lg transition-all duration-200 relative hover:bg-red-50 hover:border hover:border-red-200"
        >
          {/* Icon container */}
          <div className="relative w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-200 bg-slate-100 group-hover:bg-red-100">
            <LogOut className="w-5 h-5 text-slate-600 group-hover:text-red-600 transition-colors duration-200" />
          </div>
          
          {/* Label */}
          <span className="hidden md:inline font-medium text-slate-600 group-hover:text-red-600 transition-all duration-200">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
