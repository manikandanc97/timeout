import type { ReactNode } from 'react';

const miniBars = [45, 70, 35, 80, 55, 40, 65];

const MiniChartSkeleton = () => (
  <div className='mt-1 flex h-16 w-24 shrink-0 items-end justify-center gap-1'>
    {miniBars.map((pct, i) => (
      <div
        key={i}
        className='w-2 animate-pulse rounded-t-sm bg-gray-200'
        style={{ height: `${pct}%` }}
      />
    ))}
  </div>
);

const SummaryCardSkeleton = ({ right }: { right: ReactNode }) => (
  <div className='flex items-start justify-between rounded-2xl bg-white p-5 shadow-md'>
    <div className='flex flex-col'>
      <div className='h-4 w-28 animate-pulse rounded bg-gray-200' />
      <div className='mt-4 flex items-baseline gap-2'>
        <div className='h-10 w-16 animate-pulse rounded bg-gray-200' />
        <div className='mt-1 h-4 w-28 animate-pulse rounded bg-gray-200' />
      </div>
      <div className='mt-3 h-7 w-52 max-w-full animate-pulse rounded-lg bg-gray-200' />
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
          <div className='mt-1 flex size-14 shrink-0 items-center justify-center rounded-full bg-emerald-50'>
            <div className='size-8 animate-pulse rounded-full bg-gray-200' />
          </div>
        }
      />
    </div>
  );
};

export default LeaveSummarySkeleton;
