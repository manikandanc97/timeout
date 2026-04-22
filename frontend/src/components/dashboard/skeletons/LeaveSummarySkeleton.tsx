import type { ReactNode } from 'react';
import Skeleton from '@/components/ui/Skeleton';

const miniBars = [45, 70, 35, 80, 55, 40, 65];

const MiniChartSkeleton = () => (
  <div className='mt-1 flex h-16 w-24 shrink-0 items-end justify-center gap-1'>
    {miniBars.map((pct, i) => (
      <Skeleton
        key={i}
        className='w-2 rounded-t-sm'
        style={{ height: `${pct}%` }}
      />
    ))}
  </div>
);

const SummaryCardSkeleton = ({ right }: { right: ReactNode }) => (
  <div className='flex items-start justify-between rounded-2xl border border-border bg-card p-5 shadow-md'>
    <div className='flex flex-col'>
      <Skeleton className='h-4 w-28' />
      <div className='mt-4 flex items-baseline gap-2'>
        <Skeleton className='h-10 w-16' />
        <Skeleton className='mt-1 h-4 w-28' />
      </div>
      <Skeleton className='mt-3 h-7 w-52 max-w-full rounded-lg' />
    </div>
    {right}
  </div>
);

const LeaveSummarySkeleton = () => {
  return (
    <div className='grid grid-cols-1 gap-5 md:grid-cols-3'>
      <SummaryCardSkeleton right={<MiniChartSkeleton />} />
      <SummaryCardSkeleton right={<MiniChartSkeleton />} />
      <SummaryCardSkeleton
        right={
          <div className='mt-1 flex size-14 shrink-0 items-center justify-center rounded-full bg-muted'>
            <Skeleton className='size-8 rounded-full' />
          </div>
        }
      />
    </div>
  );
};

export default LeaveSummarySkeleton;
