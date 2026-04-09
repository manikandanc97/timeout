const UpcomingHolidaysSkeleton = () => {
  return (
    <div className='flex h-full flex-col rounded-2xl bg-white p-5 shadow-md'>
      <div className='mb-6 flex items-center gap-2'>
        <div className='flex size-8 animate-pulse items-center justify-center rounded-lg bg-gray-200' />
        <div className='h-5 w-44 animate-pulse rounded bg-gray-200' />
      </div>

      <div className='flex flex-1 flex-col'>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className='flex items-center justify-between border-b border-dashed border-gray-200 py-4 last:border-0'
          >
            <div className='h-4 w-36 max-w-[55%] animate-pulse rounded bg-gray-200' />
            <div className='h-4 w-28 animate-pulse rounded bg-gray-200' />
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingHolidaysSkeleton;
