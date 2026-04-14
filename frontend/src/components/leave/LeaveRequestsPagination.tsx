import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  visible: boolean;
  safePage: number;
  pageCount: number;
  filteredLength: number;
  pageSize: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function LeaveRequestsPagination({
  visible,
  safePage,
  pageCount,
  filteredLength,
  pageSize,
  onPrev,
  onNext,
}: Props) {
  if (!visible) return null;

  const from = (safePage - 1) * pageSize + 1;
  const to = Math.min(safePage * pageSize, filteredLength);

  return (
    <div className='flex shrink-0 flex-col items-stretch justify-between gap-3 border-t border-border pt-3 sm:flex-row sm:items-center'>
      <p className='text-xs text-muted-foreground'>
        Showing{' '}
        <span className='font-semibold text-card-foreground'>{from}</span>–
        <span className='font-semibold text-card-foreground'>{to}</span> of{' '}
        <span className='font-semibold text-card-foreground'>{filteredLength}</span>
      </p>
      <div className='flex items-center justify-center gap-2 sm:justify-end'>
        <button
          type='button'
          disabled={safePage <= 1}
          onClick={onPrev}
          className='inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-card-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <span className='text-xs font-medium text-muted-foreground'>
          Page {safePage} / {pageCount}
        </span>
        <button
          type='button'
          disabled={safePage >= pageCount}
          onClick={onNext}
          className='inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-card-foreground shadow-sm transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40'
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
