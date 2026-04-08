import React from 'react';
import SidebarSkeleton from './SidebarSkeleton';
import TopbarSkeleton from './TopbarSkeleton';
import DashboardContentSkeleton from './DashboardContentSkeleton';

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
