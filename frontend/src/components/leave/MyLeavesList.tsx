'use client';

import api from '@/services/api';
import type { Leave, LeaveStatus, LeaveType } from '@/types/leave';
import { CalendarDays, RotateCcw, Search, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import LeaveCard from './LeaveCard';
import LeaveEmptyState from './LeaveEmptyState';
import NoMatchingLeaves from './NoMatchingLeaves';
import {
  STATUS_FILTER_OPTIONS,
  TYPE_CONFIG,
  type FilterValue,
  typeFilterOptionsForGender,
} from './constants';
import { getLeaveEnd, getLeaveStart } from './utils';

type Props = { leaves: Leave[]; userGender?: string | null };

const MyLeavesList = ({ leaves, userGender = null }: Props) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<FilterValue<LeaveStatus>>('ALL');
  const [typeFilter, setTypeFilter] = useState<FilterValue<LeaveType>>('ALL');

  const router = useRouter();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const typeOptionsForUser = useMemo(
    () => typeFilterOptionsForGender(userGender),
    [userGender],
  );

  // If gender-based options change, drop a filter that no longer applies.
  useEffect(() => {
    if (typeFilter === 'MATERNITY' && userGender !== 'FEMALE') {
      setTypeFilter('ALL');
    }
    if (typeFilter === 'PATERNITY' && userGender !== 'MALE') {
      setTypeFilter('ALL');
    }
  }, [userGender, typeFilter]);

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
        new Date(getLeaveStart(b)).getTime() -
        new Date(getLeaveStart(a)).getTime(),
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

      const matchesSearch = query.length === 0 || searchFields.includes(query);

      const matchesStatus =
        statusFilter === 'ALL' || leave.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || leave.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [dedupedLeaves, searchTerm, statusFilter, typeFilter]);

  const summaryCards = useMemo(() => {
    const approved = dedupedLeaves.filter(
      (leave) => leave.status === 'APPROVED',
    ).length;
    const pending = dedupedLeaves.filter(
      (leave) => leave.status === 'PENDING',
    ).length;
    const rejected = dedupedLeaves.filter(
      (leave) => leave.status === 'REJECTED',
    ).length;

    return [
      { label: 'Total', value: dedupedLeaves.length, color: 'text-slate-800' },
      { label: 'Approved', value: approved, color: 'text-emerald-600' },
      { label: 'Pending', value: pending, color: 'text-amber-600' },
      { label: 'Rejected', value: rejected, color: 'text-rose-600' },
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

  /**
   * Deletes a leave on the server. Returns true only when the API succeeds
   * so the LeaveCard can close its confirmation modal.
   */
  const handleDelete = async (id: number): Promise<boolean> => {
    try {
      setDeletingId(id);
      await api.delete(`/leaves/${id}`);
      toast.success('Leave request cancelled successfully');
      router.refresh();
      return true;
    } catch {
      toast.error('Failed to cancel leave request. Please try again.');
      return false;
    } finally {
      setDeletingId(null);
    }
  };

  if (!dedupedLeaves.length) {
    return (
      <div className='mt-6 xl:mt-0'>
        <LeaveEmptyState />
      </div>
    );
  }

  return (
    <section className='relative bg-white/90 shadow-xl border border-gray-100 rounded-3xl h-full overflow-hidden'>
      <div className='-top-24 -left-32 absolute bg-primary/10 blur-3xl rounded-full w-64 h-64' />
      <div className='-right-20 -bottom-24 absolute bg-indigo-100 blur-3xl rounded-full w-64 h-64' />

      <div className='z-10 relative flex flex-col gap-6 p-6'>
        {/* Header section identical to ApplyLeave */}
        <div className='flex flex-wrap justify-between items-start gap-4 border-gray-100 border-b'>
          <div className='flex items-start gap-3'>
            <div className='place-items-center grid bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 shadow-inner shadow-primary/15 rounded-2xl w-12 h-12 text-primary'>
              <CalendarDays size={20} />
            </div>
            <div>
              <p className='font-semibold text-[11px] text-gray-400 uppercase tracking-[0.14em]'>
                Leave history
              </p>
              <h2 className='font-bold text-gray-900 text-2xl leading-tight'>
                Your requests at a glance
              </h2>
            </div>
          </div>

          <div className='flex flex-wrap xl:justify-end items-center gap-2'>
            <div className='inline-flex items-center gap-2 bg-white/80 shadow-sm px-3 py-1.5 border border-gray-200 rounded-full font-medium text-gray-600 text-xs'>
              <Sparkles size={12} className='text-primary' />
              <span>
                {filteredLeaves.length === dedupedLeaves.length &&
                !hasActiveFilters
                  ? 'All requests visible'
                  : `${filteredLeaves.length} of ${dedupedLeaves.length} shown`}
              </span>
            </div>
          </div>
        </div>

        <div className='flex xl:flex-row flex-col xl:justify-between xl:items-center'>
          <div className='flex flex-wrap items-center gap-2'>
            {summaryCards.map((s) => (
              <div
                key={s.label}
                className='flex items-center gap-1.5 bg-white shadow-sm px-3 py-1.5 border border-gray-100 rounded-lg'
              >
                <span className='font-medium text-gray-500 text-xs uppercase tracking-wider'>
                  {s.label}
                </span>
                <span className={`text-sm font-bold ${s.color}`}>
                  {s.value}
                </span>
              </div>
            ))}
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {hasActiveFilters && (
              <Button
                type='button'
                variant='ghost'
                onClick={clearFilters}
                className='!h-10 gap-1.5 rounded-xl px-3 !py-0 text-sm font-medium hover:!bg-rose-50 hover:!text-rose-600'
              >
                <RotateCcw size={14} />
                Clear
              </Button>
            )}
            <div className='relative w-full sm:w-[260px]'>
              <Search
                size={14}
                className='top-1/2 left-3 z-10 absolute text-gray-400 -translate-y-1/2 pointer-events-none'
              />
              <Input
                id='search-leaves'
                type='text'
                label='Search requests...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                hideLabel={true}
                placeholder='Search requests...'
                inputClassName='pl-9 h-10 py-0 bg-white hover:bg-gray-50'
              />
            </div>

            <div className='w-[140px]'>
              <Select
                id='status-filter'
                label='Status'
                hideLabel={true}
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as FilterValue<LeaveStatus>)
                }
                options={[
                  { label: 'All Status', value: 'ALL' },
                  ...STATUS_FILTER_OPTIONS.filter((o) => o.value !== 'ALL'),
                ]}
                selectClassName='h-10 bg-white hover:bg-gray-50'
              />
            </div>

            <div className='w-[160px]'>
              <Select
                id='type-filter'
                label='Type'
                hideLabel={true}
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as FilterValue<LeaveType>)
                }
                options={[
                  { label: 'All Types', value: 'ALL' },
                  ...typeOptionsForUser.map((o) => ({
                    label: o.label,
                    value: String(o.value),
                  })),
                ]}
                selectClassName='h-10 bg-white hover:bg-gray-50'
              />
            </div>
          </div>
        </div>

        <div className='mt-2 pr-2 max-h-[calc(100vh-310px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
          {filteredLeaves.length > 0 ? (
            <div className='flex flex-col gap-3'>
              {filteredLeaves.map((leave) => (
                <LeaveCard
                  key={leave.id}
                  leave={leave}
                  deletingId={deletingId}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <NoMatchingLeaves />
          )}
        </div>
      </div>
    </section>
  );
};

export default MyLeavesList;
