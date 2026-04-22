'use client';

import React, { useState } from 'react';
import type { AttendanceLog } from '@/types/attendance';
import RegularizeModal from './RegularizeModal';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';

type Props = {
  history: AttendanceLog[];
  loading: boolean;
  onRefresh: () => void;
};

export default function AttendanceHistory({ history, loading, onRefresh }: Props) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  if (loading) {
    return (
      <div className='rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
        <div className='px-6 py-5 border-b border-border flex justify-between items-center'>
          <Skeleton className='h-6 w-40' />
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border'>
              <tr>
                {['w-16', 'w-16', 'w-18', 'w-14', 'w-20', 'w-14'].map((width, index) => (
                  <th key={`attendance-loading-head-${index}`} className='px-6 py-3 font-medium'>
                    <Skeleton className={`h-3 ${width}`} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {Array.from({ length: 5 }, (_, index) => (
                <tr key={`attendance-loading-row-${index}`} className='bg-card/90'>
                  <td className='px-6 py-4'><Skeleton className='h-4 w-24' /></td>
                  <td className='px-6 py-4'><Skeleton className='h-4 w-16' /></td>
                  <td className='px-6 py-4'><Skeleton className='h-4 w-16' /></td>
                  <td className='px-6 py-4'><Skeleton className='h-6 w-20 rounded-full' /></td>
                  <td className='px-6 py-4'><Skeleton className='h-4 w-14' /></td>
                  <td className='px-6 py-4 text-right'><Skeleton className='ml-auto h-8 w-24 rounded-md' /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT': return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
      case 'ABSENT': return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      case 'HALF_DAY': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className='rounded-2xl border border-border bg-card shadow-sm overflow-hidden'>
      <div className='px-6 py-5 border-b border-border flex justify-between items-center'>
        <h3 className='font-semibold text-lg'>Recent Attendance</h3>
      </div>
      
      {history.length === 0 ? (
        <div className='px-6 py-12 text-center text-muted-foreground'>
          No attendance logs found for recent days.
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-sm text-left'>
            <thead className='text-xs text-muted-foreground uppercase bg-muted/30 border-b border-border'>
              <tr>
                <th className='px-6 py-3 font-medium'>Date</th>
                <th className='px-6 py-3 font-medium'>Check In</th>
                <th className='px-6 py-3 font-medium'>Check Out</th>
                <th className='px-6 py-3 font-medium'>Status</th>
                <th className='px-6 py-3 font-medium'>Work Hours</th>
                <th className='px-6 py-3 font-medium text-right'>Action</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {history.map((log) => (
                <tr key={log.id} className='hover:bg-muted/20 transition-colors'>
                  <td className='px-6 py-4 font-medium'>
                    {new Date(log.date).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                  </td>
                  <td className='px-6 py-4'>
                    {log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </td>
                  <td className='px-6 py-4'>
                    {log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--'}
                  </td>
                  <td className='px-6 py-4'>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(log.status)}`}>
                      {log.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className='px-6 py-4 text-muted-foreground'>
                    {log.workHours ? `${log.workHours} hrs` : '--'}
                  </td>
                  <td className='px-6 py-4 text-right'>
                    {/* Allow regularization if missing punches or half day/absent */}
                    {(!log.checkIn || !log.checkOut || log.status !== 'PRESENT') && (
                      <Button
                        variant='outline'
                        onClick={() => setSelectedDate(log.date)}
                        className='h-8 px-2 py-1 text-xs'
                      >
                        Regularize
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedDate && (
        <RegularizeModal
          isOpen={!!selectedDate}
          onClose={() => setSelectedDate(null)}
          date={selectedDate}
          onSuccess={() => {
            setSelectedDate(null);
            onRefresh();
          }}
        />
      )}
    </div>
  );
}
