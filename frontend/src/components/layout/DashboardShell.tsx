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
import DashboardContentSkeleton from '@/components/dashboard/skeletons/DashboardContentSkeleton';
import ApplyLeaveSkeleton from '@/app/(dashboard)/apply/loading';
import MyLeavesSkeleton from '@/app/(dashboard)/leaves/loading';

type Props = {
  children: React.ReactNode;
};

const DashboardShell = ({ children }: Props) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    const validateSession = async () => {
      try {
        const refreshRes = await api.post('/auth/refresh');
        setAccessToken(refreshRes.data.accessToken);
        const userRes = await api.get('/auth/me');
        if (cancelled) return;
        setUser(userRes.data);
        setLoading(false);
      } catch {
        if (!cancelled) router.push('/login');
      }
    };

    void validateSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (loading) {
    let content: React.ReactNode = null;
    if (pathname === '/dashboard') {
      content = <DashboardContentSkeleton />;
    } else if (pathname === '/apply') {
      content = <ApplyLeaveSkeleton />;
    } else if (pathname === '/leaves') {
      content = <MyLeavesSkeleton />;
    }

    return (
      <div className='flex h-screen overflow-hidden bg-gray-100'>
        <SidebarSkeleton />
        <div className='flex min-w-0 flex-1 flex-col overflow-hidden'>
          <TopbarSkeleton />
          <main className='flex-1 overflow-y-auto p-6'>{content}</main>
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
          <main className='flex-1 overflow-y-auto p-6'>{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
};

export default DashboardShell;
