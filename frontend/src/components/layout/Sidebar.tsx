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
} from 'lucide-react';
import { usePathname } from 'next/navigation';

const menuList: { name: string; href: string; icon: React.ElementType }[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'My Leaves', href: '/leaves', icon: CalendarDays },
  { name: 'Apply leave', href: '/apply', icon: FilePlus2 },
  { name: 'Team Leaves', href: '/team', icon: Users },
  { name: 'Leave Policy', href: '/policy', icon: BookOpen },
];

const Sidebar = () => {
  const pathname = usePathname();
  return (
    <aside className='flex h-full w-40 flex-col bg-primary-dark text-white'>
      <div className='flex shrink-0 items-center gap-2 p-5'>
        <Hourglass fill='white' />
        <h2 className='text-2xl font-bold text-white'>Timeout</h2>
      </div>
      <nav className='flex flex-1 flex-col space-y-2 overflow-y-auto pb-4 text-sm font-medium'>
        {menuList.map((menu) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;
          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg p-2 transition-colors ${
                isActive ? 'bg-primary text-white' : 'hover:bg-white/10'
              }`}
            >
              <Icon size={20} className='sidebar-link-icon' />
              {menu.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
