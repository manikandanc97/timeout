import React from 'react';
import SidebarSkeleton from './SidebarSkeleton';
import TopbarSkeleton from './TopbarSkeleton';
import DashboardContentSkeleton from './DashboardContentSkeleton';

const DashboardLayoutSkeleton = () => {
  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <SidebarSkeleton />

      <div className='flex flex-1 flex-col overflow-hidden'>
        <TopbarSkeleton />
        <main className='flex-1 overflow-y-auto p-6'>
          <DashboardContentSkeleton />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayoutSkeleton;
