import DashboardShell from '@/components/layout/DashboardShell';
import { getCurrentUser } from '@/services/authService';
import React from 'react';

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const user = await getCurrentUser();

  return <DashboardShell initialUser={user}>{children}</DashboardShell>;
};

export default DashboardLayout;
