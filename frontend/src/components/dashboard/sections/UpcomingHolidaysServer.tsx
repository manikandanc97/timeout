import UpcomingHolidays from './UpcomingHolidays';
import { serverFetch } from '@/services/server-api';

const UpcomingHolidaysServer = async () => {
  const holidays = await serverFetch('/holidays');

  return <UpcomingHolidays holidays={holidays} />;
};

export default UpcomingHolidaysServer;
