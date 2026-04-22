import LeaveRequestsPageClient from '@/components/leave/LeaveRequestsPageClient';
import { serverFetch } from '@/services/serverApi';
import type { Holiday } from '@/types/holiday';
import type {
  CompOffRequestWithEmployee,
  LeaveWithEmployee,
  PermissionRequestWithEmployee,
} from '@/types/leave';
import type { RegularizationRequest } from '@/types/attendance';
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
  let initialPermissionRequests: PermissionRequestWithEmployee[] = [];
  let initialCompOffRequests: CompOffRequestWithEmployee[] = [];
  let initialRegularizationRequests: RegularizationRequest[] = [];
  let holidays: Holiday[] = [];
  try {
    const [leavesRes, holidaysRes, permissionRes, compOffRes, regularizationRes] = await Promise.all([
      serverFetch<LeaveWithEmployee[]>('/leaves'),
      serverFetch<Holiday[]>('/holidays').catch(() => []),
      serverFetch<PermissionRequestWithEmployee[]>('/leaves/permissions/requests').catch(
        () => [],
      ),
      serverFetch<CompOffRequestWithEmployee[]>('/leaves/comp-off-requests').catch(
        () => [],
      ),
      serverFetch<{ data: RegularizationRequest[] }>('/attendance/regularize').catch(
        () => ({ data: [] }),
      ),
    ]);
    initialLeaves = leavesRes;
    holidays = Array.isArray(holidaysRes) ? holidaysRes : [];
    initialPermissionRequests = Array.isArray(permissionRes) ? permissionRes : [];
    initialCompOffRequests = Array.isArray(compOffRes) ? compOffRes : [];
    initialRegularizationRequests = Array.isArray(regularizationRes?.data) ? regularizationRes.data : [];
  } catch {
    initialLeaves = [];
    holidays = [];
    initialPermissionRequests = [];
    initialCompOffRequests = [];
    initialRegularizationRequests = [];
  }

  return (
    <LeaveRequestsPageClient
      initialLeaves={Array.isArray(initialLeaves) ? initialLeaves : []}
      initialPermissionRequests={initialPermissionRequests}
      initialCompOffRequests={initialCompOffRequests}
      initialRegularizationRequests={initialRegularizationRequests}
      holidays={holidays}
      canModerate={MOD_ROLES.has(role)}
    />
  );
}
