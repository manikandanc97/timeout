import React from 'react';
import Skeleton from './Skeleton';

type PageSkeletonProps = {
  hasHeader?: boolean;
  hasSubHeader?: boolean;
  className?: string;
  children?: React.ReactNode;
};

export default function PageSkeleton({
  hasHeader = true,
  hasSubHeader = true,
  className = '',
  children,
}: PageSkeletonProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {hasHeader && (
        <div className='flex items-start justify-between'>
          <div className='flex items-center gap-4'>
            <Skeleton className='h-12 w-12 rounded-2xl' />
            <div className='space-y-2'>
              <Skeleton className='h-3 w-24' />
              <Skeleton className='h-8 w-48' />
            </div>
          </div>
          <Skeleton className='h-10 w-32 rounded-full' />
        </div>
      )}

      {hasSubHeader && (
        <div className='flex flex-wrap items-center gap-3 border-b border-border pb-6'>
          <Skeleton className='h-10 w-64' />
          <Skeleton className='h-10 w-32' />
          <Skeleton className='h-10 w-32' />
          <Skeleton className='ml-auto h-10 w-40' />
        </div>
      )}

      <div className='space-y-4'>
        {children || (
          <>
            <Skeleton className='h-40 w-full rounded-2xl' />
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
              <Skeleton className='h-64 rounded-2xl' />
              <Skeleton className='h-64 rounded-2xl' />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
