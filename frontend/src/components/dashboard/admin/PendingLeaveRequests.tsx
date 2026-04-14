'use client';

import ApproveRejectButtonGroup from '@/components/leave/ApproveRejectButtonGroup';
import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/services/api';
import {
  BriefcaseBusiness,
  ClipboardList,
  Clock3,
} from 'lucide-react';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import type { LeaveWithEmployee } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import { workingDaysForLeaveRange } from '@/utils/leave/leaveHelpers';
import { AdminDashboardPanel } from './AdminDashboardPanel';

/** Fixed number of row slots so empty / partial tabs keep the same card height */
const SLOT_COUNT = 3;

const LEAVE_TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  ANNUAL: { bg: 'bg-sky-50', text: 'text-sky-700' },
  SICK: { bg: 'bg-rose-50', text: 'text-rose-700' },
  MATERNITY: { bg: 'bg-pink-50', text: 'text-pink-700' },
  PATERNITY: { bg: 'bg-violet-50', text: 'text-violet-700' },
};

function leaveTypeLabel(type: string) {
  const lower = type.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1) + ' leave';
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
  });
}

function sortPendingLeaves(rows: LeaveWithEmployee[]) {
  return rows
    .filter((row) => row.status === 'PENDING')
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    );
}

function withSlotPadding<T>(items: T[], count: number): (T | null)[] {
  const slots: (T | null)[] = items.slice(0, count);
  while (slots.length < count) slots.push(null);
  return slots;
}

type PermissionRow = {
  id: number;
  date: string;
  durationMinutes: number;
  reason: string;
  user?: { name?: string | null } | null;
};

type CompOffRow = {
  id: number;
  workDate: string;
  reason: string;
  createdAt: string;
  status?: string;
  user?: { name?: string | null } | null;
};

type BusyAction = { kind: 'leave'; id: number } | { kind: 'compOff'; id: number };

type RejectModalTarget = { kind: 'leave'; id: number } | { kind: 'compOff'; id: number };

function sortPendingCompOff(rows: CompOffRow[]) {
  return rows
    .filter((r) => r.status == null || r.status === 'PENDING')
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime(),
    );
}

function formatMinutes(total: number) {
  const h = Math.floor(total / 60);
  const m = total % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function InitialsAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className='flex justify-center items-center bg-primary/10 rounded-xl w-9 h-9 font-bold text-primary text-xs shrink-0'>
      {initials}
    </div>
  );
}

const SLOT_MIN_H = 'min-h-[5.75rem] sm:min-h-[5.25rem]';

function RequestRowPlaceholder({
  children,
  'aria-label': ariaLabel = 'Empty slot',
}: {
  children?: ReactNode;
  'aria-label'?: string;
}) {
  return (
    <li
      aria-label={ariaLabel}
      className={`flex items-stretch justify-center px-3 py-3 ${SLOT_MIN_H} rounded-xl border border-dashed border-gray-200/90 bg-gray-50/50`}
    >
      {children ?? <span className='text-gray-300 text-xs' aria-hidden> </span>}
    </li>
  );
}

export default function PendingLeaveRequests() {
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'PERMISSION' | 'COMP_OFF'>(
    'LEAVE',
  );
  const [pendingList, setPendingList] = useState<LeaveWithEmployee[]>([]);
  const [pendingLeaveTotal, setPendingLeaveTotal] = useState(0);
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);
  const [permissionTotal, setPermissionTotal] = useState(0);
  const [compOffRows, setCompOffRows] = useState<CompOffRow[]>([]);
  const [compOffTotal, setCompOffTotal] = useState(0);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState<BusyAction | null>(null);
  const [rejectTarget, setRejectTarget] = useState<RejectModalTarget | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const reloadLists = useCallback(async () => {
    const [leaveRes, holidayRes, permissionRes, compOffRes] = await Promise.all([
      api.get<LeaveWithEmployee[]>('/leaves'),
      api.get<Holiday[]>('/holidays').catch(() => ({ data: [] as Holiday[] })),
      api
        .get<PermissionRow[]>('/leaves/permissions/requests')
        .catch(() => ({ data: [] as PermissionRow[] })),
      api
        .get<CompOffRow[]>('/leaves/comp-off-requests')
        .catch(() => ({ data: [] as CompOffRow[] })),
    ]);

    const sortedLeaves = sortPendingLeaves(leaveRes.data);
    setPendingList(sortedLeaves.slice(0, SLOT_COUNT));
    setPendingLeaveTotal(sortedLeaves.length);
    setHolidays(Array.isArray(holidayRes.data) ? holidayRes.data : []);

    const permData = Array.isArray(permissionRes.data) ? permissionRes.data : [];
    setPermissionRows(permData.slice(0, SLOT_COUNT));
    setPermissionTotal(permData.length);

    const compSorted = sortPendingCompOff(
      Array.isArray(compOffRes.data) ? compOffRes.data : [],
    );
    setCompOffRows(compSorted.slice(0, SLOT_COUNT));
    setCompOffTotal(compSorted.length);
  }, []);

  useEffect(() => {
    async function loadPendingLeaves() {
      setLoading(true);
      try {
        await reloadLists();
      } catch {
        setPendingList([]);
        setPendingLeaveTotal(0);
        setHolidays([]);
        setPermissionRows([]);
        setPermissionTotal(0);
        setCompOffRows([]);
        setCompOffTotal(0);
      } finally {
        setLoading(false);
      }
    }
    void loadPendingLeaves();
  }, [reloadLists]);

  async function approveOrReject(
    leaveId: number,
    newStatus: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ) {
    setBusyAction({ kind: 'leave', id: leaveId });
    try {
      await api.put(`/leaves/${leaveId}`, {
        status: newStatus,
        ...(newStatus === 'REJECTED'
          ? { rejectionReason: rejectionReason?.trim() ?? '' }
          : {}),
      });
      await reloadLists();
    } catch {
      // silent
    } finally {
      setBusyAction(null);
    }
  }

  async function approveOrRejectCompOff(
    compOffId: number,
    newStatus: 'APPROVED' | 'REJECTED',
  ) {
    setBusyAction({ kind: 'compOff', id: compOffId });
    try {
      await api.put(`/leaves/comp-off-requests/${compOffId}`, { status: newStatus });
      await reloadLists();
    } catch {
      // silent
    } finally {
      setBusyAction(null);
    }
  }

  const isRejectingCurrent =
    rejectTarget !== null &&
    busyAction !== null &&
    busyAction.kind === rejectTarget.kind &&
    busyAction.id === rejectTarget.id;

  const openRejectModal = (kind: 'leave' | 'compOff', id: number) => {
    setRejectTarget(kind === 'leave' ? { kind: 'leave', id } : { kind: 'compOff', id });
    setRejectReason('');
  };

  const closeRejectModal = () => {
    if (isRejectingCurrent) return;
    setRejectTarget(null);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (rejectTarget === null) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) return;
    if (rejectTarget.kind === 'leave') {
      void approveOrReject(rejectTarget.id, 'REJECTED', trimmed).finally(() => {
        setRejectTarget(null);
        setRejectReason('');
      });
      return;
    }
    void approveOrRejectCompOff(rejectTarget.id, 'REJECTED').finally(() => {
      setRejectTarget(null);
      setRejectReason('');
    });
  };

  if (loading) {
    return (
      <AdminDashboardPanel
        title='Requests'
        subtitle={`Last ${SLOT_COUNT} pending`}
        icon={ClipboardList}
        iconTileClass='bg-violet-50'
        iconClass='text-violet-600'
      >
        <div className='space-y-3'>
          {[1, 2, 3].map((i) => (
            <div key={i} className='bg-gray-50 rounded-xl h-14 animate-pulse' />
          ))}
        </div>
      </AdminDashboardPanel>
    );
  }

  const leaveBadge = (
    <span className='flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full ring-1 ring-amber-200 font-semibold text-[11px] text-amber-700'>
      <span className='bg-amber-500 rounded-full w-1.5 h-1.5' />
      {pendingLeaveTotal} pending
    </span>
  );

  const permissionBadge = (
    <span className='rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200'>
      {permissionTotal} total
    </span>
  );

  const compOffBadge = (
    <span className='rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200'>
      {compOffTotal} pending
    </span>
  );

  return (
    <AdminDashboardPanel
      title='Requests'
      subtitle='Leave / Permission / Comp off'
      icon={ClipboardList}
      iconTileClass='bg-violet-50'
      iconClass='text-violet-600'
      action={
        activeTab === 'LEAVE'
          ? leaveBadge
          : activeTab === 'PERMISSION'
            ? permissionBadge
            : compOffBadge
      }
    >
      <div className='mb-4 flex items-center gap-2 rounded-xl border border-gray-100 bg-white/80 p-1'>
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
          Leave
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
          Permission
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
          Comp off
        </Button>
      </div>

      {activeTab === 'LEAVE' ? (
        <ul className='flex flex-col gap-2' aria-label='Pending leave requests'>
          {withSlotPadding(pendingList, SLOT_COUNT).map((row, i) => {
            if (!row) {
              return (
                <RequestRowPlaceholder key={`leave-empty-${i}`}>
                  {pendingList.length === 0 && i === 0 ? (
                    <div className='flex flex-col flex-1 justify-center items-center px-2 py-1 text-center'>
                      <ClipboardList
                        size={18}
                        strokeWidth={1.5}
                        className='mb-2 text-gray-300'
                        aria-hidden
                      />
                      <p className='max-w-xs text-gray-400 text-sm leading-relaxed'>
                        No pending leave requests. New submissions will appear here.
                      </p>
                    </div>
                  ) : null}
                </RequestRowPlaceholder>
              );
            }

            const isBusy = busyAction?.kind === 'leave' && busyAction.id === row.id;
            const name = row.user?.name ?? 'Unknown';
            const typeColors = LEAVE_TYPE_COLORS[row.type] ?? {
              bg: 'bg-gray-100',
              text: 'text-gray-600',
            };
            const workingDays = workingDaysForLeaveRange(
              row.startDate,
              row.endDate,
              holidays,
            );
            const daysLabel = `${workingDays} working ${workingDays === 1 ? 'day' : 'days'}`;

            return (
              <li
                key={row.id}
                className={`group flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-gray-50/70 hover:bg-gray-50 p-3 rounded-xl transition-colors duration-150 ${SLOT_MIN_H}`}
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <InitialsAvatar name={name} />
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-semibold text-gray-900 text-sm'>{name}</p>
                      <span
                        className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${typeColors.bg} ${typeColors.text}`}
                      >
                        {leaveTypeLabel(row.type)}
                      </span>
                    </div>
                    <p className='mt-0.5 text-gray-400 text-xs'>
                      {formatDate(row.startDate)} → {formatDate(row.endDate)}
                      <span className='mx-1.5 text-gray-300'>•</span>
                      <span>{daysLabel}</span>
                    </p>
                  </div>
                </div>

                <div className='shrink-0 pl-11 sm:pl-0'>
                  <ApproveRejectButtonGroup
                    disabled={isBusy}
                    onApprove={() => approveOrReject(row.id, 'APPROVED')}
                    onReject={() => openRejectModal('leave', row.id)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      {activeTab === 'PERMISSION' ? (
        <ul className='flex flex-col gap-2' aria-label='Permission requests'>
          {withSlotPadding(permissionRows, SLOT_COUNT).map((row, i) =>
            row ? (
              <li
                key={row.id}
                className={`flex items-center justify-between gap-3 rounded-xl bg-gray-50/70 p-3 ${SLOT_MIN_H}`}
              >
                <div className='min-w-0'>
                  <div className='flex items-center gap-2'>
                    <p className='text-sm font-semibold text-gray-900'>
                      {row.user?.name ?? 'Unknown'}
                    </p>
                    <span className='rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-semibold text-sky-700'>
                      Permission
                    </span>
                  </div>
                  <p className='mt-0.5 text-xs text-gray-500'>
                    {formatDate(row.date)} • {formatMinutes(row.durationMinutes)}
                  </p>
                  <p className='mt-1 line-clamp-1 text-xs text-gray-400'>{row.reason}</p>
                </div>
              </li>
            ) : (
              <RequestRowPlaceholder key={`permission-empty-${i}`}>
                {permissionRows.length === 0 && i === 0 ? (
                  <div className='flex flex-col flex-1 justify-center items-center px-2 py-1 text-center'>
                    <Clock3
                      size={18}
                      strokeWidth={1.5}
                      className='mb-2 text-gray-300'
                      aria-hidden
                    />
                    <p className='max-w-xs text-gray-400 text-sm leading-relaxed'>
                      No permission requests yet.
                    </p>
                  </div>
                ) : null}
              </RequestRowPlaceholder>
            ),
          )}
        </ul>
      ) : null}

      {activeTab === 'COMP_OFF' ? (
        <ul className='flex flex-col gap-2' aria-label='Pending comp off requests'>
          {withSlotPadding(compOffRows, SLOT_COUNT).map((row, i) => {
            if (!row) {
              return (
                <RequestRowPlaceholder key={`compoff-empty-${i}`}>
                  {compOffRows.length === 0 && i === 0 ? (
                    <div className='flex flex-col flex-1 justify-center items-center px-2 py-1 text-center'>
                      <BriefcaseBusiness
                        size={18}
                        strokeWidth={1.5}
                        className='mb-2 text-gray-300'
                        aria-hidden
                      />
                      <p className='max-w-xs text-gray-400 text-sm leading-relaxed'>
                        No pending comp off requests.
                      </p>
                    </div>
                  ) : null}
                </RequestRowPlaceholder>
              );
            }

            const isBusy = busyAction?.kind === 'compOff' && busyAction.id === row.id;
            const name = row.user?.name ?? 'Unknown';

            return (
              <li
                key={row.id}
                className={`group flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-gray-50/70 hover:bg-gray-50 p-3 rounded-xl transition-colors duration-150 ${SLOT_MIN_H}`}
              >
                <div className='flex items-center gap-3 min-w-0'>
                  <InitialsAvatar name={name} />
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <p className='font-semibold text-gray-900 text-sm'>{name}</p>
                      <span className='rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700'>
                        Comp off
                      </span>
                    </div>
                    <p className='mt-0.5 text-gray-400 text-xs line-clamp-1'>
                      Worked on {formatDate(row.workDate)}
                      <span className='mx-1.5 text-gray-300'>•</span>
                      <span>{row.reason}</span>
                    </p>
                  </div>
                </div>

                <div className='shrink-0 pl-11 sm:pl-0'>
                  <ApproveRejectButtonGroup
                    disabled={isBusy}
                    onApprove={() => void approveOrRejectCompOff(row.id, 'APPROVED')}
                    onReject={() => openRejectModal('compOff', row.id)}
                  />
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <ConfirmModal
        open={rejectTarget !== null}
        title={
          rejectTarget === null
            ? 'Reject request'
            : rejectTarget.kind === 'leave'
              ? 'Reject leave request'
              : 'Reject comp off request'
        }
        message={
          rejectTarget === null
            ? 'Please provide a reason.'
            : rejectTarget.kind === 'leave'
              ? 'Please provide a reason. This will be shown to the employee.'
              : 'Please provide a reason before rejecting this comp off request.'
        }
        cancelLabel='Cancel'
        confirmLabel='Reject'
        isProcessing={isRejectingCurrent}
        onCancel={closeRejectModal}
        onConfirm={confirmReject}
      >
        <textarea
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          rows={4}
          placeholder='Enter rejection reason'
          className='w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-red-300 focus:ring-2 focus:ring-red-100'
        />
        {!rejectReason.trim() ? (
          <p className='mt-2 text-xs text-rose-600'>Rejection reason is required.</p>
        ) : null}
      </ConfirmModal>
    </AdminDashboardPanel>
  );
}
