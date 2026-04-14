const LeaveHistorySkeleton = () => {
  return (
    <div className='flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-md'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex size-8 animate-pulse items-center justify-center rounded-lg bg-skeleton' />
          <div className='h-5 w-44 animate-pulse rounded bg-skeleton' />
        </div>
        <div className='h-4 w-20 animate-pulse rounded bg-skeleton' />
      </div>

      <div className='flex flex-1 flex-col'>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className='flex items-center justify-between border-b border-dashed border-border py-4 last:border-0'
          >
            <div className='flex-1'>
              <div className='h-4 w-28 animate-pulse rounded bg-skeleton' />
            </div>
            <div className='flex flex-1 justify-center'>
              <div className='h-4 w-44 max-w-full animate-pulse rounded bg-skeleton' />
            </div>
            <div className='flex flex-1 justify-end'>
              <div className='h-6 w-[4.5rem] animate-pulse rounded-full bg-skeleton' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveHistorySkeleton;
