import UpcomingHolidays from './UpcomingHolidays';
import { serverFetch } from '@/services/serverApi';
import type { Holiday } from '@/types/holiday';

const UpcomingHolidaysServer = async () => {
  const holidays = await serverFetch<Holiday[]>('/holidays');

  return <UpcomingHolidays holidays={holidays} />;
};

export default UpcomingHolidaysServer;
