import { CalendarDays, ClipboardList } from 'lucide-react';

type Props = {
  filteredCount: number;
  totalCount: number;
  hasActiveFilters: boolean;
};

export default function LeaveRequestsPageHeader({
  filteredCount,
  totalCount,
  hasActiveFilters,
}: Props) {
  return (
    <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
      <div className='flex items-start gap-3'>
        <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
          <ClipboardList size={20} />
        </div>
        <div>
          <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400'>
            Administration
          </p>
          <h1
            id='leave-requests-heading'
            className='text-2xl font-bold leading-tight text-gray-900'
          >
            Leave requests
          </h1>
          <p className='mt-1 text-sm text-gray-500'>
            Review, filter, and action team leave in one place.
          </p>
        </div>
      </div>
      <div className='inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm'>
        <CalendarDays size={12} className='text-primary' />
        <span>
          {filteredCount === totalCount && !hasActiveFilters
            ? 'All requests visible'
            : `${filteredCount} of ${totalCount} shown`}
        </span>
      </div>
    </div>
  );
}
