'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { Bell, Moon, Settings, Sun, User } from 'lucide-react';
import RightPanel from './RightPanel';
import { applyTheme, type ThemeMode } from '@/lib/theme';

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
  '/reports': 'Reports',
  '/payslip': 'Payslip',
  '/settings': 'Settings',
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
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  const pageTitle = resolvePageTitle(pathname);

  const toggleColorMode = () => {
    const next: ThemeMode = isDark ? 'light' : 'dark';
    applyTheme(next);
    setIsDark(next === 'dark');
  };

  return (
    <div className='flex items-center justify-between border-b border-border bg-card p-4 shadow-sm'>
      <h1 className='text-2xl font-bold text-card-foreground'>{pageTitle}</h1>
      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          onClick={toggleColorMode}
          className='text-muted-foreground! hover:text-card-foreground!'
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </Button>
        <Button
          type='button'
          variant='ghost'
          aria-label='Notifications'
          onClick={() => setActivePanel('notifications')}
          className='text-muted-foreground! hover:text-card-foreground!'
        >
          <Bell size={20} />
        </Button>
        <Button
          type='button'
          variant='ghost'
          aria-label='Settings'
          onClick={() => setActivePanel('settings')}
          className='text-muted-foreground! hover:text-card-foreground!'
        >
          <Settings size={20} />
        </Button>
        <Button
          type='button'
          variant='ghost'
          aria-label='Profile'
          onClick={() => setActivePanel('profile')}
          className='text-card-foreground! opacity-90 hover:opacity-100'
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
