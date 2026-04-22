'use client';

import { useMemo, useState } from 'react';
import type { TeamAttendanceMember } from '@/types/attendance';
import Skeleton from '@/components/ui/Skeleton';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import FilterBarShell from '@/components/common/FilterBarShell';
import { RotateCcw, Search } from 'lucide-react';

type Props = {
  members: TeamAttendanceMember[];
  loading: boolean;
  selectedDate: string;
};

const formatBoardDate = (value: string) => {
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (value: string | null) =>
  value
    ? new Date(value).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '--';

const formatHours = (value: number | null) =>
  Number.isFinite(value) && value != null ? `${value.toFixed(2)} hrs` : '--';

const getStatusColor = (status: string | null) => {
  switch (status) {
    case 'PRESENT':
      return 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20';
    case 'HALF_DAY':
      return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
    case 'ABSENT':
      return 'bg-rose-500/10 text-rose-700 border-rose-500/20';
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

export default function TeamAttendanceBoard({ members, loading, selectedDate }: Props) {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamFilter, setTeamFilter] = useState('ALL');

  const teamOptions = useMemo(
    () =>
      Array.from(
        new Set(members.map((member) => member.team?.name || 'Unassigned')),
      )
        .sort((a, b) => a.localeCompare(b))
        .map((teamName) => ({ label: teamName, value: teamName })),
    [members],
  );

  const filteredMembers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return members.filter((member) => {
      const teamName = member.team?.name || 'Unassigned';
      const designation = member.designation || '';
      const matchesSearch =
        query.length === 0 ||
        member.name.toLowerCase().includes(query) ||
        designation.toLowerCase().includes(query) ||
        teamName.toLowerCase().includes(query);
      const matchesTeam = teamFilter === 'ALL' || teamName === teamFilter;
      return matchesSearch && matchesTeam;
    });
  }, [members, searchTerm, teamFilter]);

  const groupedMembers = filteredMembers.reduce<Record<string, TeamAttendanceMember[]>>((acc, member) => {
    const teamName = member.team?.name || 'Unassigned';
    if (!acc[teamName]) {
      acc[teamName] = [];
    }
    acc[teamName].push(member);
    return acc;
  }, {});

  const teamEntries = Object.entries(groupedMembers);
  const hasActiveFilters = searchTerm.trim().length > 0 || teamFilter !== 'ALL';

  if (loading) {
    return (
      <div className='rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
        <div className='border-b border-border px-6 py-5'>
          <Skeleton className='h-6 w-52' />
        </div>
        <div className='space-y-5 p-6'>
          {[0, 1, 2].map((teamIndex) => (
            <div key={`team-attendance-skeleton-${teamIndex}`} className='space-y-3'>
              <Skeleton className='h-5 w-32' />
              <div className='space-y-2'>
                {[0, 1].map((rowIndex) => (
                  <div key={`team-attendance-skeleton-row-${teamIndex}-${rowIndex}`} className='grid grid-cols-5 gap-3 rounded-xl border border-border p-3'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-20' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-20' />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
      <div className='border-b border-border px-6 py-5'>
        <h3 className='text-lg font-semibold'>Team Attendance Today</h3>
        <p className='mt-1 text-sm text-muted-foreground'>
          Employee login and logout timings grouped by team for {formatBoardDate(selectedDate)}.
        </p>
      </div>

      <div className='border-b border-border px-6 py-4'>
        <FilterBarShell>
          <div className='relative min-w-[220px] flex-1 max-w-sm'>
            <Search
              size={14}
              className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              id='team-attendance-search'
              type='text'
              label='Search employee'
              hideLabel
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder='Search employee or designation...'
              inputClassName='h-10 py-0 pl-9 focus:ring-inset'
            />
          </div>
          <div className='w-[180px] shrink-0'>
            <Select
              id='team-attendance-team-filter'
              label='Team'
              hideLabel
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              options={[{ label: 'All teams', value: 'ALL' }, ...teamOptions]}
              selectClassName='h-10 focus:ring-inset'
            />
          </div>
          <Button
            type='button'
            unstyled
            disabled={!hasActiveFilters}
            onClick={() => {
              setSearchTerm('');
              setTeamFilter('ALL');
            }}
            aria-label='Clear attendance filters'
            className='flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-3 text-sm font-medium text-card-foreground/90 transition-colors hover:bg-danger-muted hover:text-danger-muted-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground'
          >
            <RotateCcw size={14} className='shrink-0' />
            Clear filters
          </Button>
        </FilterBarShell>
      </div>

      <div className='space-y-5 p-6'>
        {teamEntries.length === 0 ? (
          <div className='rounded-xl border border-border bg-muted/15 px-6 py-12 text-center text-muted-foreground'>
            No employee attendance records found for the selected filters.
          </div>
        ) : (
          teamEntries.map(([teamName, teamMembers]) => (
            <section key={teamName} className='space-y-3'>
              <div className='flex items-center justify-between gap-3'>
                <h4 className='text-sm font-semibold text-card-foreground'>{teamName}</h4>
                <span className='rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground'>
                  {teamMembers.length} employee{teamMembers.length === 1 ? '' : 's'}
                </span>
              </div>

              <div className='overflow-x-auto rounded-xl border border-border'>
                <table className='w-full min-w-[760px] text-left text-sm'>
                  <thead className='bg-muted/30 text-xs uppercase text-muted-foreground'>
                    <tr>
                      <th className='px-4 py-3 font-medium'>Employee</th>
                      <th className='px-4 py-3 font-medium'>Designation</th>
                      <th className='px-4 py-3 font-medium'>Login</th>
                      <th className='px-4 py-3 font-medium'>Logout</th>
                      <th className='px-4 py-3 font-medium'>Status</th>
                      <th className='px-4 py-3 font-medium'>Work Hours</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y divide-border'>
                    {teamMembers.map((member) => {
                      const log = member.attendanceLogs[0];
                      const status = log?.status ?? 'ABSENT';

                      return (
                        <tr key={member.id} className='hover:bg-muted/20 transition-colors'>
                          <td className='px-4 py-3 font-medium text-card-foreground'>{member.name}</td>
                          <td className='px-4 py-3 text-muted-foreground'>{member.designation || '--'}</td>
                          <td className='px-4 py-3 text-card-foreground'>{formatTime(log?.checkIn ?? null)}</td>
                          <td className='px-4 py-3 text-card-foreground'>{formatTime(log?.checkOut ?? null)}</td>
                          <td className='px-4 py-3'>
                            <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-semibold ${getStatusColor(status)}`}>
                              {status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className='px-4 py-3 text-muted-foreground'>{formatHours(log?.workHours ?? null)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
