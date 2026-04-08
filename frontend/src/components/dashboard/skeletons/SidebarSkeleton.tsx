import React from 'react';

const SidebarSkeleton = () => {
  return (
    <aside className='flex flex-col bg-primary-dark w-40 h-full text-white'>
      <div className='flex items-center gap-2 p-5 shrink-0'>
        <div className='bg-white/20 rounded-md w-6 h-6 animate-pulse' />
        <div className='bg-white/20 rounded w-20 h-6 animate-pulse' />
      </div>

      <div className='flex flex-col flex-1 gap-4 px-2 pb-4 overflow-y-auto'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className='flex flex-col justify-center items-center gap-2 bg-white/8 rounded p-2 h-[68px]'
          >
            <div className='bg-white/20 rounded w-5 h-5 animate-pulse' />
            <div className='bg-white/20 rounded w-16 h-3 animate-pulse' />
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
