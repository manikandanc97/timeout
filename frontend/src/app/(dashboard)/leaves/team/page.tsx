import TeamLeavesList from '@/components/leave/TeamLeavesList';
import { getLeaveHistory } from '@/services/dashboardService';
import { serverFetch } from '@/services/serverApi';
import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';
import type { User } from '@/types/user';
import React from 'react';

const TeamLeavesPage = async () => {
  const [response, profile, holidays] = await Promise.all([
    getLeaveHistory(),
    serverFetch<User>('/profile').catch(() => null),
    serverFetch<Holiday[]>('/holidays').catch(() => []),
  ]);

  const leaves: Leave[] = Array.isArray(response)
    ? response
    : ((response as { data?: Leave[] })?.data ?? []);

  const currentUserId = profile?.id ?? 0;

  return (
    <div className='flex flex-col gap-6'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight text-foreground'>Team Leaves</h1>
        <p className='text-muted-foreground'>See when your colleagues are out to plan your work accordingly.</p>
      </div>
      
      <TeamLeavesList
        leaves={leaves}
        currentUserId={currentUserId}
        holidays={Array.isArray(holidays) ? holidays : []}
      />
    </div>
  );
};

export default TeamLeavesPage;
