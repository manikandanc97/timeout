"use client";

import React from "react";
import {
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  FilePlus2,
  BookOpen,
  Users,
  ClipboardCheck,
  Settings,
  BarChart3,
  Wallet,
  ReceiptText,
  Clock,
  Home,
} from "lucide-react";

// role types 😄
export type UserRole = "employee" | "manager" | "hr" | "admin" | "super_admin";

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

// employee menu
const employeeMenuList: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "My Leaves", href: "/leaves", icon: CalendarDays },
  { name: "Team Leaves", href: "/leaves/team", icon: CalendarRange },
  { name: "Apply", href: "/apply", icon: FilePlus2 },
  { name: "Payslip", href: "/payslip", icon: ReceiptText },
  { name: "Leave Policy", href: "/policy", icon: BookOpen },
];

// manager menu
const managerMenuList: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "My Leaves", href: "/leaves", icon: CalendarDays },
  { name: "Team Leaves", href: "/leaves/team", icon: CalendarRange },
  { name: "Apply", href: "/apply", icon: FilePlus2 },
  { name: "Team Requests", href: "/requests", icon: ClipboardCheck },
  { name: "Teams", href: "/team", icon: Users },
  { name: "Payslip", href: "/payslip", icon: ReceiptText },
  { name: "Leave Policy", href: "/policy", icon: BookOpen },
];

// HR menu
const hrMenuList: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Requests", href: "/requests", icon: ClipboardCheck },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Teams", href: "/team", icon: Users },
  { name: "Holidays", href: "/holidays", icon: CalendarRange },
  { name: "Leave Policy", href: "/policy", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Payroll", href: "/payroll", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
];

// admin + super admin menu
const adminMenuList: MenuItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/attendance", icon: Clock },
  { name: "Requests", href: "/requests", icon: ClipboardCheck },
  { name: "Employees", href: "/employees", icon: Users },
  { name: "Teams", href: "/team", icon: Users },
  { name: "Holidays", href: "/holidays", icon: CalendarRange },
  { name: "Leave Policy", href: "/policy", icon: BookOpen },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Payroll", href: "/payroll", icon: Wallet },
  { name: "Settings", href: "/settings", icon: Settings },
];

// role based menu getter 🔥
export const getMenuByRole = (role: UserRole): MenuItem[] => {
  switch (role) {
    case "employee":
      return employeeMenuList;

    case "manager":
      return managerMenuList;

    case "hr":
      return hrMenuList;

    case "admin":
    case "super_admin":
      return adminMenuList;

    default:
      return employeeMenuList;
  }
};
