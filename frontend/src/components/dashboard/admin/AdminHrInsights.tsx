'use client';

import api from '@/services/api';
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
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-teal-100 text-teal-700',
];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

function LeaveTypeBadge({ type }: { type: string }) {
  const map: Record<string, string> = {
    'Annual Leave': 'bg-sky-50 text-sky-700',
    'Sick Leave': 'bg-rose-50 text-rose-700',
    'Maternity Leave': 'bg-pink-50 text-pink-700',
    'Paternity Leave': 'bg-violet-50 text-violet-700',
  };
  return (
    <span
      className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${map[type] ?? 'bg-gray-100 text-gray-600'}`}
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
        className='w-32 font-medium text-gray-700 text-xs truncate'
        title={teamName}
      >
        {teamName}
      </span>
      <div className='flex flex-1 items-center gap-2'>
        <div
          className='flex-1 bg-gray-100 rounded-full overflow-hidden'
          style={{ height: 6 }}
        >
          <div
            className='bg-teal-500 rounded-full h-full transition-all duration-700'
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className='w-6 font-semibold tabular-nums text-gray-700 text-xs text-right'>
          {count}
        </span>
      </div>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div className='bg-white shadow-sm border border-gray-100 rounded-2xl h-44 animate-pulse' />
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
      <div className='bg-red-50/50 shadow-sm p-5 border border-red-100 rounded-2xl text-red-700 text-sm'>
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
        iconTileClass='bg-sky-50'
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
                    name={row.userName}
                    colorClass={getAvatarColor(row.userName)}
                  />
                  <span className='font-medium text-gray-800 text-sm truncate'>
                    {row.userName}
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
        iconTileClass='bg-teal-50'
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
        iconTileClass='bg-pink-50'
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
                    name={row.name}
                    colorClass={getAvatarColor(row.name)}
                  />
                  <span className='font-medium text-gray-800 text-sm truncate'>
                    {row.name}
                  </span>
                </div>
                <span className='bg-pink-50 px-2 py-0.5 rounded-lg ring-1 ring-pink-100 font-semibold tabular-nums text-[11px] text-pink-700 shrink-0'>
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
        iconTileClass='bg-amber-50'
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
                    name={row.name}
                    colorClass={getAvatarColor(row.name)}
                  />
                  <span className='font-medium text-gray-800 text-sm truncate'>
                    {row.name}
                  </span>
                </div>
                <span className='bg-amber-50 px-2 py-0.5 rounded-lg font-semibold text-[11px] text-amber-700 shrink-0'>
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
