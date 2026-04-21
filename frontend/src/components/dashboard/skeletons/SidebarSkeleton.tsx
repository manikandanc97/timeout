import React from 'react';

const SidebarSkeleton = () => {
  return (
    <aside className='hidden h-full w-40 flex-col bg-sidebar text-sidebar-foreground lg:flex'>
      <div className='flex shrink-0 items-center gap-2 p-5'>
        <div className='size-6 animate-pulse rounded-md bg-card-foreground/20' />
        <div className='h-7 w-24 animate-pulse rounded bg-card-foreground/20' />
      </div>

      <nav className='flex flex-1 flex-col space-y-2 overflow-y-auto px-2 pb-4 text-sm font-medium'>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className='flex h-[68px] flex-col items-center justify-center gap-2 rounded-lg bg-sidebar-hover p-2'
          >
            <div className='size-5 animate-pulse rounded bg-card-foreground/20' />
            <div className='h-3 w-16 animate-pulse rounded bg-card-foreground/20' />
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SidebarSkeleton;
