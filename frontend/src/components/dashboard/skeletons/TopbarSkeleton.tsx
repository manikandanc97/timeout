import React from 'react';

const TopbarSkeleton = () => {
  return (
    <div className='flex items-center justify-between border-b border-gray-100 bg-white p-4 shadow-sm'>
      <div className='h-8 w-40 animate-pulse rounded bg-gray-200' />

      <div className='flex items-center gap-1'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='size-10 animate-pulse rounded-full bg-gray-200'
          />
        ))}
      </div>
    </div>
  );
};

export default TopbarSkeleton;
