'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { setAccessToken } from '@/lib/token';
import api from '@/services/api';
import SidebarSkeleton from '@/components/dashboard/skeletons/SidebarSkeleton';
import TopbarSkeleton from '@/components/dashboard/skeletons/TopbarSkeleton';
import DashboardContentSkeleton from '@/components/dashboard/skeletons/DashboardContentSkeleton';
import ApplyLeaveSkeleton from '@/app/(dashboard)/apply/loading';
import MyLeavesSkeleton from '@/app/(dashboard)/leaves/loading';
import { usePathname } from 'next/navigation';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .post('/auth/refresh')
      .then((res) => {
        setAccessToken(res.data.accessToken);
        setLoading(false);
      })
      .catch(() => {
        router.push('/login');
      });
  }, [router]);

  if (loading) {
    let Content = null;
    if (pathname === '/dashboard') {
      Content = <DashboardContentSkeleton />;
    } else if (pathname === '/apply') {
      Content = <ApplyLeaveSkeleton />;
    } else if (pathname === '/leaves') {
      Content = <MyLeavesSkeleton />;
    }

    return (
      <div className='flex bg-gray-100 h-screen overflow-hidden'>
        <SidebarSkeleton />
        <div className='flex flex-col flex-1 overflow-hidden'>
          <TopbarSkeleton />
          <main className='flex-1 p-6 overflow-y-auto'>{Content}</main>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default AuthGuard;
