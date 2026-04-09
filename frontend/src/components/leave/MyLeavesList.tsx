'use client';

import api from '@/services/api';
import type { Leave, LeaveStatus, LeaveType } from '@/types/leave';
import {
  Baby,
  CalendarDays,
  Clock3,
  FileText,
  Pencil,
  RotateCcw,
  Search,
  Sparkles,
  X,
  Stethoscope,
  Umbrella,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type ElementType } from 'react';
import { toast } from 'sonner';
import Button from '../ui/Button';
import LeaveStatusBadge from './LeaveStatusBadge';

type Props = { leaves: Leave[] };
type FilterValue<T extends string> = 'ALL' | T;

const TYPE_CONFIG: Record<
  LeaveType,
  {
    label: string;
    description: string;
    icon: ElementType;
    bg: string;
    text: string;
    border: string;
    accent: string;
  }
> = {
  ANNUAL: {
    label: 'Annual Leave',
    description: 'Planned time away from work',
    icon: Umbrella,
    bg: 'bg-cyan-50',
    text: 'text-cyan-700',
    border: 'border-cyan-200',
    accent: 'from-cyan-500 via-sky-500 to-cyan-400',
  },
  SICK: {
    label: 'Sick Leave',
    description: 'Health, recovery, and care',
    icon: Stethoscope,
    bg: 'bg-rose-50',
    text: 'text-rose-600',
    border: 'border-rose-200',
    accent: 'from-rose-500 via-pink-500 to-rose-400',
  },
  MATERNITY: {
    label: 'Maternity Leave',
    description: 'Parental support and care',
    icon: Baby,
    bg: 'bg-pink-50',
    text: 'text-pink-600',
    border: 'border-pink-200',
    accent: 'from-pink-500 via-fuchsia-500 to-pink-400',
  },
  PATERNITY: {
    label: 'Paternity Leave',
    description: 'Parental support and care',
    icon: Baby,
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    border: 'border-violet-200',
    accent: 'from-violet-500 via-indigo-500 to-violet-400',
  },
};

const TYPE_FILTER_OPTIONS: Array<{ value: LeaveType; label: string }> = [
  { value: 'ANNUAL', label: TYPE_CONFIG.ANNUAL.label },
  { value: 'SICK', label: TYPE_CONFIG.SICK.label },
  { value: 'MATERNITY', label: TYPE_CONFIG.MATERNITY.label },
  { value: 'PATERNITY', label: TYPE_CONFIG.PATERNITY.label },
];

const STATUS_FILTER_OPTIONS: Array<{
  value: FilterValue<LeaveStatus>;
  label: string;
}> = [
  { value: 'ALL', label: 'All statuses' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'APPROVED', label: 'Approved' },
  { value: 'REJECTED', label: 'Rejected' },
];

const STATUS_SUMMARY_CONFIG: Record<
  LeaveStatus,
  {
    label: string;
    bg: string;
    border: string;
    text: string;
  }
> = {
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700',
  },
  PENDING: {
    label: 'Pending',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700',
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    text: 'text-rose-700',
  },
};

const fmt = (d?: string) => {
  if (!d) return 'Date unavailable';
  const parsed = new Date(d);
  if (Number.isNaN(parsed.getTime())) return d;

  return parsed.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const countDays = (from?: string, to?: string) => {
  const start = new Date(from ?? '');
  const end = new Date(to ?? '');

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  return Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / 86400000) + 1,
  );
};

const getLeaveStart = (leave: Leave) => leave.fromDate ?? leave.startDate ?? '';
const getLeaveEnd = (leave: Leave) => leave.toDate ?? leave.endDate ?? '';

const MyLeavesList = ({ leaves }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterValue<LeaveStatus>>(
    'ALL',
  );
  const [typeFilter, setTypeFilter] = useState<FilterValue<LeaveType>>('ALL');

  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const dedupedLeaves = useMemo(() => {
    if (!leaves?.length) return [];

    const seen = new Set<string>();
    const list: Leave[] = [];

    leaves.forEach((leave) => {
      const start = getLeaveStart(leave);
      const end = getLeaveEnd(leave);
      const key = leave?.id
        ? `id-${leave.id}`
        : `${leave.type}-${start}-${end}-${leave.reason ?? ''}`;
      if (seen.has(key)) return;
      seen.add(key);
      list.push(leave);
    });

    return list.sort(
      (a, b) =>
        new Date(getLeaveStart(b)).getTime() - new Date(getLeaveStart(a)).getTime(),
    );
  }, [leaves]);

  const filteredLeaves = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return dedupedLeaves.filter((leave) => {
      const typeCfg = TYPE_CONFIG[leave.type] ?? TYPE_CONFIG.ANNUAL;
      const searchFields = [
        leave.reason ?? '',
        leave.type,
        leave.status,
        typeCfg.label,
        typeCfg.description,
      ]
        .join(' ')
        .toLowerCase();

      const matchesSearch =
        query.length === 0 || searchFields.includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || leave.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || leave.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [dedupedLeaves, searchTerm, statusFilter, typeFilter]);

  const summaryCards = useMemo(() => {
    const approved = dedupedLeaves.filter((leave) => leave.status === 'APPROVED').length;
    const pending = dedupedLeaves.filter((leave) => leave.status === 'PENDING').length;
    const rejected = dedupedLeaves.filter((leave) => leave.status === 'REJECTED').length;

    return [
      {
        label: 'Total requests',
        value: dedupedLeaves.length,
        bg: 'bg-slate-50',
        border: 'border-slate-200',
        text: 'text-slate-800',
      },
      {
        ...STATUS_SUMMARY_CONFIG.APPROVED,
        value: approved,
      },
      {
        ...STATUS_SUMMARY_CONFIG.PENDING,
        value: pending,
      },
      {
        ...STATUS_SUMMARY_CONFIG.REJECTED,
        value: rejected,
      },
    ];
  }, [dedupedLeaves]);

  const hasActiveFilters =
    searchTerm.trim().length > 0 ||
    statusFilter !== 'ALL' ||
    typeFilter !== 'ALL';

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('ALL');
    setTypeFilter('ALL');
  };

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
      <div className='relative mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
        <div className='absolute -top-24 -left-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -right-20 -bottom-20 h-52 w-52 rounded-full bg-cyan-100 blur-3xl' />

        <div className='relative z-10 flex flex-col items-center gap-4 px-6 py-16 text-center'>
          <div className='grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
            <CalendarDays size={28} />
          </div>
          <div className='space-y-1.5'>
            <p className='font-semibold text-sm text-gray-700'>
              No leave requests yet
            </p>
            <p className='mx-auto max-w-sm text-sm text-gray-500 leading-6'>
              Once you submit time off, your request history and approval states
              will appear here.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-6 space-y-5'>
      <section className='relative overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
        <div className='absolute -top-24 -left-28 h-56 w-56 rounded-full bg-primary/10 blur-3xl' />
        <div className='absolute -right-24 -bottom-24 h-56 w-56 rounded-full bg-sky-100 blur-3xl' />

        <div className='relative z-10 flex flex-col gap-5 p-5 md:p-6'>
          <div className='flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'>
            <div
              className='flex items-start gap-3'
            >
              <div className='grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
                <CalendarDays size={20} />
              </div>
              <div>
                <p className='font-semibold text-[11px] text-gray-400 uppercase tracking-[0.14em]'>
                  Leave history
                </p>
                <h2 className='font-bold text-2xl text-gray-900 leading-tight'>
                  Your requests at a glance
                </h2>
                <p className='mt-1 text-sm text-gray-500'>
                  Track outcomes, revisit notes, and manage anything still
                  pending.
                </p>
              </div>
            </div>

            <div className='flex flex-wrap items-center gap-2 xl:justify-end'>
              <div className='inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm'>
                <Sparkles size={12} className='text-primary' />
                <span>
                  {filteredLeaves.length === dedupedLeaves.length && !hasActiveFilters
                    ? 'All requests visible'
                    : `${filteredLeaves.length} of ${dedupedLeaves.length} shown`}
                </span>
              </div>
              {hasActiveFilters && (
                <button
                  type='button'
                  onClick={clearFilters}
                  className='inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50'
                >
                  <RotateCcw size={12} />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
            {summaryCards.map((item) => (
              <div
                key={item.label}
                className={`rounded-2xl border px-4 py-3 shadow-sm ${item.bg} ${item.border}`}
              >
                <p className='font-medium text-[11px] text-gray-500 uppercase tracking-wide'>
                  {item.label}
                </p>
                <p className={`mt-2 font-bold text-2xl ${item.text}`}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <section className='rounded-2xl border border-gray-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm'>
            <div className='flex flex-col gap-3 xl:flex-row xl:items-center'>
              <label className='relative flex-1'>
                <Search
                  size={16}
                  className='pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-gray-400'
                />
                <input
                  type='text'
                  placeholder='Search by leave type, reason, or status'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className='h-11 w-full rounded-xl border border-gray-200 bg-white pl-10 pr-4 text-sm text-gray-700 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-4 focus:ring-primary/10'
                />
              </label>

              <div className='grid gap-3 sm:grid-cols-2 xl:w-[420px]'>
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as FilterValue<LeaveStatus>)
                  }
                  className='h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10'
                >
                  {STATUS_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  value={typeFilter}
                  onChange={(e) =>
                    setTypeFilter(e.target.value as FilterValue<LeaveType>)
                  }
                  className='h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm text-gray-700 outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10'
                >
                  <option value='ALL'>All leave types</option>
                  {TYPE_FILTER_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='mt-3 flex flex-col gap-1 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between'>
              <p>
                {filteredLeaves.length === 1
                  ? '1 matching request'
                  : `${filteredLeaves.length} matching requests`}
              </p>
              <p>Newest requests appear first.</p>
            </div>
          </section>
        </div>
      </section>

      {filteredLeaves.length > 0 ? (
        <div className='space-y-4'>
        {filteredLeaves.map((leave) => {
          const typeCfg = TYPE_CONFIG[leave.type] ?? TYPE_CONFIG.ANNUAL;
          const TypeIcon = typeCfg.icon;
          const start = getLeaveStart(leave);
          const end = getLeaveEnd(leave);
          const days = countDays(start, end);
          const isPending = leave.status === 'PENDING';
          const durationLabel =
            days > 0
              ? `${days} ${days === 1 ? 'day' : 'days'}`
              : 'Dates unavailable';

          return (
            <div
              key={leave.id}
              className='group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/80 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md'
            >
              <div
                className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${typeCfg.accent}`}
              />

              <div className='relative flex flex-col gap-4 p-4 md:p-5'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='flex items-start gap-3 min-w-0'>
                    <div
                      className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${typeCfg.bg} ${typeCfg.border}`}
                    >
                      <TypeIcon size={18} className={typeCfg.text} />
                    </div>

                    <div className='min-w-0'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span className={`text-sm font-semibold ${typeCfg.text}`}>
                        {typeCfg.label}
                        </span>
                        <span className='rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500'>
                          Request #{String(leave.id).padStart(3, '0')}
                        </span>
                      </div>
                      <p className='mt-1 text-sm text-gray-500'>
                        {typeCfg.description}
                      </p>
                    </div>
                  </div>

                  <div className='flex flex-wrap items-center gap-2 lg:justify-end'>
                    <div className='inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700'>
                      <Clock3 size={12} className='text-gray-400' />
                      <span>{durationLabel}</span>
                    </div>
                    <LeaveStatusBadge status={leave.status} />
                  </div>
                </div>

                <div className='grid gap-3 sm:grid-cols-2'>
                  <div className='rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3'>
                    <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                      <CalendarDays size={13} />
                      <span>Leave window</span>
                    </div>
                    <p className='mt-1.5 text-sm font-semibold text-gray-800'>
                      {fmt(start)} to {fmt(end)}
                    </p>
                  </div>

                  <div className='rounded-2xl border border-gray-100 bg-gray-50/80 px-4 py-3'>
                    <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-400'>
                      <Clock3 size={13} />
                      <span>Duration</span>
                    </div>
                    <p className='mt-1.5 text-sm font-semibold text-gray-800'>
                      {durationLabel}
                    </p>
                  </div>
                </div>

                {leave.reason ? (
                  <div
                    className={`rounded-2xl border px-4 py-3 ${typeCfg.bg} ${typeCfg.border}`}
                  >
                    <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500'>
                      <FileText size={13} className={typeCfg.text} />
                      <span>Reason</span>
                    </div>
                    <p className='mt-1.5 text-sm text-gray-700 leading-6'>
                      {leave.reason}
                    </p>
                  </div>
                ) : (
                  <div className='rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 px-4 py-3 text-sm text-gray-500'>
                    No reason was added for this request.
                  </div>
                )}

                {isPending && (
                  <div className='flex flex-col gap-3 border-gray-100 border-t pt-4 sm:flex-row sm:items-center sm:justify-between'>
                    <p className='text-xs text-gray-500'>
                      Pending requests can still be updated or withdrawn before
                      approval.
                    </p>

                    <div className='flex flex-wrap items-center gap-2 sm:justify-end'>
                      <Button
                        onClick={() =>
                          toast.info('Leave editing is not wired up yet.')
                        }
                        className='inline-flex items-center gap-1.5 !bg-white hover:!bg-gray-50 px-3.5 py-2 border border-gray-200 rounded-xl font-semibold !text-gray-700 shadow-none'
                      >
                        <Pencil size={13} strokeWidth={2.1} />
                        Edit
                      </Button>
                      <Button
                        onClick={() => handleDelete(leave.id)}
                        disabled={deletingId === leave.id}
                        className='inline-flex items-center gap-1.5 !bg-red-600 hover:!bg-red-700 px-3.5 py-2 rounded-xl font-semibold !text-white shadow-sm shadow-red-600/20 disabled:cursor-not-allowed'
                      >
                        {deletingId === leave.id ? (
                          <span className='inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/70 border-t-white' />
                        ) : (
                          <X size={13} strokeWidth={2.5} />
                        )}
                        {deletingId === leave.id ? 'Cancelling...' : 'Cancel'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
        </div>
      ) : (
        <div className='rounded-3xl border border-dashed border-gray-200 bg-white/80 px-6 py-14 text-center shadow-sm'>
          <div className='mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-50 text-gray-400'>
            <Search size={22} />
          </div>
          <h3 className='mt-4 font-semibold text-lg text-gray-900'>
            No requests match these filters
          </h3>
          <p className='mx-auto mt-2 max-w-md text-sm text-gray-500 leading-6'>
            Try widening the status or leave type filters, or clear your search
            to see the full history again.
          </p>
          {hasActiveFilters && (
            <button
              type='button'
              onClick={clearFilters}
              className='mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50'
            >
              <RotateCcw size={14} />
              Reset filters
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyLeavesList;
