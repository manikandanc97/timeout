const LeaveHistorySkeleton = () => {
  return (
    <div className='bg-white shadow-md p-5 rounded-2xl h-full animate-pulse'>
      <div className='bg-gray-200 mb-6 rounded w-48 h-6'></div>

      <div className='space-y-4'>
        <div className='bg-gray-100 rounded h-10'></div>
        <div className='bg-gray-100 rounded h-10'></div>
        <div className='bg-gray-100 rounded h-10'></div>
      </div>
    </div>
  );
};

export default LeaveHistorySkeleton;
