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
  const [mounted, setMounted] = useState(false);
  const [isPunching, setIsPunching] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Failed to record punch';
      toast.error(message);
    } finally {
      setIsPunching(false);
    }
  };

  const hasPunchedIn = !!todayStatus?.checkIn;
  const hasPunchedOut = !!todayStatus?.checkOut;

  const btnText = !hasPunchedIn ? 'Punch In' : !hasPunchedOut ? 'Punch Out' : 'Done for Today';
  const disabled = loading || isPunching || hasPunchedOut;
  const liveTimeLabel = mounted
    ? currTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '--:--:--';
  const liveDateLabel = mounted
    ? currTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'Loading date...';
  const statusLabel = !hasPunchedIn ? 'Ready to start' : !hasPunchedOut ? 'Currently working' : 'Attendance completed';

  return (
    <section className='relative isolate overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl'>
      <div className='pointer-events-none absolute -left-20 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-16 -right-12 h-40 w-40 rounded-full bg-accent/15 blur-3xl' />

      <div className='relative z-10 flex flex-col gap-5 p-5 sm:p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4'>
          <div className='flex items-start gap-4'>
            <div className='grid h-14 w-14 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
              <Clock size={24} />
            </div>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Attendance desk
              </p>
              <h2 className='mt-0.5 text-3xl font-bold tracking-tight text-primary'>
                {liveTimeLabel}
              </h2>
              <p className='mt-1 text-sm font-medium text-primary/80'>{liveDateLabel}</p>
              <p className='mt-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                {statusLabel}
              </p>
            </div>
          </div>

          <div className='flex w-full flex-col gap-3 sm:w-auto sm:min-w-[220px]'>
            <Button
              onClick={handlePunch}
              disabled={disabled}
              variant={hasPunchedIn && !hasPunchedOut ? 'outline' : 'primary'}
              className='h-12 rounded-2xl! px-5! text-base font-bold'
            >
              {isPunching ? 'Processing...' : btnText}
            </Button>
          </div>
        </div>

        <div className='grid gap-3 md:grid-cols-3'>
          <div className='rounded-2xl border border-border bg-muted/25 px-4 py-3'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Punch In
            </p>
            <p className='mt-2 text-lg font-bold text-card-foreground'>
              {todayStatus?.checkIn
                ? new Date(todayStatus.checkIn).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'}
            </p>
          </div>
          <div className='rounded-2xl border border-border bg-muted/25 px-4 py-3'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Punch Out
            </p>
            <p className='mt-2 text-lg font-bold text-card-foreground'>
              {todayStatus?.checkOut
                ? new Date(todayStatus.checkOut).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : '--:--'}
            </p>
          </div>
          <div className='rounded-2xl border border-border bg-muted/25 px-4 py-3'>
            <p className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              Work Hours
            </p>
            <p className='mt-2 text-lg font-bold text-card-foreground'>
              {todayStatus?.workHours != null ? `${todayStatus.workHours.toFixed(2)} hrs` : '--'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
