'use client';

import ApplyLeave from '@/components/leave/ApplyLeave';
import LeaveCalendarPanel from '@/components/leave/LeaveCalendarPanel';
import type { Leave, LeaveDashboardData } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import type { User } from '@/types/user';
import React, { useState } from 'react';

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
  const [history, setHistory] = useState<Leave[]>(initialHistory ?? []);

  const handleLeaveCreated = (leave: Leave | null | undefined) => {
    if (!leave) return;
    setHistory((prev) => {
      const byId = new Map<number, Leave>();
      prev.forEach((l) => {
        if (l.id != null) byId.set(l.id, l);
      });
      if (leave.id != null) {
        byId.set(leave.id, leave);
      } else {
        // fall back to append if no id
        return [leave, ...prev];
      }
      return Array.from(byId.values()).sort(
        (a, b) =>
          new Date(b.fromDate ?? b.startDate ?? '').getTime() -
          new Date(a.fromDate ?? a.startDate ?? '').getTime(),
      );
    });
  };

  return (
    <div className='gap-6 grid grid-cols-1 xl:grid-cols-3'>
      <div className='xl:col-span-2'>
        <ApplyLeave
          userGender={initialProfile?.gender ?? ''}
          balance={initialDashboard?.balance ?? null}
          holidays={initialHolidays ?? []}
          history={history}
          onSuccess={handleLeaveCreated}
        />
      </div>
      <div className='top-2 xl:sticky self-start xl:col-span-1'>
        <LeaveCalendarPanel
          holidays={initialHolidays ?? []}
          history={history}
        />
      </div>
    </div>
  );
};

export default ApplyLeaveClient;
