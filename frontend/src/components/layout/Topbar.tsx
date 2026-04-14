'use client';

import { usePathname } from 'next/navigation';
import React, { useState } from 'react';
import Button from '../ui/Button';
import { Bell, Moon, Settings, User } from 'lucide-react';
import RightPanel from './RightPanel';

/** Single map: easier to update labels and avoids a long if/else chain. */
const ROUTE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/leaves': 'My Leaves',
  '/apply': 'Apply Leave',
  '/requests': 'Requests',
  '/employees': 'Employees',
  '/holidays': 'Holidays',
  '/team': 'Team Leaves',
  '/policy': 'Leave Policy',
  '/payroll': 'Payroll',
};

const resolvePageTitle = (pathname: string) => {
  if (ROUTE_TITLES[pathname]) return ROUTE_TITLES[pathname];
  const matchedPrefix = Object.keys(ROUTE_TITLES).find(
    (route) => pathname.startsWith(`${route}/`) && route !== '/',
  );
  return matchedPrefix ? ROUTE_TITLES[matchedPrefix] : 'Dashboard';
};

const Topbar = () => {
  const pathname = usePathname();

  const [activePanel, setActivePanel] = useState<string | null>(null);

  const pageTitle = resolvePageTitle(pathname);

  return (
    <div className='flex items-center justify-between border-b border-gray-100 bg-white p-4 shadow-sm'>
      <h1 className='text-2xl font-bold text-gray-900'>{pageTitle}</h1>
      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          aria-label='Toggle theme (coming soon)'
          className='text-gray-600!'
        >
          <Moon size={20} />
        </Button>
        <Button
          type='button'
          variant='ghost'
          aria-label='Notifications'
          onClick={() => setActivePanel('notifications')}
          className='text-gray-600!'
        >
          <Bell size={20} />
        </Button>
        <Button
          type='button'
          variant='ghost'
          aria-label='Settings'
          onClick={() => setActivePanel('settings')}
          className='text-gray-600!'
        >
          <Settings size={20} />
        </Button>
        <Button
          type='button'
          variant='ghost'
          aria-label='Profile'
          onClick={() => setActivePanel('profile')}
          className='text-gray-800!'
        >
          <User size={20} />
        </Button>
      </div>

      <RightPanel
        activePanel={activePanel}
        onClose={() => setActivePanel(null)}
      />
    </div>
  );
};

export default Topbar;
