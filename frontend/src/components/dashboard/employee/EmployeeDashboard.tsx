import WelcomeCardServer from '@/components/dashboard/cards/WelcomeCardServer';
import UpcomingHolidaysServer from '@/components/dashboard/sections/UpcomingHolidaysServer';
import WelcomeCardSkeleton from '@/components/dashboard/skeletons/WelcomeCardSkeleton';
import UpcomingHolidaysSkeleton from '@/components/dashboard/skeletons/UpcomingHolidaysSkeleton';
import EmployeeDashboardShell from '@/components/dashboard/employee/EmployeeDashboardShell';
import { getDashboardData, getLeaveHistory } from '@/services/dashboardService';
import { serverFetch } from '@/services/serverApi';
import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';
import { Suspense } from 'react';

export default async function EmployeeDashboard() {
  const [dash, historyRaw, holidaysRaw] = await Promise.all([
    getDashboardData(),
    getLeaveHistory(),
    serverFetch<Holiday[]>('/holidays').catch(() => []),
  ]);

  const history = Array.isArray(historyRaw) ? historyRaw : [];
  const holidays = Array.isArray(holidaysRaw) ? holidaysRaw : [];

  return (
    <EmployeeDashboardShell
      initialDashboard={dash}
      initialHistory={history.slice(0, 10) as Leave[]}
      holidays={holidays}
      welcome={
        <Suspense key='welcome-slot' fallback={<WelcomeCardSkeleton />}>
          <WelcomeCardServer />
        </Suspense>
      }
      upcoming={
        <Suspense key='upcoming-slot' fallback={<UpcomingHolidaysSkeleton />}>
          <UpcomingHolidaysServer />
        </Suspense>
      }
    />
  );
}
