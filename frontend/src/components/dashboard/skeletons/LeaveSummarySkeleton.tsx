const CardSkeleton = () => (
  <div className='bg-white shadow-md p-5 rounded-2xl animate-pulse'>
    <div className='bg-gray-200 rounded w-28 h-4'></div>

    <div className='flex items-baseline gap-2 mt-4'>
      <div className='bg-gray-200 rounded w-16 h-10'></div>
      <div className='bg-gray-200 rounded w-24 h-4'></div>
    </div>

    <div className='bg-gray-200 mt-4 rounded w-40 h-6'></div>
  </div>
);

const LeaveSummarySkeleton = () => {
  return (
    <div className='gap-5 grid grid-cols-1 md:grid-cols-3'>
      <CardSkeleton />
      <CardSkeleton />
      <CardSkeleton />
    </div>
  );
};

export default LeaveSummarySkeleton;
