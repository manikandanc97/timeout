const WelcomeCardSkeleton = () => {
  return (
    <div className='bg-white p-8 border border-[#00a76f]/20 rounded-2xl h-full animate-pulse'>
      <div className='space-y-4'>
        <div className='bg-gray-200 rounded w-32 h-5'></div>
        <div className='bg-gray-200 rounded w-48 h-8'></div>
        <div className='bg-gray-200 rounded w-40 h-4'></div>
        <div className='bg-gray-200 rounded w-full h-4'></div>
        <div className='bg-gray-200 rounded w-32 h-10'></div>
      </div>
    </div>
  );
};

export default WelcomeCardSkeleton;
