'use client';

import LeaveCalendarPanel from '@/components/leave/LeaveCalendarPanel';
import api from '@/services/api';
import { useEffect, useState } from 'react';
import type { Holiday } from '@/types/holiday';

/**
 * Holidays + weekends + today only (no leave status overlay).
 * Same shell as the apply-leave calendar for a consistent HR view.
 */
export default function AdminCalendarSidebar() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const holidayRes = await api.get<Holiday[]>('/holidays');
        setHolidays(holidayRes.data);
      } catch (err) {
        console.error('Could not load holidays', err);
        setHolidays([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div
        className='h-full min-h-[420px] w-full flex-1 animate-pulse rounded-2xl border border-gray-100 bg-linear-to-br from-gray-50 to-gray-100/80 shadow-inner'
        aria-hidden
      />
    );
  }

  return (
    <div className='flex h-full min-h-0 w-full flex-1 flex-col'>
      <LeaveCalendarPanel
        holidays={holidays}
        history={[]}
        showLeaveDays={false}
        bannerEyebrow='Team calendar'
        bannerTitle='Upcoming leave days'
        rootClassName='h-full min-h-0 flex-1'
      />
    </div>
  );
}
