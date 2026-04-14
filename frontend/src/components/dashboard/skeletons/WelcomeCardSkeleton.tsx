const WelcomeCardSkeleton = () => {
  return (
    <div className='relative flex h-full flex-col items-center justify-between overflow-hidden rounded-2xl border border-border bg-linear-to-r from-primary/10 via-primary/5 to-accent/10 p-8 shadow-sm md:flex-row md:p-10'>
      <div className='relative z-10 flex w-full max-w-md flex-col items-start gap-4 md:w-auto'>
        <div className='w-full space-y-2'>
          <div className='h-5 w-32 animate-pulse rounded bg-skeleton/90' />
          <div className='h-9 w-48 max-w-full animate-pulse rounded bg-skeleton/90' />
          <div className='mt-1 h-4 w-56 max-w-full animate-pulse rounded bg-skeleton/70' />
        </div>
        <div className='mt-2 w-full space-y-2'>
          <div className='h-4 w-full animate-pulse rounded bg-skeleton/70' />
          <div className='h-4 w-[92%] animate-pulse rounded bg-skeleton/70' />
        </div>
        <div className='mt-4 h-10 w-40 animate-pulse rounded-lg bg-skeleton/90' />
      </div>

      <div className='relative z-10 mt-8 flex h-48 w-48 shrink-0 items-center justify-center md:mt-0 md:h-64 md:w-64'>
        <div className='h-36 w-36 animate-pulse rounded-full bg-skeleton/60 md:h-48 md:w-48' />
      </div>
    </div>
  );
};

export default WelcomeCardSkeleton;
