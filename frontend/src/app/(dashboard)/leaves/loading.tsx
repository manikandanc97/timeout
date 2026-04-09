import React from 'react';

function LeaveCardSkeleton({ accentBorder }: { accentBorder: string }) {
  return (
    <div
      className={`relative flex md:flex-row flex-col gap-4 rounded-xl border border-gray-100 border-l-4 bg-white p-5 shadow-sm ${accentBorder}`}
    >
      <div className='flex min-w-0 flex-1 items-start gap-3.5'>
        <div className='bg-gray-200 rounded-xl border border-gray-100 w-10 h-10 shrink-0' />
        <div className='flex flex-col flex-1 justify-center mt-0.5 min-w-0'>
          <div className='flex flex-wrap items-center gap-2 mb-1'>
            <div className='bg-gray-200 rounded w-28 h-4' />
            <div className='bg-gray-200 rounded-full w-16 h-5' />
          </div>
          <div className='bg-gray-200 rounded w-48 max-w-full h-3 mb-2' />
          <div className='flex items-start gap-1.5 mt-0.5'>
            <div className='bg-gray-200 rounded mt-0.5 w-3.5 h-3.5 shrink-0' />
            <div className='bg-gray-200 rounded flex-1 h-10 max-w-md' />
          </div>
        </div>
      </div>
      <div className='flex flex-col justify-between md:items-end gap-3 pt-3 md:pt-0 md:pl-5 border-gray-100 border-t md:border-t-0 md:border-l shrink-0'>
        <div className='flex flex-wrap gap-2'>
          <div className='bg-gray-200 rounded-md border border-gray-100 w-40 h-8' />
          <div className='bg-gray-200 rounded-md border border-gray-100 w-24 h-8' />
        </div>
        <div className='flex items-center self-start md:self-end gap-2 mt-1'>
          <div className='bg-gray-200 rounded-lg border border-gray-200 w-8 h-8' />
          <div className='bg-gray-200 rounded-lg border border-red-100 w-8 h-8' />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <section className='relative bg-white/90 shadow-xl border border-gray-100 rounded-3xl h-full overflow-hidden animate-pulse'>
      <div className='-top-24 -left-32 absolute bg-primary/10 blur-3xl rounded-full w-64 h-64' />
      <div className='-right-20 -bottom-24 absolute bg-indigo-100 blur-3xl rounded-full w-64 h-64' />

      <div className='z-10 relative flex flex-col gap-6 p-6'>
        <div className='flex flex-wrap justify-between items-start gap-4 border-gray-100 border-b'>
          <div className='flex items-start gap-3'>
            <div className='grid h-12 w-12 place-items-center rounded-2xl bg-gray-200' />
            <div className='space-y-2'>
              <div className='bg-gray-200 rounded w-24 h-2.5' />
              <div className='bg-gray-200 rounded w-64 max-w-[85vw] h-7' />
            </div>
          </div>
          <div className='flex flex-wrap xl:justify-end items-center gap-2'>
            <div className='bg-gray-200 border border-gray-200 rounded-full w-44 h-8' />
          </div>
        </div>

        <div className='flex xl:flex-row flex-col xl:justify-between xl:items-center gap-4'>
          <div className='flex flex-wrap items-center gap-2'>
            {[...Array(4)].map((_, i) => (
              <div
                key={`sum-${i}`}
                className='flex items-center gap-1.5 bg-white shadow-sm px-3 py-1.5 border border-gray-100 rounded-lg'
              >
                <div className='bg-gray-200 rounded w-12 h-3' />
                <div className='bg-gray-200 rounded w-5 h-4' />
              </div>
            ))}
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <div className='relative w-full sm:w-[260px]'>
              <div className='top-1/2 left-3 z-10 absolute bg-gray-300 rounded w-3.5 h-3.5 -translate-y-1/2' />
              <div className='flex items-center bg-white pl-9 border border-gray-200 rounded-xl h-10'>
                <div className='bg-gray-200 rounded w-32 h-2.5' />
              </div>
            </div>
            <div className='w-[140px]'>
              <div className='bg-gray-200 rounded-xl border border-gray-200 w-full h-10' />
            </div>
            <div className='w-[160px]'>
              <div className='bg-gray-200 rounded-xl border border-gray-200 w-full h-10' />
            </div>
          </div>
        </div>

        <div className='mt-2 pr-2 max-h-[calc(100vh-310px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100'>
          <div className='flex flex-col gap-3'>
            <LeaveCardSkeleton accentBorder='border-l-cyan-500' />
            <LeaveCardSkeleton accentBorder='border-l-rose-500' />
            <LeaveCardSkeleton accentBorder='border-l-pink-500' />
            <LeaveCardSkeleton accentBorder='border-l-violet-500' />
          </div>
        </div>
      </div>
    </section>
  );
}
