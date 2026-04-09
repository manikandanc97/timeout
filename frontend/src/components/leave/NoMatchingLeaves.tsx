import { Search } from 'lucide-react';

const NoMatchingLeaves = () => {
  return (
    <div className='h-full rounded-3xl border border-gray-100 px-6 py-14 text-center'>
      <div className='mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-50 text-gray-400'>
        <Search size={22} />
      </div>
      <h3 className='mt-4 font-semibold text-lg text-gray-900'>
        No requests match these filters
      </h3>
      <p className='mx-auto mt-2 max-w-md text-sm text-gray-500 leading-6'>
        Try widening the status or leave type filters, or clear your search to
        see the full history again.
      </p>
    </div>
  );
};

export default NoMatchingLeaves;
