'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import PunchCard from './PunchCard';
import AttendanceHistory from './AttendanceHistory';
import TeamAttendanceBoard from './TeamAttendanceBoard';
import AttendanceCalendarSidebar from './AttendanceCalendarSidebar';
import { getTeamAttendance, getTodayStatus, getMyAttendance } from '@/services/attendanceApi';
import type { AttendanceLog, TeamAttendanceMember } from '@/types/attendance';

export default function AttendancePageClient() {
  const { user } = useAuth();
  const canViewTeamAttendance = user?.role === 'ADMIN' || user?.role === 'MANAGER';
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [todayStatus, setTodayStatus] = useState<AttendanceLog | null>(null);
  const [history, setHistory] = useState<AttendanceLog[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamAttendanceMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = useCallback(async () => {
    try {
      setLoading(true);
      if (canViewTeamAttendance) {
        const teamData = await getTeamAttendance(selectedDate).catch(() => ({ members: [] }));
        setTeamMembers(teamData?.members || []);
        return;
      }

      const [todayData, historyData] = await Promise.all([
        getTodayStatus().catch(() => null),
        getMyAttendance(1, 31, selectedDate).catch(() => ({ data: [] })),
      ]);
      setTodayStatus(todayData?.today || null);
      setHistory(historyData?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [canViewTeamAttendance, selectedDate]);

  useEffect(() => {
    void fetchAttendance();
  }, [fetchAttendance]);

  if (canViewTeamAttendance) {
    return (
      <div className='flex flex-col gap-6'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-foreground'>Attendance</h1>
          <p className='text-muted-foreground'>
            Track employee login and logout timings grouped by team and date.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]'>
          <div className='min-w-0'>
            <TeamAttendanceBoard
              members={teamMembers}
              loading={loading}
              selectedDate={selectedDate}
            />
          </div>
          <div className='self-start lg:sticky lg:top-[88px]'>
            <AttendanceCalendarSidebar
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Attendance</h1>
        <p className='text-muted-foreground'>Manage your daily attendance and view history</p>
      </div>

      <div className='grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_340px]'>
        <div className='min-w-0 space-y-6'>
          <PunchCard todayStatus={todayStatus} onPunch={fetchAttendance} loading={loading} />
          <div className='w-full overflow-hidden'>
            <AttendanceHistory
              history={history}
              loading={loading}
              onRefresh={fetchAttendance}
              title='Attendance by Date'
              emptyMessage='No attendance record found for the selected date.'
            />
          </div>
        </div>
        <div className='self-start lg:sticky lg:top-[88px]'>
          <AttendanceCalendarSidebar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
          />
        </div>
      </div>
    </div>
  );
}
