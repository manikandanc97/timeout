'use client';

import LeaveRequestsFilterBar from '@/components/leave/LeaveRequestsFilterBar';
import LeaveRequestsPageHeader from '@/components/leave/LeaveRequestsPageHeader';
import LeaveRequestsPagination from '@/components/leave/LeaveRequestsPagination';
import ApproveRejectButtonGroup from '@/components/leave/ApproveRejectButtonGroup';
import RequestCategoryTabs from '@/components/leave/RequestCategoryTabs';
import LeaveRequestsSummaryCards from '@/components/leave/LeaveRequestsSummaryCards';
import LeaveStatusBadge from '@/components/leave/LeaveStatusBadge';
import LeaveRequestsTable from '@/components/leave/LeaveRequestsTable';
import {
  computeRequestStatusSummary,
  LEAVE_REQUESTS_PAGE_SIZE,
} from '@/components/leave/leaveRequestsPageUtils';
import { useLeaveRequestsPage } from '@/components/leave/useLeaveRequestsPage';
import type { Holiday } from '@/types/holiday';
import type {
  CompOffRequestWithEmployee,
  LeaveWithEmployee,
  PermissionRequestWithEmployee,
} from '@/types/leave';
import { useMemo, useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import api from '@/services/api';
import { toast } from 'sonner';

type Props = {
  initialLeaves: LeaveWithEmployee[];
  initialPermissionRequests: PermissionRequestWithEmployee[];
  initialCompOffRequests: CompOffRequestWithEmployee[];
  holidays: Holiday[];
  canModerate: boolean;
};

export default function LeaveRequestsPageClient({
  initialLeaves,
  initialPermissionRequests,
  initialCompOffRequests,
  holidays,
  canModerate,
}: Props) {
  const req = useLeaveRequestsPage({ initialLeaves });
  const [permissionRows, setPermissionRows] = useState(initialPermissionRequests);
  const [compOffRows, setCompOffRows] = useState(initialCompOffRequests);
  const [otherBusyKey, setOtherBusyKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'PERMISSION' | 'COMP_OFF'>(
    'LEAVE',
  );
  const [otherSearch, setOtherSearch] = useState('');
  const [otherDateFrom, setOtherDateFrom] = useState('');
  const [otherDateTo, setOtherDateTo] = useState('');
  const [otherPage, setOtherPage] = useState(1);

  const permissionFiltered = useMemo(() => {
    const q = otherSearch.trim().toLowerCase();
    return permissionRows.filter((row) => {
      const name = (row.user?.name ?? '').toLowerCase();
      const email = (row.user?.email ?? '').toLowerCase();
      const reason = (row.reason ?? '').toLowerCase();
      const matchesSearch =
        q.length === 0 ||
        name.includes(q) ||
        email.includes(q) ||
        reason.includes(q);
      const rowDate = new Date(row.date);
      const fromOk =
        !otherDateFrom || rowDate >= new Date(`${otherDateFrom}T00:00:00`);
      const toOk = !otherDateTo || rowDate <= new Date(`${otherDateTo}T23:59:59`);
      return matchesSearch && fromOk && toOk;
    });
  }, [permissionRows, otherDateFrom, otherDateTo, otherSearch]);

  const compOffFiltered = useMemo(() => {
    const q = otherSearch.trim().toLowerCase();
    return compOffRows.filter((row) => {
      const name = (row.user?.name ?? '').toLowerCase();
      const email = (row.user?.email ?? '').toLowerCase();
      const reason = (row.reason ?? '').toLowerCase();
      const matchesSearch =
        q.length === 0 || name.includes(q) || email.includes(q) || reason.includes(q);
      const rowDate = new Date(row.workDate);
      const fromOk =
        !otherDateFrom || rowDate >= new Date(`${otherDateFrom}T00:00:00`);
      const toOk = !otherDateTo || rowDate <= new Date(`${otherDateTo}T23:59:59`);
      return matchesSearch && fromOk && toOk;
    });
  }, [compOffRows, otherDateFrom, otherDateTo, otherSearch]);

  const otherFiltered = activeTab === 'PERMISSION' ? permissionFiltered : compOffFiltered;
  const otherPageCount = Math.max(
    1,
    Math.ceil(otherFiltered.length / LEAVE_REQUESTS_PAGE_SIZE),
  );
  const safeOtherPage = Math.min(otherPage, otherPageCount);
  const otherSlice = otherFiltered.slice(
    (safeOtherPage - 1) * LEAVE_REQUESTS_PAGE_SIZE,
    safeOtherPage * LEAVE_REQUESTS_PAGE_SIZE,
  );
  const hasOtherFilters =
    otherSearch.trim().length > 0 || otherDateFrom.length > 0 || otherDateTo.length > 0;

  const permissionSummary = useMemo(
    () => computeRequestStatusSummary(permissionRows),
    [permissionRows],
  );
  const compOffSummary = useMemo(
    () => computeRequestStatusSummary(compOffRows),
    [compOffRows],
  );

  const tabSummary =
    activeTab === 'LEAVE'
      ? req.summary
      : activeTab === 'PERMISSION'
        ? permissionSummary
        : compOffSummary;

  const clearOtherFilters = () => {
    setOtherSearch('');
    setOtherDateFrom('');
    setOtherDateTo('');
    setOtherPage(1);
  };

  const formatDate = (value: string) =>
    value
      ? new Date(value).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : '—';

  const formatMinutes = (value: number) => {
    const h = Math.floor(value / 60);
    const m = value % 60;
    if (h <= 0) return `${m}m`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}m`;
  };

  const formatTimeFromMinutes = (minutes?: number | null) => {
    if (minutes == null || !Number.isFinite(minutes)) return '—';
    const h24 = Math.floor(minutes / 60);
    const mm = minutes % 60;
    const meridiem = h24 >= 12 ? 'PM' : 'AM';
    const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
    return `${String(h12).padStart(2, '0')}:${String(mm).padStart(2, '0')} ${meridiem}`;
  };

  const updatePermissionStatus = async (
    requestId: number,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    const key = `permission-${requestId}`;
    setOtherBusyKey(key);
    try {
      await api.put(`/leaves/permissions/requests/${requestId}`, { status });
      setPermissionRows((prev) =>
        prev.map((row) => (row.id === requestId ? { ...row, status } : row)),
      );
      toast.success(
        status === 'APPROVED'
          ? 'Permission request approved.'
          : 'Permission request rejected.',
      );
    } catch {
      toast.error('Could not update permission request.');
    } finally {
      setOtherBusyKey(null);
    }
  };

  const updateCompOffStatus = async (
    requestId: number,
    status: 'APPROVED' | 'REJECTED',
  ) => {
    const key = `compoff-${requestId}`;
    setOtherBusyKey(key);
    try {
      const { data } = await api.put<{
        leaveBalance?: { compOff: number };
      }>(`/leaves/comp-off-requests/${requestId}`, { status });
      setCompOffRows((prev) =>
        prev.map((row) => (row.id === requestId ? { ...row, status } : row)),
      );
      if (status === 'APPROVED' && data?.leaveBalance != null) {
        toast.success(
          `Comp off approved. Employee comp off balance is now ${data.leaveBalance.compOff} day(s).`,
        );
      } else {
        toast.success(
          status === 'APPROVED'
            ? 'Comp off request approved.'
            : 'Comp off request rejected.',
        );
      }
    } catch {
      toast.error('Could not update comp off request.');
    } finally {
      setOtherBusyKey(null);
    }
  };

  return (
    <section className='relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex min-w-0 flex-col gap-3'>
          <LeaveRequestsPageHeader
            filteredCount={req.filtered.length}
            totalCount={req.rows.length}
            hasActiveFilters={req.hasActiveFilters}
          />

          <LeaveRequestsSummaryCards summary={tabSummary} />

          <section
            aria-labelledby='requests-heading'
            className='flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
          >
              <RequestCategoryTabs activeTab={activeTab} onTabChange={setActiveTab} />

              {activeTab === 'LEAVE' ? (
                <>
                  <LeaveRequestsFilterBar
                    searchTerm={req.searchTerm}
                    onSearchChange={req.setSearchTerm}
                    statusFilter={req.statusFilter}
                    onStatusChange={req.setStatusFilter}
                    typeFilter={req.typeFilter}
                    onTypeChange={req.setTypeFilter}
                    dateFrom={req.dateFrom}
                    onDateFromChange={req.setDateFrom}
                    dateTo={req.dateTo}
                    onDateToChange={req.setDateTo}
                    hasActiveFilters={req.hasActiveFilters}
                    onClearFilters={req.clearFilters}
                  />

                  <div className='flex w-full min-w-0 min-h-124 flex-col overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/40'>
                    <LeaveRequestsTable
                      rows={req.pageSlice}
                      holidays={holidays}
                      canModerate={canModerate}
                      busyId={req.busyId}
                      onApproveReject={req.approveOrReject}
                    />
                  </div>

                  <LeaveRequestsPagination
                    visible={req.filtered.length > req.pageSize}
                    safePage={req.safePage}
                    pageCount={req.pageCount}
                    filteredLength={req.filtered.length}
                    pageSize={req.pageSize}
                    onPrev={() => req.setPage((p) => Math.max(1, p - 1))}
                    onNext={() =>
                      req.setPage((p) => Math.min(req.pageCount, p + 1))
                    }
                  />
                </>
              ) : (
                <>
                  <div className='flex min-w-0 shrink-0 flex-nowrap items-center gap-3 overflow-x-auto py-0.5 [scrollbar-width:thin]'>
                    <div className='min-w-[200px] max-w-sm flex-1'>
                      <Input
                        id='other-req-search'
                        type='text'
                        label='Search'
                        hideLabel
                        placeholder='Search employee / reason…'
                        value={otherSearch}
                        onChange={(e) => {
                          setOtherSearch(e.target.value);
                          setOtherPage(1);
                        }}
                        inputClassName='h-10 py-0 focus:ring-inset'
                      />
                    </div>
                    <div className='w-[150px] shrink-0'>
                      <Input
                        id='other-req-from'
                        type='date'
                        label='From'
                        hideLabel
                        placeholder='From'
                        value={otherDateFrom}
                        onChange={(e) => {
                          setOtherDateFrom(e.target.value);
                          setOtherPage(1);
                        }}
                        inputClassName='h-10 py-0 focus:ring-inset'
                      />
                    </div>
                    <div className='w-[150px] shrink-0'>
                      <Input
                        id='other-req-to'
                        type='date'
                        label='To'
                        hideLabel
                        placeholder='To'
                        value={otherDateTo}
                        min={otherDateFrom || undefined}
                        onChange={(e) => {
                          setOtherDateTo(e.target.value);
                          setOtherPage(1);
                        }}
                        inputClassName='h-10 py-0 focus:ring-inset'
                      />
                    </div>
                    <Button
                      type='button'
                      unstyled
                      disabled={!hasOtherFilters}
                      onClick={clearOtherFilters}
                      className='ml-auto flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400'
                    >
                      Clear filters
                    </Button>
                  </div>

                  <div className='min-h-124 w-full min-w-0 overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/40'>
                    <table className='w-full min-w-xl table-fixed border-collapse text-left text-sm'>
                      {activeTab === 'PERMISSION' ? (
                        <colgroup>
                          <col className='w-[18%]' />
                          <col className='w-[14%]' />
                          <col className='w-[20%]' />
                          <col className='w-[12%]' />
                          <col className='w-[36%]' />
                        </colgroup>
                      ) : (
                        <colgroup>
                          <col className='w-[20%]' />
                          <col className='w-[14%]' />
                          <col className='w-[46%]' />
                          <col className='w-[20%]' />
                        </colgroup>
                      )}
                      <thead className='sticky top-0 z-10'>
                        <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
                          <th className='px-3 py-3.5 text-left sm:px-4'>Employee</th>
                          {activeTab === 'PERMISSION' ? (
                            <>
                              <th className='px-3 py-3.5 text-left sm:px-4'>Date</th>
                              <th className='px-3 py-3.5 text-left sm:px-4'>Time</th>
                              <th className='px-3 py-3.5 text-left sm:px-4'>Duration</th>
                              <th className='px-3 py-3.5 pr-5 text-left sm:pl-4 sm:pr-6'>Action</th>
                            </>
                          ) : (
                            <>
                              <th className='px-3 py-3.5 text-left sm:px-4'>Work date</th>
                              <th className='px-3 py-3.5 text-left sm:px-4'>Reason</th>
                              <th className='px-3 py-3.5 pr-5 text-left sm:pl-4 sm:pr-6'>Action</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {otherSlice.length === 0 ? (
                          <tr>
                            <td
                              colSpan={activeTab === 'PERMISSION' ? 5 : 5}
                              className='px-3 py-16 text-center align-middle text-sm text-gray-500 sm:px-4 sm:py-24'
                            >
                              No requests match your filters.
                            </td>
                          </tr>
                        ) : activeTab === 'PERMISSION' ? (
                          (otherSlice as PermissionRequestWithEmployee[]).map((row) => (
                            <tr
                              key={row.id}
                              className='border-b border-gray-50 transition-colors hover:bg-gray-50/60'
                            >
                              <td className='min-w-0 px-3 py-2 align-top font-medium text-gray-900 sm:px-4'>
                                <span className='block truncate' title={row.user?.name ?? undefined}>
                                  {row.user?.name ?? '—'}
                                </span>
                              </td>
                              <td className='min-w-0 whitespace-nowrap px-3 py-2 align-top text-gray-700 sm:px-4'>
                                {formatDate(row.date)}
                              </td>
                              <td className='min-w-0 px-3 py-2 align-top text-gray-700 sm:px-4'>
                                {row.startTimeMinutes != null && row.endTimeMinutes != null
                                  ? `${formatTimeFromMinutes(row.startTimeMinutes)} - ${formatTimeFromMinutes(row.endTimeMinutes)}`
                                  : '—'}
                              </td>
                              <td className='min-w-0 whitespace-nowrap px-3 py-2 align-top text-gray-700 sm:px-4'>
                                {formatMinutes(row.durationMinutes)}
                              </td>
                              <td className='min-w-0 px-3 py-2 pr-5 align-top sm:pl-4 sm:pr-6'>
                                {canModerate && row.status === 'PENDING' ? (
                                  <ApproveRejectButtonGroup
                                    disabled={otherBusyKey === `permission-${row.id}`}
                                    onApprove={() =>
                                      void updatePermissionStatus(row.id, 'APPROVED')
                                    }
                                    onReject={() =>
                                      void updatePermissionStatus(row.id, 'REJECTED')
                                    }
                                  />
                                ) : (
                                  <LeaveStatusBadge status={row.status} className='shrink-0' />
                                )}
                              </td>
                            </tr>
                          ))
                        ) : (
                          (otherSlice as CompOffRequestWithEmployee[]).map((row) => (
                            <tr
                              key={row.id}
                              className='border-b border-gray-50 transition-colors hover:bg-gray-50/60'
                            >
                              <td className='min-w-0 px-3 py-2 align-top font-medium text-gray-900 sm:px-4'>
                                <span className='block truncate' title={row.user?.name ?? undefined}>
                                  {row.user?.name ?? '—'}
                                </span>
                              </td>
                              <td className='min-w-0 whitespace-nowrap px-3 py-2 align-top text-gray-700 sm:px-4'>
                                {formatDate(row.workDate)}
                              </td>
                              <td className='min-w-0 px-3 py-2 align-top text-gray-600 sm:px-4'>
                                <span className='line-clamp-2 wrap-break-word' title={row.reason}>
                                  {row.reason || '—'}
                                </span>
                              </td>
                              <td className='min-w-0 px-3 py-2 pr-5 align-top sm:pl-4 sm:pr-6'>
                                {canModerate && row.status === 'PENDING' ? (
                                  <ApproveRejectButtonGroup
                                    disabled={otherBusyKey === `compoff-${row.id}`}
                                    onApprove={() =>
                                      void updateCompOffStatus(row.id, 'APPROVED')
                                    }
                                    onReject={() =>
                                      void updateCompOffStatus(row.id, 'REJECTED')
                                    }
                                  />
                                ) : (
                                  <LeaveStatusBadge status={row.status} className='shrink-0' />
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <LeaveRequestsPagination
                    visible={otherFiltered.length > LEAVE_REQUESTS_PAGE_SIZE}
                    safePage={safeOtherPage}
                    pageCount={otherPageCount}
                    filteredLength={otherFiltered.length}
                    pageSize={LEAVE_REQUESTS_PAGE_SIZE}
                    onPrev={() => setOtherPage((p) => Math.max(1, p - 1))}
                    onNext={() =>
                      setOtherPage((p) => Math.min(otherPageCount, p + 1))
                    }
                  />
                </>
              )}
            </section>
        </div>
      </div>
    </section>
  );
}
