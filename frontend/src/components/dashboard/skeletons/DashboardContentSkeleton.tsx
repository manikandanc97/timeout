import React from 'react';
import LeaveBalanceSkeleton from './LeaveBalanceSkeleton';
import LeaveHistorySkeleton from './LeaveHistorySkeleton';
import LeaveSummarySkeleton from './LeaveSummarySkeleton';
import UpcomingHolidaysSkeleton from './UpcomingHolidaysSkeleton';
import WelcomeCardSkeleton from './WelcomeCardSkeleton';

const DashboardContentSkeleton = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <WelcomeCardSkeleton />
        </div>
        <div className='lg:col-span-1'>
          <LeaveBalanceSkeleton />
        </div>
      </div>

      <div>
        <LeaveSummarySkeleton />
      </div>

      <div>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <LeaveHistorySkeleton />
          <UpcomingHolidaysSkeleton />
        </div>
      </div>
    </div>
  );
};

export default DashboardContentSkeleton;
