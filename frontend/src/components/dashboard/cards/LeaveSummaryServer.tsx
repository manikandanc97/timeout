import { getDashboardData } from '@/services/dashboardService';
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
