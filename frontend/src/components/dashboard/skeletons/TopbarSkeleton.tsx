import React from 'react';

const TopbarSkeleton = () => {
  return (
    <div className='flex justify-between items-center bg-white shadow-md p-4'>
      <div className='bg-gray-200 rounded w-40 h-8 animate-pulse' />

      <div className='flex gap-2'>
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className='bg-gray-200 rounded-full w-10 h-10 animate-pulse'
          />
        ))}
      </div>
    </div>
  );
};

export default TopbarSkeleton;
