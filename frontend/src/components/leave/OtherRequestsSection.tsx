'use client';

import type { CompOffRequestWithEmployee, PermissionRequestWithEmployee } from '@/types/leave';
import ApproveRejectButtonGroup from '@/components/leave/ApproveRejectButtonGroup';
import LeaveRequestsPagination from '@/components/leave/LeaveRequestsPagination';
import LeaveStatusBadge from '@/components/leave/LeaveStatusBadge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatPersonName } from '@/lib/personName';
import { LEAVE_REQUESTS_PAGE_SIZE } from '@/components/leave/leaveRequestsPageUtils';

type Tab = 'PERMISSION' | 'COMP_OFF';

type Props = {
  activeTab: Tab;
  canModerate: boolean;
  otherSearch: string;
  otherDateFrom: string;
  otherDateTo: string;
  hasOtherFilters: boolean;
  otherSlice: (PermissionRequestWithEmployee | CompOffRequestWithEmployee)[];
  otherFilteredLength: number;
  otherPageCount: number;
  safeOtherPage: number;
  otherBusyKey: string | null;
  setOtherSearch: (value: string) => void;
  setOtherDateFrom: (value: string) => void;
  setOtherDateTo: (value: string) => void;
  setOtherPage: (updater: (current: number) => number) => void;
  clearOtherFilters: () => void;
  updatePermissionStatus: (requestId: number, status: 'APPROVED' | 'REJECTED') => Promise<void>;
  updateCompOffStatus: (requestId: number, status: 'APPROVED' | 'REJECTED') => Promise<void>;
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

export default function OtherRequestsSection(props: Props) {
  const {
    activeTab,
    canModerate,
    otherSearch,
    otherDateFrom,
    otherDateTo,
    hasOtherFilters,
    otherSlice,
    otherFilteredLength,
    otherPageCount,
    safeOtherPage,
    otherBusyKey,
    setOtherSearch,
    setOtherDateFrom,
    setOtherDateTo,
    setOtherPage,
    clearOtherFilters,
    updatePermissionStatus,
    updateCompOffStatus,
  } = props;

  return (
    <>
      <div className='flex min-w-0 shrink-0 flex-nowrap items-center gap-3 overflow-x-auto py-0.5 [scrollbar-width:thin]'>
        <div className='min-w-[200px] max-w-sm flex-1'>
          <Input
            id='other-req-search'
            type='text'
            label='Search'
            hideLabel
            placeholder='Search employee / reason...'
            value={otherSearch}
            onChange={(e) => {
              setOtherSearch(e.target.value);
              setOtherPage(() => 1);
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
              setOtherPage(() => 1);
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
              setOtherPage(() => 1);
            }}
            inputClassName='h-10 py-0 focus:ring-inset'
          />
        </div>
        <Button
          type='button'
          unstyled
          disabled={!hasOtherFilters}
          onClick={clearOtherFilters}
          className='ml-auto flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger-muted hover:text-danger-muted-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground'
        >
          Clear filters
        </Button>
      </div>

      <div className='min-h-124 w-full min-w-0 overflow-x-auto rounded-xl border border-border bg-muted/35'>
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
            <tr className='border-b border-border bg-muted/90 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'>
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
                <td colSpan={5} className='px-3 py-16 text-center align-middle text-sm text-muted-foreground sm:px-4 sm:py-24'>
                  No requests match your filters.
                </td>
              </tr>
            ) : activeTab === 'PERMISSION' ? (
              (otherSlice as PermissionRequestWithEmployee[]).map((row) => (
                <tr key={row.id} className='border-b border-border/60 transition-colors hover:bg-muted/50'>
                  <td className='min-w-0 px-3 py-2 align-top text-sm font-medium text-card-foreground sm:px-4'>
                    <span className='block truncate' title={formatPersonName(row.user?.name) || undefined}>
                      {formatPersonName(row.user?.name) || '—'}
                    </span>
                  </td>
                  <td className='min-w-0 whitespace-nowrap px-3 py-2 align-top text-sm text-muted-foreground sm:px-4'>{formatDate(row.date)}</td>
                  <td className='min-w-0 px-3 py-2 align-top text-sm text-muted-foreground sm:px-4'>
                    {row.startTimeMinutes != null && row.endTimeMinutes != null
                      ? `${formatTimeFromMinutes(row.startTimeMinutes)} - ${formatTimeFromMinutes(row.endTimeMinutes)}`
                      : '—'}
                  </td>
                  <td className='min-w-0 whitespace-nowrap px-3 py-2 align-top text-sm text-muted-foreground sm:px-4'>{formatMinutes(row.durationMinutes)}</td>
                  <td className='min-w-0 px-3 py-2 pr-5 align-top sm:pl-4 sm:pr-6'>
                    {canModerate && row.status === 'PENDING' ? (
                      <ApproveRejectButtonGroup
                        disabled={otherBusyKey === `permission-${row.id}`}
                        onApprove={() => void updatePermissionStatus(row.id, 'APPROVED')}
                        onReject={() => void updatePermissionStatus(row.id, 'REJECTED')}
                      />
                    ) : (
                      <LeaveStatusBadge status={row.status} className='shrink-0' />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              (otherSlice as CompOffRequestWithEmployee[]).map((row) => (
                <tr key={row.id} className='border-b border-border/60 transition-colors hover:bg-muted/50'>
                  <td className='min-w-0 px-3 py-2 align-top text-sm font-medium text-card-foreground sm:px-4'>
                    <span className='block truncate' title={formatPersonName(row.user?.name) || undefined}>
                      {formatPersonName(row.user?.name) || '—'}
                    </span>
                  </td>
                  <td className='min-w-0 whitespace-nowrap px-3 py-2 align-top text-sm text-muted-foreground sm:px-4'>{formatDate(row.workDate)}</td>
                  <td className='min-w-0 px-3 py-2 align-top text-sm text-muted-foreground sm:px-4'>
                    <span className='line-clamp-2 wrap-break-word' title={row.reason}>{row.reason || '—'}</span>
                  </td>
                  <td className='min-w-0 px-3 py-2 pr-5 align-top sm:pl-4 sm:pr-6'>
                    {canModerate && row.status === 'PENDING' ? (
                      <ApproveRejectButtonGroup
                        disabled={otherBusyKey === `compoff-${row.id}`}
                        onApprove={() => void updateCompOffStatus(row.id, 'APPROVED')}
                        onReject={() => void updateCompOffStatus(row.id, 'REJECTED')}
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
        visible={otherFilteredLength > LEAVE_REQUESTS_PAGE_SIZE}
        safePage={safeOtherPage}
        pageCount={otherPageCount}
        filteredLength={otherFilteredLength}
        pageSize={LEAVE_REQUESTS_PAGE_SIZE}
        onPrev={() => setOtherPage((p) => Math.max(1, p - 1))}
        onNext={() => setOtherPage((p) => Math.min(otherPageCount, p + 1))}
      />
    </>
  );
}
