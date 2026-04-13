import React from 'react';
import AdminDashboardSkeleton from '@/components/dashboard/skeletons/AdminDashboardSkeleton';
import DashboardContentSkeleton from '@/components/dashboard/skeletons/DashboardContentSkeleton';
import { getCurrentUser } from '@/services/authService';

export default async function Loading() {
  try {
    const user = await getCurrentUser();
    if (user?.role === 'EMPLOYEE') return <DashboardContentSkeleton />;
  } catch {
    // If role cannot be resolved during initial load, prefer admin skeleton.
  }

  return <AdminDashboardSkeleton />;
}
