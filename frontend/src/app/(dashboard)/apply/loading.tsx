import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className='grid grid-cols-1 gap-6 xl:grid-cols-3'>
      <div className='xl:col-span-2'>
        <div className='relative overflow-hidden rounded-3xl border border-border bg-card/90 shadow-xl'>
          <div className='absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl' />
          <div className='absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15' />

          <div className='relative z-10 flex flex-col gap-6 p-6'>
            <div className='flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6'>
              <div className='flex items-start gap-3'>
                <Skeleton className='h-12 w-12 rounded-2xl' />
                <div className='space-y-2'>
                  <Skeleton className='h-2.5 w-20' />
                  <Skeleton className='h-7 w-44' />
                </div>
              </div>
            </div>

            <div className='flex items-center gap-2 overflow-x-auto rounded-xl border border-border bg-muted/30 p-1 no-scrollbar'>
              {['w-20', 'w-24', 'w-22', 'w-18', 'w-24'].map((width, index) => (
                <Skeleton
                  key={`apply-tab-${index}`}
                  className={`h-9 shrink-0 rounded-lg ${width}`}
                />
              ))}
            </div>

            <div className='will-change-[transform,opacity]'>
              <div className='space-y-5'>
                <div className='grid gap-4'>
                  <section className='rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm md:p-5'>
                    <div className='flex items-center justify-between gap-3'>
                      <Skeleton className='h-5 w-40' />
                      <Skeleton className='h-7 w-28 rounded-full' />
                    </div>
                    <div className='mt-3 grid grid-cols-3 gap-3 pb-1'>
                      {[
                        'border-cyan-500/30 bg-cyan-500/10 ring-2 ring-cyan-400/35 dark:bg-cyan-400/15',
                        'border-rose-500/30 bg-rose-500/10 dark:bg-rose-400/15',
                        'border-violet-500/30 bg-violet-500/10 dark:bg-violet-400/15',
                      ].map((cardClass, index) => (
                        <div
                          key={`leave-type-${index}`}
                          className={`flex flex-col gap-3 rounded-xl border px-4 py-4 ${cardClass}`}
                        >
                          <div className='flex items-start gap-3'>
                            <Skeleton className='h-10 w-10 shrink-0 rounded-lg border border-border/80' />
                            <div className='min-w-0 flex-1 space-y-2'>
                              <Skeleton className='h-3 w-24' />
                              <Skeleton className='h-2.5 w-[85%] max-w-28' />
                            </div>
                            <Skeleton className='h-6 w-9 shrink-0 rounded-md' />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className='rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm md:p-5'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='space-y-2'>
                        <Skeleton className='h-5 w-24' />
                        <Skeleton className='h-3 w-52 max-w-full' />
                      </div>
                      <Skeleton className='h-7 w-36 shrink-0 rounded-full opacity-20' />
                    </div>
                    <div className='mt-4 grid gap-3 sm:grid-cols-2'>
                      {[0, 1].map((index) => (
                        <div key={`date-${index}`} className='space-y-2'>
                          <Skeleton className='h-3 w-20' />
                          <Skeleton className='h-10 w-full rounded-md' />
                        </div>
                      ))}
                    </div>
                    <div className='mt-4 grid grid-cols-2 gap-3 md:grid-cols-4'>
                      {Array.from({ length: 4 }, (_, index) => (
                        <div
                          key={`stat-${index}`}
                          className='rounded-xl border border-border bg-card px-3 py-2 text-center'
                        >
                          <Skeleton className='mx-auto mb-2 h-2.5 w-20' />
                          <Skeleton className='mx-auto h-6 w-8' />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                <section className='rounded-2xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur-sm md:p-5'>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='space-y-2'>
                      <Skeleton className='h-5 w-20' />
                      <Skeleton className='h-3 w-48 max-w-full' />
                    </div>
                  </div>
                  <div className='mt-4'>
                    <Skeleton className='h-18 w-full rounded-md' />
                  </div>
                </section>

                <section className='flex flex-col gap-4 rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-sm md:flex-row md:items-center md:p-5'>
                  <div className='flex flex-1 flex-col gap-2'>
                    <Skeleton className='h-3 w-[90%] max-w-xs' />
                    <Skeleton className='h-3 w-[75%] max-w-52' />
                  </div>
                  <div className='flex w-full items-center gap-3 md:ml-auto md:w-auto'>
                    <Skeleton className='h-12 w-22 rounded-lg' />
                    <Skeleton className='h-12 min-w-30 flex-1 rounded-lg md:flex-initial' />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='top-2 self-start xl:sticky xl:col-span-1'>
        <div className='flex flex-col overflow-hidden rounded-2xl bg-card shadow-md'>
          <div className='bg-linear-to-br from-primary-dark via-primary to-accent px-5 pb-6 pt-5'>
            <div className='flex flex-col gap-2'>
              <div className='space-y-2'>
                <div className='h-2.5 w-28 rounded bg-card-foreground/15' />
                <div className='h-6 w-48 rounded bg-card-foreground/20' />
              </div>
              <div className='flex flex-col gap-2 rounded-xl border border-white/25 bg-card/15 px-3 py-2.5 backdrop-blur-sm'>
                <div className='h-2 w-24 rounded bg-card-foreground/18' />
                <div className='h-4 w-36 rounded bg-card-foreground/20' />
                <div className='h-2.5 w-28 rounded bg-card-foreground/12' />
              </div>
            </div>
          </div>
          <div className='flex flex-1 flex-col px-4 pb-5 pt-4'>
            <div className='mb-4 flex items-center justify-between'>
              <Skeleton className='h-8 w-8 rounded-lg' />
              <div className='flex flex-col items-center space-y-1.5'>
                <Skeleton className='h-4 w-32' />
                <Skeleton className='h-2.5 w-24' />
              </div>
              <Skeleton className='h-8 w-8 rounded-lg' />
            </div>
            <div className='mb-1 grid grid-cols-7 gap-1'>
              {Array.from({ length: 7 }, (_, index) => (
                <Skeleton
                  key={`head-${index}`}
                  className='mx-auto h-2.5 w-8'
                />
              ))}
            </div>
            <div className='grid grid-cols-7 gap-y-1'>
              {Array.from({ length: 35 }, (_, index) => (
                <Skeleton
                  key={`day-${index}`}
                  className={`mx-auto h-9 w-9 rounded-xl ${
                    index === 14 ? 'opacity-50' : ''
                  }`}
                />
              ))}
            </div>
            <div className='mt-4 border-t border-border pt-3'>
              <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={`legend-${index}`} className='flex items-center gap-2'>
                    <Skeleton className='h-2.5 w-2.5 shrink-0 rounded-full' />
                    <Skeleton className='h-3 w-24' />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
