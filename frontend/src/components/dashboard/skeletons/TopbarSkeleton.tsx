import React from 'react';

const TopbarSkeleton = () => {
  return (
    <div className='flex items-center justify-between border-b border-border bg-card p-4 shadow-sm dark:shadow-none'>
      <div className='flex items-center gap-3'>
        <div className='size-10 animate-pulse rounded-lg bg-skeleton lg:hidden' />
        <div className='h-8 w-32 animate-pulse rounded bg-skeleton sm:w-40' />
      </div>

      <div className='flex items-center gap-1'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='size-10 animate-pulse rounded-full bg-skeleton'
          />
        ))}
      </div>
    </div>
  );
};

export default TopbarSkeleton;
