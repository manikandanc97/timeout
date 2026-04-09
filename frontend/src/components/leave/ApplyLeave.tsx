'use client';

import api from '@/services/api';
import { leaveSchema, type LeaveFormData } from '@/utils/leave/leaveSchema';
import type { Leave, LeaveBalance, LeaveType } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import type { Gender } from '@/types/user';
import { LEAVE_BALANCE_LABELS } from '@/constants/leave';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '../ui/Button';
import {
  AlertTriangle,
  ShieldCheck,
  CalendarClock,
  Stethoscope,
  Baby,
  Umbrella,
  Sparkles,
  Info,
  Clock3,
} from 'lucide-react';
import Input from '../ui/Input';
import { calculateLeaveDays } from '@/utils/leave/leaveHelpers';
import { startDate as formatDate } from '@/utils/leave/leaveHelpers';

type Props = {
  userGender: Gender | string;
  balance: LeaveBalance | null;
  holidays: Holiday[];
  history: Leave[];
  onSuccess?: (leave: Leave | null | undefined) => void;
};

const leaveTypeConfig: Record<LeaveType, {
  icon: React.ElementType;
  color: string;
  bg: string;
  border: string;
  ring: string;
  label: string;
  desc: string;
}> = {
  ANNUAL: {
    icon: Umbrella,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50',
    border: 'border-cyan-200',
    ring: 'ring-cyan-500',
    label: 'Annual Leave',
    desc: 'Planned time off',
  },
  SICK: {
    icon: Stethoscope,
    color: 'text-rose-500',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    ring: 'ring-rose-400',
    label: 'Sick Leave',
    desc: 'Medical and wellness',
  },
  MATERNITY: {
    icon: Baby,
    color: 'text-pink-500',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    ring: 'ring-pink-400',
    label: 'Maternity Leave',
    desc: 'Parental care',
  },
  PATERNITY: {
    icon: Baby,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    ring: 'ring-violet-400',
    label: 'Paternity Leave',
    desc: 'Parental care',
  },
};

const balanceKeyMap: Record<LeaveType, keyof LeaveBalance> = {
  ANNUAL: 'annual',
  SICK: 'sick',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
};

const formatFriendlyDate = (dateStr?: string) => {
  if (!dateStr) return null;
  const parsed = new Date(dateStr);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return parsed.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const ApplyLeave = ({ userGender, balance, holidays, history, onSuccess }: Props) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: undefined,
      startDate: '',
      endDate: '',
      reason: '',
    } as Partial<LeaveFormData>,
  });

  const type = watch('type');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const dateStats = useMemo(
    () => calculateLeaveDays(startDate, endDate, holidays),
    [startDate, endDate, holidays],
  );

  const todayIso = useMemo(() => formatDate(new Date()), []);

  const leaveOptions = useMemo<LeaveType[]>(() => {
    const options: LeaveType[] = ['ANNUAL', 'SICK'];
    if (userGender === 'FEMALE') options.push('MATERNITY');
    else if (userGender === 'MALE') options.push('PATERNITY');
    return options;
  }, [userGender]);

  const selectedBalance = useMemo(() => {
    if (!type || !balance) return null;
    const key = balanceKeyMap[type as LeaveType];
    return key ? (balance[key] ?? null) : null;
  }, [type, balance]);

  const daysToDeduct = dateStats.workingDays;
  const balanceAfter =
    selectedBalance !== null ? selectedBalance - daysToDeduct : null;
  const isOverdrawn = balanceAfter !== null && balanceAfter < 0;
  const hasDateRange = Boolean(startDate && endDate);
  const hasOverlap = useMemo(() => {
    if (!hasDateRange || !history?.length) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;

    return history.some((leave) => {
      const leaveStart = new Date(leave.fromDate ?? leave.startDate ?? '');
      const leaveEnd = new Date(leave.toDate ?? leave.endDate ?? '');
      if (
        Number.isNaN(leaveStart.getTime()) ||
        Number.isNaN(leaveEnd.getTime()) ||
        leave.status === 'REJECTED'
      )
        return false;
      return leaveStart <= end && start <= leaveEnd;
    });
  }, [hasDateRange, history, startDate, endDate]);

  const activeConfig =
    type && type in leaveTypeConfig
      ? leaveTypeConfig[type as LeaveType]
      : null;

  const upcomingHoliday = useMemo(() => {
    if (!holidays || holidays.length === 0) return null;
    const today = new Date();
    const normalized = holidays
      .map((holiday) => ({
        ...holiday,
        dateObj: new Date(holiday.date),
      }))
      .filter((holiday) => !Number.isNaN(holiday.dateObj.getTime()))
      .filter((holiday) => holiday.dateObj >= today)
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());
    return normalized[0] ?? null;
  }, [holidays]);

  const lastRequest = useMemo(() => {
    if (!history || history.length === 0) return null;
    const sorted = [...history].sort((a, b) => {
      const aDate = new Date(a.fromDate ?? a.startDate ?? 0).getTime();
      const bDate = new Date(b.fromDate ?? b.startDate ?? 0).getTime();
      return bDate - aDate;
    });
    return sorted[0];
  }, [history]);

  const balanceProgress = useMemo(() => {
    if (!selectedBalance || selectedBalance <= 0) return null;
    const remaining = Math.max(selectedBalance - daysToDeduct, 0);
    const percent = Math.min(
      100,
      Math.max(0, (remaining / selectedBalance) * 100),
    );
    return { remaining, percent };
  }, [selectedBalance, daysToDeduct]);

  const startPreview = formatFriendlyDate(startDate);
  const endPreview = formatFriendlyDate(endDate);

  const onSubmit = async (data: LeaveFormData) => {
    try {
      if (hasOverlap) {
        toast.error('You already have a leave for these dates.');
        return;
      }
      const response = await api.post('/leaves', {
        type: data.type,
        fromDate: data.startDate,
        toDate: data.endDate,
        reason: data.reason,
      });
      toast.success('Leave request submitted successfully');
      reset();
      onSuccess?.((response as any)?.data?.leave);
    } catch {
      toast.error('Failed to submit leave request. Please try again.');
    }
  };

  return (
    <div className='relative bg-white/90 shadow-xl border border-gray-100 rounded-3xl overflow-hidden'>
      <div className='-top-24 -left-32 absolute bg-primary/10 blur-3xl rounded-full w-64 h-64' />
      <div className='-right-20 -bottom-24 absolute bg-indigo-100 blur-3xl rounded-full w-64 h-64' />
      <div className='z-10 relative flex flex-col gap-6 p-6'>
        <div className='flex flex-wrap justify-between items-start gap-4 border-gray-100 border-b'>
          <div className='flex items-start gap-3'>
            <div className='place-items-center grid bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 shadow-inner shadow-primary/15 rounded-2xl w-12 h-12 text-primary'>
              <CalendarClock size={20} />
            </div>
            <div>
              <p className='font-semibold text-[11px] text-gray-400 uppercase tracking-[0.14em]'>
                Leave desk
              </p>
              <h2 className='font-bold text-gray-900 text-2xl leading-tight'>
                Apply for leave
              </h2>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className='gap-5 grid lg:grid-cols-[1.7fr,1fr]'
        >
          <div className='space-y-5'>
            <div className='gap-4 grid'>
              <section className='bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
                <div className='flex justify-between items-center gap-3'>
                  <div>
                    <h3 className='font-semibold text-gray-900 text-lg'>
                      Choose leave type
                    </h3>
                  </div>
                  <div className='flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full font-medium text-[11px] text-gray-600'>
                    <ShieldCheck size={12} className='text-primary' />
                    <span>
                      {LEAVE_BALANCE_LABELS[type as LeaveType] ??
                        'Balance aware'}
                    </span>
                  </div>
                </div>

                <Controller
                  name='type'
                  control={control}
                  render={({ field }) => (
                    <div className='gap-3 grid grid-cols-3 mt-3 pb-1'>
                      {leaveOptions.map((key) => {
                        const cfg = leaveTypeConfig[key];
                        const Icon = cfg.icon;
                        const isSelected = field.value === key;
                        const balanceLabel = balance
                          ? (balance[balanceKeyMap[key]] ?? null)
                          : null;

                        return (
                          <Button
                            key={key}
                            onClick={() => setValue('type', key)}
                            className={`!bg-transparent !text-gray-800 !p-0 !h-auto flex-col group relative flex min-w-[230px] max-w-[260px] gap-3 !rounded-xl border px-4 py-4 !text-left transition-all duration-150 hover:-translate-y-0.5 hover:!shadow-md ${
                              isSelected
                                ? `${cfg.bg} !border-transparent ring-2 ring-offset-2 ring-offset-white ${cfg.ring} !shadow-[0_10px_28px_rgba(0,0,0,0.08)]`
                                : 'border-gray-200 !bg-gray-50'
                            }`}
                          >
                            <div className='flex items-start gap-3'>
                              <div
                                className={`flex h-10 w-10 items-center justify-center rounded-lg border bg-white shadow-sm ${
                                  isSelected ? cfg.border : 'border-gray-200'
                                }`}
                              >
                                <Icon
                                  size={18}
                                  className={
                                    isSelected ? cfg.color : 'text-gray-500'
                                  }
                                />
                              </div>
                              <div className='space-y-1'>
                                <p
                                  className={`text-sm font-semibold leading-tight ${
                                    isSelected ? cfg.color : 'text-gray-800'
                                  }`}
                                >
                                  {cfg.label}
                                </p>
                                <p className='text-gray-500 text-xs'>
                                  {cfg.desc}
                                </p>
                              </div>
                              {balanceLabel !== null && (
                                <div
                                  className={`ml-auto items-center justify-center px-2 py-1 text-xs font-semibold ${
                                    isSelected
                                      ? `${cfg.border} ${cfg.color}`
                                      : 'border-gray-200 text-gray-600'
                                  }`}
                                >
                                  {balanceLabel}d
                                </div>
                              )}
                            </div>
                          </Button>
                        );
                      })}
                    </div>
                  )}
                />
                {errors.type && (
                  <p className='flex items-center gap-1 mt-2 text-red-500 text-xs'>
                    <AlertTriangle size={11} />
                    {errors.type.message}
                  </p>
                )}
              </section>

              <section className='bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
                <div className='flex justify-between items-start gap-3'>
                  <div>
                    <h3 className='font-semibold text-gray-900 text-lg'>
                      Duration
                    </h3>
                    <p className='text-gray-500 text-xs'>
                      Weekends are excluded automatically from working days.
                    </p>
                  </div>
                  <div className='flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full font-semibold text-[11px] text-primary'>
                    <Clock3 size={12} />
                    <span>
                      {dateStats.totalCalendar > 0
                        ? `${dateStats.totalCalendar} calendar days`
                        : 'Awaiting dates'}
                    </span>
                  </div>
                </div>

                <div className='gap-3 grid sm:grid-cols-2 mt-4'>
                  <Controller
                    name='startDate'
                    control={control}
                    render={({ field }) => (
                      <Input
                        id='startDate'
                        label='Start Date'
                        type='date'
                        min={todayIso}
                        max={endDate || undefined}
                        {...field}
                      />
                    )}
                  />
                  <Controller
                    name='endDate'
                    control={control}
                    render={({ field }) => (
                      <Input
                        id='endDate'
                        label='End Date'
                        type='date'
                        min={startDate || todayIso}
                        {...field}
                      />
                    )}
                  />
                </div>

                {(errors.startDate || errors.endDate) && (
                  <div className='space-y-1 mt-2 text-red-500 text-xs'>
                    {errors.startDate?.message && (
                      <p className='flex items-center gap-1'>
                        <AlertTriangle size={11} />
                        {errors.startDate.message}
                      </p>
                    )}
                    {errors.endDate?.message && (
                      <p className='flex items-center gap-1'>
                        <AlertTriangle size={11} />
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>
                )}
                {hasDateRange && hasOverlap && (
                  <p className='flex items-center gap-1 mt-2 text-red-500 text-xs'>
                    <AlertTriangle size={11} />
                    You already applied for one or more of these dates.
                  </p>
                )}

                {hasDateRange && (
                  <div className='gap-3 grid grid-cols-2 md:grid-cols-4 mt-4'>
                    {[
                      {
                        label: 'Calendar days',
                        value: dateStats.totalCalendar,
                        tone: 'text-gray-800',
                      },
                      {
                        label: 'Weekends skipped',
                        value: dateStats.weekends,
                        tone: 'text-amber-600',
                      },
                      {
                        label: 'Holidays skipped',
                        value: dateStats.holidayWeekdays,
                        tone: 'text-emerald-600',
                      },
                      {
                        label: 'Working days',
                        value: daysToDeduct,
                        tone: 'text-primary',
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className='bg-gray-50 px-3 py-2 border border-gray-100 rounded-xl text-center'
                      >
                        <p className='font-medium text-[11px] text-gray-500 uppercase tracking-wide'>
                          {item.label}
                        </p>
                        <p className={`text-lg font-bold ${item.tone}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <section className='bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
              <div className='flex justify-between items-center gap-3'>
                <div>
                  <h3 className='font-semibold text-gray-900 text-lg'>
                    Reason
                  </h3>
                  <p className='text-gray-500 text-xs'>
                    Keep it short. Your manager will see this note.
                  </p>
                </div>
              </div>

              <div className='mt-4'>
                <Controller
                  name='reason'
                  control={control}
                  render={({ field }) => (
                    <Input
                      id='reason'
                      label='Reason for leave'
                      type='textarea'
                      rows={3}
                      {...field}
                    />
                  )}
                />
                {errors.reason && (
                  <p className='flex items-center gap-1 mt-2 text-red-500 text-xs'>
                    <AlertTriangle size={11} />
                    {errors.reason.message}
                  </p>
                )}
              </div>
            </section>

            <section className='flex md:flex-row flex-col md:items-center gap-4 bg-white/90 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
              <div className='flex flex-col flex-1 gap-1 text-gray-500 text-xs'>
                <div className='flex items-center gap-2 text-gray-600'>
                  <AlertTriangle size={12} className='text-amber-500' />
                  <span>Requests route to your manager for approval.</span>
                </div>
                <div className='flex items-center gap-2 text-gray-600'>
                  <ShieldCheck size={12} className='text-primary' />
                  <span>Typical review time: 1-2 business days.</span>
                </div>
              </div>

              <div className='flex items-center gap-3 md:ml-auto'>
                <Button
                  onClick={() => reset()}
                  className='!bg-transparent inline-flex items-center justify-center hover:!bg-gray-100 px-5 md:px-6 !py-3 border border-gray-200 !rounded-lg font-semibold !text-gray-700 text-sm transition-colors duration-150 shadow-none'
                >
                  Reset
                </Button>
                <Button
                  type='submit'
                  disabled={isSubmitting || isOverdrawn}
                  className='shadow-md shadow-primary/20 px-6 md:px-8 py-3 font-semibold text-sm'
                >
                  {isSubmitting ? (
                    <span className='flex items-center gap-2'>
                      <span className='inline-block border-2 border-white/50 border-t-white rounded-full w-4 h-4 animate-spin' />
                      Submitting...
                    </span>
                  ) : (
                    'Submit request'
                  )}
                </Button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyLeave;
