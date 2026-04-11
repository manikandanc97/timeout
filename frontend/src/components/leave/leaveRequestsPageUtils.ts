import type { FilterValue } from '@/components/leave/constants';
import { getLeaveEnd, getLeaveStart } from '@/components/leave/utils';
import type { LeaveStatus, LeaveType, LeaveWithEmployee } from '@/types/leave';

export const LEAVE_REQUESTS_PAGE_SIZE = 15;

export type LeaveRequestsSummary = {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
};

function atDayStart(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function parseYmd(value: string) {
  const [y, m, d] = value.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

export function leaveOverlapsRange(
  leave: LeaveWithEmployee,
  fromStr: string,
  toStr: string,
) {
  if (!fromStr && !toStr) return true;
  const start = atDayStart(new Date(getLeaveStart(leave)));
  const end = atDayStart(new Date(getLeaveEnd(leave)));
  if (Number.isNaN(start) || Number.isNaN(end)) return true;

  const from = fromStr ? parseYmd(fromStr) : null;
  const to = toStr ? parseYmd(toStr) : null;
  const rangeStart = from ? atDayStart(from) : -Infinity;
  const rangeEnd = to ? atDayStart(to) : Infinity;
  if (Number.isNaN(rangeStart as number) || Number.isNaN(rangeEnd as number)) {
    return true;
  }
  return start <= rangeEnd && end >= rangeStart;
}

export function computeLeaveRequestsSummary(
  rows: LeaveWithEmployee[],
): LeaveRequestsSummary {
  const pending = rows.filter((r) => r.status === 'PENDING').length;
  const approved = rows.filter((r) => r.status === 'APPROVED').length;
  const rejected = rows.filter((r) => r.status === 'REJECTED').length;
  return {
    pending,
    approved,
    rejected,
    total: rows.length,
  };
}

export function filterLeaveRequests(
  rows: LeaveWithEmployee[],
  params: {
    searchTerm: string;
    statusFilter: FilterValue<LeaveStatus>;
    typeFilter: FilterValue<LeaveType>;
    dateFrom: string;
    dateTo: string;
  },
): LeaveWithEmployee[] {
  const q = params.searchTerm.trim().toLowerCase();
  return rows.filter((leave) => {
    const name = leave.user?.name?.toLowerCase() ?? '';
    const email = leave.user?.email?.toLowerCase() ?? '';
    const reason = (leave.reason ?? '').toLowerCase();
    const matchesSearch =
      q.length === 0 ||
      name.includes(q) ||
      email.includes(q) ||
      reason.includes(q);

    const matchesStatus =
      params.statusFilter === 'ALL' || leave.status === params.statusFilter;
    const matchesType =
      params.typeFilter === 'ALL' || leave.type === params.typeFilter;
    const matchesDates = leaveOverlapsRange(
      leave,
      params.dateFrom,
      params.dateTo,
    );

    return matchesSearch && matchesStatus && matchesType && matchesDates;
  });
}

export function leaveRequestsPageCount(
  filteredLength: number,
  pageSize: number = LEAVE_REQUESTS_PAGE_SIZE,
) {
  return Math.max(1, Math.ceil(filteredLength / pageSize));
}

export function leaveRequestsPageSlice(
  filtered: LeaveWithEmployee[],
  safePage: number,
  pageSize: number = LEAVE_REQUESTS_PAGE_SIZE,
) {
  const start = (safePage - 1) * pageSize;
  return filtered.slice(start, start + pageSize);
}
