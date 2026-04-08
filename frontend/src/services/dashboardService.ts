import { cache } from 'react';
import type { LeaveDashboardData } from '@/types/leave';
import { serverFetch } from './serverApi';

export const getDashboardData = cache(async () => {
  return serverFetch<LeaveDashboardData>('/leaves/dashboard');
});
