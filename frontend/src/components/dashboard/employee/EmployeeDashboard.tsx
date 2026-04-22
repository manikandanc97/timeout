import WelcomeCard from '@/components/dashboard/cards/WelcomeCard';
import UpcomingHolidays from '@/components/dashboard/sections/UpcomingHolidays';
import EmployeeDashboardShell from '@/components/dashboard/employee/EmployeeDashboardShell';
import { getDashboardData, getLeaveHistory } from '@/services/dashboardService';
import { serverFetch } from '@/services/serverApi';
import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';
import type { User } from '@/types/user';
import { startOfLocalCalendarDay } from '@/utils/leave/leaveHelpers';

export default async function EmployeeDashboard({ user }: { user: User | null }) {
  const [dash, historyRaw, holidaysRaw] = await Promise.all([
    getDashboardData(),
    getLeaveHistory(),
    serverFetch<Holiday[]>('/holidays').catch(() => []),
  ]);

  const history = Array.isArray(historyRaw) ? historyRaw : [];
  const holidays = Array.isArray(holidaysRaw) ? holidaysRaw : [];
  const today = startOfLocalCalendarDay(new Date());
  const upcomingHolidays = holidays
    .filter(
      (holiday) =>
        startOfLocalCalendarDay(new Date(holiday.date)).getTime() >= today.getTime(),
    )
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <EmployeeDashboardShell
      initialDashboard={dash}
      initialHistory={history.slice(0, 10) as Leave[]}
      holidays={holidays}
      welcome={<WelcomeCard name={user?.name || 'User'} />}
      upcoming={<UpcomingHolidays holidays={upcomingHolidays} />}
    />
  );
}
