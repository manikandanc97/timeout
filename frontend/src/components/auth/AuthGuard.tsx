'use client';

import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { setAccessToken } from '@/lib/token';
import api from '@/services/api';
import DashboardLayoutSkeleton from '../layout/DashboardLayoutSkeleton';

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
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
    return <DashboardLayoutSkeleton />;
  }

  return <div>{children}</div>;
};

export default AuthGuard;
