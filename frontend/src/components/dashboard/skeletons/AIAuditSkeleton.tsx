import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function AIAuditSkeleton() {
  return (
    <div className='audit-page space-y-6'>
      <style>{`
        .audit-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 4px 40px;
        }
      `}</style>

      <div className='flex items-start justify-between'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 w-24' />
          </div>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96 max-w-full' />
        </div>
        <Skeleton className='h-10 w-24 rounded-xl' />
      </div>

      <div className='flex flex-wrap gap-3'>
        <Skeleton className='h-10 w-40 rounded-xl' />
        <Skeleton className='h-10 w-40 rounded-xl' />
        <Skeleton className='h-10 w-40 rounded-xl' />
        <Skeleton className='h-10 w-40 rounded-xl' />
        <Skeleton className='h-10 w-20 rounded-xl' />
      </div>

      <div className='overflow-hidden rounded-[20px] border border-border bg-card'>
        <div className='overflow-x-auto'>
          <table className='w-full border-collapse text-left text-sm'>
            <thead>
              <tr className='border-b border-border bg-muted'>
                {['w-10', 'w-20', 'w-14', 'w-20', 'w-24', 'w-16', 'w-20', 'w-8'].map((width, index) => (
                  <th key={`audit-head-${index}`} className='px-4 py-3'>
                    <Skeleton className={`h-3 ${width}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 8 }, (_, rowIndex) => (
                <tr key={`audit-row-${rowIndex}`} className='border-b border-border last:border-0'>
                  <td className='px-4 py-4'><Skeleton className='h-3.5 w-12' /></td>
                  <td className='px-4 py-4'>
                    <div className='flex items-center gap-3'>
                      <Skeleton className='h-8 w-8 rounded-full' />
                      <div className='space-y-1.5'>
                        <Skeleton className='h-3.5 w-24' />
                        <Skeleton className='h-2.5 w-20' />
                      </div>
                    </div>
                  </td>
                  <td className='px-4 py-4'><Skeleton className='h-6 w-16 rounded-md' /></td>
                  <td className='px-4 py-4'><Skeleton className='h-3.5 w-24' /></td>
                  <td className='px-4 py-4'><Skeleton className='h-3.5 w-32' /></td>
                  <td className='px-4 py-4'><Skeleton className='h-6 w-20 rounded-md' /></td>
                  <td className='px-4 py-4'><Skeleton className='h-3.5 w-28' /></td>
                  <td className='px-4 py-4'><Skeleton className='ml-auto h-8 w-10 rounded-md' /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className='mt-6 flex items-center justify-center gap-4'>
        <Skeleton className='h-10 w-24 rounded-xl' />
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-10 w-24 rounded-xl' />
      </div>
    </div>
  );
}
