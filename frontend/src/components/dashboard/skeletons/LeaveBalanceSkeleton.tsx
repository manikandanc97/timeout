const LeaveBalanceSkeleton = () => {
  return (
    <div className='flex h-full flex-col rounded-2xl border border-border bg-card p-5 shadow-md'>
      <div className='mb-4 h-7 w-40 animate-pulse rounded bg-skeleton' />

      <div className='relative flex min-h-[200px] w-full flex-1 items-center justify-center'>
        <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1'>
          <div className='h-4 w-14 animate-pulse rounded bg-skeleton' />
          <div className='h-9 w-12 animate-pulse rounded bg-skeleton' />
        </div>
        <div
          className='box-border size-[190px] shrink-0 animate-pulse rounded-full border-[22px] border-skeleton bg-card'
          aria-hidden
        />
      </div>

      <hr className='mb-2 mt-4 border-border' />

      <div className='mt-4 flex flex-wrap justify-center gap-4'>
        {[0, 1].map((i) => (
          <div key={i} className='flex items-center gap-2'>
            <div className='size-3 animate-pulse rounded-full bg-skeleton' />
            <div className='h-4 w-14 animate-pulse rounded bg-skeleton' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaveBalanceSkeleton;
