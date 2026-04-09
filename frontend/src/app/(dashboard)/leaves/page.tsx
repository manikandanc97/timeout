import MyLeavesList from '@/components/leave/MyLeavesList';
import { getLeaveHistory } from '@/services/dashboardService';
import { serverFetch } from '@/services/serverApi';
import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';
import type { User } from '@/types/user';
import React from 'react';

const LeavesPage = async () => {
  const [response, profile, holidays] = await Promise.all([
    getLeaveHistory(),
    serverFetch<User>('/profile').catch(() => null),
    serverFetch<Holiday[]>('/holidays').catch(() => []),
  ]);

  const leaves: Leave[] = Array.isArray(response)
    ? response
    : ((response as { data?: Leave[] })?.data ?? []);

  const userGender =
    profile && typeof profile.gender === 'string' ? profile.gender : null;

  return (
    <MyLeavesList
      leaves={leaves}
      userGender={userGender}
      holidays={Array.isArray(holidays) ? holidays : []}
    />
  );
};

export default LeavesPage;
