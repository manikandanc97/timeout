import React from 'react';
import Skeleton from '@/components/ui/Skeleton';

export default function Loading() {
  return (
    <div className='gap-6 grid grid-cols-1 xl:grid-cols-3 animate-pulse'>
      <div className='xl:col-span-2'>
        <div className='relative bg-card/90 shadow-xl border border-border rounded-3xl overflow-hidden'>
          <div className='-top-24 -left-32 absolute bg-primary/10 blur-3xl rounded-full w-64 h-64' />
          <div className='absolute -right-20 -bottom-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl dark:bg-indigo-400/15' />
          <div className='z-10 relative flex flex-col gap-6 p-6'>
            {/* Header — matches ApplyLeave title block */}
            <div className='flex flex-wrap justify-between items-start gap-4 border-b border-border pb-6'>
              <div className='flex items-start gap-3'>
                <Skeleton className='h-12 w-12 rounded-2xl' />
                <div className='space-y-2'>
                  <Skeleton className='w-20 h-2.5' />
                  <Skeleton className='w-44 h-7' />
                </div>
              </div>
            </div>

            {/* Form shell — same grid as ApplyLeave (single main column) */}
            <div className='gap-5 grid lg:grid-cols-[1.7fr,1fr]'>
              <div className='space-y-5'>
                <div className='gap-4 grid'>
                  {/* Choose leave type */}
                  <section className='bg-card/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-border rounded-2xl'>
                    <div className='flex justify-between items-center gap-3'>
                      <Skeleton className='w-40 h-5' />
                      <Skeleton className='rounded-full w-28 h-7' />
                    </div>
                    <div className='gap-3 grid grid-cols-3 mt-3 pb-1'>
                      {[
                        'border-cyan-500/30 bg-cyan-500/10 ring-2 ring-cyan-400/35 dark:bg-cyan-400/15',
                        'border-rose-500/30 bg-rose-500/10 dark:bg-rose-400/15',
                        'border-violet-500/30 bg-violet-500/10 dark:bg-violet-400/15',
                      ].map((cardClass, i) => (
                        <div
                          key={`type-${i}`}
                          className={`flex flex-col gap-3 rounded-xl border px-4 py-4 ${cardClass}`}
                        >
                          <div className='flex items-start gap-3'>
                            <Skeleton className='border border-border/80 rounded-lg w-10 h-10 shrink-0' />
                            <div className='flex-1 min-w-0 space-y-2'>
                              <Skeleton className='w-24 h-3' />
                              <Skeleton className='w-[85%] max-w-28 h-2.5' />
                            </div>
                            <Skeleton className='rounded-md w-9 h-6 shrink-0' />
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Duration */}
                  <section className='bg-card/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-border rounded-2xl'>
                    <div className='flex justify-between items-start gap-3'>
                      <div className='space-y-2'>
                        <Skeleton className='w-24 h-5' />
                        <Skeleton className='w-52 h-3' />
                      </div>
                      <Skeleton className='opacity-20 rounded-full w-36 h-7 shrink-0' />
                    </div>
                    <div className='gap-3 grid sm:grid-cols-2 mt-4'>
                      {[0, 1].map((i) => (
                        <div key={`date-${i}`} className='space-y-2'>
                          <Skeleton className='w-20 h-3' />
                          <Skeleton className='w-full h-10 rounded-md' />
                        </div>
                      ))}
                    </div>
                    <div className='gap-3 grid grid-cols-2 md:grid-cols-4 mt-4'>
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={`stat-${i}`}
                          className='bg-card px-3 py-2 border border-border rounded-xl text-center'
                        >
                          <Skeleton className='mx-auto mb-2 w-20 h-2.5' />
                          <Skeleton className='mx-auto w-8 h-6' />
                        </div>
                      ))}
                    </div>
                  </section>
                </div>

                {/* Reason */}
                <section className='bg-card/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-border rounded-2xl'>
                  <div className='flex justify-between items-center gap-3'>
                    <div className='space-y-2'>
                      <Skeleton className='w-20 h-5' />
                      <Skeleton className='w-48 h-3' />
                    </div>
                  </div>
                  <div className='mt-4'>
                    <Skeleton className='w-full h-18 rounded-md' />
                  </div>
                </section>

                {/* Footer note + actions */}
                <section className='flex md:flex-row flex-col md:items-center gap-4 bg-card/90 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-border rounded-2xl'>
                  <div className='flex flex-col flex-1 gap-2'>
                    <Skeleton className='w-[90%] max-w-xs h-3' />
                    <Skeleton className='w-[75%] max-w-52 h-3' />
                  </div>
                  <div className='flex items-center gap-3 md:ml-auto w-full md:w-auto'>
                    <Skeleton className='w-22 h-12 rounded-lg' />
                    <Skeleton className='min-w-30 flex-1 md:flex-initial h-12 rounded-lg' />
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='top-2 xl:sticky self-start xl:col-span-1'>
        <div className='flex flex-col bg-card shadow-md rounded-2xl overflow-hidden'>
          <div className='bg-linear-to-br from-primary-dark via-primary to-accent px-5 pt-5 pb-6'>
            <div className='flex flex-col gap-2'>
              <div className='space-y-2'>
                <div className='bg-card-foreground/15 rounded w-28 h-2.5' />
                <div className='bg-card-foreground/20 rounded w-48 h-6' />
              </div>
              <div className='flex flex-col gap-2 bg-card/15 backdrop-blur-sm px-3 py-2.5 border border-white/25 rounded-xl'>
                <div className='bg-card-foreground/18 rounded w-24 h-2' />
                <div className='bg-card-foreground/20 rounded w-36 h-4' />
                <div className='bg-card-foreground/12 rounded w-28 h-2.5' />
              </div>
            </div>
          </div>
          <div className='flex flex-col flex-1 px-4 pt-4 pb-5'>
            <div className='flex justify-between items-center mb-4'>
              <Skeleton className='w-8 h-8 rounded-lg' />
              <div className='space-y-1.5 items-center flex flex-col'>
                <Skeleton className='w-32 h-4' />
                <Skeleton className='w-24 h-2.5' />
              </div>
              <Skeleton className='w-8 h-8 rounded-lg' />
            </div>
            <div className='gap-1 grid grid-cols-7 mb-1'>
              {[...Array(7)].map((_, i) => (
                <Skeleton
                  key={`head-${i}`}
                  className='mx-auto w-8 h-2.5'
                />
              ))}
            </div>
            <div className='gap-y-1 grid grid-cols-7'>
              {[...Array(35)].map((_, i) => (
                <Skeleton
                  key={`day-${i}`}
                  className={`mx-auto rounded-xl w-9 h-9 ${
                    i === 14 ? 'opacity-50' : ''
                  }`}
                />
              ))}
            </div>
            <div className='mt-4 pt-3 border-border border-t'>
              <div className='gap-x-4 gap-y-2 grid grid-cols-2'>
                {[...Array(6)].map((_, i) => (
                  <div key={`legend-${i}`} className='flex items-center gap-2'>
                    <Skeleton className='w-2.5 h-2.5 shrink-0 rounded-full' />
                    <Skeleton className='w-24 h-3' />
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
