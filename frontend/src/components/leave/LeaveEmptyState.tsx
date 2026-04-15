import { CalendarDays } from 'lucide-react';

type Props = {
  className?: string;
};

/** Fills available height (parent should set min-height, e.g. calc viewport − chrome). */
export default function LeaveEmptyState({ className = '' }: Props) {
  return (
    <div
      className={`relative isolate flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl ${className}`}
    >
      <div className='pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl' />

      <div className='relative z-10 flex flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center sm:py-16'>
        <div className='grid h-16 w-16 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
          <CalendarDays size={28} />
        </div>
        <div className='space-y-1.5'>
          <p className='text-lg font-semibold'>
            No leave requests yet
          </p>
          <p className='mx-auto max-w-sm text-sm leading-6 text-card-foreground/82'>
            Once you submit time off, your request history and approval states
            will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
