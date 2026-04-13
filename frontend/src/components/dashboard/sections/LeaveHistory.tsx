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
    <div className='flex flex-col bg-white shadow-md p-5 rounded-2xl h-full'>
      <div className='flex justify-between items-center mb-6'>
        <div className='flex items-center gap-2'>
          <div className='flex justify-center items-center bg-blue-50 rounded-lg w-8 h-8'>
            <History size={18} className='text-blue-500' />
          </div>
          <h2 className='font-semibold text-lg'>Recent Leave History</h2>
        </div>
        <Link
          href='/leaves'
          className='flex items-center gap-1 font-medium text-blue-500 hover:text-blue-600 text-sm transition-colors'
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
                className='flex flex-col gap-2 border-b border-dashed border-gray-200 py-4 text-left last:border-0 sm:flex-row sm:items-center sm:gap-8'
              >
                <span className='shrink-0 font-medium text-gray-700 text-sm'>
                  {leave.type
                    ?.toLowerCase()
                    ?.replace(/\b\w/g, (c) => c.toUpperCase())}{' '}
                  Leave
                </span>
                <span className='min-w-0 flex-1 text-left text-gray-500 text-sm'>
                  {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                  <span className='mx-2 text-gray-300'>•</span>
                  <span className='text-gray-400 text-xs'>
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
          <div className='flex flex-1 flex-col items-center justify-center px-4 py-16 text-center text-gray-400'>
            <History size={32} className='mb-3 opacity-20' />
            <p className='text-sm'>No leave history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveHistory;
