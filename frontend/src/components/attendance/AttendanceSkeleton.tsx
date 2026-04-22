import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function AttendanceSkeleton() {
  return (
    <div className='flex flex-col gap-6 animate-pulse'>
      <div>
        <Skeleton className='h-9 w-48' />
        <Skeleton className='mt-2 h-4 w-96' />
      </div>

      <div className='grid gap-6 md:grid-cols-[300px_1fr]'>
        <div className='flex flex-col gap-6'>
          {/* PunchCard Skeleton */}
          <div className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <Skeleton className='h-6 w-32 mb-6' />
            <div className='flex flex-col items-center gap-4'>
              <Skeleton className='h-32 w-32 rounded-full' />
              <Skeleton className='h-10 w-full rounded-xl' />
              <div className='grid w-full grid-cols-2 gap-3 mt-4'>
                <Skeleton className='h-16 rounded-xl' />
                <Skeleton className='h-16 rounded-xl' />
              </div>
            </div>
          </div>
        </div>

        <div className='w-full'>
          {/* AttendanceHistory Skeleton */}
          <div className='rounded-2xl border border-border bg-card overflow-hidden shadow-sm'>
            <div className='border-b border-border p-4 flex justify-between items-center'>
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-9 w-24 rounded-lg' />
            </div>
            <div className='p-4 space-y-3'>
              {[...Array(5)].map((_, i) => (
                <div key={i} className='flex items-center gap-4 py-3 border-b border-border/50 last:border-0'>
                  <Skeleton className='h-10 w-10 rounded-full' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-32' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                  <Skeleton className='h-8 w-20 rounded-md' />
                  <Skeleton className='h-8 w-24 rounded-md' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
