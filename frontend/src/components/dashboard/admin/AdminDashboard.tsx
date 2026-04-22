import type { Holiday } from '@/types/holiday';
import type { AdminDashboardSnapshot } from '@/types/dashboard';
import { LayoutDashboard } from 'lucide-react';
import AdminDashboardClient from './AdminDashboardClient';

const todayLabel = () =>
  new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

const AdminDashboard = ({
  initialSnapshot,
  initialHolidays,
}: {
  initialSnapshot: AdminDashboardSnapshot | null;
  initialHolidays: Holiday[];
}) => {
  return (
    <div className='min-h-screen space-y-6 pb-8'>
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

      <AdminDashboardClient
        initialSnapshot={initialSnapshot}
        initialHolidays={initialHolidays}
      />
    </div>
  );
};

export default AdminDashboard;
