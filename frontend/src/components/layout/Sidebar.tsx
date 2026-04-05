"use client";

import Link from "next/link";
import React, { use } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  FilePlus2,
  BookOpen,
  Hourglass,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";

const menuList: { name: string; href: string; icon: React.ElementType }[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Leaves", href: "/leaves", icon: CalendarDays },
  { name: "Apply leave", href: "/apply", icon: FilePlus2 },
  { name: "Team Leaves", href: "/team", icon: Users },
  { name: "Leave Policy", href: "/policy", icon: BookOpen },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className="flex flex-col bg-primary-dark w-40 h-full text-white">
      <div className="flex items-center gap-2 p-5 shrink-0">
        <Hourglass fill="white" />
        <h2 className="font-bold text-white text-2xl">Timeout</h2>
      </div>
      <nav className="flex flex-col flex-1 space-y-4 pb-4 overflow-y-auto font-medium text-sm">
        {menuList.map((menu) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;
          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={`flex flex-col items-center p-2 rounded gap-2 justify-center ${isActive ? " bg-primary text-white" : ""}`}
            >
              <Icon size={20} className="sidebar-link-icon" />
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
