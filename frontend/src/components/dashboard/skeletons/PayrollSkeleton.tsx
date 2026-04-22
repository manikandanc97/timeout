import Skeleton from '@/components/ui/Skeleton';

export default function PayrollSkeleton() {
  return (
    <section className='relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card/90 shadow-xl'>
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15' />

      <div className='relative z-10 flex flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
          <div className='flex items-start gap-3'>
            <Skeleton className='h-12 w-12 rounded-2xl' />
            <div className='space-y-2'>
              <Skeleton className='h-2.5 w-20' />
              <Skeleton className='h-8 w-40' />
            </div>
          </div>
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <Skeleton className='h-10 w-36 rounded-xl' />
            <Skeleton className='h-10 w-20 rounded-lg' />
            <Skeleton className='h-10 w-24 rounded-lg' />
          </div>
        </div>

        <section className='grid w-full shrink-0 grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-3.5'>
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={`payroll-kpi-${index}`}
              className='rounded-2xl border border-border border-l-4 border-l-border bg-card p-3 shadow-sm sm:p-3.5'
            >
              <Skeleton className='h-3 w-24' />
              <Skeleton className='mt-2 h-8 w-16' />
            </div>
          ))}
        </section>

        <section className='flex min-w-0 flex-col gap-3 rounded-2xl border border-border bg-muted/25 p-3 shadow-sm sm:gap-3.5 sm:p-4'>
          <div className='flex flex-wrap items-center justify-end gap-2'>
            <Skeleton className='h-10 w-52 rounded-xl' />
            <Skeleton className='h-10 w-20 rounded-xl' />
            <Skeleton className='h-10 w-28 rounded-xl' />
            <Skeleton className='h-10 w-20 rounded-xl' />
            <Skeleton className='h-10 w-28 rounded-xl' />
            <Skeleton className='h-10 w-30 rounded-xl' />
          </div>

          <div className='flex min-h-124 w-full min-w-0 flex-col overflow-x-auto rounded-xl border border-border bg-muted/35'>
            <div className='w-full min-w-0 overflow-x-auto'>
              <table className='w-full min-w-[980px] border-collapse text-left text-sm'>
                <thead className='sticky top-0 z-10'>
                  <tr className='border-b border-border bg-muted/90 text-xs font-semibold uppercase tracking-wide text-muted-foreground backdrop-blur-sm'>
                    {['w-28', 'w-18', 'w-18', 'w-14', 'w-18', 'w-20', 'w-14', 'w-16'].map((width, index) => (
                      <th key={`payroll-head-${index}`} className='px-4 py-3.5 text-left'>
                        <Skeleton className={`h-3 ${width}`} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }, (_, rowIndex) => (
                    <tr key={`payroll-row-${rowIndex}`} className='border-b border-border/60 bg-card/90'>
                      <td className='px-4 py-2 align-top'>
                        <div className='space-y-1.5'>
                          <Skeleton className='h-3.5 w-30' />
                          <Skeleton className='h-2.5 w-18' />
                        </div>
                      </td>
                      <td className='px-4 py-2 align-top'><Skeleton className='h-3.5 w-20' /></td>
                      <td className='px-4 py-2 align-top'><Skeleton className='h-3.5 w-20' /></td>
                      <td className='px-4 py-2 align-top'><Skeleton className='h-3.5 w-14' /></td>
                      <td className='px-4 py-2 align-top'><Skeleton className='h-3.5 w-18' /></td>
                      <td className='px-4 py-2 align-top'><Skeleton className='h-3.5 w-24' /></td>
                      <td className='px-4 py-2 align-top'><Skeleton className='h-6 w-16 rounded-md' /></td>
                      <td className='px-4 py-2 text-right align-top'>
                        <div className='flex min-w-[120px] flex-wrap justify-end gap-1.5'>
                          <Skeleton className='h-8 w-14 rounded-md' />
                          <Skeleton className='h-8 w-12 rounded-md' />
                          <Skeleton className='h-8 w-18 rounded-md' />
                          <Skeleton className='h-8 w-12 rounded-md' />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className='flex items-center justify-between px-2 py-3'>
            <Skeleton className='h-4 w-44' />
            <div className='flex items-center gap-2'>
              <Skeleton className='h-9 w-22 rounded-lg' />
              <Skeleton className='h-9 w-28 rounded-lg' />
              <Skeleton className='h-9 w-18 rounded-lg' />
            </div>
          </div>
        </section>
      </div>
    </section>
  );
}
