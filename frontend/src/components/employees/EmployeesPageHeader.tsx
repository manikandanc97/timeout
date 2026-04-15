import { UserPlus, Users } from 'lucide-react';

type Props = {
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
};

export default function EmployeesPageHeader({
  filteredCount,
  totalCount,
  hasActiveFilters,
}: Props) {
  return (
    <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
      <div className='flex items-start gap-3'>
        <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
          <UserPlus size={20} />
        </div>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Directory
          </p>
          <h1
            id='employees-heading'
            className='text-2xl font-bold leading-tight text-card-foreground'
          >
            Employees
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Filters and roster in one place.
          </p>
        </div>
      </div>
      <div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm'>
        <Users size={12} className='text-primary' />
        <span>
          {filteredCount === totalCount && !hasActiveFilters
            ? 'All employees visible'
            : `${filteredCount} of ${totalCount} shown`}
        </span>
      </div>
    </div>
  );
}
