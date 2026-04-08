import MyLeavesList from '@/components/leave/MyLeavesList';
import { getLeaveHistory } from '@/services/dashboardService';
import type { Leave } from '@/types/leave';
import React from 'react';

const LeavesPage = async () => {
  const response = await getLeaveHistory();
  const leaves: Leave[] = Array.isArray(response)
    ? response
    : ((response as { data?: Leave[] })?.data ?? []);

  console.log('history response', response);

  return (
    <div className='bg-white shadow-md p-6 rounded-2xl'>
      <h1 className='font-semibold text-gray-900 text-2xl'>My Leaves</h1>
      <p className='mt-2 text-gray-600'>View and manage your leave requests</p>
      <div>
        <MyLeavesList leaves={leaves} />
      </div>
    </div>
  );
};

export default LeavesPage;
