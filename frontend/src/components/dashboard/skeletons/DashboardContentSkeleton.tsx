import React from 'react';
import LeaveBalanceSkeleton from './LeaveBalanceSkeleton';
import LeaveHistorySkeleton from './LeaveHistorySkeleton';
import LeaveSummarySkeleton from './LeaveSummarySkeleton';
import UpcomingHolidaysSkeleton from './UpcomingHolidaysSkeleton';
import WelcomeCardSkeleton from './WelcomeCardSkeleton';

const DashboardContentSkeleton = () => {
  return (
    <div className='space-y-6'>
      <div className='gap-6 grid grid-cols-1 md:grid-cols-3'>
        <div className='md:col-span-2'>
          <WelcomeCardSkeleton />
        </div>
        <div className='md:col-span-1'>
          <LeaveBalanceSkeleton />
        </div>
      </div>

      <LeaveSummarySkeleton />

      <div className='gap-6 grid grid-cols-1 lg:grid-cols-2'>
        <LeaveHistorySkeleton />
        <UpcomingHolidaysSkeleton />
      </div>
    </div>
  );
};

export default DashboardContentSkeleton;
