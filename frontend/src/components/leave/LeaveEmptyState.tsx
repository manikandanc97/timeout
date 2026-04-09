import { CalendarDays } from 'lucide-react';

export default function LeaveEmptyState() {
  return (
    <div className='relative mt-6 overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
      <div className='absolute -top-24 -left-32 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex flex-col items-center gap-4 px-6 py-16 text-center border-b border-gray-100'>
        <div className='grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
          <CalendarDays size={28} />
        </div>
        <div className='space-y-1.5'>
          <p className='font-semibold text-lg text-gray-900'>
            No leave requests yet
          </p>
          <p className='mx-auto max-w-sm text-sm text-gray-500 leading-6'>
            Once you submit time off, your request history and approval states
            will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
