import LeaveBalance from './LeaveBalance';
import { getDashboardData } from '@/services/dashboardService';

const LeaveBalanceServer = async () => {
  const data = await getDashboardData();

  return <LeaveBalance balance={data.balance} />;
};

export default LeaveBalanceServer;
