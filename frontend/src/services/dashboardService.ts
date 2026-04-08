import { cache } from 'react';
import type { Leave, LeaveDashboardData } from '@/types/leave';
import { serverFetch } from './serverApi';

export const getDashboardData = cache(async () => {
  return serverFetch<LeaveDashboardData>('/leaves/dashboard');
});

export const getLeaveHistory = cache(async () => {
  return serverFetch<Leave[]>('/history');
});
