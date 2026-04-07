'use client';

import {
  History,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

export type Leave = {
  id: number;
  type: string;
  fromDate: string;
  toDate: string;
  status: string;
};

type Props = {
  leaves: Leave[];
};

export const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
      return (
        <span className='bg-green-100 px-3 py-1.5 rounded-md font-semibold text-emerald-700 text-xs'>
          Approved
        </span>
      );
    case 'REJECTED':
      return (
        <span className='bg-red-100 px-3 py-1.5 rounded-md font-semibold text-rose-700 text-xs'>
          Rejected
        </span>
      );
    default:
      return (
        <span className='bg-orange-100 px-3 py-1.5 rounded-md font-semibold text-amber-700 text-xs'>
          Pending
        </span>
      );
  }
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return 'N/A';

  return new Date(dateStr).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getLeaveDays = (fromDate: string, toDate: string) => {
  const from = new Date(fromDate);
  const to = new Date(toDate);

  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

const LeaveHistory = ({ leaves = [] }: Props) => {
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
                    {formatDate(leave.fromDate)} → {formatDate(leave.toDate)}
                    <span className='mx-2 text-gray-300'>•</span>
                    <span className='text-gray-400 text-xs'>
                      {getLeaveDays(leave.fromDate, leave.toDate)} days
                    </span>
                  </span>
                </div>
                <div className='flex flex-1 justify-end'>
                  {getStatusBadge(leave.status)}
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
