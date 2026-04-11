/** Mirrors `EmployeesSummaryCards` — stacked KPI placeholders, sidebar widths. */
function EmployeesSummarySkeleton() {
  const accents = [
    'border-l-sky-400',
    'border-l-emerald-400',
    'border-l-amber-400',
    'border-l-violet-400',
  ];
  return (
    <section
      aria-hidden
      className='flex w-full shrink-0 flex-col gap-3.5 self-start rounded-2xl bg-white/95 sm:gap-4 lg:w-62 xl:w-56'
    >
      <div className='h-2.5 w-16 rounded bg-gray-200/90 lg:hidden' />
      {accents.map((accent, i) => (
        <div
          key={i}
          className={`rounded-2xl border border-gray-100 border-l-4 ${accent} bg-white p-3.5 shadow-sm sm:p-4`}
        >
          <div className='flex items-center justify-between gap-2'>
            <div className='h-3 w-24 animate-pulse rounded bg-gray-200/90' />
            <div className='h-9 w-9 shrink-0 animate-pulse rounded-xl bg-gray-100' />
          </div>
          <div className='mt-2.5 h-8 w-14 animate-pulse rounded bg-gray-200/90 sm:h-9' />
          {i === 3 ? (
            <div className='mt-2 h-2.5 w-28 animate-pulse rounded bg-gray-100/90' />
          ) : null}
        </div>
      ))}
    </section>
  );
}

/** Layout matches `EmployeesPageClient` (header + inner panel; summary right on lg). */
export default function EmployeesSkeleton() {
  return (
    <section className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4'>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
            {/* EmployeesPageHeader */}
            <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
              <div className='flex items-start gap-3'>
                <div className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-gray-100 via-gray-50 to-gray-100 shadow-inner ring-1 ring-gray-100/80' />
                <div className='space-y-2 pt-0.5'>
                  <div className='h-2.5 w-24 animate-pulse rounded bg-gray-200/90' />
                  <div className='h-8 w-44 max-w-[70vw] animate-pulse rounded-md bg-gray-200/90' />
                  <div className='h-3.5 w-56 max-w-[85vw] animate-pulse rounded bg-gray-100' />
                </div>
              </div>
              <div className='h-8 w-46 shrink-0 animate-pulse rounded-full border border-gray-200/80 bg-gray-50/90' />
            </div>

            <section
              aria-hidden
              className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
            >
              {/* EmployeesFilterBar */}
              <div className='flex min-w-0 shrink-0 flex-nowrap items-center gap-3 overflow-x-auto py-0.5 [scrollbar-width:thin]'>
                <div className='h-10 min-w-[180px] max-w-sm flex-1 animate-pulse rounded-md bg-gray-100/90 ring-1 ring-gray-100' />
                <div className='h-10 w-[160px] shrink-0 animate-pulse rounded-md bg-gray-100/90 ring-1 ring-gray-100' />
                <div className='h-10 w-[150px] shrink-0 animate-pulse rounded-md bg-gray-100/90 ring-1 ring-gray-100' />
                <div className='h-10 w-[140px] shrink-0 animate-pulse rounded-md bg-gray-100/90 ring-1 ring-gray-100' />
                <div className='ml-auto h-10 w-32 shrink-0 animate-pulse rounded-xl bg-gray-50 ring-1 ring-gray-100' />
              </div>

              <div className='flex min-h-[260px] flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40 sm:min-h-[300px]'>
                <div className='min-h-0 flex-1 overflow-hidden'>
                  <div className='sticky top-0 z-10 border-b border-gray-100 bg-gray-50/95 px-4 py-3 backdrop-blur-sm'>
                    <div className='flex min-w-[880px] gap-3'>
                      <div className='h-3 w-14 animate-pulse rounded bg-gray-200/80' />
                      <div className='h-3 w-12 animate-pulse rounded bg-gray-200/80' />
                      <div className='h-3 w-14 animate-pulse rounded bg-gray-200/80' />
                      <div className='h-3 w-22 animate-pulse rounded bg-gray-200/80' />
                      <div className='h-3 w-14 animate-pulse rounded bg-gray-200/80' />
                      <div className='h-3 w-12 animate-pulse rounded bg-gray-200/80' />
                      <div className='h-3 w-14 animate-pulse rounded bg-gray-200/80' />
                      <div className='h-3 w-16 animate-pulse rounded bg-gray-200/80' />
                      <div className='ml-auto h-3 w-16 animate-pulse rounded bg-gray-200/80' />
                    </div>
                  </div>
                  <div className='divide-y divide-gray-100/90'>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                      <div
                        key={i}
                        className='flex min-w-[880px] items-center gap-3 px-4 py-3.5'
                      >
                        <div className='h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-200/80' />
                        <div className='w-32 shrink-0 space-y-1.5'>
                          <div className='h-3.5 w-28 animate-pulse rounded bg-gray-100' />
                        </div>
                        <div className='h-3.5 w-40 shrink-0 animate-pulse rounded bg-gray-100' />
                        <div className='h-3.5 w-24 shrink-0 animate-pulse rounded bg-gray-100' />
                        <div className='h-3.5 w-20 shrink-0 animate-pulse rounded bg-gray-100' />
                        <div className='h-3.5 w-16 shrink-0 animate-pulse rounded bg-gray-100' />
                        <div className='h-6 w-16 shrink-0 animate-pulse rounded-md bg-gray-100' />
                        <div className='h-3.5 w-18 shrink-0 animate-pulse rounded bg-gray-100' />
                        <div className='ml-auto h-8 w-16 shrink-0 animate-pulse rounded-lg border border-gray-100 bg-white shadow-sm' />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* EmployeesPagination */}
              <div className='flex shrink-0 flex-col items-stretch justify-between gap-3 border-t border-gray-100 pt-3 sm:flex-row sm:items-center'>
                <div className='h-3 w-44 animate-pulse rounded bg-gray-100' />
                <div className='flex items-center justify-center gap-2 sm:justify-end'>
                  <div className='h-8 w-22 animate-pulse rounded-lg border border-gray-100 bg-white shadow-sm' />
                  <div className='h-3 w-20 animate-pulse rounded bg-gray-100' />
                  <div className='h-8 w-18 animate-pulse rounded-lg border border-gray-100 bg-white shadow-sm' />
                </div>
              </div>
            </section>
          </div>

          <EmployeesSummarySkeleton />
        </div>
      </div>
    </section>
  );
}
