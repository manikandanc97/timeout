'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import Button from '../ui/Button';
import { Bell, Settings } from 'lucide-react';
import RightPanel from './RightPanel';
import { useNotifications } from '@/context/NotificationProvider';
import { useAuth } from '@/context/AuthContext';
import { formatPersonName, initialsFromPersonName } from '@/lib/personName';

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
  const { unreadCount } = useNotifications();
  const { user } = useAuth();

  const [activePanel, setActivePanel] = useState<string | null>(null);

  useEffect(() => {
    const openAiPanel = () => setActivePanel('aiChat');
    window.addEventListener('open-ai-chat-panel', openAiPanel);
    return () => window.removeEventListener('open-ai-chat-panel', openAiPanel);
  }, []);

  const pageTitle = resolvePageTitle(pathname);
  const displayName = formatPersonName(user?.name) || 'User';
  const roleLabel = String(user?.role ?? 'Member').toUpperCase();
  const initials = initialsFromPersonName(displayName);

  return (
    <div className='flex items-center justify-between border-b border-border bg-card p-4 shadow-sm dark:shadow-none'>
      <h1 className='text-2xl font-bold text-card-foreground'>{pageTitle}</h1>
      <div className='flex items-center gap-1'>
        <Button
          type='button'
          variant='ghost'
          aria-label='Notifications'
          onClick={() => setActivePanel('notifications')}
          className='relative text-muted-foreground! hover:text-card-foreground!'
        >
          <Bell size={20} />
          {unreadCount > 0 ? (
            <span className='absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-none text-destructive-foreground'>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
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
          className='rounded-full! border! border-border! bg-muted/60! px-2! py-1! text-card-foreground! hover:bg-muted!'
        >
          <div className='flex items-center gap-2'>
            <span className='flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground'>
              {initials}
            </span>
            <span className='hidden text-left leading-tight sm:block'>
              <span className='block max-w-32 truncate text-sm font-semibold text-card-foreground'>
                {displayName}
              </span>
              <span className='block text-[11px] font-medium tracking-wide text-muted-foreground'>
                {roleLabel}
              </span>
            </span>
          </div>
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
