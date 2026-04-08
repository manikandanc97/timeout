'use client';

import api from '@/services/api';
import type { Leave, LeaveStatus, LeaveType } from '@/types/leave';
import { CalendarDays, Clock3, Pencil, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useState } from 'react';
import Button from '../ui/Button';

type Props = { leaves: Leave[] };

const TYPE_STYLES: Record<LeaveType, { pill: string; label: string }> = {
  ANNUAL: { pill: 'bg-sky-100 text-sky-900', label: 'Annual leave' },
  SICK: { pill: 'bg-pink-100 text-pink-900', label: 'Sick leave' },
  MATERNITY: {
    pill: 'bg-fuchsia-100 text-fuchsia-900',
    label: 'Maternity leave',
  },
  PATERNITY: {
    pill: 'bg-violet-100 text-violet-900',
    label: 'Paternity leave',
  },
};

const StatusBadge = ({ status }: { status: LeaveStatus | string }) => {
  const s = status?.toUpperCase();
  const styles =
    s === 'APPROVED'
      ? 'bg-green-100 text-green-700'
      : s === 'REJECTED'
        ? 'bg-red-100 text-red-700'
        : 'bg-amber-100 text-amber-700';
  const dot =
    s === 'APPROVED'
      ? 'bg-green-500'
      : s === 'REJECTED'
        ? 'bg-red-500'
        : 'bg-amber-500';
  const label =
    s === 'APPROVED' ? 'Approved' : s === 'REJECTED' ? 'Rejected' : 'Pending';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${styles}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const countDays = (from: string, to: string) =>
  Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;

const MyLeavesList = ({ leaves }: Props) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await api.delete(`/leaves/${id}`);
      toast.success('Leave request cancelled successfully');
      router.refresh();
    } catch (error) {
      toast.error('Failed to cancel leave request. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!leaves?.length) {
    return (
      <div className='flex flex-col justify-center items-center py-16 text-gray-400'>
        <CalendarDays size={36} className='opacity-20 mb-3' />
        <p className='text-sm'>No leave requests found</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-3 mt-6'>
      {leaves.map((leave) => {
        const typeStyle = TYPE_STYLES[leave.type] ?? TYPE_STYLES.ANNUAL;
        const d = countDays(leave.fromDate, leave.toDate);
        const isPending = leave.status === 'PENDING';

        return (
          <div
            key={leave.id}
            className='flex flex-col gap-3 bg-white p-4 md:p-5 border border-gray-100 hover:border-gray-200 rounded-xl transition-colors'
          >
            <div className='flex flex-wrap justify-between items-start gap-3'>
              <div className='flex flex-wrap items-center gap-2'>
                <span
                  className={`rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${typeStyle.pill}`}
                >
                  {typeStyle.label}
                </span>
                <StatusBadge status={leave.status} />
              </div>

              {isPending && (
                <div className='flex items-center gap-2'>
                  <Button className='inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors'>
                    <Pencil size={12} strokeWidth={2} />
                    <span>Edit</span>
                  </Button>
                  <Button
                    onClick={() => handleDelete(leave.id)}
                    disabled={deletingId === leave.id}
                    className='inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white shadow-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
                  >
                    <X size={12} />
                    {deletingId === leave.id ? 'Cancelling...' : 'Cancel'}
                  </Button>
                </div>
              )}
            </div>

            <div className='flex flex-wrap items-center gap-4 text-gray-500 text-sm'>
              <span className='flex items-center gap-1.5'>
                <CalendarDays size={14} />
                {fmt(leave.fromDate)} to {fmt(leave.toDate)}
              </span>
              <span className='flex items-center gap-1.5'>
                <Clock3 size={14} />
                {d} {d === 1 ? 'day' : 'days'}
              </span>
            </div>

            {leave.reason && (
              <p className='pl-3 border-gray-200 border-l-2 text-gray-500 text-sm leading-relaxed'>
                {leave.reason}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MyLeavesList;
