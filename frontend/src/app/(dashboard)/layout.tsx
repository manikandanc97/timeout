import DashboardShell from '@/components/layout/DashboardShell';
import React from 'react';

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardShell>{children}</DashboardShell>;
};

export default DashboardLayout;
