'use client';

import api from '@/services/api';
import { formatPersonName } from '@/lib/personName';
import {
  Cake,
  PartyPopper,
  Umbrella,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  AdminDashboardEmpty,
  AdminDashboardPanel,
} from './AdminDashboardPanel';
import {
  getAvatarColor,
  InitialsAvatar,
  LeaveTypeBadge,
  SectionSkeleton,
  TeamBar,
} from './hrInsightsUtils';

export type AdminHrDashboardPayload = {
  employeesOnLeaveToday: { userName: string; leaveType: string }[];
  upcomingBirthdays: { name: string; dateLabel: string }[];
  newJoinersThisWeek: { name: string; teamName: string }[];
  teamEmployeeCounts: { teamName: string; count: number }[];
};

export default function AdminHrInsights() {
  const [data, setData] = useState<AdminHrDashboardPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        const { data: body } =
          await api.get<AdminHrDashboardPayload>('/dashboard/stats');
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
      <div className='gap-4 grid sm:grid-cols-2'>
        {[1, 2, 3, 4].map((i) => (
          <SectionSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className='rounded-2xl border border-danger-muted-foreground/25 bg-danger-muted p-5 text-sm text-danger-muted-foreground shadow-sm'>
        Could not load HR insights. Please refresh or sign in again.
      </div>
    );
  }

  const maxTeamCount = Math.max(
    ...(data.teamEmployeeCounts.map((t) => t.count) ?? [1]),
    1,
  );

  return (
    <div className='gap-4 grid sm:grid-cols-2'>
      {/* Employees on Leave */}
      <AdminDashboardPanel
        title='On leave today'
        subtitle={`${data.employeesOnLeaveToday.length} approved`}
        icon={Umbrella}
        iconTileClass='bg-muted'
        iconClass='text-sky-600'
      >
        {data.employeesOnLeaveToday.length === 0 ? (
          <AdminDashboardEmpty
            icon={UserRound}
            message='Everyone is in today.'
          />
        ) : (
          <ul className='space-y-2.5'>
            {data.employeesOnLeaveToday.map((row, i) => (
              <li
                key={`leave-${i}`}
                className='flex justify-between items-center gap-3'
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <InitialsAvatar
                    name={formatPersonName(row.userName) || 'Unknown'}
                    colorClass={getAvatarColor(formatPersonName(row.userName) || 'Unknown')}
                  />
                  <span className='truncate text-sm font-medium'>
                    {formatPersonName(row.userName) || 'Unknown'}
                  </span>
                </div>
                <LeaveTypeBadge type={row.leaveType} />
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

      {/* Team Headcount */}
      <AdminDashboardPanel
        title='Team headcount'
        subtitle='Employees by team'
        icon={UsersRound}
        iconTileClass='bg-muted'
        iconClass='text-teal-600'
      >
        {data.teamEmployeeCounts.length === 0 ? (
          <AdminDashboardEmpty
            icon={UsersRound}
            message='Assign employees to teams to see counts here.'
          />
        ) : (
          <ul className='space-y-3'>
            {data.teamEmployeeCounts.map((row, i) => (
              <li key={`team-${i}`}>
                <TeamBar
                  teamName={row.teamName}
                  count={row.count}
                  max={maxTeamCount}
                />
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

      {/* Upcoming Birthdays */}
      <AdminDashboardPanel
        title='Upcoming birthdays'
        subtitle='Next 60 days'
        icon={Cake}
        iconTileClass='bg-muted'
        iconClass='text-pink-500'
      >
        {data.upcomingBirthdays.length === 0 ? (
          <AdminDashboardEmpty
            icon={Cake}
            message='Add date of birth when creating employees to see birthday reminders.'
          />
        ) : (
          <ul className='space-y-2.5'>
            {data.upcomingBirthdays.map((row, i) => (
              <li
                key={`bday-${i}`}
                className='flex justify-between items-center gap-3'
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <InitialsAvatar
                    name={formatPersonName(row.name) || 'Unknown'}
                    colorClass={getAvatarColor(formatPersonName(row.name) || 'Unknown')}
                  />
                  <span className='truncate text-sm font-medium'>
                    {formatPersonName(row.name) || 'Unknown'}
                  </span>
                </div>
                <span className='shrink-0 rounded-lg bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground ring-1 ring-border'>
                  {row.dateLabel}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

      {/* New Joiners */}
      <AdminDashboardPanel
        title='New joiners'
        subtitle='This week (Mon–Sun)'
        icon={PartyPopper}
        iconTileClass='bg-muted'
        iconClass='text-amber-600'
      >
        {data.newJoinersThisWeek.length === 0 ? (
          <AdminDashboardEmpty
            icon={PartyPopper}
            message='No new profiles joined this week yet.'
          />
        ) : (
          <ul className='space-y-2.5'>
            {data.newJoinersThisWeek.map((row, i) => (
              <li
                key={`joiner-${i}`}
                className='flex justify-between items-center gap-3'
              >
                <div className='flex items-center gap-2.5 min-w-0'>
                  <InitialsAvatar
                    name={formatPersonName(row.name) || 'Unknown'}
                    colorClass={getAvatarColor(formatPersonName(row.name) || 'Unknown')}
                  />
                  <span className='truncate text-sm font-medium'>
                    {formatPersonName(row.name) || 'Unknown'}
                  </span>
                </div>
                <span className='shrink-0 rounded-lg bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground ring-1 ring-border'>
                  {row.teamName}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>
    </div>
  );
}
