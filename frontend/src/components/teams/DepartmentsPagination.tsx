import { TEAMS_PAGE_SIZE } from '@/components/teams/constants';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  safeDeptPage: number;
  deptPageCount: number;
  departmentsLength: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function DepartmentsPagination({
  safeDeptPage,
  deptPageCount,
  departmentsLength,
  onPrev,
  onNext,
}: Props) {
  return (
    <div className='mt-2 flex shrink-0 flex-col items-stretch justify-between gap-2 border-t border-border pt-2 sm:flex-row sm:items-center'>
      <p className='text-[11px] text-muted-foreground'>
        Showing <span className='font-semibold text-card-foreground/90'>{(safeDeptPage - 1) * TEAMS_PAGE_SIZE + 1}</span>–
        <span className='font-semibold text-card-foreground/90'>{Math.min(safeDeptPage * TEAMS_PAGE_SIZE, departmentsLength)}</span> of{' '}
        <span className='font-semibold text-card-foreground/90'>{departmentsLength}</span>
      </p>
      <div className='flex items-center justify-center gap-1.5 sm:justify-end'>
        <button
          type='button'
          disabled={safeDeptPage <= 1}
          onClick={onPrev}
          className='inline-flex items-center gap-0.5 rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-semibold text-card-foreground/90 shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft size={12} />
          Prev
        </button>
        <span className='text-[11px] font-medium text-muted-foreground'>
          {safeDeptPage} / {deptPageCount}
        </span>
        <button
          type='button'
          disabled={safeDeptPage >= deptPageCount}
          onClick={onNext}
          className='inline-flex items-center gap-0.5 rounded-lg border border-border bg-card px-2 py-1 text-[11px] font-semibold text-card-foreground/90 shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
        >
          Next
          <ChevronRight size={12} />
        </button>
      </div>
    </div>
  );
}
