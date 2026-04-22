import Skeleton from '@/components/ui/Skeleton';

/** Mirrors `LeaveRequestsSummaryCards` — KPI placeholders in a row. */
function LeaveRequestsSummarySkeleton() {
  const accents = [
    'border-l-amber-400',
    'border-l-emerald-400',
    'border-l-rose-400',
    'border-l-slate-400',
  ];
  return (
    <section
      aria-hidden
      className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-3.5'
    >
      {accents.map((accent, i) => (
        <div
          key={i}
          className={`rounded-2xl border border-border border-l-4 ${accent} bg-card p-3 shadow-sm sm:p-3.5`}
        >
          <div className='flex items-center justify-between gap-2'>
            <Skeleton className='h-3 w-14 sm:w-16' />
            <Skeleton className='h-8 w-8 shrink-0 rounded-lg sm:h-9 sm:w-9 sm:rounded-xl' />
          </div>
          <Skeleton className='mt-2 h-7 w-12 sm:mt-2.5 sm:h-8' />
        </div>
      ))}
    </section>
  );
}

/** Layout matches `LeaveRequestsPageClient` (summary row above filters + table). */
export default function LeaveRequestsSkeleton() {
  return (
    <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15' />

      <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
          {/* LeaveRequestsPageHeader */}
          <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
            <div className='flex items-start gap-3'>
              <Skeleton className='h-12 w-12 shrink-0 rounded-2xl shadow-inner ring-1 ring-border/80' />
              <div className='space-y-2 pt-0.5'>
                <Skeleton className='h-2.5 w-28' />
                <Skeleton className='h-8 w-52 max-w-[70vw]' />
                <Skeleton className='h-3.5 w-64 max-w-[85vw]' />
              </div>
            </div>
            <Skeleton className='h-8 w-46 shrink-0 rounded-full border border-border/80' />
          </div>

          <LeaveRequestsSummarySkeleton />

          {/* Inner section: tabs + filters + table + pagination */}
            <section
              aria-hidden
              className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
            >
              {/* LeaveRequestsFilterBar */}
              <div className='flex min-w-0 shrink-0 flex-nowrap items-center gap-3 overflow-x-auto py-0.5 [scrollbar-width:thin]'>
                <Skeleton className='h-10 min-w-[180px] max-w-sm flex-1 ring-1 ring-border' />
                <Skeleton className='h-10 w-[150px] shrink-0 ring-1 ring-border' />
                <Skeleton className='h-10 w-[170px] shrink-0 ring-1 ring-border' />
                <Skeleton className='h-10 w-[150px] shrink-0 ring-1 ring-border' />
                <Skeleton className='h-10 w-[150px] shrink-0 ring-1 ring-border' />
                <Skeleton className='ml-auto h-10 w-30 shrink-0 rounded-xl ring-1 ring-border' />
              </div>

              {/* Table shell */}
              <div className='flex min-h-124 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-muted/40'>
                <div className='min-h-0 flex-1 overflow-hidden'>
                  {/* Thead strip */}
                  <div className='sticky top-0 z-10 border-b border-border bg-muted/95 px-4 py-3 backdrop-blur-sm'>
                    <div className='flex gap-3'>
                      <Skeleton className='h-3 w-18' />
                      <Skeleton className='h-3 w-18' />
                      <Skeleton className='h-3 w-10' />
                      <Skeleton className='h-3 w-10' />
                      <Skeleton className='h-3 min-w-0 flex-1' />
                      <Skeleton className='h-3 w-14' />
                      <Skeleton className='ml-auto h-3 w-16' />
                    </div>
                  </div>
                  {/* Body rows — column widths loosely match real table */}
                  <div className='divide-y divide-border/90'>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className='flex min-w-[720px] items-center gap-3 px-4 py-3.5'
                      >
                        <div className='w-[140px] shrink-0 space-y-1.5'>
                          <Skeleton className='h-3.5 w-28' />
                          <Skeleton className='h-2.5 w-36' />
                        </div>
                        <Skeleton className='h-6 w-18 shrink-0' />
                        <Skeleton className='h-3.5 w-17 shrink-0' />
                        <Skeleton className='h-3.5 w-17 shrink-0' />
                        <div className='min-w-0 flex-1'>
                          <Skeleton className='h-3.5 max-w-[220px]' />
                        </div>
                        <Skeleton className='h-6 w-18 shrink-0 rounded-full' />
                        <div className='ml-auto flex w-28 shrink-0 justify-end gap-2'>
                          <Skeleton className='h-7 w-17 rounded-lg' />
                          <Skeleton className='h-7 w-17 rounded-lg' />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* LeaveRequestsPagination */}
              <div className='flex shrink-0 flex-col items-stretch justify-between gap-3 border-t border-border pt-3 sm:flex-row sm:items-center'>
                <Skeleton className='h-3 w-44' />
                <div className='flex items-center justify-center gap-2 sm:justify-end'>
                  <Skeleton className='h-8 w-22 rounded-lg border border-border shadow-sm' />
                  <Skeleton className='h-3 w-20' />
                  <Skeleton className='h-8 w-18 rounded-lg border border-border shadow-sm' />
                </div>
              </div>
            </section>
        </div>
      </div>
    </section>
  );
}
