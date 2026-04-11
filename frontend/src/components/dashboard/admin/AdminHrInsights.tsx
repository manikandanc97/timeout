'use client';

import api from '@/services/api';
import { Cake, PartyPopper, Umbrella, UserRound, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AdminDashboardEmpty,
  AdminDashboardPanel,
} from './AdminDashboardPanel';

export type AdminHrDashboardPayload = {
  employeesOnLeaveToday: { userName: string; leaveType: string }[];
  upcomingBirthdays: { name: string; dateLabel: string }[];
  newJoinersThisWeek: { name: string; teamName: string }[];
  teamEmployeeCounts: { teamName: string; count: number }[];
};

const listRowClass =
  'flex flex-col gap-0.5 border-gray-100 border-b border-dashed py-3.5 last:border-b-0 sm:flex-row sm:items-center sm:justify-between';

export default function AdminHrInsights() {
  const [data, setData] = useState<AdminHrDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const { data: body } = await api.get<AdminHrDashboardPayload>(
          '/dashboard/stats',
        );
        if (!cancelled) {
          setData({
            employeesOnLeaveToday: body.employeesOnLeaveToday ?? [],
            upcomingBirthdays: body.upcomingBirthdays ?? [],
            newJoinersThisWeek: body.newJoinersThisWeek ?? [],
            teamEmployeeCounts: body.teamEmployeeCounts ?? [],
          });
        }
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className='space-y-5'>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className='h-40 animate-pulse rounded-2xl border border-gray-100 bg-linear-to-br from-gray-50 to-gray-100/80 shadow-inner'
          />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className='rounded-2xl border border-red-100 bg-red-50/60 p-5 text-red-800 text-sm shadow-sm'>
        Could not load HR insights. Please sign in again if your session expired.
      </div>
    );
  }

  return (
    <div className='space-y-5'>
      <AdminDashboardPanel
        title='Employees on leave today'
        subtitle='Approved leave · today'
        icon={Umbrella}
        iconTileClass='border-cyan-100 bg-cyan-50'
        iconClass='text-cyan-600'
        accentBorder='border-l-4 border-l-cyan-500'
      >
        {data.employeesOnLeaveToday.length === 0 ? (
          <AdminDashboardEmpty
            icon={UserRound}
            message='Everyone is expected in today, or no approved leave overlaps today.'
          />
        ) : (
          <ul className='border-gray-100 border-t'>
            {data.employeesOnLeaveToday.map((row, i) => (
              <li key={`${row.userName}-${i}`} className={listRowClass}>
                <span className='font-medium text-gray-900'>{row.userName}</span>
                <span className='w-fit rounded-md bg-cyan-50 px-2 py-0.5 font-medium text-cyan-800 text-xs'>
                  {row.leaveType}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

      <AdminDashboardPanel
        title='Team-wise headcount'
        subtitle='Employees by team'
        icon={UsersRound}
        iconTileClass='border-teal-100 bg-teal-50'
        iconClass='text-teal-600'
        accentBorder='border-l-4 border-l-teal-500'
      >
        {data.teamEmployeeCounts.length === 0 ? (
          <AdminDashboardEmpty
            icon={UsersRound}
            message='Assign employees to teams from the Teams page so counts appear here.'
          />
        ) : (
          <ul className='border-gray-100 border-t'>
            {data.teamEmployeeCounts.map((row, i) => (
              <li
                key={`${row.teamName}-${i}`}
                className='flex items-center justify-between gap-3 border-gray-100 border-b border-dashed py-3.5 last:border-b-0'
              >
                <span className='font-medium text-gray-900'>{row.teamName}</span>
                <span className='flex h-9 min-w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 font-bold text-teal-800 text-sm tabular-nums ring-1 ring-teal-100/80'>
                  {row.count}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

      <AdminDashboardPanel
        title='Upcoming birthdays'
        subtitle='Next 60 days'
        icon={Cake}
        iconTileClass='border-pink-100 bg-pink-50'
        iconClass='text-pink-600'
        accentBorder='border-l-4 border-l-pink-400'
      >
        {data.upcomingBirthdays.length === 0 ? (
          <AdminDashboardEmpty
            icon={Cake}
            message='Add date of birth when creating employees to show upcoming celebrations here.'
          />
        ) : (
          <ul className='border-gray-100 border-t'>
            {data.upcomingBirthdays.map((row, i) => (
              <li
                key={`${row.name}-${i}`}
                className='flex items-center justify-between gap-3 border-gray-100 border-b border-dashed py-3.5 last:border-b-0'
              >
                <span className='font-medium text-gray-900'>{row.name}</span>
                <span className='shrink-0 rounded-md bg-gray-50 px-2.5 py-0.5 font-medium text-gray-600 text-xs tabular-nums ring-1 ring-gray-100'>
                  {row.dateLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

      <AdminDashboardPanel
        title='New joiners this week'
        subtitle='Calendar week (Mon–Sun)'
        icon={PartyPopper}
        iconTileClass='border-amber-100 bg-amber-50'
        iconClass='text-amber-600'
        accentBorder='border-l-4 border-l-amber-500'
      >
        {data.newJoinersThisWeek.length === 0 ? (
          <AdminDashboardEmpty
            icon={PartyPopper}
            message='No new profiles joined this week yet.'
          />
        ) : (
          <ul className='border-gray-100 border-t'>
            {data.newJoinersThisWeek.map((row, i) => (
              <li key={`${row.name}-${i}`} className={listRowClass}>
                <span className='font-medium text-gray-900'>{row.name}</span>
                <span className='text-gray-500 text-sm'>{row.teamName}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>
    </div>
  );
}
