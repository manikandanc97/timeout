import React from 'react';
import PageSkeleton from '@/components/ui/PageSkeleton';
import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <PageSkeleton hasSubHeader={false}>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        <div className='lg:col-span-2'>
          <Skeleton className='h-48 w-full rounded-3xl' />
        </div>
        <div className='lg:col-span-1'>
          <Skeleton className='h-48 w-full rounded-3xl' />
        </div>
      </div>
      <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className='h-24 rounded-2xl' />
        ))}
      </div>
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        <Skeleton className='h-80 rounded-3xl' />
        <Skeleton className='h-80 rounded-3xl' />
      </div>
    </PageSkeleton>
  );
}
