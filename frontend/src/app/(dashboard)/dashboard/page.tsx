import dynamic from 'next/dynamic';
import WelcomeCardSkeleton from '@/components/dashboard/skeletons/WelcomeCardSkeleton';
import LeaveSummarySkeleton from '@/components/dashboard/skeletons/LeaveSummarySkeleton';
import LeaveBalanceSkeleton from '@/components/dashboard/skeletons/LeaveBalanceSkeleton';
import LeaveHistorySkeleton from '@/components/dashboard/skeletons/LeaveHistorySkeleton';
import UpcomingHolidaysSkeleton from '@/components/dashboard/skeletons/UpcomingHolidaysSkeleton';

const WelcomeCardServer = dynamic(
  () => import('@/components/dashboard/cards/WelcomeCardServer'),
  {
    loading: () => <WelcomeCardSkeleton />,
    ssr: true,
  },
);

const LeaveSummaryServer = dynamic(
  () => import('@/components/dashboard/cards/LeaveSummaryServer'),
  {
    loading: () => <LeaveSummarySkeleton />,
    ssr: true,
  },
);

const LeaveBalanceServer = dynamic(
  () => import('@/components/dashboard/cards/LeaveBalanceServer'),
  {
    loading: () => <LeaveBalanceSkeleton />,
    ssr: true,
  },
);

const LeaveHistoryServer = dynamic(
  () => import('@/components/dashboard/sections/LeaveHistoryServer'),
  {
    loading: () => <LeaveHistorySkeleton />,
    ssr: true,
  },
);

const UpcomingHolidaysServer = dynamic(
  () => import('@/components/dashboard/sections/UpcomingHolidaysServer'),
  {
    loading: () => <UpcomingHolidaysSkeleton />,
    ssr: true,
  },
);

const Dashboard = () => {
  return (
    <div className='space-y-6'>
      <div className='gap-6 grid grid-cols-1 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <WelcomeCardServer />
        </div>
        <div className='md:col-span-1'>
          <LeaveBalanceServer />
        </div>
      </div>
      <div>
        <LeaveSummaryServer />
      </div>
      <div>
        <div className='gap-6 grid grid-cols-1 lg:grid-cols-2'>
          <LeaveHistoryServer />
          <UpcomingHolidaysServer />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
