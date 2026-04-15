import { CalendarRange } from 'lucide-react';

type Props = {
  filteredCount: number;
  totalLoaded: number;
  hasActiveFilters: boolean;
};

export default function HolidaysPageHeader({
  filteredCount,
  totalLoaded,
  hasActiveFilters,
}: Props) {
  return (
    <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
      <div className='flex items-start gap-3'>
        <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
          <CalendarRange size={20} />
        </div>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
            Calendar
          </p>
          <h1
            id='holidays-heading'
            className='text-2xl font-bold leading-tight text-card-foreground'
          >
            Holidays
          </h1>
          <p className='mt-1 text-sm text-muted-foreground'>
            Organization holidays, filters, and maintenance.
          </p>
        </div>
      </div>
      <div className='inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm'>
        <CalendarRange size={12} className='text-primary' />
        <span>
          {filteredCount === totalLoaded && !hasActiveFilters
            ? 'All holidays visible'
            : `${filteredCount} of ${totalLoaded} shown`}
        </span>
      </div>
    </div>
  );
}
