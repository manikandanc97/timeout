import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function AttendanceSkeleton() {
  return (
    <div className='flex flex-col gap-6'>
      <div>
        <Skeleton className='h-9 w-44' />
        <Skeleton className='mt-2 h-4 w-80 max-w-full' />
      </div>

      <div className='grid gap-6 md:grid-cols-[300px_1fr]'>
        <div className='flex flex-col gap-6'>
          <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
            <div className='border-b border-border bg-primary/5 p-6 text-center text-primary'>
              <Skeleton className='mx-auto h-10 w-10 rounded-full' />
              <Skeleton className='mx-auto mt-3 h-9 w-36' />
              <Skeleton className='mx-auto mt-2 h-4 w-52 max-w-full' />
            </div>
            <div className='flex flex-col gap-4 p-6'>
              <div className='flex justify-between items-center px-2 text-sm'>
                <div className='space-y-2'>
                  <Skeleton className='h-3 w-20' />
                  <Skeleton className='h-5 w-16' />
                </div>
                <div className='space-y-2 text-right'>
                  <Skeleton className='ml-auto h-3 w-22' />
                  <Skeleton className='ml-auto h-5 w-16' />
                </div>
              </div>
              <Skeleton className='mt-2 h-12 w-full rounded-xl' />
            </div>
          </div>
        </div>

        <div className='w-full'>
          <div className='overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
            <div className='flex items-center justify-between border-b border-border p-4'>
              <Skeleton className='h-6 w-40' />
            </div>
            <div className='overflow-x-auto'>
              <table className='w-full text-sm text-left'>
                <thead className='border-b border-border bg-muted/30 text-xs uppercase text-muted-foreground'>
                  <tr>
                    {['w-16', 'w-16', 'w-18', 'w-14', 'w-20', 'w-14'].map((width, index) => (
                      <th key={`attendance-head-${index}`} className='px-6 py-3 font-medium'>
                        <Skeleton className={`h-3 ${width}`} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className='divide-y divide-border'>
                  {Array.from({ length: 5 }, (_, index) => (
                    <tr key={`attendance-row-${index}`} className='bg-card/90'>
                      <td className='px-6 py-4'><Skeleton className='h-4 w-24' /></td>
                      <td className='px-6 py-4'><Skeleton className='h-4 w-16' /></td>
                      <td className='px-6 py-4'><Skeleton className='h-4 w-16' /></td>
                      <td className='px-6 py-4'><Skeleton className='h-6 w-20 rounded-full' /></td>
                      <td className='px-6 py-4'><Skeleton className='h-4 w-14' /></td>
                      <td className='px-6 py-4 text-right'><Skeleton className='ml-auto h-8 w-24 rounded-md' /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
