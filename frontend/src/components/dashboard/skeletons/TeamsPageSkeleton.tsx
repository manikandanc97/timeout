import { TeamsTableSkeletonBody } from '@/components/teams/TeamsTable';

/** Mirrors `TeamPageClient`: header, filter row, teams table, pagination; aside = summary grid + departments panel. */
export default function TeamsPageSkeleton() {
  return (
    <section
      aria-hidden
      className='relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white/90 shadow-xl'
    >
      <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
      <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-100 blur-3xl' />

      <div className='relative z-10 flex min-h-0 flex-1 flex-col gap-3 p-4 sm:gap-4 sm:p-5'>
        <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4'>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col gap-3'>
            {/* TeamsPageHeader */}
            <div className='flex shrink-0 flex-wrap items-start justify-between gap-3'>
              <div className='flex items-start gap-3'>
                <div className='grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-linear-to-br from-gray-100 via-gray-50 to-gray-100 shadow-inner ring-1 ring-gray-100/80' />
                <div className='space-y-2 pt-0.5'>
                  <div className='h-2.5 w-28 animate-pulse rounded bg-gray-200/90' />
                  <div className='h-8 w-32 max-w-[50vw] animate-pulse rounded-md bg-gray-200/90' />
                  <div className='h-3.5 w-64 max-w-[85vw] animate-pulse rounded bg-gray-100' />
                </div>
              </div>
              <div className='h-8 w-40 shrink-0 animate-pulse rounded-full border border-gray-200/80 bg-gray-50/90' />
            </div>

            <section className='flex min-h-0 min-w-0 flex-1 flex-col gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:gap-3.5 sm:p-4'>
              {/* TeamsFilterBar (admin: search, department, Add team, clear) */}
              <div className='flex min-w-0 shrink-0 flex-nowrap items-center gap-3 overflow-x-auto py-1.5 [scrollbar-width:thin]'>
                <div className='h-10 min-w-[180px] max-w-sm flex-1 animate-pulse rounded-md bg-gray-100/90 ring-1 ring-gray-100' />
                <div className='h-10 w-[160px] shrink-0 animate-pulse rounded-md bg-gray-100/90 ring-1 ring-gray-100' />
                <div className='h-10 w-[118px] shrink-0 animate-pulse rounded-xl bg-gray-200/80 ring-1 ring-gray-100' />
                <div className='ml-auto h-10 w-[118px] shrink-0 animate-pulse rounded-xl bg-gray-50 ring-1 ring-gray-100' />
              </div>

              <div className='flex min-h-0 max-h-[min(56vh,32rem)] flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40 sm:max-h-[min(60vh,36rem)]'>
                <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
                  <table className='w-full table-fixed border-collapse text-left text-sm'>
                    <thead className='sticky top-0 z-10'>
                      <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
                        <th className='w-[30%] px-4 py-3 text-left'>
                          Team name
                        </th>
                        <th className='w-[30%] px-4 py-3 text-left'>
                          Department
                        </th>
                        <th className='w-[15%] whitespace-nowrap px-2 py-3 text-left'>
                          Employee count
                        </th>
                        <th className='w-[25%] whitespace-nowrap px-2 py-3 text-right'>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody aria-busy={true} aria-label='Loading teams'>
                      <TeamsTableSkeletonBody />
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TeamsPagination */}
              <div className='flex flex-col items-stretch justify-between gap-3 border-t border-gray-100 pt-2 sm:flex-row sm:items-center'>
                <div className='h-3.5 w-52 max-w-full animate-pulse rounded bg-gray-100' />
                <div className='flex items-center justify-center gap-2 sm:justify-end'>
                  <div className='h-9 w-9 shrink-0 animate-pulse rounded-lg bg-gray-100 ring-1 ring-gray-200/80' />
                  <div className='h-9 w-9 shrink-0 animate-pulse rounded-lg bg-gray-100 ring-1 ring-gray-200/80' />
                </div>
              </div>
            </section>
          </div>

          <aside
            aria-hidden
            className='flex w-full min-h-0 shrink-0 flex-col gap-3 lg:min-h-0 lg:min-w-[20rem] lg:w-80 xl:min-w-[22rem] xl:w-[22rem]'
          >
            {/* TeamsSummaryCards loading layout */}
            <section className='w-full shrink-0 self-start rounded-2xl bg-white/95'>
              <h2 className='mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-400 lg:hidden'>
                Summary
              </h2>
              <div className='grid grid-cols-2 gap-2.5 sm:gap-3'>
                {['border-l-sky-400', 'border-l-violet-400'].map((accent) => (
                  <div
                    key={accent}
                    className={`animate-pulse rounded-2xl border border-gray-100 border-l-4 ${accent} bg-white p-3 shadow-sm sm:p-3.5`}
                  >
                    <div className='flex justify-between gap-1.5'>
                      <div className='h-2.5 w-12 rounded bg-gray-200 sm:h-3 sm:w-16' />
                      <div className='h-7 w-7 shrink-0 rounded-lg bg-gray-100 sm:h-8 sm:w-8' />
                    </div>
                    <div className='mt-2 h-6 w-8 rounded bg-gray-200 sm:mt-2.5 sm:h-7' />
                  </div>
                ))}
              </div>
            </section>

            {/* DepartmentsPanel shell */}
            <section className='flex min-h-0 min-w-0 flex-1 flex-col rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-sm sm:p-4'>
              <div className='mb-3 flex shrink-0 flex-wrap items-start justify-between gap-2'>
                <div className='flex min-w-0 flex-1 items-start gap-2.5'>
                  <div className='grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gray-100 ring-1 ring-gray-100/80' />
                  <div className='min-w-0 space-y-1.5 pt-0.5'>
                    <div className='h-4 w-28 animate-pulse rounded bg-gray-200/90' />
                    <div className='h-3 w-40 animate-pulse rounded bg-gray-100' />
                  </div>
                </div>
                <div className='h-9 w-9 shrink-0 animate-pulse rounded-xl border border-gray-200/80 bg-gray-50' />
              </div>
              <div className='flex min-h-0 max-h-[min(56vh,32rem)] flex-1 flex-col overflow-hidden rounded-xl border border-gray-100 bg-gray-50/40 sm:max-h-[min(60vh,36rem)]'>
                <table className='w-full table-fixed border-collapse text-left text-sm'>
                  <thead className='sticky top-0 z-10'>
                    <tr className='border-b border-gray-100 bg-gray-50/95 text-xs font-semibold uppercase tracking-wide text-gray-500 backdrop-blur-sm'>
                      <th className='min-w-0 px-2.5 py-2.5 text-left sm:px-3'>
                        Department
                      </th>
                      <th className='w-[5.5rem] px-2 py-2.5 text-right sm:w-24 sm:px-3'>
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 5 }, (_, i) => (
                      <tr
                        key={i}
                        className='border-b border-gray-100/80 last:border-0'
                      >
                        <td className='min-w-0 px-2.5 py-2.5 sm:px-3'>
                          <div
                            className={`h-4 max-w-full animate-pulse rounded bg-gray-200/90 ${['w-36', 'w-28', 'w-40', 'w-32', 'w-24'][i % 5]}`}
                          />
                        </td>
                        <td className='px-2 py-2.5 text-right sm:px-3'>
                          <div className='flex justify-end gap-1'>
                            <div className='h-8 w-8 animate-pulse rounded-lg bg-gray-100' />
                            <div className='h-8 w-8 animate-pulse rounded-lg bg-gray-100' />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
