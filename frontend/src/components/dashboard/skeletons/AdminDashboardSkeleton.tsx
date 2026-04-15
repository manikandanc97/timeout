import React from 'react';

/**
 * Route / shell loading UI aligned with {@link AdminDashboard} layout
 * (header, KPI row, pending panel, HR grid, sticky calendar column).
 */
function PanelShell({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
      <div className='flex items-center border-b border-border px-5 py-4'>
        <div className='flex items-center gap-3'>
          <div className='h-9 w-9 shrink-0 rounded-xl bg-skeleton' />
          <div className='space-y-2'>
            <div className='h-3.5 w-36 rounded bg-skeleton' />
            <div className='h-2.5 w-28 rounded bg-skeleton' />
          </div>
        </div>
      </div>
      <div className='flex-1 px-5 py-4'>{children}</div>
    </div>
  );
}

const AdminDashboardSkeleton = () => {
  return (
    <div className='min-h-screen space-y-6 pb-8 animate-pulse'>
      {/* Page header — matches AdminDashboard */}
      <div className='flex items-start justify-between'>
        <div className='flex items-center gap-4'>
          <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-skeleton ring-1 ring-border' />
          <div className='space-y-2'>
            <div className='h-2.5 w-24 rounded bg-skeleton' />
            <div className='h-8 w-40 rounded bg-skeleton' />
            <div className='h-3.5 w-52 rounded bg-muted' />
          </div>
        </div>
      </div>

      {/* Summary KPI row — matches AdminSummaryCards (icon + value + label) */}
      <section>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {(
            [
              'border-l-sky-200',
              'border-l-emerald-200',
              'border-l-amber-200',
              'border-l-rose-200',
            ] as const
          ).map((accent, i) => (
            <div
              key={`kpi-${i}`}
              className={`flex items-center gap-3 rounded-2xl border border-border border-l-4 bg-card px-4 py-3.5 shadow-sm ${accent}`}
            >
              <div className='h-10 w-10 shrink-0 rounded-xl bg-skeleton' />
              <div className='min-w-0 flex-1 space-y-1.5'>
                <div className='h-7 w-12 rounded-md bg-skeleton' />
                <div className='h-3 max-w-44 rounded bg-muted' />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Main grid + sticky calendar — matches AdminDashboard section */}
      <section className='grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start'>
        <div className='space-y-6 xl:col-span-2'>
          {/* Pending leave requests — loading state mirrors PendingLeaveRequests */}
          <PanelShell>
            <div className='space-y-3'>
              {[1, 2, 3].map((i) => (
                <div key={i} className='h-14 rounded-xl bg-muted' />
              ))}
            </div>
          </PanelShell>

          {/* HR insights — four AdminDashboardPanel-sized blocks */}
          <div className='grid gap-4 sm:grid-cols-2'>
            {[0, 1, 2, 3].map((i) => (
              <PanelShell key={`hr-${i}`}>
                <div className='space-y-2.5'>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-2.5'>
                      <div className='h-8 w-8 shrink-0 rounded-lg bg-muted' />
                      <div className='h-3.5 flex-1 max-w-[120px] rounded bg-skeleton' />
                    </div>
                    <div className='h-5 w-16 shrink-0 rounded-md bg-muted' />
                  </div>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-2.5'>
                      <div className='h-8 w-8 shrink-0 rounded-lg bg-muted' />
                      <div className='h-3.5 flex-1 max-w-[100px] rounded bg-skeleton' />
                    </div>
                    <div className='h-5 w-14 shrink-0 rounded-md bg-muted' />
                  </div>
                  <div className='flex items-center justify-between gap-3'>
                    <div className='flex min-w-0 items-center gap-2.5'>
                      <div className='h-8 w-8 shrink-0 rounded-lg bg-muted' />
                      <div className='h-3.5 flex-1 max-w-[110px] rounded bg-skeleton' />
                    </div>
                    <div className='h-5 w-12 shrink-0 rounded-md bg-muted' />
                  </div>
                </div>
              </PanelShell>
            ))}
          </div>
        </div>

        {/* Calendar column — same shell as apply/loading calendar (LeaveCalendarPanel) */}
        <div className='top-2 z-10 self-start xl:sticky xl:col-span-1'>
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
                <div className='h-8 w-8 rounded-lg bg-skeleton' />
                <div className='flex flex-col items-center space-y-1.5'>
                  <div className='h-4 w-32 rounded bg-skeleton' />
                  <div className='h-2.5 w-24 rounded bg-skeleton' />
                </div>
                <div className='h-8 w-8 rounded-lg bg-skeleton' />
              </div>
              <div className='mb-1 grid grid-cols-7 gap-1'>
                {[...Array(7)].map((_, i) => (
                  <div
                    key={`head-${i}`}
                    className='mx-auto h-2.5 w-8 rounded bg-skeleton'
                  />
                ))}
              </div>
              <div className='grid grid-cols-7 gap-y-1'>
                {[...Array(35)].map((_, i) => (
                  <div
                    key={`day-${i}`}
                    className={`mx-auto h-9 w-9 rounded-xl ${
                      i === 14 ? 'bg-primary/50' : 'bg-skeleton'
                    }`}
                  />
                ))}
              </div>
              <div className='mt-4 border-t border-border pt-3'>
                <div className='grid grid-cols-2 gap-x-4 gap-y-2'>
                  {[...Array(6)].map((_, i) => (
                    <div key={`legend-${i}`} className='flex items-center gap-2'>
                      <div className='h-2.5 w-2.5 shrink-0 rounded-full bg-skeleton' />
                      <div className='h-3 w-24 rounded bg-skeleton' />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardSkeleton;
