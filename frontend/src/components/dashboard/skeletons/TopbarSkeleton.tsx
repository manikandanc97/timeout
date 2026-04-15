import React from 'react';

const TopbarSkeleton = () => {
  return (
    <div className='flex items-center justify-between border-b border-border bg-card p-4 shadow-sm dark:shadow-none'>
      <div className='h-8 w-40 animate-pulse rounded bg-skeleton' />

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
