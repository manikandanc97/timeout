/** Mirrors `HolidaysSummaryCards` — three KPIs in a row on sm+. */
function HolidaysSummarySkeleton() {
  const accents = [
    'border-l-violet-400',
    'border-l-emerald-400',
    'border-l-sky-400',
  ];
  return (
    <section
      aria-hidden
      className='grid w-full shrink-0 grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5'
    >
      {accents.map((accent, i) => (
        <div
          key={i}
          className={`rounded-2xl border border-gray-100 border-l-4 ${accent} bg-white p-3 shadow-sm sm:p-3.5`}
        >
          <div className='flex items-center justify-between gap-2'>
            <div className='h-3 w-20 animate-pulse rounded bg-gray-200/90 sm:w-24' />
            <div className='h-8 w-8 shrink-0 animate-pulse rounded-lg bg-gray-100 sm:h-9 sm:w-9 sm:rounded-xl' />
          </div>
          <div className='mt-2 h-7 w-10 animate-pulse rounded bg-gray-200/90 sm:mt-2.5 sm:h-8' />
        </div>
      ))}
    </section>
  );
}

/** Layout matches `HolidaysPageClient` (scrollable main + `min-h-124` table shell). */
export default function HolidaysSkeleton() {
  return (
    <section className='relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex min-w-0 flex-col gap-3'>
          <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
            <div className='flex items-start gap-3'>
              <div className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-gray-100 via-gray-50 to-gray-100 shadow-inner ring-1 ring-gray-100/80' />
              <div className='space-y-2 pt-0.5'>
                <div className='h-2.5 w-24 animate-pulse rounded bg-gray-200/90' />
                <div className='h-8 w-48 max-w-[70vw] animate-pulse rounded-md bg-gray-200/90' />
                <div className='h-3.5 w-60 max-w-[85vw] animate-pulse rounded bg-gray-100' />
              </div>
            </div>
            <div className='h-8 w-40 shrink-0 animate-pulse rounded-full border border-gray-200/80 bg-gray-50/90' />
          </div>

          <HolidaysSummarySkeleton />

          <section
            aria-hidden
            className='flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
          >
            <div className='flex min-w-0 shrink-0 flex-nowrap items-center gap-3 overflow-x-auto py-0.5 [scrollbar-width:thin]'>
              <div className='h-10 min-w-[180px] max-w-sm flex-1 animate-pulse rounded-md bg-gray-100/90 ring-1 ring-gray-100' />
              <div className='ml-auto h-10 w-36 shrink-0 animate-pulse rounded-xl bg-gray-50 ring-1 ring-gray-100' />
            </div>

            <div className='flex w-full min-w-0 min-h-124 flex-col overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/40'>
              <div className='sticky top-0 z-10 border-b border-gray-100 bg-gray-50/95 px-4 py-3 backdrop-blur-sm'>
                <div className='flex min-w-[420px] gap-3'>
                  <div className='h-3 w-14 animate-pulse rounded bg-gray-200/80' />
                  <div className='h-3 w-12 animate-pulse rounded bg-gray-200/80' />
                  <div className='ml-auto h-3 w-16 animate-pulse rounded bg-gray-200/80' />
                </div>
              </div>
              <div className='divide-y divide-gray-100/90'>
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className='flex min-w-[420px] items-center gap-3 px-4 py-3.5'
                  >
                    <div className='h-3.5 w-40 shrink-0 animate-pulse rounded bg-gray-100' />
                    <div className='h-3.5 w-28 shrink-0 animate-pulse rounded bg-gray-100' />
                    <div className='ml-auto flex shrink-0 gap-1'>
                      <div className='h-8 w-8 animate-pulse rounded-lg bg-gray-100 ring-1 ring-gray-200/80' />
                      <div className='h-8 w-8 animate-pulse rounded-lg bg-gray-100 ring-1 ring-gray-200/80' />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
