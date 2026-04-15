'use client';

import Link from 'next/link';
import { Hourglass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { employeeMenuList, adminMenuList } from '@/constants/sidebarMenu';
import { useAuth } from '@/context/AuthContext';

const Sidebar = () => {
  const pathname = usePathname();

  const { user } = useAuth();

  let menuList = employeeMenuList;

  if (
    user &&
    (user.role === 'ADMIN' ||
      user.role === 'MANAGER' ||
      user.role === 'HR')
  ) {
    menuList = adminMenuList;
  }

  return (
    <aside className='flex h-full w-40 flex-col bg-sidebar text-sidebar-foreground'>
      <div className='flex shrink-0 items-center gap-2 p-5'>
        <Hourglass
          className='shrink-0 text-sidebar-foreground'
          fill='currentColor'
          aria-hidden
        />
        <h2 className='text-2xl font-bold text-sidebar-foreground'>Timeout</h2>
      </div>
      <nav className='flex flex-col flex-1 space-y-2 pb-4 overflow-y-auto font-medium text-sm'>
        {menuList.map((menu) => {
          const Icon = menu.icon;
          const isActive = pathname === menu.href;
          return (
            <Link
              key={menu.name}
              href={menu.href}
              className={`flex flex-col items-center justify-center gap-2 rounded-lg p-2 transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-sidebar-hover'
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
