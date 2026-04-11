import AdminDashboard from '@/components/dashboard/admin/AdminDashboard';
import EmployeeDashboard from '@/components/dashboard/employee/EmployeeDashboard';
import { getCurrentUser } from '@/services/authService';

const Dashboard = async () => {
  const user = await getCurrentUser();

  console.log('Current user:', user);

  if (user.role === 'ADMIN') {
    return <AdminDashboard />;
  }

  return <EmployeeDashboard />;
};

export default Dashboard;
