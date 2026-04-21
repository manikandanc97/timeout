import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className='w-full overflow-hidden rounded-xl border border-border bg-card'>
      <div className='overflow-x-auto'>
        <table className='w-full border-collapse text-left text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted/50'>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className='px-4 py-3'>
                  <Skeleton className='h-4 w-24' />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i} className='border-b border-border last:border-0'>
                {Array.from({ length: columns }).map((_, j) => (
                  <td key={j} className='px-4 py-4'>
                    <Skeleton className='h-4 w-full max-w-[120px]' />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className='flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 shadow-sm'
        >
          <Skeleton className='h-3 w-20' />
          <Skeleton className='h-8 w-32' />
          <div className='mt-2 flex items-center gap-2'>
            <Skeleton className='h-2 w-full' />
          </div>
        </div>
      ))}
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className='flex flex-col gap-6 p-1'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className='flex flex-col gap-2'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-10 w-full rounded-xl' />
        </div>
      ))}
      <div className='mt-4 flex justify-end gap-3'>
        <Skeleton className='h-10 w-24 rounded-xl' />
        <Skeleton className='h-10 w-32 rounded-xl' />
      </div>
    </div>
  );
}
