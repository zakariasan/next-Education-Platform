"use client";
import React from "react";
import { LayoutDashboard, CircuitBoard, ClipboardCheck } from "lucide-react";
import AppSidebar, { type NavItem } from "@/components/AppSidebar";

const navItems: NavItem[] = [
  { label: "Home", icon: LayoutDashboard, href: "/dashboard/student", exact: true },
  { label: "Holy Graph", icon: CircuitBoard, href: "/dashboard/student/modules" },
  { label: "Peer Reviews", icon: ClipboardCheck, href: "/dashboard/student/reviews" },
];

const StudentSideBar = ({ name }: { name?: string }) => (
  <AppSidebar items={navItems} roleLabel={name ?? "Student"} initial={name?.[0]?.toUpperCase()} />
);

export default StudentSideBar;
