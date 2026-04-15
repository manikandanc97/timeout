import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus, RotateCcw, Search } from 'lucide-react';

import type { EmployeeStatusFilter } from './constants';

type Option = { label: string; value: string };

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  teamFilter: string;
  onTeamChange: (value: string) => void;
  statusFilter: EmployeeStatusFilter;
  onStatusChange: (value: EmployeeStatusFilter) => void;
  departmentOptions: Option[];
  teamOptions: Option[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isAdmin: boolean;
  onAddEmployee: () => void;
};

export default function EmployeesFilterBar({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  teamFilter,
  onTeamChange,
  statusFilter,
  onStatusChange,
  departmentOptions,
  teamOptions,
  hasActiveFilters,
  onClearFilters,
  isAdmin,
  onAddEmployee,
}: Props) {
  return (
    <div className='flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto py-1.5 [scrollbar-width:thin]'>
      <div className='relative min-w-[180px] flex-1 max-w-sm'>
        <Search
          size={14}
          className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground'
        />
        <Input
          id='employees-search'
          type='text'
          label='Search employee'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          hideLabel
          placeholder='Search employee…'
          inputClassName='h-10 py-0 pl-9 focus:ring-inset'
        />
      </div>
      <div className='w-[160px] shrink-0'>
        <Select
          id='employees-dept'
          label='Department'
          hideLabel
          placeholder='All departments'
          value={departmentFilter}
          onChange={(e) => onDepartmentChange(e.target.value)}
          options={[
            { label: 'All departments', value: 'ALL' },
            ...departmentOptions,
          ]}
          selectClassName='h-10 focus:ring-inset'
        />
      </div>
      <div className='w-[150px] shrink-0'>
        <Select
          id='employees-team'
          label='Team'
          hideLabel
          placeholder='All teams'
          value={teamFilter}
          onChange={(e) => onTeamChange(e.target.value)}
          options={[{ label: 'All teams', value: 'ALL' }, ...teamOptions]}
          selectClassName='h-10 focus:ring-inset'
        />
      </div>
      <div className='w-[140px] shrink-0'>
        <Select
          id='employees-status'
          label='Status'
          hideLabel
          value={statusFilter}
          onChange={(e) =>
            onStatusChange(e.target.value as EmployeeStatusFilter)
          }
          options={[
            { label: 'All statuses', value: 'ALL' },
            { label: 'Active', value: 'ACTIVE' },
            { label: 'On leave', value: 'ON_LEAVE' },
            { label: 'Deactivated', value: 'DEACTIVATED' },
          ]}
          selectClassName='h-10 focus:ring-inset'
        />
      </div>
      {isAdmin ? (
        <Button
          type='button'
          onClick={onAddEmployee}
          className='flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-4 text-sm font-semibold shadow-sm'
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Employee
        </Button>
      ) : null}
      <Button
        type='button'
        unstyled
        disabled={!hasActiveFilters}
        onClick={onClearFilters}
        aria-label='Clear all filters'
        className='ml-auto flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-3 text-sm font-medium text-card-foreground/90 transition-colors hover:bg-danger-muted hover:text-danger-muted-foreground disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-muted-foreground'
      >
        <RotateCcw size={14} className='shrink-0' />
        Clear filters
      </Button>
    </div>
  );
}
