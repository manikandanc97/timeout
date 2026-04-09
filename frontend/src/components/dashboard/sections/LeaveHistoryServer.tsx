import LeaveHistory from './LeaveHistory';
import { serverFetch } from '@/services/serverApi';
import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';

const LeaveHistoryServer = async () => {
  const [history, holidays] = await Promise.all([
    serverFetch<Leave[]>('/history'),
    serverFetch<Holiday[]>('/holidays').catch(() => []),
  ]);
  const list = Array.isArray(history) ? history : [];
  const hol = Array.isArray(holidays) ? holidays : [];

  return <LeaveHistory leaves={list.slice(0, 10)} holidays={hol} />;
};

export default LeaveHistoryServer;
