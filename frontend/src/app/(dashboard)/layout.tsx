import AuthGuard from '@/components/auth/AuthGuard';
import Sidebar from '@/components/layout/Sidebar';
import Topbar from '@/components/layout/Topbar';
import React from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthGuard>
      <div>
        <div className='flex h-screen overflow-hidden bg-gray-100'>
          <Sidebar />

          <div className='flex flex-col flex-1 overflow-hidden'>
            <Topbar />
            <main className='flex-1 overflow-y-auto p-6'>{children}</main>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;
