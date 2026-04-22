import Skeleton from '@/components/ui/Skeleton';

function ReportsTableSkeleton({
  columnWidths,
}: {
  columnWidths: string[];
}) {
  return (
    <section className='flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-card/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'>
      <div className='space-y-2'>
        <Skeleton className='h-5 w-52' />
        <Skeleton className='h-3.5 w-80 max-w-full' />
      </div>
      <div className='flex w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-border bg-muted/40'>
        <div className='sticky top-0 z-10 border-b border-border bg-muted/95 px-4 py-3 backdrop-blur-sm'>
          <div className='flex min-w-[980px] gap-3'>
            {columnWidths.map((width, index) => (
              <Skeleton key={`reports-head-${index}`} className={`h-3 ${width}`} />
            ))}
          </div>
        </div>
        <div className='divide-y divide-border/90'>
          {Array.from({ length: 5 }, (_, rowIndex) => (
            <div key={`reports-row-${rowIndex}`} className='flex min-w-[980px] items-center gap-3 px-4 py-3.5'>
              {columnWidths.map((width, columnIndex) => (
                <Skeleton
                  key={`reports-cell-${rowIndex}-${columnIndex}`}
                  className={`h-3.5 shrink-0 ${width}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function ReportsSkeleton() {
  return (
    <section className='relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15' />

      <div className='relative z-10 flex flex-col gap-4 p-4 sm:p-5'>
        <div className='flex flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <Skeleton className='h-12 w-12 rounded-2xl' />
            <div className='space-y-2'>
              <Skeleton className='h-2.5 w-20' />
              <Skeleton className='h-8 w-40' />
              <Skeleton className='h-3.5 w-64 max-w-full' />
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Skeleton className='h-10 w-20 rounded-lg' />
            <Skeleton className='h-10 w-20 rounded-lg' />
            <Skeleton className='h-10 w-36 rounded-lg' />
            <Skeleton className='h-10 w-24 rounded-lg' />
            <Skeleton className='h-10 w-24 rounded-lg' />
          </div>
        </div>

        <section className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'>
          {Array.from({ length: 5 }, (_, index) => (
            <article
              key={`reports-kpi-${index}`}
              className='rounded-2xl border border-border border-l-4 border-l-border bg-card p-3 shadow-sm sm:p-3.5'
            >
              <Skeleton className='mb-2 h-3 w-24' />
              <Skeleton className='h-8 w-16' />
            </article>
          ))}
        </section>

        <ReportsTableSkeleton
          columnWidths={['w-28', 'w-24', 'w-22', 'w-24', 'w-18', 'w-20', 'w-22', 'w-16', 'w-20']}
        />
        <ReportsTableSkeleton
          columnWidths={['w-28', 'w-22', 'w-20', 'w-20', 'w-18', 'w-16', 'w-18']}
        />
        <ReportsTableSkeleton
          columnWidths={['w-28', 'w-24', 'w-18', 'w-20', 'w-16', 'w-20', 'w-24']}
        />
      </div>
    </section>
  );
}
