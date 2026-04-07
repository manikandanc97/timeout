import LeaveHistory from './LeaveHistory';
import { serverFetch } from '@/services/server-api';

const LeaveHistoryServer = async () => {
  const history = await serverFetch('/history');

  return <LeaveHistory leaves={history} />;
};

export default LeaveHistoryServer;
