'use client';

import ApplyLeave from '@/components/leave/ApplyLeave';
import LeaveCalendarPanel from '@/components/leave/LeaveCalendarPanel';
import React from 'react';

type Props = {
  initialProfile: any;
  initialDashboard: any;
  initialHolidays: any[];
  initialHistory: any[];
};

const ApplyLeaveClient = ({
  initialProfile,
  initialDashboard,
  initialHolidays,
  initialHistory,
}: Props) => {
  return (
    <div className='gap-6 grid grid-cols-1 xl:grid-cols-3'>
      <div className='xl:col-span-2'>
        <ApplyLeave
          userGender={initialProfile?.gender ?? ''}
          balance={initialDashboard?.balance ?? null}
          holidays={initialHolidays ?? []}
          history={initialHistory ?? []}
        />
      </div>
      <div className='xl:col-span-1'>
        <LeaveCalendarPanel
          holidays={initialHolidays ?? []}
          history={initialHistory ?? []}
        />
      </div>
    </div>
  );
};

export default ApplyLeaveClient;
