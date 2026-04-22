import React from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { TableSkeleton } from '@/components/common/SkeletonLoaders';

export default function AIAuditSkeleton() {
  return (
    <div className='audit-page animate-pulse space-y-6'>
      <style>{`
        .audit-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 4px 40px;
        }
      `}</style>

      {/* Header */}
      <div className='flex justify-between items-start'>
        <div className='space-y-2'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-16' />
            <Skeleton className='h-4 w-4' />
            <Skeleton className='h-4 w-24' />
          </div>
          <Skeleton className='h-8 w-64' />
          <Skeleton className='h-4 w-96' />
        </div>
        <Skeleton className='h-10 w-24 rounded-xl' />
      </div>

      {/* Filters */}
      <div className='flex flex-wrap gap-3'>
        <Skeleton className='h-10 w-40 rounded-xl' />
        <Skeleton className='h-10 w-40 rounded-xl' />
        <Skeleton className='h-10 w-40 rounded-xl' />
        <Skeleton className='h-10 w-40 rounded-xl' />
        <Skeleton className='h-10 w-20 rounded-xl' />
      </div>

      {/* Table */}
      <TableSkeleton rows={10} columns={7} />

      {/* Pagination */}
      <div className='flex justify-center items-center gap-4 mt-6'>
        <Skeleton className='h-10 w-24 rounded-xl' />
        <Skeleton className='h-4 w-48' />
        <Skeleton className='h-10 w-24 rounded-xl' />
      </div>
    </div>
  );
}
