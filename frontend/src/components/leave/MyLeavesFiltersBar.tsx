'use client';

import { CalendarDays, RotateCcw, Search, Sparkles } from 'lucide-react';
import type { LeaveStatus, LeaveType } from '@/types/leave';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { STATUS_FILTER_OPTIONS, type FilterValue } from './constants';

type Option = { label: string; value: string };

type Props = {
  filteredLength: number;
  totalLength: number;
  hasActiveFilters: boolean;
  searchTerm: string;
  statusFilter: FilterValue<LeaveStatus>;
  typeFilter: FilterValue<LeaveType>;
  typeOptionsForUser: Option[];
  onSearchChange: (value: string) => void;
  onStatusChange: (value: FilterValue<LeaveStatus>) => void;
  onTypeChange: (value: FilterValue<LeaveType>) => void;
  onClearFilters: () => void;
};

export default function MyLeavesFiltersBar({
  filteredLength,
  totalLength,
  hasActiveFilters,
  searchTerm,
  statusFilter,
  typeFilter,
  typeOptionsForUser,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onClearFilters,
}: Props) {
  return (
    <>
      <div className='flex flex-wrap items-start justify-between gap-4 border-b border-border'>
        <div className='flex items-start gap-3'>
          <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
            <CalendarDays size={20} />
          </div>
          <div>
            <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
              Leave history
            </p>
            <h2 className='text-2xl font-bold leading-tight text-card-foreground'>Your requests at a glance</h2>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2 xl:justify-end'>
          <div className='inline-flex items-center gap-2 rounded-full border border-border bg-muted/80 px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm'>
            <Sparkles size={12} className='text-primary' />
            <span>
              {filteredLength === totalLength && !hasActiveFilters
                ? 'All requests visible'
                : `${filteredLength} of ${totalLength} shown`}
            </span>
          </div>
        </div>
      </div>

      <div className='flex xl:flex-row flex-col xl:justify-between xl:items-center'>
        <div className='flex flex-wrap items-center gap-2'>
          {hasActiveFilters && (
            <Button
              type='button'
              variant='ghost'
              onClick={onClearFilters}
              className='flex items-center gap-1.5 rounded-xl px-3 font-medium text-sm hover:!bg-danger-muted hover:!text-danger-muted-foreground'
            >
              <RotateCcw size={14} />
              Clear
            </Button>
          )}
          <div className='relative w-full sm:w-[260px]'>
            <Search
              size={14}
              className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground'
            />
            <Input
              id='search-leaves'
              type='text'
              label='Search requests...'
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              hideLabel
              placeholder='Search requests...'
              inputClassName='h-10 py-0 pl-9'
            />
          </div>
          <div className='w-[140px]'>
            <Select
              id='status-filter'
              label='Status'
              hideLabel
              value={statusFilter}
              onChange={(e) => onStatusChange(e.target.value as FilterValue<LeaveStatus>)}
              options={[{ label: 'All Status', value: 'ALL' }, ...STATUS_FILTER_OPTIONS.filter((o) => o.value !== 'ALL')]}
              selectClassName='h-10'
            />
          </div>
          <div className='w-[160px]'>
            <Select
              id='type-filter'
              label='Type'
              hideLabel
              value={typeFilter}
              onChange={(e) => onTypeChange(e.target.value as FilterValue<LeaveType>)}
              options={[{ label: 'All Types', value: 'ALL' }, ...typeOptionsForUser.map((o) => ({ label: o.label, value: String(o.value) }))]}
              selectClassName='h-10'
            />
          </div>
        </div>
      </div>
    </>
  );
}
