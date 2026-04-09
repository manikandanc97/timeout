import Button from '@/components/ui/Button';
import { RotateCcw, Search } from 'lucide-react';

type Props = {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
};

export default function NoMatchingLeaves({ hasActiveFilters, onClearFilters }: Props) {
  return (
    <div className='rounded-3xl border border-dashed border-gray-200 bg-white/80 px-6 py-14 text-center shadow-sm'>
      <div className='mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-50 text-gray-400'>
        <Search size={22} />
      </div>
      <h3 className='mt-4 font-semibold text-lg text-gray-900'>
        No requests match these filters
      </h3>
      <p className='mx-auto mt-2 max-w-md text-sm text-gray-500 leading-6'>
        Try widening the status or leave type filters, or clear your search
        to see the full history again.
      </p>
      {hasActiveFilters && (
        <Button
          onClick={onClearFilters}
          className='mt-5 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50'
        >
          <RotateCcw size={14} />
          Reset filters
        </Button>
      )}
    </div>
  );
}
