'use client';

import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setIsMobileMenuOpen(false);
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [pathname, isMobileMenuOpen]);

  useEffect(() => {
    const schedule = () => setShowAssistant(true);

    if (typeof window === 'undefined') {
      return;
    }

    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(schedule, { timeout: 1500 });
      return () => window.cancelIdleCallback(handle);
    }

    const timeout = window.setTimeout(schedule, 900);
    return () => window.clearTimeout(timeout);
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
                  ? 'flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden p-4 sm:p-6'
                  : 'flex-1 overflow-y-auto p-4 sm:p-6'
              }
            >
              {fillMainHeight ? (
                <div className='flex min-h-0 flex-1 flex-col'>{children}</div>
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
