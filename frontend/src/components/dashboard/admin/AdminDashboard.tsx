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
    <div className='space-y-6'>
      <header className='flex items-start gap-3'>
        <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-primary/10'>
          <LayoutDashboard
            size={22}
            className='text-primary'
            strokeWidth={2}
            aria-hidden
          />
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-medium text-primary'>Admin overview</p>
          <h1 className='mt-0.5 text-2xl font-bold tracking-tight text-gray-900'>
            Dashboard
          </h1>
          <p className='mt-1 text-sm text-gray-500'>{todayLabel()}</p>
        </div>
      </header>

      <section aria-label='Organization summary'>
        <AdminSummaryCards />
      </section>

      <section
        aria-label='Pending requests, people insights, and calendar'
        className='grid grid-cols-1 gap-6 xl:grid-cols-3 xl:items-start'
      >
        <div className='min-h-0 space-y-5 xl:col-span-2'>
          <PendingLeaveRequests />
          <AdminHrInsights />
        </div>
        <div className='min-h-0 xl:col-span-1'>
          <AdminCalendarSidebar />
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
