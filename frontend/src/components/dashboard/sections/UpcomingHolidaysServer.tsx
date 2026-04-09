import UpcomingHolidays from './UpcomingHolidays';
import { serverFetch } from '@/services/serverApi';
import type { Holiday } from '@/types/holiday';
import { startOfLocalCalendarDay } from '@/utils/leave/leaveHelpers';

const UpcomingHolidaysServer = async () => {
  const holidays = await serverFetch<Holiday[]>('/holidays');
  const list = Array.isArray(holidays) ? holidays : [];

  const today = startOfLocalCalendarDay(new Date());
  const upcoming = list
    .filter(
      (h) => startOfLocalCalendarDay(new Date(h.date)).getTime() >= today.getTime(),
    )
    .sort(
      (a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime(),
    )
    .slice(0, 10);

  return <UpcomingHolidays holidays={upcoming} />;
};

export default UpcomingHolidaysServer;
