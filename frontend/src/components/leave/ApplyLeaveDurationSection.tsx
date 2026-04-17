'use client';

import { Controller, type Control, type FieldErrors } from 'react-hook-form';
import { AlertTriangle, Clock3 } from 'lucide-react';
import type { LeaveFormData } from '@/utils/leave/leaveSchema';
import type { calculateLeaveDays } from '@/utils/leave/leaveHelpers';
import Input from '../ui/Input';

type Props = {
  control: Control<LeaveFormData>;
  errors: FieldErrors<LeaveFormData>;
  todayIso: string;
  startDate: string;
  endDate: string;
  dateStats: ReturnType<typeof calculateLeaveDays>;
  hasDateRange: boolean;
  hasOverlap: boolean;
  daysToDeduct: number;
  lopDays: number;
  balanceDeductedDays: number;
};

export default function ApplyLeaveDurationSection({
  control,
  errors,
  todayIso,
  startDate,
  endDate,
  dateStats,
  hasDateRange,
  hasOverlap,
  daysToDeduct,
  lopDays,
  balanceDeductedDays,
}: Props) {
  return (
    <section className='rounded-2xl border border-border bg-card/90 p-4 shadow-sm backdrop-blur-sm md:p-5'>
      <div className='flex justify-between items-start gap-3'>
        <div>
          <h3 className='text-lg font-semibold text-card-foreground'>Duration</h3>
          <p className='text-xs text-muted-foreground'>Weekends are excluded automatically from working days.</p>
        </div>
        <div className='flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full font-semibold text-[11px] text-primary'>
          <Clock3 size={12} />
          <span>{dateStats.totalCalendar > 0 ? `${dateStats.totalCalendar} calendar days` : 'Awaiting dates'}</span>
        </div>
      </div>

      <div className='gap-3 grid sm:grid-cols-2 mt-4'>
        <Controller
          name='startDate'
          control={control}
          render={({ field }) => (
            <Input id='startDate' label='Start Date' type='date' min={todayIso} max={endDate || undefined} required {...field} />
          )}
        />
        <Controller
          name='endDate'
          control={control}
          render={({ field }) => (
            <Input id='endDate' label='End Date' type='date' min={startDate || todayIso} required {...field} />
          )}
        />
      </div>

      {errors.startDate || errors.endDate ? (
        <div className='space-y-1 mt-2 text-destructive text-xs'>
          {errors.startDate?.message ? (
            <p className='flex items-center gap-1'>
              <AlertTriangle size={11} />
              {errors.startDate.message}
            </p>
          ) : null}
          {errors.endDate?.message ? (
            <p className='flex items-center gap-1'>
              <AlertTriangle size={11} />
              {errors.endDate.message}
            </p>
          ) : null}
        </div>
      ) : null}
      {hasDateRange && hasOverlap ? (
        <p className='flex items-center gap-1 mt-2 text-destructive text-xs'>
          <AlertTriangle size={11} />
          You already applied for one or more of these dates.
        </p>
      ) : null}

      {hasDateRange ? (
        <div className='gap-3 grid grid-cols-2 md:grid-cols-4 mt-4'>
          {[
            { label: 'Calendar days', value: dateStats.totalCalendar, tone: 'text-card-foreground' },
            { label: 'Weekends skipped', value: dateStats.weekends, tone: 'text-amber-600' },
            { label: 'Holidays skipped', value: dateStats.holidayWeekdays, tone: 'text-emerald-600' },
            { label: 'Working days', value: daysToDeduct, tone: 'text-primary' },
          ].map((item) => (
            <div key={item.label} className='rounded-xl border border-border bg-muted/60 px-3 py-2 text-center'>
              <p className='text-[11px] font-medium uppercase tracking-wide text-muted-foreground'>{item.label}</p>
              <p className={`text-lg font-bold ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </div>
      ) : null}

      {hasDateRange && lopDays > 0 ? (
        <div className='mt-3 rounded-xl border border-warning-muted-foreground/25 bg-warning-muted px-3 py-2 text-xs text-warning-muted-foreground'>
          <p className='font-semibold'>Leave balance exceeded: {lopDays} day(s) will be treated as Loss of Pay (LOP).</p>
          <p className='mt-1'>Balance deduction: {balanceDeductedDays} day(s) | LOP: {lopDays} day(s)</p>
        </div>
      ) : null}
    </section>
  );
}
