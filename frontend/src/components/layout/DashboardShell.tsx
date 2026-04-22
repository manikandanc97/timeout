'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationProvider';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import type { User } from '@/types/user';

const AIAssistant = dynamic(
  () => import('@/components/ai-assistant/AIAssistant').then((mod) => mod.AIAssistant),
  { ssr: false },
);

type Props = {
  children: React.ReactNode;
  initialUser: User | null;
};

const MAIN_VIEWPORT_FILL_PATHS = new Set(['/team']);

const DashboardShell = ({ children, initialUser }: Props) => {
  const pathname = usePathname();
  const user = initialUser;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const fillMainHeight = MAIN_VIEWPORT_FILL_PATHS.has(pathname);
  const previousPathnameRef = useRef(pathname);

  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      const timeout = window.setTimeout(() => {
        setIsMobileMenuOpen(false);
      }, 0);
      return () => window.clearTimeout(timeout);
    }

    previousPathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const schedule = () => setShowAssistant(true);

    if (typeof window === 'undefined') {
      return;
    }

    const browserWindow = window as Window &
      typeof globalThis & {
        requestIdleCallback?: (
          callback: IdleRequestCallback,
          options?: IdleRequestOptions,
        ) => number;
        cancelIdleCallback?: (handle: number) => void;
      };

    if (browserWindow.requestIdleCallback) {
      const handle = browserWindow.requestIdleCallback(schedule, { timeout: 1500 });
      return () => browserWindow.cancelIdleCallback?.(handle);
    }

    const timeout = browserWindow.setTimeout(schedule, 900);
    return () => browserWindow.clearTimeout(timeout);
  }, []);

  return (
    <AuthProvider user={user}>
      <NotificationProvider>
        <div className='flex h-screen overflow-hidden bg-background'>
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
            <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
            <main
              className={
                fillMainHeight
                  ? 'flex flex-1 flex-col overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:min-h-0'
                  : 'flex-1 overflow-y-auto p-4 sm:p-6'
              }
            >
              {fillMainHeight ? (
                <div className='flex flex-col lg:min-h-0 lg:flex-1'>{children}</div>
              ) : (
                children
              )}
            </main>
          </div>
        </div>
        {showAssistant ? (
          <AIAssistant userRole={user?.role || 'EMPLOYEE'} />
        ) : null}
      </NotificationProvider>
    </AuthProvider>
  );
};

export default DashboardShell;
