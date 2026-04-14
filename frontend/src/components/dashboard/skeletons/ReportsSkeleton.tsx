/** Skeleton aligned to Reports page cards + filters + 3 tables. */
export default function ReportsSkeleton() {
  return (
    <section className='relative flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-4 p-4 sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <div className='h-12 w-12 animate-pulse rounded-2xl bg-gray-100' />
            <div className='space-y-2'>
              <div className='h-2.5 w-20 animate-pulse rounded bg-gray-200/90' />
              <div className='h-8 w-40 animate-pulse rounded bg-gray-200/90' />
              <div className='h-3.5 w-64 animate-pulse rounded bg-gray-100' />
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='h-10 w-24 animate-pulse rounded-lg bg-gray-100' />
            ))}
          </div>
        </div>

        <section className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'>
          {Array.from({ length: 5 }).map((_, i) => (
            <article
              key={i}
              className='rounded-2xl border border-gray-100 border-l-4 border-l-gray-200 bg-white p-3 shadow-sm sm:p-3.5'
            >
              <div className='h-3 w-24 animate-pulse rounded bg-gray-200/90' />
              <div className='mt-2 h-8 w-16 animate-pulse rounded bg-gray-200/90' />
            </article>
          ))}
        </section>

        {Array.from({ length: 3 }).map((_, sectionIdx) => (
          <section
            key={sectionIdx}
            className='flex min-w-0 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'
          >
            <div className='space-y-2'>
              <div className='h-5 w-52 animate-pulse rounded bg-gray-200/90' />
              <div className='h-3.5 w-80 animate-pulse rounded bg-gray-100' />
            </div>
            <div className='flex w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-gray-100 bg-gray-50/40'>
              <div className='sticky top-0 z-10 border-b border-gray-100 bg-gray-50/95 px-4 py-3 backdrop-blur-sm'>
                <div className='flex min-w-[980px] gap-3'>
                  {Array.from({ length: 8 }).map((__, i) => (
                    <div key={i} className='h-3 w-20 animate-pulse rounded bg-gray-200/80' />
                  ))}
                </div>
              </div>
              <div className='divide-y divide-gray-100/90'>
                {Array.from({ length: 5 }).map((__, rowIdx) => (
                  <div key={rowIdx} className='flex min-w-[980px] items-center gap-3 px-4 py-3.5'>
                    {Array.from({ length: 8 }).map((___, colIdx) => (
                      <div
                        key={`${rowIdx}-${colIdx}`}
                        className='h-3.5 w-24 shrink-0 animate-pulse rounded bg-gray-100'
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
