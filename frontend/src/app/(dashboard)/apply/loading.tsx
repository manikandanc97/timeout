import React from 'react';

export default function Loading() {
  return (
    <div className='gap-6 grid grid-cols-1 xl:grid-cols-3 h-full animate-pulse'>
      {/* Apply Leave skeleton (matches full card layout) */}
      <div className='relative xl:col-span-2 bg-white/90 shadow-xl border border-gray-100 rounded-3xl overflow-hidden'>
        <div className='-top-24 -left-32 absolute bg-primary/10 blur-3xl rounded-full w-64 h-64' />
        <div className='-right-20 -bottom-24 absolute bg-indigo-100 blur-3xl rounded-full w-64 h-64' />
        <div className='z-10 relative flex flex-col gap-6 p-6 lg:p-8 cursor-wait'>
          {/* Header */}
          <div className='flex flex-wrap justify-between items-start gap-4 pb-5 border-gray-100 border-b'>
            <div className='flex items-start gap-3'>
              <div className='bg-gray-200 rounded-2xl w-12 h-12' />
              <div className='space-y-2'>
                <div className='bg-gray-200 rounded w-32 h-3' />
                <div className='bg-gray-200 rounded w-44 h-4' />
                <div className='bg-gray-200 rounded w-56 h-3' />
              </div>
            </div>
          </div>

          <div className='gap-5 grid lg:grid-cols-[1.7fr,1fr]'>
            <div className='space-y-5'>
              {/* Leave type section */}
              <section className='bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
                <div className='flex justify-between items-center gap-3 mb-3'>
                  <div className='bg-gray-200 rounded w-32 h-4' />
                  <div className='bg-gray-200 rounded-full w-28 h-5' />
                </div>
                <div className='gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`type-${i}`}
                      className={`flex flex-col gap-3 px-4 py-4 border rounded-xl ${
                        i === 0
                          ? 'bg-cyan-50/60 border-cyan-200 ring-2 ring-cyan-300/60'
                          : 'bg-gray-50 border-gray-100'
                      }`}
                    >
                      <div className='flex items-start gap-3'>
                        <div className='bg-gray-200 rounded-lg w-10 h-10' />
                        <div className='flex-1 space-y-2'>
                          <div className='bg-gray-200 rounded w-24 h-3' />
                          <div className='bg-gray-200 rounded w-32 h-3' />
                        </div>
                        <div className='bg-gray-200 rounded-full w-12 h-6' />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Duration section */}
              <section className='space-y-4 bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
                <div className='flex justify-between items-start gap-3'>
                  <div className='space-y-2'>
                    <div className='bg-gray-200 rounded w-28 h-4' />
                    <div className='bg-gray-200 rounded w-48 h-3' />
                  </div>
                  <div className='bg-primary/10 rounded-full w-32 h-5' />
                </div>
                <div className='gap-3 grid sm:grid-cols-2'>
                  {[...Array(2)].map((_, i) => (
                    <div key={`date-${i}`} className='space-y-2'>
                      <div className='bg-gray-200 rounded w-24 h-3' />
                      <div className='bg-gray-200 rounded-md w-full h-10' />
                    </div>
                  ))}
                </div>
                <div className='gap-3 grid grid-cols-3'>
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={`stat-${i}`}
                      className='bg-gray-50 px-3 py-2 border border-gray-100 rounded-xl text-center'
                    >
                      <div className='bg-gray-200 mx-auto mb-2 rounded w-16 h-3' />
                      <div className='bg-gray-200 mx-auto rounded w-10 h-4' />
                    </div>
                  ))}
                </div>
              </section>

              {/* Reason section */}
              <section className='space-y-3 bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
                <div className='bg-gray-200 rounded w-28 h-4' />
                <div className='bg-gray-200 rounded-md w-full h-24' />
              </section>

              {/* Footer note + buttons */}
              <section className='flex md:flex-row flex-col md:items-center gap-4 bg-white/90 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
                <div className='flex-1 space-y-2'>
                  <div className='bg-gray-200 rounded w-48 h-3' />
                  <div className='bg-gray-200 rounded w-40 h-3' />
                </div>
                <div className='flex items-center gap-3 md:ml-auto w-full md:w-auto'>
                  <div className='bg-gray-200 rounded-lg w-20 h-11' />
                  <div className='bg-gray-300 rounded-lg w-28 h-11' />
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar skeleton */}
      <div className='flex flex-col bg-white shadow-md rounded-2xl overflow-hidden cursor-wait xl:sticky top-4 self-start'>
        <div className='bg-gradient-to-br from-primary-dark via-primary to-[#0aafca] px-5 pt-5 pb-6'>
          <div className='space-y-3'>
            <div className='bg-white/30 rounded w-24 h-3' />
            <div className='bg-white/40 rounded w-40 h-4' />
            <div className='flex items-center gap-3 bg-white/15 px-3 py-2 rounded-xl'>
              <div className='bg-white/40 rounded-full w-6 h-6' />
              <div className='flex-1 space-y-2'>
                <div className='bg-white/40 rounded w-32 h-3' />
                <div className='bg-white/30 rounded w-24 h-3' />
              </div>
            </div>
          </div>
        </div>
        <div className='flex flex-col flex-1 px-4 pt-4 pb-5'>
          <div className='flex justify-between items-center mb-4'>
            <div className='bg-gray-200 rounded-full w-8 h-8' />
            <div className='bg-gray-200 rounded w-28 h-4' />
            <div className='bg-gray-200 rounded-full w-8 h-8' />
          </div>
          <div className='gap-1 grid grid-cols-7 mb-2'>
            {[...Array(7)].map((_, i) => (
              <div
                key={`head-${i}`}
                className='bg-gray-200 mx-auto rounded w-9 h-3'
              />
            ))}
          </div>
          <div className='gap-y-2 grid grid-cols-7'>
            {[...Array(35)].map((_, i) => (
              <div
                key={`day-${i}`}
                className={`mx-auto rounded-xl w-9 h-9 ${
                  i === 14 ? 'bg-primary/40' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <div className='gap-3 grid grid-cols-2 mt-4 pt-3 border-gray-100 border-t'>
            {[...Array(4)].map((_, i) => (
              <div key={`legend-${i}`} className='flex items-center gap-2'>
                <div className='bg-gray-200 rounded-full w-3 h-3' />
                <div className='bg-gray-200 rounded w-20 h-3' />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
