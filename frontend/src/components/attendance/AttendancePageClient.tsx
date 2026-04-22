'use client';

import React, { useCallback, useEffect, useState } from 'react';
import PunchCard from './PunchCard';
import AttendanceHistory from './AttendanceHistory';
import { getTodayStatus, getMyAttendance } from '@/services/attendanceApi';
import type { AttendanceLog } from '@/types/attendance';

export default function AttendancePageClient() {
  const [todayStatus, setTodayStatus] = useState<AttendanceLog | null>(null);
  const [history, setHistory] = useState<AttendanceLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      const [todayData, historyData] = await Promise.all([
        getTodayStatus().catch(() => null),
        getMyAttendance().catch(() => ({ data: [] })),
      ]);
      setTodayStatus(todayData?.today || null);
      setHistory(historyData?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Attendance</h1>
        <p className='text-muted-foreground'>Manage your daily attendance and view history</p>
      </div>

      <div className='grid gap-6 md:grid-cols-[300px_1fr]'>
        <div className='flex flex-col gap-6 md:sticky md:top-[88px] h-fit'>
          <PunchCard todayStatus={todayStatus} onPunch={fetchAttendance} loading={loading} />
        </div>
        <div className='w-full overflow-hidden'>
          <AttendanceHistory history={history} loading={loading} onRefresh={fetchAttendance} />
        </div>
      </div>
    </div>
  );
}
