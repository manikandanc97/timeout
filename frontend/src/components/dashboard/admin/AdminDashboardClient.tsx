'use client';

import { subscribeDashboardRefresh } from '@/lib/dashboardRealtimeBus';
import api from '@/services/api';
import type { AdminDashboardSnapshot } from '@/types/dashboard';
import type { Holiday } from '@/types/holiday';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useState } from 'react';
import AdminCalendarSidebar from './AdminCalendarSidebar';
import AdminHrInsights from './AdminHrInsights';
import AdminSummaryCards from './AdminSummaryCards';

const PendingLeaveRequests = dynamic(() => import('./PendingLeaveRequests'), {
  loading: () => (
    <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
      <div className='border-b border-border px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='h-9 w-9 animate-pulse rounded-xl bg-skeleton' />
          <div className='space-y-2'>
            <div className='h-3.5 w-28 animate-pulse rounded bg-skeleton' />
            <div className='h-2.5 w-40 animate-pulse rounded bg-skeleton/70' />
          </div>
        </div>
      </div>
      <div className='space-y-3 px-5 py-4'>
        {[0, 1, 2].map((index) => (
          <div key={index} className='h-14 animate-pulse rounded-xl bg-muted' />
        ))}
      </div>
    </div>
  ),
});

type Props = {
  initialSnapshot: AdminDashboardSnapshot | null;
  initialHolidays: Holiday[];
};

export default function AdminDashboardClient({
  initialSnapshot,
  initialHolidays,
}: Props) {
  const [snapshot, setSnapshot] = useState<AdminDashboardSnapshot | null>(initialSnapshot);
  const [snapshotLoading, setSnapshotLoading] = useState(initialSnapshot == null);

  const refreshSnapshot = useCallback(async (showSkeleton = false) => {
    if (showSkeleton) {
      setSnapshotLoading(true);
    }

    try {
      const { data } = await api.get<AdminDashboardSnapshot>('/dashboard/stats');
      setSnapshot(data);
    } catch {
      if (showSkeleton) {
        setSnapshot(null);
      }
    } finally {
      if (showSkeleton) {
        setSnapshotLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (initialSnapshot != null) {
      return;
    }

    void refreshSnapshot(true);
  }, [initialSnapshot, refreshSnapshot]);

  useEffect(() => {
    return subscribeDashboardRefresh('adminDashboardStats', () => {
      void refreshSnapshot(false);
    });
  }, [refreshSnapshot]);

  return (
    <>
      <section>
        <AdminSummaryCards stats={snapshot} loading={snapshotLoading} />
      </section>

      <section className='lg:items-start gap-6 grid grid-cols-1 lg:grid-cols-3'>
        <div className='grow space-y-6 lg:col-span-2'>
          <PendingLeaveRequests />
          <AdminHrInsights data={snapshot} loading={snapshotLoading} />
        </div>

        <div className='top-2 z-10 self-start lg:sticky lg:col-span-1'>
          <AdminCalendarSidebar initialHolidays={initialHolidays} />
        </div>
      </section>
    </>
  );
}
