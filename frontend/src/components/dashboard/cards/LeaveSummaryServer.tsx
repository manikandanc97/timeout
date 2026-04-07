import { getDashboardData } from '@/services/dashboard-data';
import LeaveSummaryCards from './LeaveSummaryCards';

const LeaveSummaryServer = async () => {
  const data = await getDashboardData();

  return (
    <LeaveSummaryCards
      balance={data.balance}
      monthlyUsage={data.monthlyUsage}
      chartData={data.chartData}
    />
  );
};

export default LeaveSummaryServer;
