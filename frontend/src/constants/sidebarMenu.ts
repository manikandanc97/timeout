'use client';

import React from 'react';
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
} from 'lucide-react';

type MenuItem = {
  name: string;
  href: string;
  icon: React.ElementType;
};

export const employeeMenuList: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Leaves', href: '/leaves', icon: CalendarDays },
  { name: 'Apply Leave', href: '/apply', icon: FilePlus2 },
  { name: 'Leave Policy', href: '/policy', icon: BookOpen },
];

export const adminMenuList: MenuItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Requests', href: '/requests', icon: ClipboardCheck },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Teams', href: '/team', icon: Users },
  { name: 'Holidays', href: '/holidays', icon: CalendarRange },
  { name: 'Leave Policy', href: '/policy', icon: BookOpen },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Payroll', href: '/payroll', icon: Wallet },
  { name: 'Settings', href: '/settings', icon: Settings },
];
