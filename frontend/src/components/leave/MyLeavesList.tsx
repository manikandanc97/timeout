'use client';

import api from '@/services/api';
import type { Leave, LeaveStatus, LeaveType } from '@/types/leave';
import {
  CalendarDays,
  Clock3,
  Pencil,
  X,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Stethoscope,
  Umbrella,
  Baby,
  FileText,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useMemo, useState } from 'react';
import Button from '../ui/Button';

type Props = { leaves: Leave[] };

const TYPE_CONFIG: Record<
  LeaveType,
  {
    label: string;
    icon: React.ElementType;
    bg: string;
    text: string;
    border: string;
    accent: string;
  }
> = {
  ANNUAL: {
    label: 'Annual Leave',
    icon: Umbrella,
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    accent: 'bg-cyan-500',
  },
  SICK: {
    label: 'Sick Leave',
    icon: Stethoscope,
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    accent: 'bg-rose-500',
  },
  MATERNITY: {
    label: 'Maternity Leave',
    icon: Baby,
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    accent: 'bg-pink-500',
  },
  PATERNITY: {
    label: 'Paternity Leave',
    icon: Baby,
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-200',
    accent: 'bg-violet-500',
  },
};

const STATUS_CONFIG: Record<
  string,
  {
    label: string;
    icon: React.ElementType;
    bg: string;
    text: string;
    dot: string;
  }
> = {
  APPROVED: {
    label: 'Approved',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-400',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-600',
    dot: 'bg-red-400',
  },
  PENDING: {
    label: 'Pending',
    icon: AlertCircle,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-400',
  },
};

const fmt = (d: string) =>
  new Date(d).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

const countDays = (from: string, to: string) =>
  Math.ceil((new Date(to).getTime() - new Date(from).getTime()) / 86400000) + 1;

const StatusBadge = ({
  status,
  className = '',
}: {
  status: LeaveStatus | string;
  className?: string;
}) => {
  const s = status?.toUpperCase();
  const cfg = STATUS_CONFIG[s] ?? STATUS_CONFIG.PENDING;
  const Icon = cfg.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${cfg.bg} ${cfg.text} ${className}`}
    >
      <Icon size={12} strokeWidth={2.5} />
      {cfg.label}
    </span>
  );
};

const MyLeavesList = ({ leaves }: Props) => {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const dedupedLeaves = useMemo(() => {
    if (!leaves?.length) return [];
    const seen = new Set<string>();
    const list: Leave[] = [];

    leaves.forEach((leave) => {
      const key = leave?.id
        ? `id-${leave.id}`
        : `${leave.type}-${leave.fromDate}-${leave.toDate}-${leave.reason ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push(leave);
    });

    return list.sort(
      (a, b) =>
        new Date(b.fromDate ?? b.startDate ?? '').getTime() -
        new Date(a.fromDate ?? a.startDate ?? '').getTime(),
    );
  }, [leaves]);

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await api.delete(`/leaves/${id}`);
      toast.success('Leave request cancelled successfully');
      router.refresh();
    } catch {
      toast.error('Failed to cancel leave request. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!dedupedLeaves.length) {
    return (
      <div className='flex flex-col justify-center items-center gap-4 py-20 text-gray-400'>
        <div className='flex justify-center items-center bg-gray-50 border border-gray-100 rounded-2xl w-16 h-16'>
          <CalendarDays size={28} className='opacity-30' />
        </div>
        <div className='text-center'>
          <p className='font-medium text-gray-500 text-sm'>
            No leave requests yet
          </p>
          <p className='mt-1 text-gray-400 text-xs'>
            Your leave history will appear here
          </p>
        </div>
      </div>
    );
  }

  // Group by status for summary
  const approved = dedupedLeaves.filter((l) => l.status === 'APPROVED').length;
  const pending = dedupedLeaves.filter((l) => l.status === 'PENDING').length;
  const rejected = dedupedLeaves.filter((l) => l.status === 'REJECTED').length;

  return (
    <div className='space-y-6 mt-6'>
      {/* Summary chips */}
      <div className='flex flex-wrap gap-3'>
        {[
          {
            label: 'Total',
            value: dedupedLeaves.length,
            bg: 'bg-gray-100',
            text: 'text-gray-700',
          },
          {
            label: 'Approved',
            value: approved,
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
          },
          {
            label: 'Pending',
            value: pending,
            bg: 'bg-amber-50',
            text: 'text-amber-700',
          },
          {
            label: 'Rejected',
            value: rejected,
            bg: 'bg-red-50',
            text: 'text-red-600',
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${item.bg} ${item.text}`}
          >
            <span className='font-bold text-lg leading-none'>{item.value}</span>
            <span className='opacity-80 font-medium text-xs'>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Leave cards */}
      <div className='space-y-3'>
        {dedupedLeaves.map((leave) => {
          const typeCfg = TYPE_CONFIG[leave.type] ?? TYPE_CONFIG.ANNUAL;
          const TypeIcon = typeCfg.icon;
          const days = countDays(leave.fromDate, leave.toDate);
          const isPending = leave.status === 'PENDING';
          const statusCfg =
            STATUS_CONFIG[leave.status?.toUpperCase()] ?? STATUS_CONFIG.PENDING;

          return (
            <div
              key={leave.id}
              className='group relative bg-white shadow-sm hover:shadow-md border border-gray-100 hover:border-gray-200 rounded-2xl overflow-hidden transition-all duration-200'
            >
              {/* Left accent bar */}
              <div
                className={`absolute left-0 top-0 bottom-0 w-1 ${typeCfg.accent} rounded-l-2xl`}
              />

              <div className='flex sm:flex-row flex-col sm:items-center gap-4 py-4 pr-4 pl-5'>
                {/* Icon + type */}
                <div className='flex flex-1 items-center gap-3 min-w-0'>
                  <div
                    className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl border ${typeCfg.bg} ${typeCfg.border}`}
                  >
                    <TypeIcon size={18} className={typeCfg.text} />
                  </div>

                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className={`text-sm font-semibold ${typeCfg.text}`}>
                        {typeCfg.label}
                      </span>
                      <StatusBadge status={leave.status} className='sm:hidden' />
                    </div>

                    <div className='flex flex-wrap items-center gap-3 mt-1.5 text-gray-500 text-xs'>
                      <span className='flex items-center gap-1'>
                        <CalendarDays size={12} />
                        {fmt(leave.fromDate)} to {fmt(leave.toDate)}
                      </span>
                      <span className='flex items-center gap-1 font-medium text-gray-600'>
                        <Clock3 size={12} />
                        {days} {days === 1 ? 'day' : 'days'}
                      </span>
                    </div>

                    {leave.reason && (
                      <p className='flex items-start gap-1 mt-2 text-gray-400 text-xs line-clamp-1'>
                        <FileText size={11} className='flex-shrink-0 mt-0.5' />
                        {leave.reason}
                      </p>
                    )}
                  </div>
                </div>

                {/* Status indicator (desktop) */}
                <div className='hidden sm:flex flex-shrink-0 items-center gap-2'>
                  <span
                    className={`w-2 h-2 rounded-full ${statusCfg.dot} ${
                      leave.status === 'PENDING' ? 'animate-pulse' : ''
                    }`}
                  />
                  <span className={`text-xs font-medium ${statusCfg.text}`}>
                    {statusCfg.label}
                  </span>
                </div>

                {/* Actions */}
                {isPending && (
                  <div className='flex flex-shrink-0 items-center gap-2'>
                    <Button className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors !bg-white !text-gray-700 border border-gray-200 hover:!bg-gray-50 hover:border-gray-300 shadow-sm'>
                      <Pencil size={12} strokeWidth={2} />
                      Edit
                    </Button>
                    <Button
                      onClick={() => handleDelete(leave.id)}
                      disabled={deletingId === leave.id}
                      className='inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-xs transition-colors disabled:cursor-not-allowed shadow-sm !bg-red-600 hover:!bg-red-700 !text-white border border-red-600 hover:border-red-700'
                    >
                      {deletingId === leave.id ? (
                        <span className='inline-block w-4 h-4 border-2 border-white/70 border-t-white rounded-full animate-spin' />
                      ) : (
                        <X size={12} strokeWidth={2.5} />
                      )}
                      {deletingId === leave.id ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyLeavesList;
