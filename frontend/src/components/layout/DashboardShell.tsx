'use client';

import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { setAccessToken } from '@/lib/token';
import api from '@/services/api';
import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationProvider';
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
import HolidaysSkeleton from '@/components/dashboard/skeletons/HolidaysSkeleton';
import PayrollSkeleton from '@/components/dashboard/skeletons/PayrollSkeleton';
import ReportsSkeleton from '@/components/dashboard/skeletons/ReportsSkeleton';
import ApplyLeaveSkeleton from '@/app/(dashboard)/apply/loading';
import MyLeavesSkeleton from '@/app/(dashboard)/leaves/loading';
import { AIAssistant } from '@/components/ai-assistant/AIAssistant';

type Props = {
  children: React.ReactNode;
  initialRole?: string | null;
};

/** Main fills viewport under topbar; inner routes manage their own scroll regions. */
const MAIN_VIEWPORT_FILL_PATHS = new Set(['/team']);

const DashboardShell = ({ children, initialRole = null }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [roleHint, setRoleHint] = useState<string | null>(initialRole);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const fillMainHeight = MAIN_VIEWPORT_FILL_PATHS.has(pathname);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

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
    // Session is validated once on mount. Re-running on every pathname change
    // remounted the shell in a loading state and made every navigation look
    // like a full dashboard reload.
  }, [router]);

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
      content = <HolidaysSkeleton />;
    } else if (pathname === '/team') {
      content = <TeamsPageSkeleton />;
    } else if (pathname === '/payroll') {
      content = <PayrollSkeleton />;
    } else if (pathname === '/reports') {
      content = <ReportsSkeleton />;
    } else if (pathname === '/settings') {
      content = <ReportsSkeleton />;
    } else if (pathname === '/payslip') {
      content = <PayrollSkeleton />;
    }

    return (
      <div className='flex h-screen overflow-hidden bg-background'>
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
      <NotificationProvider>
        <div className='flex h-screen overflow-hidden bg-background'>
          <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
          <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
            <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
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
        {/* AI Assistant floating widget — available on every page */}
        <AIAssistant userRole={user?.role || 'EMPLOYEE'} />
      </NotificationProvider>
    </AuthProvider>
  );
};

export default DashboardShell;
