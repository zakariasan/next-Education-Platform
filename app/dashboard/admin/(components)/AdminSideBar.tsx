"use client";
import React from "react";
import { LayoutDashboard, CircuitBoard, ClipboardCheck, CalendarDays } from "lucide-react";
import AppSidebar, { type NavItem } from "@/components/AppSidebar";

const navItems: NavItem[] = [
  { label: "Overview", icon: LayoutDashboard, href: "/dashboard/admin", exact: true },
  { label: "Modules", icon: CircuitBoard, href: "/dashboard/admin/modules" },
  { label: "Reviews", icon: ClipboardCheck, href: "/dashboard/admin/reviews" },
  { label: "Events", icon: CalendarDays, href: "/dashboard/admin/events" },
];

const AdminSideBar = () => <AppSidebar items={navItems} roleLabel="Admin" />;

export default AdminSideBar;
