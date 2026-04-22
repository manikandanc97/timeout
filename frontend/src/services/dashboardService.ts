import { cache } from 'react';
import type { Leave, LeaveDashboardData } from '@/types/leave';
import { serverFetch } from './serverApi';
import type { Holiday } from '@/types/holiday';
import type { AdminDashboardSnapshot } from '@/types/dashboard';

export const getDashboardData = cache(async () => {
  return serverFetch<LeaveDashboardData>('/leaves/dashboard');
});

export const getLeaveHistory = cache(async () => {
  return serverFetch<Leave[]>('/history');
});

export const getAdminDashboardSnapshot = cache(async () => {
  return serverFetch<AdminDashboardSnapshot>('/dashboard/stats');
});

export const getHolidayList = cache(async () => {
  return serverFetch<Holiday[]>('/holidays');
});
