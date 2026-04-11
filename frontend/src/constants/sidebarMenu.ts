'use client';

import Link from 'next/link';
import React from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  FilePlus2,
  BookOpen,
  Hourglass,
  Users,
  ClipboardCheck,
  Settings,
  BarChart3,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

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
  { name: 'Leave Requests', href: '/requests', icon: ClipboardCheck },
  { name: 'Employees', href: '/employees', icon: Users },
  { name: 'Teams', href: '/team', icon: Users },
  { name: 'Leave Policy', href: '/policy', icon: BookOpen },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];
