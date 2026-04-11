'use client';

import api from '@/services/api';
import type { FilterValue } from '@/components/leave/constants';
import type { LeaveStatus, LeaveType, LeaveWithEmployee } from '@/types/leave';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import {
  computeLeaveRequestsSummary,
  filterLeaveRequests,
  LEAVE_REQUESTS_PAGE_SIZE,
  leaveRequestsPageCount,
  leaveRequestsPageSlice,
} from './leaveRequestsPageUtils';

type Args = {
  initialLeaves: LeaveWithEmployee[];
};

export function useLeaveRequestsPage({ initialLeaves }: Args) {
  const [rows, setRows] = useState<LeaveWithEmployee[]>(initialLeaves);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<FilterValue<LeaveStatus>>('ALL');
  const [typeFilter, setTypeFilter] = useState<FilterValue<LeaveType>>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    setRows(initialLeaves);
  }, [initialLeaves]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo]);

  const summary = useMemo(() => computeLeaveRequestsSummary(rows), [rows]);

  const filtered = useMemo(
    () =>
      filterLeaveRequests(rows, {
        searchTerm,
        statusFilter,
        typeFilter,
        dateFrom,
        dateTo,
      }),
    [rows, searchTerm, statusFilter, typeFilter, dateFrom, dateTo],
  );

  const pageCount = leaveRequestsPageCount(
    filtered.length,
    LEAVE_REQUESTS_PAGE_SIZE,
  );

  useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const safePage = Math.min(page, pageCount);
  const pageSlice = useMemo(
    () => leaveRequestsPageSlice(filtered, safePage, LEAVE_REQUESTS_PAGE_SIZE),
    [filtered, safePage],
  );

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== 'ALL' ||
    typeFilter !== 'ALL' ||
    dateFrom.length > 0 ||
    dateTo.length > 0;

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
    setDateFrom('');
    setDateTo('');
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await api.get<LeaveWithEmployee[]>('/leaves');
      setRows(res.data);
    } catch {
      toast.error('Could not refresh leave requests.');
    }
  }, []);

  const approveOrReject = useCallback(
    async (leaveId: number, newStatus: 'APPROVED' | 'REJECTED') => {
      setBusyId(leaveId);
      try {
        await api.put(`/leaves/${leaveId}`, { status: newStatus });
        toast.success(
          newStatus === 'APPROVED' ? 'Leave approved.' : 'Leave rejected.',
        );
        await refresh();
      } catch {
        toast.error('Could not update leave status.');
      } finally {
        setBusyId(null);
      }
    },
    [refresh],
  );

  return {
    rows,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    typeFilter,
    setTypeFilter,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    page,
    setPage,
    busyId,
    summary,
    filtered,
    pageSlice,
    safePage,
    pageCount,
    hasActiveFilters,
    clearFilters,
    approveOrReject,
    pageSize: LEAVE_REQUESTS_PAGE_SIZE,
  };
}
