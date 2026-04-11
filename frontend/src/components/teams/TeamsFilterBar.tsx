import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Plus, RotateCcw, Search } from 'lucide-react';

type Option = { label: string; value: string };

type Props = {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  departmentFilter: string;
  onDepartmentChange: (value: string) => void;
  departmentOptions: Option[];
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  isAdmin: boolean;
  onAddTeam: () => void;
};

export default function TeamsFilterBar({
  searchTerm,
  onSearchChange,
  departmentFilter,
  onDepartmentChange,
  departmentOptions,
  hasActiveFilters,
  onClearFilters,
  isAdmin,
  onAddTeam,
}: Props) {
  return (
    <div className='flex min-w-0 shrink-0 flex-nowrap items-center gap-3 overflow-x-auto py-0.5 [scrollbar-width:thin]'>
      <div className='relative min-w-[180px] max-w-sm flex-1'>
        <Search
          size={14}
          className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-gray-400'
        />
        <Input
          id='teams-search'
          type='text'
          label='Search team'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          hideLabel
          placeholder='Search team…'
          inputClassName='h-10 py-0 pl-9 focus:ring-inset'
        />
      </div>
      <div className='w-[160px] shrink-0'>
        <Select
          id='teams-dept'
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
      {isAdmin ? (
        <Button
          type='button'
          onClick={onAddTeam}
          className='flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-4 text-sm font-semibold shadow-sm'
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Team
        </Button>
      ) : null}
      <Button
        type='button'
        unstyled
        disabled={!hasActiveFilters}
        onClick={onClearFilters}
        aria-label='Clear all filters'
        className='ml-auto flex h-10 shrink-0 items-center gap-1.5 self-center rounded-xl px-3 text-sm font-medium text-gray-700 transition-colors hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-400'
      >
        <RotateCcw size={14} className='shrink-0' />
        Clear filters
      </Button>
    </div>
  );
}
