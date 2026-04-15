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

export type AdminHrDashboardPayload = {
  employeesOnLeaveToday: { userName: string; leaveType: string }[];
  upcomingBirthdays: { name: string; dateLabel: string }[];
  newJoinersThisWeek: { name: string; teamName: string }[];
  teamEmployeeCounts: { teamName: string; count: number }[];
};

function InitialsAvatar({
  name,
  colorClass,
}: {
  name: string;
  colorClass: string;
}) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${colorClass}`}
    >
      {initials}
    </div>
  );
}

const avatarColors = [
  'bg-sky-500/15 text-sky-800 dark:bg-sky-400/20 dark:text-sky-200',
  'bg-violet-500/15 text-violet-800 dark:bg-violet-400/20 dark:text-violet-200',
  'bg-emerald-500/15 text-emerald-800 dark:bg-emerald-400/20 dark:text-emerald-200',
  'bg-amber-500/15 text-amber-900 dark:bg-amber-400/20 dark:text-amber-200',
  'bg-rose-500/15 text-rose-800 dark:bg-rose-400/20 dark:text-rose-200',
  'bg-teal-500/15 text-teal-800 dark:bg-teal-400/20 dark:text-teal-200',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function LeaveTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    'Annual Leave':
      'bg-sky-500/12 text-sky-800 dark:bg-sky-400/18 dark:text-sky-200',
    'Sick Leave':
      'bg-rose-500/12 text-rose-800 dark:bg-rose-400/18 dark:text-rose-200',
    'Maternity Leave':
      'bg-pink-500/12 text-pink-800 dark:bg-pink-400/18 dark:text-pink-200',
    'Paternity Leave':
      'bg-violet-500/12 text-violet-800 dark:bg-violet-400/18 dark:text-violet-200',
  };
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${map[type] ?? 'bg-muted text-muted-foreground'}`}
    >
      {type}
    </span>
  );
}

function TeamBar({
  teamName,
  count,
  max,
}: {
  teamName: string;
  count: number;
  max: number;
}) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;
  return (
    <div className='flex items-center gap-3'>
      <span
        className='w-32 truncate text-xs font-medium text-card-foreground'
        title={teamName}
      >
        {teamName}
      </span>
      <div className='flex flex-1 items-center gap-2'>
        <div
          className='flex-1 overflow-hidden rounded-full bg-muted'
          style={{ height: 6 }}
        >
          <div
            className='h-full rounded-full bg-primary transition-all duration-700'
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className='w-6 text-right text-xs font-semibold tabular-nums text-muted-foreground'>
          {count}
        </span>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className='h-44 animate-pulse rounded-2xl border border-border bg-card shadow-sm' />
  );
}

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
