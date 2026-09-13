"use client";
import React from "react";
import { LayoutDashboard, BookOpenText, ClipboardList, CalendarDays, Users, School2, CircuitBoard, ClipboardCheck, Waypoints } from "lucide-react";
import AppSidebar, { type NavItem } from "@/components/AppSidebar";

const navItems: NavItem[] = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard/teacher", exact: true },
  { label: "Schools", icon: School2, href: "/dashboard/teacher/schools" },
  { label: "Classes", icon: BookOpenText, href: "/dashboard/teacher/classes" },
  { label: "Modules", icon: CircuitBoard, href: "/dashboard/teacher/modules" },
  { label: "Course map", icon: Waypoints, href: "/dashboard/teacher/curriculum" },
  { label: "Reviews", icon: ClipboardCheck, href: "/dashboard/teacher/reviews" },
  { label: "Assignments & Quizzes", icon: ClipboardList, href: "/dashboard/teacher/assignments" },
  { label: "Students", icon: Users, href: "/dashboard/teacher/students" },
  { label: "Events", icon: CalendarDays, href: "/dashboard/teacher/events" },
];

const SideBar = () => <AppSidebar items={navItems} roleLabel="Teacher" profileHref="/dashboard/teacher/profile" />;

export default SideBar;
