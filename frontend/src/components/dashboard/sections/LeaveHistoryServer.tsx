import LeaveHistory from './LeaveHistory';
import { serverFetch } from '@/services/serverApi';
import type { Leave } from '@/types/leave';

const LeaveHistoryServer = async () => {
  const history = await serverFetch<Leave[]>('/history');

  return <LeaveHistory leaves={history} />;
};

export default LeaveHistoryServer;
