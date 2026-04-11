import { ChevronLeft, ChevronRight } from 'lucide-react';

import { TEAMS_PAGE_SIZE } from './constants';

type Props = {
  visible: boolean;
  safePage: number;
  pageCount: number;
  filteredLength: number;
  onPrev: () => void;
  onNext: () => void;
};

export default function TeamsPagination({
  visible,
  safePage,
  pageCount,
  filteredLength,
  onPrev,
  onNext,
}: Props) {
  if (!visible) return null;

  return (
    <div className='flex shrink-0 flex-col items-stretch justify-between gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center'>
      <p className='text-xs text-gray-500'>
        Showing{' '}
        <span className='font-semibold text-gray-700'>
          {(safePage - 1) * TEAMS_PAGE_SIZE + 1}
        </span>
        –
        <span className='font-semibold text-gray-700'>
          {Math.min(safePage * TEAMS_PAGE_SIZE, filteredLength)}
        </span>{' '}
        of{' '}
        <span className='font-semibold text-gray-700'>{filteredLength}</span>
      </p>
      <div className='flex items-center justify-center gap-2 sm:justify-end'>
        <button
          type='button'
          disabled={safePage <= 1}
          onClick={onPrev}
          className='inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
        >
          <ChevronLeft size={14} />
          Previous
        </button>
        <span className='text-xs font-medium text-gray-600'>
          Page {safePage} / {pageCount}
        </span>
        <button
          type='button'
          disabled={safePage >= pageCount}
          onClick={onNext}
          className='inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40'
        >
          Next
          <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
}
