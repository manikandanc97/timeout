import React from 'react';

export default function Loading() {
  return (
    <div className='flex xl:flex-row flex-col gap-6 items-start h-full relative animate-pulse'>
      {/* Apply Leave Section Skeleton */}
      <div className='flex flex-col flex-1 bg-white shadow-md p-5 rounded-2xl w-full'>
        <div className='flex items-center gap-2 mb-6'>
          <div className='bg-gray-200 rounded-lg w-8 h-8 shrink-0' />
          <div className='bg-gray-200 rounded-md w-32 h-6' />
        </div>

        <div className='space-y-4 cursor-wait'>
          {/* Leave Type Skeleton */}
          <div>
            <div className='bg-gray-200 mb-1 rounded w-20 h-4' />
            <div className='bg-gray-200 rounded-md w-full h-[38px]' />
          </div>

          {/* Dates Skeleton */}
          <div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
            <div>
              <div className='bg-gray-200 mb-1 rounded w-20 h-4' />
              <div className='bg-gray-200 rounded-md w-full h-[38px]' />
            </div>
            <div>
              <div className='bg-gray-200 mb-1 rounded w-20 h-4' />
              <div className='bg-gray-200 rounded-md w-full h-[38px]' />
            </div>
          </div>

          {/* Reason Skeleton */}
          <div className='relative w-full pt-1' style={{ marginTop: '30px' }}>
            <div className='bg-gray-200 rounded-md w-full h-[106px]' />
          </div>

          {/* Alert/Policy Skeletons */}
          <div className='bg-gray-200 mt-2 rounded-lg w-full h-14' />

          {/* Footer / Submit Button Skeleton */}
          <div className='flex justify-between items-center pt-1'>
            <div className='bg-gray-200 rounded w-48 h-4' />
            <div className='bg-gray-200 rounded-md w-40 h-10' />
          </div>
        </div>
      </div>

      {/* Calendar Section Skeleton */}
      <div className='flex flex-col shrink-0 bg-white shadow-md p-5 rounded-2xl w-full xl:w-[360px] overflow-hidden'>
        <div className='flex items-center gap-2 mb-6'>
          <div className='bg-gray-200 rounded-lg w-8 h-8 shrink-0' />
          <div className='bg-gray-200 rounded-md w-24 h-6' />
        </div>

        {/* Calendar Grid Skeleton */}
        <div className='flex flex-col items-center gap-[4px] mt-2 cursor-wait'>
          <div className='flex justify-between items-center w-full mb-4 px-2'>
            <div className='bg-gray-200 rounded-full w-8 h-8' />
            <div className='bg-gray-200 rounded-md w-32 h-6' />
            <div className='bg-gray-200 rounded-full w-8 h-8' />
          </div>

          <div className='grid grid-cols-7 gap-x-[4px] gap-y-[4px] w-full'>
            {[...Array(7)].map((_, i) => (
              <div
                key={`header-${i}`}
                className='bg-gray-200 rounded-md w-9 h-9 mx-auto'
              />
            ))}
            {[...Array(35)].map((_, i) => (
              <div
                key={`day-${i}`}
                className='bg-gray-200 rounded-full w-9 h-9 mx-auto'
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
