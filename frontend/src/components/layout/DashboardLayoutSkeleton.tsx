import React from 'react';
import LeaveBalanceSkeleton from '@/components/dashboard/skeletons/LeaveBalanceSkeleton';
import LeaveHistorySkeleton from '@/components/dashboard/skeletons/LeaveHistorySkeleton';
import LeaveSummarySkeleton from '@/components/dashboard/skeletons/LeaveSummarySkeleton';
import UpcomingHolidaysSkeleton from '@/components/dashboard/skeletons/UpcomingHolidaysSkeleton';
import WelcomeCardSkeleton from '@/components/dashboard/skeletons/WelcomeCardSkeleton';

const SidebarSkeleton = () => {
  return (
    <aside className='flex flex-col bg-primary-dark w-40 h-full text-white'>
      <div className='flex items-center gap-2 p-5 shrink-0'>
        <div className='bg-white/20 rounded-md w-6 h-6 animate-pulse' />
        <div className='bg-white/20 rounded w-20 h-6 animate-pulse' />
      </div>

      <div className='flex flex-col flex-1 gap-4 px-2 pb-4 overflow-y-auto'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className='flex flex-col justify-center items-center gap-2 bg-white/8 rounded p-2 h-[68px]'
          >
            <div className='bg-white/20 rounded w-5 h-5 animate-pulse' />
            <div className='bg-white/20 rounded w-16 h-3 animate-pulse' />
          </div>
        ))}
      </div>
    </aside>
  );
};

const TopbarSkeleton = () => {
  return (
    <div className='flex justify-between items-center bg-white shadow-md p-4'>
      <div className='bg-gray-200 rounded w-40 h-8 animate-pulse' />

      <div className='flex gap-2'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='bg-gray-200 rounded-full w-10 h-10 animate-pulse'
          />
        ))}
      </div>
    </div>
  );
};

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

const DashboardLayoutSkeleton = () => {
  return (
    <div className='flex h-screen overflow-hidden bg-gray-100'>
      <SidebarSkeleton />

      <div className='flex flex-col flex-1 overflow-hidden'>
        <TopbarSkeleton />
        <main className='flex-1 overflow-y-auto p-6'>
          <DashboardContentSkeleton />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayoutSkeleton;
