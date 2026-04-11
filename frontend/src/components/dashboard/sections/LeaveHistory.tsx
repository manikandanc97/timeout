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

      <div className='flex flex-col flex-1'>
        {leaves.length > 0 ? (
          <div className='space-y-1'>
            {leaves.map((leave) => (
              <div
                key={leave.id}
                className='flex justify-between items-center py-4 border-gray-200 last:border-0 border-b border-dashed'
              >
                <span className='flex-1 font-medium text-gray-700 text-sm'>
                  {leave.type
                    ?.toLowerCase()
                    ?.replace(/\b\w/g, (c) => c.toUpperCase())}{' '}
                  Leave
                </span>
                <div className='flex flex-1 justify-center'>
                  <span className='text-gray-500 text-sm whitespace-nowrap'>
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
                </div>
                <div className='flex flex-1 justify-end'>
                  <LeaveStatusBadge status={leave.status} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className='flex flex-col flex-1 justify-center items-center py-10 text-gray-400'>
            <History size={32} className='opacity-20 mb-3' />
            <p className='text-sm'>No leave history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveHistory;
