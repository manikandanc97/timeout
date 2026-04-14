'use client';

import { History, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import type { Holiday } from '@/types/holiday';
import type { Leave } from '@/types/leave';
import LeaveStatusBadge from '@/components/leave/LeaveStatusBadge';
import { workingDaysForLeaveRange } from '@/utils/leave/leaveHelpers';

type Props = {
  leaves: Leave[];
  holidays?: Holiday[];
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';

  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const LeaveHistory = ({ leaves = [], holidays = [] }: Props) => {
  return (
    <div className='flex h-full flex-col rounded-2xl border border-border bg-card p-5 text-card-foreground shadow-md'>
      <div className='mb-6 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-icon-chip-info-bg'>
            <History size={18} className='text-icon-chip-info-fg' />
          </div>
          <h2 className='text-lg font-semibold'>Recent Leave History</h2>
        </div>
        <Link
          href='/leaves'
          className='flex items-center gap-1 text-sm font-medium text-link transition-colors hover:text-link-hover'
        >
          View All <ChevronRight size={16} />
        </Link>
      </div>

      <div className='flex flex-1 flex-col text-left'>
        {leaves.length > 0 ? (
          <div className='space-y-1 text-left'>
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className='flex flex-col gap-2 border-b border-dashed border-border py-4 text-left last:border-0 sm:flex-row sm:items-center sm:gap-8'
              >
                <span className='shrink-0 text-sm font-medium'>
                  {leave.type
                    ?.toLowerCase()
                    ?.replace(/\b\w/g, (c) => c.toUpperCase())}{' '}
                  Leave
                </span>
                <span className='min-w-0 flex-1 text-left text-sm text-muted-foreground'>
                  {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  <span className='mx-2 text-border'>•</span>
                  <span className='text-xs opacity-90'>
                    {workingDaysForLeaveRange(
                      leave.startDate,
                      leave.endDate,
                      holidays,
                    )}{' '}
                    working days
                  </span>
                </span>
                <div className='shrink-0 text-left'>
                  <LeaveStatusBadge status={leave.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-1 flex-col items-center justify-center px-4 py-16 text-center text-muted-foreground'>
            <History size={32} className='mb-3 opacity-20' />
            <p className='text-sm'>No leave history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveHistory;
