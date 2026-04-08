import React from 'react';
import ApplyLeaveClient from './ApplyLeaveClient';
import { serverFetch } from '@/services/serverApi';
import { getDashboardData } from '@/services/dashboardService';
import type { User } from '@/types/user';
import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';

const page = async () => {
  const [profile, dashboard, holidays, history] = await Promise.all([
    serverFetch<User>('/profile'),
    getDashboardData(),
    serverFetch<Holiday[]>('/holidays'),
    serverFetch<Leave[]>('/history'),
  ]);

  return (
    <ApplyLeaveClient
      initialProfile={profile}
      initialDashboard={dashboard}
      initialHolidays={holidays}
      initialHistory={history}
    />
  );
};

export default page;
