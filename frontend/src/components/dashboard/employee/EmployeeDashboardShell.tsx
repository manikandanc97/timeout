'use client';

import LeaveBalance from '@/components/dashboard/cards/LeaveBalance';
import LeaveHistory from '@/components/dashboard/sections/LeaveHistory';
import LeaveSummaryCards from '@/components/dashboard/cards/LeaveSummaryCards';
import { subscribeDashboardRefresh } from '@/lib/dashboardRealtimeBus';
import api from '@/services/api';
import type { Holiday } from '@/types/holiday';
import type { Leave, LeaveDashboardData } from '@/types/leave';
import { Fragment, type ReactNode } from 'react';
import { useCallback, useEffect, useState } from 'react';

type Props = {
  initialDashboard: LeaveDashboardData;
  initialHistory: Leave[];
  holidays: Holiday[];
  welcome: ReactNode;
  upcoming: ReactNode;
};

export default function EmployeeDashboardShell({
  initialDashboard,
  initialHistory,
  holidays: initialHolidays,
  welcome,
  upcoming,
}: Props) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [history, setHistory] = useState(initialHistory);
  const [holidays, setHolidays] = useState(initialHolidays);

  useEffect(() => {
    setDashboard(initialDashboard);
  }, [initialDashboard]);

  useEffect(() => {
    setHistory(initialHistory);
  }, [initialHistory]);

  useEffect(() => {
    setHolidays(initialHolidays);
  }, [initialHolidays]);

  const refetchLeaveSections = useCallback(async () => {
    try {
      const [dashRes, histRes, holRes] = await Promise.all([
        api.get<LeaveDashboardData>('/leaves/dashboard'),
        api.get<Leave[]>('/history'),
        api.get<Holiday[]>('/holidays').catch(() => ({ data: [] as Holiday[] })),
      ]);
      setDashboard(dashRes.data);
      const list = Array.isArray(histRes.data) ? histRes.data : [];
      setHistory(list.slice(0, 10));
      setHolidays(Array.isArray(holRes.data) ? holRes.data : []);
    } catch {
      /* keep previous data */
    }
  }, []);

  useEffect(() => {
    return subscribeDashboardRefresh('employeeDashboard', () => {
      void refetchLeaveSections();
    });
  }, [refetchLeaveSections]);

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <Fragment key='welcome-slot'>{welcome}</Fragment>
        </div>
        <div className='min-h-0 min-w-0 lg:col-span-1'>
          <LeaveBalance balance={dashboard.balance} />
        </div>
      </div>
      <div>
        <LeaveSummaryCards
          balance={dashboard.balance}
          monthlyUsage={dashboard.monthlyUsage}
          chartData={dashboard.chartData}
        />
      </div>
      <div>
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          <LeaveHistory leaves={history} holidays={holidays} />
          <Fragment key='upcoming-slot'>{upcoming}</Fragment>
        </div>
      </div>
    </div>
  );
}
