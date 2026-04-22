'use client';

import api from '@/services/api';
import type { Holiday } from '@/types/holiday';
import type { Leave, LeaveStatus, LeaveType } from '@/types/leave';
import { subscribeDashboardRefresh } from '@/lib/dashboardRealtimeBus';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';

import LeaveCard from './LeaveCard';
import LeaveEmptyState from './LeaveEmptyState';
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
  userGender?: string | null;
  holidays?: Holiday[];
};

const MyLeavesList = ({
  leaves,
  userGender = null,
  holidays = [],
}: Props) => {
  const [localLeaves, setLocalLeaves] = useState<Leave[]>(leaves);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<FilterValue<LeaveStatus>>('ALL');
  const [typeFilter, setTypeFilter] = useState<FilterValue<LeaveType>>('ALL');

  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    setLocalLeaves(leaves);
  }, [leaves]);

  const refetchLeaveHistory = useCallback(async () => {
    try {
      const res = await api.get<Leave[]>('/history');
      setLocalLeaves(Array.isArray(res.data) ? res.data : []);
    } catch {
      /* keep list */
    }
  }, []);

  useEffect(() => {
    return subscribeDashboardRefresh('employeeLeavesPage', () => {
      void refetchLeaveHistory();
    });
  }, [refetchLeaveHistory]);

  const typeOptionsForUser = useMemo(
    () => typeFilterOptionsForGender(userGender),
    [userGender],
  );

  // If gender-based options change, drop a filter that no longer applies.
  useEffect(() => {
    if (typeFilter === 'MATERNITY' && userGender !== 'FEMALE') {
      setTypeFilter('ALL');
    }
    if (typeFilter === 'PATERNITY' && userGender !== 'MALE') {
      setTypeFilter('ALL');
    }
  }, [userGender, typeFilter]);

  const dedupedLeaves = useMemo(() => {
    if (!localLeaves?.length) return [];

    const seen = new Set<string>();
    const list: Leave[] = [];

    localLeaves.forEach((leave) => {
      const start = getLeaveStart(leave);
      const end = getLeaveEnd(leave);
      const key = leave?.id
        ? `id-${leave.id}`
        : `${leave.type}-${start}-${end}-${leave.reason ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push(leave);
    });

    return list.sort(
      (a, b) =>
        new Date(getLeaveStart(b)).getTime() -
        new Date(getLeaveStart(a)).getTime(),
    );
  }, [localLeaves]);

  const filteredLeaves = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return dedupedLeaves.filter((leave) => {
      const typeCfg = TYPE_CONFIG[leave.type] ?? TYPE_CONFIG.ANNUAL;
      const searchFields = [
        leave.reason ?? '',
        leave.type,
        leave.status,
        typeCfg.label,
        typeCfg.description,
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

  const summaryCards = useMemo(() => {
    const approved = dedupedLeaves.filter(
      (leave) => leave.status === 'APPROVED',
    ).length;
    const pending = dedupedLeaves.filter(
      (leave) => leave.status === 'PENDING',
    ).length;
    const rejected = dedupedLeaves.filter(
      (leave) => leave.status === 'REJECTED',
    ).length;

    return [
      { label: 'Total', value: dedupedLeaves.length, color: 'text-card-foreground' },
      { label: 'Approved', value: approved, color: 'text-emerald-600' },
      { label: 'Pending', value: pending, color: 'text-amber-600' },
      { label: 'Rejected', value: rejected, color: 'text-rose-600' },
    ];
  }, [dedupedLeaves]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== 'ALL' ||
    typeFilter !== 'ALL';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

  /**
   * Deletes a leave on the server. Returns true only when the API succeeds
   * so the LeaveCard can close its confirmation modal.
   */
  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      setDeletingId(id);
      await api.delete(`/leaves/${id}`);
      toast.success('Leave request cancelled successfully');
      await refetchLeaveHistory();
      return true;
    } catch {
      toast.error('Failed to cancel leave request. Please try again.');
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  if (!dedupedLeaves.length) {
    return (
      <div className='mt-6 flex min-h-[calc(100dvh-9rem)] flex-col xl:mt-0'>
        <LeaveEmptyState />
      </div>
    );
  }

  return (
    <section className='relative isolate overflow-hidden rounded-3xl border border-border bg-card shadow-xl'>
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

        <div className='flex flex-wrap items-center gap-2'>
          {summaryCards.map((s) => (
            <div
              key={s.label}
              className='flex items-center gap-1.5 rounded-lg border border-border bg-muted/60 px-3 py-1.5 shadow-sm'
            >
              <span className='text-xs font-medium uppercase tracking-wider text-muted-foreground'>
                {s.label}
              </span>
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
            </div>
          ))}
        </div>

        <div className='mt-2 pr-2'>
          {filteredLeaves.length > 0 ? (
            <div className='flex flex-col gap-3'>
              {filteredLeaves.map((leave) => (
                <LeaveCard
                  key={leave.id}
                  leave={leave}
                  deletingId={deletingId}
                  holidays={holidays}
                  onDelete={handleDelete}
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

export default MyLeavesList;
