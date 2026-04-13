'use client';

import LeaveRequestsFilterBar from '@/components/leave/LeaveRequestsFilterBar';
import LeaveRequestsPageHeader from '@/components/leave/LeaveRequestsPageHeader';
import LeaveRequestsPagination from '@/components/leave/LeaveRequestsPagination';
import LeaveRequestsSummaryCards from '@/components/leave/LeaveRequestsSummaryCards';
import LeaveRequestsTable from '@/components/leave/LeaveRequestsTable';
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

  const OTHER_PAGE_SIZE = 15;

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
  const otherPageCount = Math.max(1, Math.ceil(otherFiltered.length / OTHER_PAGE_SIZE));
  const safeOtherPage = Math.min(otherPage, otherPageCount);
  const otherSlice = otherFiltered.slice(
    (safeOtherPage - 1) * OTHER_PAGE_SIZE,
    safeOtherPage * OTHER_PAGE_SIZE,
  );
  const hasOtherFilters =
    otherSearch.trim().length > 0 || otherDateFrom.length > 0 || otherDateTo.length > 0;

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
      await api.put(`/leaves/comp-off-requests/${requestId}`, { status });
      setCompOffRows((prev) =>
        prev.map((row) => (row.id === requestId ? { ...row, status } : row)),
      );
      toast.success(
        status === 'APPROVED'
          ? 'Comp off request approved.'
          : 'Comp off request rejected.',
      );
    } catch {
      toast.error('Could not update comp off request.');
    } finally {
      setOtherBusyKey(null);
    }
  };

  return (
    <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4'>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
            <LeaveRequestsPageHeader
              filteredCount={req.filtered.length}
              totalCount={req.rows.length}
              hasActiveFilters={req.hasActiveFilters}
            />

            <section
              aria-labelledby='leave-requests-heading'
              className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
            >
              <div className='flex items-center gap-2 rounded-xl border border-gray-100 bg-white/80 p-1'>
                <Button
                  type='button'
                  unstyled
                  onClick={() => setActiveTab('LEAVE')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'LEAVE'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Leave requests
                </Button>
                <Button
                  type='button'
                  unstyled
                  onClick={() => setActiveTab('PERMISSION')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'PERMISSION'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Permission requests
                </Button>
                <Button
                  type='button'
                  unstyled
                  onClick={() => setActiveTab('COMP_OFF')}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    activeTab === 'COMP_OFF'
                      ? 'bg-primary text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  Comp off requests
                </Button>
              </div>

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

                  <div className='flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40'>
                    <LeaveRequestsTable
                      rows={req.pageSlice}
                      holidays={holidays}
                      canModerate={canModerate}
                      busyId={req.busyId}
                      onApproveReject={req.approveOrReject}
                    />
                  </div>

                  <LeaveRequestsPagination
                    visible={req.filtered.length > 0}
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

                  <div className='min-h-0 flex-1 overflow-auto rounded-xl border border-gray-100 bg-gray-50/40'>
                    <table className='w-full min-w-[720px] border-collapse text-left text-sm'>
                      <thead className='sticky top-0 z-10'>
                        <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
                          <th className='px-4 py-3.5 text-left'>Employee</th>
                          {activeTab === 'PERMISSION' ? (
                            <>
                              <th className='px-4 py-3.5 text-left'>Date</th>
                              <th className='px-4 py-3.5 text-left'>Time</th>
                              <th className='px-4 py-3.5 text-left'>Duration</th>
                              <th className='px-4 py-3.5 text-left'>Action</th>
                            </>
                          ) : (
                            <>
                              <th className='px-4 py-3.5 text-left'>Work date</th>
                              <th className='px-4 py-3.5 text-left'>Reason</th>
                              <th className='px-4 py-3.5 text-left'>Action</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {otherSlice.length === 0 ? (
                          <tr>
                            <td
                              colSpan={activeTab === 'PERMISSION' ? 5 : 5}
                              className='px-4 py-16 text-center align-middle text-sm text-gray-500 sm:py-24'
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
                              <td className='px-4 py-2 align-top font-medium text-gray-900'>
                                {row.user?.name ?? '—'}
                              </td>
                              <td className='px-4 py-2 align-top text-gray-700'>
                                {formatDate(row.date)}
                              </td>
                              <td className='px-4 py-2 align-top text-gray-700'>
                                {row.startTimeMinutes != null && row.endTimeMinutes != null
                                  ? `${formatTimeFromMinutes(row.startTimeMinutes)} - ${formatTimeFromMinutes(row.endTimeMinutes)}`
                                  : '—'}
                              </td>
                              <td className='px-4 py-2 align-top text-gray-700'>
                                {formatMinutes(row.durationMinutes)}
                              </td>
                              <td className='px-4 py-2 align-top'>
                                {canModerate && row.status === 'PENDING' ? (
                                  <div className='flex gap-2'>
                                    <button
                                      type='button'
                                      disabled={otherBusyKey === `permission-${row.id}`}
                                      onClick={() =>
                                        void updatePermissionStatus(row.id, 'APPROVED')
                                      }
                                      className='inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type='button'
                                      disabled={otherBusyKey === `permission-${row.id}`}
                                      onClick={() =>
                                        void updatePermissionStatus(row.id, 'REJECTED')
                                      }
                                      className='inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className='text-xs text-gray-500'>{row.status}</span>
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
                              <td className='px-4 py-2 align-top font-medium text-gray-900'>
                                {row.user?.name ?? '—'}
                              </td>
                              <td className='px-4 py-2 align-top text-gray-700'>
                                {formatDate(row.workDate)}
                              </td>
                              <td className='max-w-[320px] px-4 py-2 align-top text-gray-600'>
                                <span className='line-clamp-2'>{row.reason || '—'}</span>
                              </td>
                              <td className='px-4 py-2 align-top'>
                                {canModerate && row.status === 'PENDING' ? (
                                  <div className='flex gap-2'>
                                    <button
                                      type='button'
                                      disabled={otherBusyKey === `compoff-${row.id}`}
                                      onClick={() =>
                                        void updateCompOffStatus(row.id, 'APPROVED')
                                      }
                                      className='inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                      Approve
                                    </button>
                                    <button
                                      type='button'
                                      disabled={otherBusyKey === `compoff-${row.id}`}
                                      onClick={() =>
                                        void updateCompOffStatus(row.id, 'REJECTED')
                                      }
                                      className='inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50'
                                    >
                                      Reject
                                    </button>
                                  </div>
                                ) : (
                                  <span className='text-xs text-gray-500'>{row.status}</span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  <LeaveRequestsPagination
                    visible={otherFiltered.length > 0}
                    safePage={safeOtherPage}
                    pageCount={otherPageCount}
                    filteredLength={otherFiltered.length}
                    pageSize={OTHER_PAGE_SIZE}
                    onPrev={() => setOtherPage((p) => Math.max(1, p - 1))}
                    onNext={() =>
                      setOtherPage((p) => Math.min(otherPageCount, p + 1))
                    }
                  />
                </>
              )}
            </section>
          </div>

          {activeTab === 'LEAVE' ? (
            <LeaveRequestsSummaryCards summary={req.summary} />
          ) : null}
        </div>
      </div>
    </section>
  );
}
