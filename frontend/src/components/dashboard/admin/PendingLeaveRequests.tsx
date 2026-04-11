'use client';

import Button from '@/components/ui/Button';
import api from '@/services/api';
import { ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LeaveWithEmployee } from '@/types/leave';
import {
  AdminDashboardEmpty,
  AdminDashboardPanel,
} from './AdminDashboardPanel';

const MAX_VISIBLE = 5;

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
  const [pendingList, setPendingList] = useState<LeaveWithEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    async function loadPendingLeaves() {
      setLoading(true);
      try {
        const res = await api.get<LeaveWithEmployee[]>('/leaves');
        setPendingList(pickLatestPending(res.data));
      } catch {
        setPendingList([]);
      } finally {
        setLoading(false);
      }
    }
    loadPendingLeaves();
  }, []);

  async function approveOrReject(
    leaveId: number,
    newStatus: 'APPROVED' | 'REJECTED',
  ) {
    setBusyId(leaveId);
    try {
      await api.put(`/leaves/${leaveId}`, { status: newStatus });
      const res = await api.get<LeaveWithEmployee[]>('/leaves');
      setPendingList(pickLatestPending(res.data));
    } catch {
      // silent
    } finally {
      setBusyId(null);
    }
  }

  const badge = (
    <span className='flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-full ring-1 ring-amber-200 font-semibold text-[11px] text-amber-700'>
      <span className='bg-amber-500 rounded-full w-1.5 h-1.5' />
      {pendingList.length} pending
    </span>
  );

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

  return (
    <AdminDashboardPanel
      title='Pending leave requests'
      subtitle={`Up to ${MAX_VISIBLE} newest · awaiting approval`}
      icon={ClipboardList}
      iconTileClass='bg-violet-50'
      iconClass='text-violet-600'
      action={badge}
    >
      {pendingList.length === 0 ? (
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
                    onClick={() => approveOrReject(row.id, 'REJECTED')}
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
      )}
    </AdminDashboardPanel>
  );
}
