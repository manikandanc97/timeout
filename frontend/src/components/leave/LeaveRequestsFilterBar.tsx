import FilterBarShell from '@/components/common/FilterBarShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import {
  STATUS_FILTER_OPTIONS,
  TYPE_FILTER_OPTIONS,
  type FilterValue,
} from '@/components/leave/constants';
import type { LeaveStatus, LeaveType } from '@/types/leave';
import { RotateCcw, Search } from 'lucide-react';

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: FilterValue<LeaveStatus>;
  onStatusChange: (value: FilterValue<LeaveStatus>) => void;
  typeFilter: FilterValue<LeaveType>;
  onTypeChange: (value: FilterValue<LeaveType>) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  hideTypeFilter?: boolean;
};

export default function LeaveRequestsFilterBar({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  hasActiveFilters,
  onClearFilters,
  hideTypeFilter = false,
}: Props) {
  return (
    <FilterBarShell
      className='shrink-0 py-0.5'
      actions={
        <Button
          type='button'
          unstyled
          disabled={!hasActiveFilters}
          onClick={onClearFilters}
          aria-label='Clear all filters'
          className='flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-danger-muted hover:text-danger-muted-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground'
        >
          <RotateCcw size={14} className='shrink-0' />
          Clear filters
        </Button>
      }
    >
      <div className='relative min-w-[180px] max-w-sm flex-1'>
        <Search
          size={14}
          className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground'
          aria-hidden
        />
        <Input
          id='search-employee-leaves'
          type='text'
          label='Search employee'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          hideLabel
          placeholder='Search employee…'
          inputClassName='h-10 py-0 pl-9 focus:ring-inset'
        />
      </div>
      <div className='w-[150px] shrink-0'>
        <Select
          id='req-status'
          label='Status'
          hideLabel
          value={statusFilter}
          onChange={(e) =>
            onStatusChange(e.target.value as FilterValue<LeaveStatus>)
          }
          options={STATUS_FILTER_OPTIONS.map((o) => ({
            label: o.label,
            value: o.value,
          }))}
          selectClassName='h-10 focus:ring-inset'
        />
      </div>
      {!hideTypeFilter && (
        <div className='w-[170px] shrink-0'>
          <Select
            id='req-type'
            label='Leave type'
            hideLabel
            value={typeFilter}
            onChange={(e) =>
              onTypeChange(e.target.value as FilterValue<LeaveType>)
            }
            options={[
              { label: 'All types', value: 'ALL' },
              ...TYPE_FILTER_OPTIONS.map((o) => ({
                label: o.label,
                value: o.value,
              })),
            ]}
            selectClassName='h-10 focus:ring-inset'
          />
        </div>
      )}
      <div className='w-[150px] shrink-0'>
        <Input
          id='req-from'
          type='date'
          label='From'
          value={dateFrom}
          onChange={(e) => onDateFromChange(e.target.value)}
          hideLabel
          placeholder='From'
          inputClassName='h-10 py-0 focus:ring-inset'
        />
      </div>
      <div className='w-[150px] shrink-0'>
        <Input
          id='req-to'
          type='date'
          label='To'
          value={dateTo}
          onChange={(e) => onDateToChange(e.target.value)}
          hideLabel
          placeholder='To'
          inputClassName='h-10 py-0 focus:ring-inset'
          min={dateFrom || undefined}
        />
      </div>
    </FilterBarShell>
  );
}
