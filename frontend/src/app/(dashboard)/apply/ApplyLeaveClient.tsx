'use client';

import ApplyLeave from '@/components/leave/ApplyLeave';
import LeaveCalendarPanel from '@/components/leave/LeaveCalendarPanel';
import type { Leave, LeaveDashboardData } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import type { User } from '@/types/user';
import React from 'react';

type Props = {
  initialProfile: Partial<User> | null;
  initialDashboard: LeaveDashboardData | null;
  initialHolidays: Holiday[];
  initialHistory: Leave[];
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
      <div className='top-2 xl:sticky self-start xl:col-span-1'>
        <LeaveCalendarPanel
          holidays={initialHolidays ?? []}
          history={initialHistory ?? []}
        />
      </div>
    </div>
  );
};

export default ApplyLeaveClient;
