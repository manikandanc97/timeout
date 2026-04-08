'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { setAccessToken } from '@/lib/token';
import api from '@/services/api';
import { SidebarSkeleton, TopbarSkeleton, DashboardContentSkeleton } from '../layout/DashboardLayoutSkeleton';
import ApplyLeaveSkeleton from '@/app/(dashboard)/apply/loading';
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
    }

    return (
      <div className='flex h-screen overflow-hidden bg-gray-100'>
        <SidebarSkeleton />
        <div className='flex flex-col flex-1 overflow-hidden'>
          <TopbarSkeleton />
          <main className='flex-1 overflow-y-auto p-6'>
            {Content}
          </main>
        </div>
      </div>
    );
  }

  return <div>{children}</div>;
};

export default AuthGuard;
