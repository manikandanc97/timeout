'use client';

import type { Holiday } from '@/types/holiday';
import type { Leave, LeaveStatus, LeaveType } from '@/types/leave';
import { useMemo, useState } from 'react';
import LeaveCard from './LeaveCard';
import NoMatchingLeaves from './NoMatchingLeaves';
import MyLeavesFiltersBar from './MyLeavesFiltersBar';
import {
  TYPE_CONFIG,
  type FilterValue,
  typeFilterOptionsForGender,
} from './constants';
import { getLeaveEnd, getLeaveStart } from './utils';

type Props = {
  leaves: Leave[];
  currentUserId: number;
  holidays?: Holiday[];
};

const TeamLeavesList = ({
  leaves,
  currentUserId,
  holidays = [],
}: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<FilterValue<LeaveStatus>>('ALL');
  const [typeFilter, setTypeFilter] = useState<FilterValue<LeaveType>>('ALL');

  // Filter out current user's leaves
  const teamLeaves = useMemo(() => {
    return (leaves || []).filter((l) => l.userId !== currentUserId);
  }, [leaves, currentUserId]);

  const dedupedLeaves = useMemo(() => {
    if (!teamLeaves?.length) return [];

    const seen = new Set<string>();
    const list: Leave[] = [];

    teamLeaves.forEach((leave) => {
      const start = getLeaveStart(leave);
      const end = getLeaveEnd(leave);
      const key = leave?.id
        ? `id-${leave.id}`
        : `${leave.type}-${start}-${end}-${leave.reason ?? ''}-${leave.userId}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push(leave);
    });

    return list.sort(
      (a, b) =>
        new Date(getLeaveStart(b)).getTime() -
        new Date(getLeaveStart(a)).getTime(),
    );
  }, [teamLeaves]);

  const filteredLeaves = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return dedupedLeaves.filter((leave) => {
      const typeCfg = TYPE_CONFIG[leave.type] ?? TYPE_CONFIG.ANNUAL;
      const userName = (leave as any).user?.name ?? '';
      const searchFields = [
        leave.reason ?? '',
        leave.type,
        leave.status,
        typeCfg.label,
        typeCfg.description,
        userName,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch = query.length === 0 || searchFields.includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || leave.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || leave.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [dedupedLeaves, searchTerm, statusFilter, typeFilter]);

  const typeOptionsForUser = useMemo(
    () => typeFilterOptionsForGender(null),
    [],
  );

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== 'ALL' ||
    typeFilter !== 'ALL';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  if (!dedupedLeaves.length) {
    return (
      <div className='mt-6 flex min-h-[calc(100dvh-9rem)] flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 text-center p-12'>
        <div className='flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary mb-4'>
           <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-users"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </div>
        <h3 className='text-xl font-bold text-foreground mb-2'>No team leaves found</h3>
        <p className='text-muted-foreground max-w-md'>
          When your team members are on leave, they will appear here. Currently, everyone is in!
        </p>
      </div>
    );
  }

  return (
    <section className='relative isolate h-full overflow-hidden rounded-3xl border border-border bg-card shadow-xl'>
      <div className='pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-6 p-6'>
        <MyLeavesFiltersBar
          filteredLength={filteredLeaves.length}
          totalLength={dedupedLeaves.length}
          hasActiveFilters={hasActiveFilters}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          typeFilter={typeFilter}
          typeOptionsForUser={typeOptionsForUser.map((o) => ({
            label: o.label,
            value: String(o.value),
          }))}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onTypeChange={setTypeFilter}
          onClearFilters={clearFilters}
        />

        <div className='scroll-area-hrm mt-2 max-h-[calc(100vh-260px)] pr-2'>
          {filteredLeaves.length > 0 ? (
            <div className='flex flex-col gap-3'>
              {filteredLeaves.map((leave) => (
                <LeaveCard
                  key={leave.id}
                  leave={leave}
                  deletingId={null}
                  holidays={holidays}
                  onDelete={async () => false}
                  isReadOnly={true}
                />
              ))}
            </div>
          ) : (
            <NoMatchingLeaves />
          )}
        </div>
      </div>
    </section>
  );
};

export default TeamLeavesList;
