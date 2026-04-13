'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { setAccessToken } from '@/lib/token';
import api from '@/services/api';
import { AuthProvider } from '@/context/AuthContext';
import type { User } from '@/types/user';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import SidebarSkeleton from '@/components/dashboard/skeletons/SidebarSkeleton';
import TopbarSkeleton from '@/components/dashboard/skeletons/TopbarSkeleton';
import AdminDashboardSkeleton from '@/components/dashboard/skeletons/AdminDashboardSkeleton';
import DashboardContentSkeleton from '@/components/dashboard/skeletons/DashboardContentSkeleton';
import LeaveRequestsSkeleton from '@/components/dashboard/skeletons/LeaveRequestsSkeleton';
import EmployeesSkeleton from '@/components/dashboard/skeletons/EmployeesSkeleton';
import TeamsPageSkeleton from '@/components/dashboard/skeletons/TeamsPageSkeleton';
import ApplyLeaveSkeleton from '@/app/(dashboard)/apply/loading';
import MyLeavesSkeleton from '@/app/(dashboard)/leaves/loading';

type Props = {
  children: React.ReactNode;
  initialRole?: string | null;
};

/** Main fills viewport under topbar; page scrolls inside its own panel (not whole main). */
const MAIN_VIEWPORT_FILL_PATHS = new Set([
  '/requests',
  '/employees',
  '/team',
  '/holidays',
]);

const DashboardShell = ({ children, initialRole = null }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [roleHint, setRoleHint] = useState<string | null>(initialRole);
  const fillMainHeight = MAIN_VIEWPORT_FILL_PATHS.has(pathname);

  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      setLoading(true);
      try {
        const refreshRes = await api.post('/auth/refresh');
        setAccessToken(refreshRes.data.accessToken);
        const userRes = await api.get('/auth/me');
        if (cancelled) return;
        setUser(userRes.data);
        const resolvedRole = String(userRes.data?.role ?? '');
        if (resolvedRole) setRoleHint(resolvedRole);
        setLoading(false);
      } catch {
        if (!cancelled) router.push('/login');
      }
    };

    void validateSession();
    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (loading) {
    let content: React.ReactNode = null;
    if (pathname === '/dashboard') {
      const effectiveRole = String(user?.role ?? roleHint ?? '');
      content =
        effectiveRole === 'EMPLOYEE' ? (
          <DashboardContentSkeleton />
        ) : (
          <AdminDashboardSkeleton />
        );
    } else if (pathname === '/apply') {
      content = <ApplyLeaveSkeleton />;
    } else if (pathname === '/leaves') {
      content = <MyLeavesSkeleton />;
    } else if (pathname === '/requests') {
      content = <LeaveRequestsSkeleton />;
    } else if (pathname === '/employees') {
      content = <EmployeesSkeleton />;
    } else if (pathname === '/holidays') {
      content = <LeaveRequestsSkeleton />;
    } else if (pathname === '/team') {
      content = <TeamsPageSkeleton />;
    }

    return (
      <div className='flex h-screen overflow-hidden bg-gray-100'>
        <SidebarSkeleton />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <TopbarSkeleton />
          <main
            className={
              fillMainHeight
                ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-6'
                : 'flex-1 overflow-y-auto p-6'
            }
          >
            {fillMainHeight ? (
              <div className='flex min-h-0 flex-1 flex-col'>{content}</div>
            ) : (
              content
            )}
          </main>
        </div>
      </div>
    );
  }

  return (
    <AuthProvider user={user}>
      <div className='flex h-screen overflow-hidden bg-background'>
        <Sidebar />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <Topbar />
          <main
            className={
              fillMainHeight
                ? 'flex min-h-0 flex-1 flex-col overflow-hidden p-6'
                : 'flex-1 overflow-y-auto p-6'
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
    </AuthProvider>
  );
};

export default DashboardShell;
