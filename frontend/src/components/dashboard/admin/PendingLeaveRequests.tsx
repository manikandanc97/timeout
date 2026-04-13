'use client';

import Button from '@/components/ui/Button';
import ConfirmModal from '@/components/ui/ConfirmModal';
import api from '@/services/api';
import {
  BriefcaseBusiness,
  CheckCircle2,
  ClipboardList,
  Clock3,
  XCircle,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LeaveWithEmployee } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import { workingDaysForLeaveRange } from '@/utils/leave/leaveHelpers';
import {
  AdminDashboardEmpty,
  AdminDashboardPanel,
} from './AdminDashboardPanel';

const MAX_VISIBLE = 5;
const MAX_OTHER_VISIBLE = 8;

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

function pickLatestPending(rows: LeaveWithEmployee[]) {
  return rows
    .filter((row) => row.status === 'PENDING')
    .sort(
      (a, b) =>
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime(),
    )
    .slice(0, MAX_VISIBLE);
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
  user?: { name?: string | null } | null;
};

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

export default function PendingLeaveRequests() {
  const [activeTab, setActiveTab] = useState<'LEAVE' | 'PERMISSION' | 'COMP_OFF'>(
    'LEAVE',
  );
  const [pendingList, setPendingList] = useState<LeaveWithEmployee[]>([]);
  const [permissionRows, setPermissionRows] = useState<PermissionRow[]>([]);
  const [compOffRows, setCompOffRows] = useState<CompOffRow[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [rejectLeaveId, setRejectLeaveId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    async function loadPendingLeaves() {
      setLoading(true);
      try {
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
        setPendingList(pickLatestPending(leaveRes.data));
        setHolidays(Array.isArray(holidayRes.data) ? holidayRes.data : []);
        setPermissionRows(
          Array.isArray(permissionRes.data)
            ? permissionRes.data.slice(0, MAX_OTHER_VISIBLE)
            : [],
        );
        setCompOffRows(
          Array.isArray(compOffRes.data)
            ? compOffRes.data.slice(0, MAX_OTHER_VISIBLE)
            : [],
        );
      } catch {
        setPendingList([]);
        setHolidays([]);
        setPermissionRows([]);
        setCompOffRows([]);
      } finally {
        setLoading(false);
      }
    }
    loadPendingLeaves();
  }, []);

  async function approveOrReject(
    leaveId: number,
    newStatus: 'APPROVED' | 'REJECTED',
    rejectionReason?: string,
  ) {
    setBusyId(leaveId);
    try {
      await api.put(`/leaves/${leaveId}`, {
        status: newStatus,
        ...(newStatus === 'REJECTED'
          ? { rejectionReason: rejectionReason?.trim() ?? '' }
          : {}),
      });
      const [leaveRes, permissionRes, compOffRes] = await Promise.all([
        api.get<LeaveWithEmployee[]>('/leaves'),
        api
          .get<PermissionRow[]>('/leaves/permissions/requests')
          .catch(() => ({ data: [] as PermissionRow[] })),
        api
          .get<CompOffRow[]>('/leaves/comp-off-requests')
          .catch(() => ({ data: [] as CompOffRow[] })),
      ]);
      setPendingList(pickLatestPending(leaveRes.data));
      setPermissionRows(
        Array.isArray(permissionRes.data)
          ? permissionRes.data.slice(0, MAX_OTHER_VISIBLE)
          : [],
      );
      setCompOffRows(
        Array.isArray(compOffRes.data)
          ? compOffRes.data.slice(0, MAX_OTHER_VISIBLE)
          : [],
      );
    } catch {
      // silent
    } finally {
      setBusyId(null);
    }
  }

  const isRejectingCurrent = rejectLeaveId !== null && busyId === rejectLeaveId;

  const openRejectModal = (leaveId: number) => {
    setRejectLeaveId(leaveId);
    setRejectReason('');
  };

  const closeRejectModal = () => {
    if (isRejectingCurrent) return;
    setRejectLeaveId(null);
    setRejectReason('');
  };

  const confirmReject = () => {
    if (rejectLeaveId === null) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) return;
    void approveOrReject(rejectLeaveId, 'REJECTED', trimmed).finally(() => {
      setRejectLeaveId(null);
      setRejectReason('');
    });
  };

  if (loading) {
    return (
      <AdminDashboardPanel
        title='Pending leave requests'
        subtitle={`Up to ${MAX_VISIBLE} newest`}
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
      {pendingList.length} pending
    </span>
  );

  const permissionBadge = (
    <span className='rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-700 ring-1 ring-sky-200'>
      {permissionRows.length} latest
    </span>
  );

  const compOffBadge = (
    <span className='rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 ring-1 ring-indigo-200'>
      {compOffRows.length} latest
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
        pendingList.length === 0 ? (
          <AdminDashboardEmpty
            icon={ClipboardList}
            message='No pending leave requests. New submissions will appear here.'
          />
        ) : (
          <ul className='space-y-2'>
            {pendingList.map((row) => {
              const isBusy = busyId === row.id;
              const name = row.user?.name ?? 'Unknown';
              const typeColors = LEAVE_TYPE_COLORS[row.type] ?? {
                bg: 'bg-gray-100',
                text: 'text-gray-600',
              };

              return (
                <li
                  key={row.id}
                  className='group flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 bg-gray-50/70 hover:bg-gray-50 p-3 rounded-xl transition-colors duration-150'
                >
                  <div className='flex items-center gap-3 min-w-0'>
                    <InitialsAvatar name={name} />
                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <p className='font-semibold text-gray-900 text-sm'>
                          {name}
                        </p>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[11px] font-semibold ${typeColors.bg} ${typeColors.text}`}
                        >
                          {leaveTypeLabel(row.type)}
                        </span>
                      </div>
                      <p className='mt-0.5 text-gray-400 text-xs'>
                        {formatDate(row.startDate)} → {formatDate(row.endDate)}
                        <span className='mx-1.5 text-gray-300'>•</span>
                        <span>
                          {(() => {
                            const workingDays = workingDaysForLeaveRange(
                              row.startDate,
                              row.endDate,
                              holidays,
                            );
                            return `${workingDays} working ${workingDays === 1 ? 'day' : 'days'}`;
                          })()}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className='flex gap-2 pl-11 sm:pl-0 shrink-0'>
                    <button
                      disabled={isBusy}
                      onClick={() => approveOrReject(row.id, 'APPROVED')}
                      className='flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 px-3 py-1.5 rounded-lg ring-1 ring-emerald-200 font-semibold text-emerald-700 text-xs transition-all duration-150 disabled:cursor-not-allowed'
                    >
                      <CheckCircle2 size={13} />
                      Approve
                    </button>
                    <button
                      disabled={isBusy}
                      onClick={() => openRejectModal(row.id)}
                      className='flex items-center gap-1.5 bg-red-50 hover:bg-red-100 disabled:opacity-50 px-3 py-1.5 rounded-lg ring-1 ring-red-200 font-semibold text-red-700 text-xs transition-all duration-150 disabled:cursor-not-allowed'
                    >
                      <XCircle size={13} />
                      Reject
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      {activeTab === 'PERMISSION' ? (
        permissionRows.length === 0 ? (
          <AdminDashboardEmpty
            icon={Clock3}
            message='No permission requests found.'
          />
        ) : (
          <ul className='space-y-2'>
            {permissionRows.map((row) => {
              const employeeName = row.user?.name ?? 'Unknown';
              return (
                <li
                  key={row.id}
                  className='flex items-center justify-between gap-3 rounded-xl bg-gray-50/70 p-3'
                >
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-semibold text-gray-900'>{employeeName}</p>
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
              );
            })}
          </ul>
        )
      ) : null}

      {activeTab === 'COMP_OFF' ? (
        compOffRows.length === 0 ? (
          <AdminDashboardEmpty
            icon={BriefcaseBusiness}
            message='No comp off requests found.'
          />
        ) : (
          <ul className='space-y-2'>
            {compOffRows.map((row) => {
              const employeeName = row.user?.name ?? 'Unknown';
              return (
                <li
                  key={row.id}
                  className='flex items-center justify-between gap-3 rounded-xl bg-gray-50/70 p-3'
                >
                  <div className='min-w-0'>
                    <div className='flex items-center gap-2'>
                      <p className='text-sm font-semibold text-gray-900'>{employeeName}</p>
                      <span className='rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700'>
                        Comp off
                      </span>
                    </div>
                    <p className='mt-0.5 text-xs text-gray-500'>
                      Worked on {formatDate(row.workDate)}
                    </p>
                    <p className='mt-1 line-clamp-1 text-xs text-gray-400'>{row.reason}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : null}

      <ConfirmModal
        open={rejectLeaveId !== null}
        title='Reject leave request'
        message='Please provide a reason. This will be shown to the employee.'
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
