"use client";
import React from "react";
import { LayoutDashboard, BookOpenText, LogOut, ClipboardList, CalendarDays, GraduationCap, Users, School2, CircuitBoard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ThemeToggle from "@/components/ThemeToggle";

const navItems = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard/teacher" },
  { label: "Schools", icon: School2, href: "/dashboard/teacher/schools" },
  { label: "Classes", icon: BookOpenText, href: "/dashboard/teacher/classes" },
  { label: "Modules", icon: CircuitBoard, href: "/dashboard/teacher/modules" },
  { label: "Assignments & Quizzes", icon: ClipboardList, href: "/dashboard/assignments" },
  { label: "Students", icon: Users, href: "/dashboard/studensprogress" },
  { label: "Events", icon: CalendarDays, href: "/dashboard/events" },
];

const SideBar = () => {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full md:w-64 w-16 bg-sidebar border-r border-sidebar-border shadow-sm transition-all duration-300 flex flex-col z-30">
      {/* Header Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-md">
            <GraduationCap className="h-6 w-6 text-primary-foreground" />
          </div>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">
              PhysiClub
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Education Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 pt-6 px-3 flex-grow">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard/teacher"
              ? pathname === item.href
              : pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.label} className="group relative" href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 ease-out active:scale-[0.97] relative
                  ${isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground hover:translate-x-0.5"
                  }
                `}
              >
                <div
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-lg shrink-0 transition-all duration-150
                    ${isActive ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "bg-transparent"}
                  `}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </div>
                <span className="hidden md:inline text-sm">{item.label}</span>
                {isActive && (
                  <div className="hidden md:block absolute right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* User Section & Logout */}
      <div className="p-3 border-t border-sidebar-border mt-auto">
        {/* User info */}
        <div className="hidden md:flex items-center gap-3 mb-3 p-3 bg-sidebar-accent/50 rounded-lg">
          <Link href="/dashboard/teacher/profile" className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground text-sm font-semibold shrink-0">
              T
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">Teacher</p>
              <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary inline-block" /> Online
              </p>
            </div>
          </Link>
          <ThemeToggle className="shrink-0" />
        </div>
        <div className="md:hidden flex justify-center mb-3">
          <ThemeToggle />
        </div>

        {/* Logout Button */}
        <button
          onClick={() => {
            signOut({ callbackUrl: "/auth/login" });
          }}
          className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors duration-150 cursor-pointer hover:bg-destructive/10"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0">
            <LogOut className="w-[18px] h-[18px] text-sidebar-foreground/70 group-hover:text-destructive transition-colors duration-150" />
          </div>
          <span className="hidden md:inline text-sm font-medium text-sidebar-foreground/70 group-hover:text-destructive transition-colors duration-150">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
};

export default SideBar;
