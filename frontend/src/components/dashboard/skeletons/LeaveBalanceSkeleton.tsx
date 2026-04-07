const LeaveBalanceSkeleton = () => {
  return (
    <div className='bg-white shadow-md p-5 rounded-2xl h-full animate-pulse'>
      <div className='bg-gray-200 mb-6 rounded w-40 h-6'></div>

      <div className='bg-gray-200 mx-auto rounded-full w-40 h-40'></div>

      <div className='flex justify-center gap-4 mt-6'>
        <div className='bg-gray-200 rounded w-20 h-4'></div>
        <div className='bg-gray-200 rounded w-20 h-4'></div>
      </div>
    </div>
  );
};

export default LeaveBalanceSkeleton;
