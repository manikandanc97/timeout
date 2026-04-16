import FilterBarShell from '@/components/common/FilterBarShell';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Plus, RotateCcw, Search } from 'lucide-react';

type Props = {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  canManage: boolean;
  onAddHoliday: () => void;
};

export default function HolidaysFilterBar({
  searchTerm,
  onSearchChange,
  hasActiveFilters,
  onClearFilters,
  canManage,
  onAddHoliday,
}: Props) {
  return (
    <FilterBarShell
      className='shrink-0 py-0.5'
      actions={
        <>
          <Button
            type='button'
            unstyled
            disabled={!hasActiveFilters}
            onClick={onClearFilters}
            aria-label='Clear search'
            className='inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-border bg-card px-3 text-sm font-medium text-card-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-card'
          >
            <RotateCcw size={14} className='shrink-0' aria-hidden />
            Clear
          </Button>
          {canManage ? (
            <Button
              type='button'
              unstyled
              onClick={onAddHoliday}
              className='inline-flex h-10 shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-dark'
            >
              <Plus size={16} className='shrink-0' aria-hidden />
              Add Holiday
            </Button>
          ) : null}
        </>
      }
    >
      <div className='relative min-w-[180px] max-w-sm flex-1'>
        <Search
          size={14}
          className='pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-muted-foreground'
          aria-hidden
        />
        <Input
          id='holidays-search'
          type='text'
          label='Search holiday'
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          hideLabel
          placeholder='Search holiday…'
          inputClassName='h-10 py-0 pl-9 focus:ring-inset'
        />
      </div>
    </FilterBarShell>
  );
}
