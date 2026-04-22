'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { toast } from 'react-hot-toast';
import { punchIn, punchOut } from '@/services/attendanceApi';
import type { AttendanceLog } from '@/types/attendance';
import { Clock } from 'lucide-react';

type Props = {
  todayStatus: AttendanceLog | null;
  onPunch: () => void;
  loading: boolean;
};

export default function PunchCard({ todayStatus, onPunch, loading }: Props) {
  const [currTime, setCurrTime] = useState(new Date());
  const [isPunching, setIsPunching] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePunch = async () => {
    try {
      setIsPunching(true);
      if (!todayStatus?.checkIn) {
        await punchIn();
        toast.success('Punched in successfully');
      } else if (!todayStatus?.checkOut) {
        await punchOut();
        toast.success('Punched out successfully');
      }
      onPunch();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to record punch');
    } finally {
      setIsPunching(false);
    }
  };

  const hasPunchedIn = !!todayStatus?.checkIn;
  const hasPunchedOut = !!todayStatus?.checkOut;

  const btnText = !hasPunchedIn ? 'Punch In' : !hasPunchedOut ? 'Punch Out' : 'Done for Today';
  const disabled = loading || isPunching || hasPunchedOut;

  return (
    <div className='flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm'>
      <div className='bg-primary/5 p-6 text-center text-primary border-b border-border'>
        <Clock size={40} className='mx-auto mb-2 opacity-80' />
        <h2 className='text-3xl font-bold tracking-tight'>
          {currTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </h2>
        <p className='text-sm mt-1 opacity-80 font-medium'>
          {currTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>
      <div className='p-6 flex flex-col gap-4'>
        <div className='flex justify-between items-center text-sm px-2'>
          <div className='flex flex-col'>
            <span className='text-muted-foreground'>Punch In at</span>
            <span className='font-semibold'>{todayStatus?.checkIn ? new Date(todayStatus.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
          </div>
          <div className='flex flex-col items-end'>
            <span className='text-muted-foreground'>Punch Out at</span>
            <span className='font-semibold'>{todayStatus?.checkOut ? new Date(todayStatus.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}</span>
          </div>
        </div>
        <Button
          onClick={handlePunch}
          disabled={disabled}
          variant={hasPunchedIn && !hasPunchedOut ? 'outline' : 'primary'}
          className='w-full mt-2 font-bold py-3'
        >
          {isPunching ? 'Processing...' : btnText}
        </Button>
      </div>
    </div>
  );
}
