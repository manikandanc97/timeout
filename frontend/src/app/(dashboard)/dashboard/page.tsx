import AdminDashboard from '@/components/dashboard/admin/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/employee/EmployeeDashboard';
import { getCurrentUser } from '@/services/authService';

const Dashboard = async () => {
  const user = await getCurrentUser();
  if (user.role !== 'EMPLOYEE') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;
