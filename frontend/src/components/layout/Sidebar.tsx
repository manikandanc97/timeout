'use client';

import Link from 'next/link';
import { Hourglass } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { getMenuByRole, UserRole } from '@/constants/sidebarMenu';
import { useAuth } from '@/context/AuthContext';

type SidebarProps = {
  isOpen?: boolean;
  onClose?: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const pathname = usePathname();

  const { user } = useAuth();

  const userRole = (user?.role?.toLowerCase() || 'employee') as UserRole;
  const menuList = getMenuByRole(userRole);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className='fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden'
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:static lg:w-40 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className='flex shrink-0 items-center justify-between p-5'>
          <div className='flex items-center gap-2'>
            <Hourglass
              className='shrink-0 text-sidebar-foreground'
              fill='currentColor'
              aria-hidden
            />
            <h2 className='text-2xl font-bold text-sidebar-foreground'>Timeout</h2>
          </div>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className='rounded-md p-1 hover:bg-sidebar-hover lg:hidden'
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            >
              <line x1='18' y1='6' x2='6' y2='18' />
              <line x1='6' y1='6' x2='18' y2='18' />
            </svg>
          </button>
        </div>
        <nav className='flex flex-1 flex-col space-y-2 overflow-y-auto pb-4 font-medium text-sm'>
          {menuList.map((menu) => {
            const Icon = menu.icon;
            const isActive = pathname === menu.href;
            return (
              <Link
                key={menu.name}
                href={menu.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-colors lg:flex-col lg:justify-center lg:gap-2 lg:px-2 lg:py-2 ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-sidebar-hover'
                }`}
              >
                <Icon size={20} className='sidebar-link-icon' />
                <span>{menu.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
