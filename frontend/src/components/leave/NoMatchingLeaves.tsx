import { Search } from 'lucide-react';

const NoMatchingLeaves = () => {
  return (
    <div className='h-full rounded-3xl border border-border bg-muted/30 px-6 py-14 text-center text-card-foreground'>
      <div className='mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-muted text-muted-foreground'>
        <Search size={22} />
      </div>
      <h3 className='mt-4 text-lg font-semibold'>
        No requests match these filters
      </h3>
      <p className='mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground'>
        Try widening the status or leave type filters, or clear your search to
        see the full history again.
      </p>
    </div>
  );
};

export default NoMatchingLeaves;
