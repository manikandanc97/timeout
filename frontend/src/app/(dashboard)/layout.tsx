import DashboardShell from '@/components/layout/DashboardShell';
import { getCurrentUser } from '@/services/authService';
import React from 'react';

const DashboardLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  let initialRole: string | null = null;
  try {
    const user = await getCurrentUser();
    initialRole = typeof user?.role === 'string' ? user.role : null;
  } catch {
    initialRole = null;
  }

  return <DashboardShell initialRole={initialRole}>{children}</DashboardShell>;
};

export default DashboardLayout;
