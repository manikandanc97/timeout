import React from 'react';
import ApplyLeaveClient from './ApplyLeaveClient';
import { serverFetch } from '@/services/server-api';
import { getDashboardData } from '@/services/dashboard-data';

const page = async () => {
  const [profile, dashboard, holidays, history] = await Promise.all([
    serverFetch('/profile'),
    getDashboardData(),
    serverFetch('/holidays'),
    serverFetch('/history'),
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
