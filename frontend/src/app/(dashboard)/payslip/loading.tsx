import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { TableSkeleton } from '@/components/common/SkeletonLoaders';

export default function Loading() {
  return (
    <div className='rounded-3xl border border-border bg-card p-4 shadow-sm sm:p-5 animate-pulse'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3'>
        <div className='min-w-0 flex-1'>
          <Skeleton className='h-8 w-48 mb-2' />
          <Skeleton className='h-4 w-64' />
        </div>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-32 rounded-xl' />
          <Skeleton className='h-10 w-24 rounded-xl' />
        </div>
      </div>

      <TableSkeleton rows={5} columns={6} />
    </div>
  );
}
