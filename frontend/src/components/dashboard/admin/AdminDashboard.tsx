'use client';

import { LayoutDashboard } from 'lucide-react';
import AdminCalendarSidebar from './AdminCalendarSidebar';
import AdminHrInsights from './AdminHrInsights';
import AdminSummaryCards from './AdminSummaryCards';
import PendingLeaveRequests from './PendingLeaveRequests';

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const AdminDashboard = () => {
  return (
    <div className='space-y-6 pb-8 min-h-screen'>
      {/* Page Header */}
      <div className='flex justify-between items-start'>
        <div className='flex items-center gap-4'>
          <div className='flex justify-center items-center bg-primary/10 rounded-2xl ring-1 ring-primary/20 w-12 h-12 shrink-0'>
            <LayoutDashboard
              size={22}
              className='text-primary'
              strokeWidth={2}
              aria-hidden
            />
          </div>
          <div>
            <p className='font-semibold text-primary text-xs uppercase tracking-widest'>
              Admin overview
            </p>
            <h1 className='mt-0.5 font-bold text-card-foreground text-2xl tracking-tight'>
              Dashboard
            </h1>
            <p className='mt-0.5 text-muted-foreground text-sm'>{todayLabel()}</p>
          </div>
        </div>
      </div>

      {/* Summary KPI Row */}
      <section>
        <AdminSummaryCards />
      </section>

      {/* Main Content + Right Sidebar */}
      <section className='lg:items-start gap-6 grid grid-cols-1 lg:grid-cols-3'>
        {/* Left: Pending Requests + HR Insights */}
        <div className='grow space-y-6 lg:col-span-2'>
          <PendingLeaveRequests />
          <AdminHrInsights />
        </div>

        {/* Right: Calendar — sticky within main scroll (needs self-start in grid) */}
        <div className='top-2 z-10 self-start lg:sticky lg:col-span-1'>
          <AdminCalendarSidebar />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
