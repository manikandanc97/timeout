import MyLeavesList from '@/components/leave/MyLeavesList';
import { getLeaveHistory } from '@/services/dashboardService';
import type { Leave } from '@/types/leave';
import React from 'react';

const LeavesPage = async () => {
  const response = await getLeaveHistory();
  const leaves: Leave[] = Array.isArray(response)
    ? response
    : ((response as { data?: Leave[] })?.data ?? []);

  console.log('history response', response);

  return <MyLeavesList leaves={leaves} />;
};

export default LeavesPage;
