'use client';

import Button from '@/components/ui/Button';
import api from '@/services/api';
import { ClipboardList } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { LeaveWithEmployee } from '@/types/leave';
import {
  AdminDashboardEmpty,
  AdminDashboardPanel,
} from './AdminDashboardPanel';

const MAX_VISIBLE = 5;

function prettyLeaveType(type: string) {
  const lower = type.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function formatDate(dateString: string) {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
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
      } catch (err) {
        console.error('Could not load leaves', err);
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
    } catch (err) {
      console.error('Could not update leave', err);
    } finally {
      setBusyId(null);
    }
  }

  if (loading) {
    return (
      <AdminDashboardPanel
        title='Pending leave requests'
        subtitle={`Up to ${MAX_VISIBLE} newest · awaiting approval`}
        icon={ClipboardList}
        iconTileClass='border-blue-100 bg-blue-50'
        iconClass='text-blue-600'
        accentBorder='border-l-4 border-l-blue-500'
      >
        <div className='h-36 animate-pulse rounded-xl bg-gray-50/90 ring-1 ring-gray-100/80' />
      </AdminDashboardPanel>
    );
  }

  return (
    <AdminDashboardPanel
      title='Pending leave requests'
      subtitle={`Up to ${MAX_VISIBLE} newest · awaiting approval`}
      icon={ClipboardList}
      iconTileClass='border-blue-100 bg-blue-50'
      iconClass='text-blue-600'
      accentBorder='border-l-4 border-l-blue-500'
    >
      {pendingList.length === 0 ? (
        <AdminDashboardEmpty
          icon={ClipboardList}
          message='No pending leave requests. New submissions will appear here for quick approval.'
        />
      ) : (
        <ul className='border-gray-100 border-t'>
          {pendingList.map((row) => {
            const isBusy = busyId === row.id;
            const name = row.user?.name ?? 'Unknown';

            return (
              <li
                key={row.id}
                className='border-gray-100 border-b border-dashed py-4 last:border-b-0'
              >
                <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='min-w-0'>
                    <p className='font-medium text-gray-900'>{name}</p>
                    <p className='mt-0.5 text-gray-500 text-sm'>
                      {prettyLeaveType(row.type)} leave ·{' '}
                      {formatDate(row.startDate)} → {formatDate(row.endDate)}
                    </p>
                  </div>

                  <div className='flex shrink-0 gap-2'>
                    <Button
                      variant='outline'
                      disabled={isBusy}
                      onClick={() => approveOrReject(row.id, 'APPROVED')}
                      className='border-emerald-200 py-1.5 text-emerald-700! hover:bg-emerald-50!'
                    >
                      Approve
                    </Button>
                    <Button
                      variant='outline'
                      disabled={isBusy}
                      onClick={() => approveOrReject(row.id, 'REJECTED')}
                      className='border-red-200 py-1.5 text-red-700! hover:bg-red-50!'
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </AdminDashboardPanel>
  );
}
