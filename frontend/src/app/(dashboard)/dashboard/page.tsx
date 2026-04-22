import AdminDashboard from '@/components/dashboard/admin/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/employee/EmployeeDashboard';
import { getCurrentUser } from '@/services/authService';
import {
  getAdminDashboardSnapshot,
  getHolidayList,
} from '@/services/dashboardService';

const Dashboard = async () => {
  const user = await getCurrentUser();
  if (user.role !== 'EMPLOYEE') {
    const [initialSnapshot, initialHolidays] = await Promise.all([
      getAdminDashboardSnapshot().catch(() => null),
      getHolidayList().catch(() => []),
    ]);

    return (
      <AdminDashboard
        initialSnapshot={initialSnapshot}
        initialHolidays={initialHolidays}
      />
    );
  }

  return <EmployeeDashboard user={user} />;
};

export default Dashboard;
