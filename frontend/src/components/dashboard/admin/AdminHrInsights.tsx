'use client';

import { formatPersonName } from '@/lib/personName';
import { Cake, Clock3, PartyPopper, Umbrella, UserRound, UsersRound } from 'lucide-react';
import type { AdminHrDashboardPayload } from '@/types/dashboard';
import { AdminDashboardEmpty, AdminDashboardPanel } from './AdminDashboardPanel';
import {
  getAvatarColor,
  InitialsAvatar,
  LeaveTypeBadge,
  SectionSkeleton,
  TeamBar,
  TeamHoursBar,
} from './hrInsightsUtils';

export default function AdminHrInsights({
  data = null,
  loading = false,
}: {
  data?: AdminHrDashboardPayload | null;
  loading?: boolean;
}) {
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
    ...(data.teamEmployeeCounts.map((team) => team.count) ?? [1]),
    1,
  );
  const maxTeamHours = Math.max(
    ...(data.teamAttendanceHoursToday.map((team) => team.hours) ?? [1]),
    1,
  );

  return (
    <div className='gap-4 grid sm:grid-cols-2'>
      <AdminDashboardPanel
        title='On leave today'
        subtitle={`${data.employeesOnLeaveToday.length} approved`}
        icon={Umbrella}
        iconTileClass='bg-muted'
        iconClass='text-sky-600'
      >
        {data.employeesOnLeaveToday.length === 0 ? (
          <AdminDashboardEmpty icon={UserRound} message='Everyone is in today.' />
        ) : (
          <ul className='space-y-2.5'>
            {data.employeesOnLeaveToday.map((row, index) => (
              <li
                key={`leave-${index}`}
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

      <AdminDashboardPanel
        title='Login hours today'
        subtitle='Employee worked hours'
        icon={Clock3}
        iconTileClass='bg-muted'
        iconClass='text-emerald-600'
      >
        {data.employeeAttendanceHoursToday.length === 0 ? (
          <AdminDashboardEmpty
            icon={Clock3}
            message='No attendance hours recorded yet for today.'
          />
        ) : (
          <ul className='space-y-2.5'>
            {data.employeeAttendanceHoursToday.map((row, index) => (
              <li
                key={`hours-${index}`}
                className='flex items-center justify-between gap-3'
              >
                <div className='flex min-w-0 items-center gap-2.5'>
                  <InitialsAvatar
                    name={formatPersonName(row.userName) || 'Unknown'}
                    colorClass={getAvatarColor(formatPersonName(row.userName) || 'Unknown')}
                  />
                  <div className='min-w-0'>
                    <p className='truncate text-sm font-medium'>
                      {formatPersonName(row.userName) || 'Unknown'}
                    </p>
                    <p className='truncate text-[11px] text-muted-foreground'>
                      {row.teamName}
                    </p>
                  </div>
                </div>
                <span className='shrink-0 rounded-lg bg-muted px-2 py-0.5 text-[11px] font-semibold tabular-nums text-muted-foreground ring-1 ring-border'>
                  {row.hours.toFixed(2)}h
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

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
            {data.teamEmployeeCounts.map((row, index) => (
              <li key={`team-${index}`}>
                <TeamBar teamName={row.teamName} count={row.count} max={maxTeamCount} />
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

      <AdminDashboardPanel
        title='Team login hours'
        subtitle='Today by team'
        icon={UsersRound}
        iconTileClass='bg-muted'
        iconClass='text-emerald-600'
      >
        {data.teamAttendanceHoursToday.length === 0 ? (
          <AdminDashboardEmpty
            icon={UsersRound}
            message='No team attendance hours recorded yet for today.'
          />
        ) : (
          <ul className='space-y-3'>
            {data.teamAttendanceHoursToday.map((row, index) => (
              <li key={`team-hours-${index}`}>
                <TeamHoursBar teamName={row.teamName} hours={row.hours} max={maxTeamHours} />
              </li>
            ))}
          </ul>
        )}
      </AdminDashboardPanel>

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
            {data.upcomingBirthdays.map((row, index) => (
              <li
                key={`birthday-${index}`}
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

      <AdminDashboardPanel
        title='New joiners'
        subtitle='This week (Mon-Sun)'
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
            {data.newJoinersThisWeek.map((row, index) => (
              <li
                key={`joiner-${index}`}
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
