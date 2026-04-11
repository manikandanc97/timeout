import LeaveRequestsPageClient from '@/components/leave/LeaveRequestsPageClient';
import { serverFetch } from '@/services/serverApi';
import type { LeaveWithEmployee } from '@/types/leave';
import type { User } from '@/types/user';
import { redirect } from 'next/navigation';

const VIEW_ROLES = new Set(['ADMIN', 'MANAGER', 'HR']);
const MOD_ROLES = new Set(['ADMIN', 'MANAGER']);

export default async function LeaveRequestsPage() {
  let user: User;
  try {
    user = await serverFetch<User>('/profile');
  } catch {
    redirect('/login');
  }

  const role = String(user.role ?? '');
  if (!VIEW_ROLES.has(role)) {
    redirect('/dashboard');
  }

  let initialLeaves: LeaveWithEmployee[] = [];
  try {
    initialLeaves = await serverFetch<LeaveWithEmployee[]>('/leaves');
  } catch {
    initialLeaves = [];
  }

  return (
    <LeaveRequestsPageClient
      initialLeaves={Array.isArray(initialLeaves) ? initialLeaves : []}
      canModerate={MOD_ROLES.has(role)}
    />
  );
}
