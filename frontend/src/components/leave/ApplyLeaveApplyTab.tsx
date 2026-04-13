'use client';

import { LEAVE_BALANCE_LABELS } from '@/constants/leave';
import type { LeaveBalance, LeaveType } from '@/types/leave';
import type { LeaveFormData } from '@/utils/leave/leaveSchema';
import { calculateLeaveDays } from '@/utils/leave/leaveHelpers';
import {
  AlertTriangle,
  ShieldCheck,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react';
import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormReset,
  UseFormSetValue,
} from 'react-hook-form';
import { Controller } from 'react-hook-form';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { balanceKeyMap, leaveTypeConfig } from './applyLeaveConfig';

export type ApplyLeaveApplyTabProps = {
  control: Control<LeaveFormData>;
  errors: FieldErrors<LeaveFormData>;
  isSubmitting: boolean;
  onSubmit: (data: LeaveFormData) => void | Promise<void>;
  handleSubmit: UseFormHandleSubmit<LeaveFormData, LeaveFormData>;
  reset: UseFormReset<LeaveFormData>;
  setValue: UseFormSetValue<LeaveFormData>;
  type: LeaveFormData['type'];
  startDate: string;
  endDate: string;
  todayIso: string;
  leaveOptions: LeaveType[];
  leaveTypeStart: number;
  setLeaveTypeStart: React.Dispatch<React.SetStateAction<number>>;
  canGoPrev: boolean;
  canGoNext: boolean;
  maxLeaveTypeStart: number;
  balance: LeaveBalance | null;
  dateStats: ReturnType<typeof calculateLeaveDays>;
  daysToDeduct: number;
  hasDateRange: boolean;
  hasOverlap: boolean;
  isOverdrawn: boolean;
  canSubmitLeave: boolean;
};

const ApplyLeaveApplyTab = ({
  control,
  errors,
  isSubmitting,
  onSubmit,
  handleSubmit,
  reset,
  setValue,
  type,
  startDate,
  endDate,
  todayIso,
  leaveOptions,
  leaveTypeStart,
  setLeaveTypeStart,
  canGoPrev,
  canGoNext,
  maxLeaveTypeStart,
  balance,
  dateStats,
  daysToDeduct,
  hasDateRange,
  hasOverlap,
  isOverdrawn,
  canSubmitLeave,
}: ApplyLeaveApplyTabProps) => (
  <form
    onSubmit={handleSubmit(onSubmit)}
    className='gap-5 grid lg:grid-cols-[1.7fr,1fr]'
  >
    <div className='min-w-0 space-y-5'>
      <div className='gap-4 grid'>
        <section className='overflow-hidden bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
          <div className='flex justify-between items-center gap-3'>
            <div>
              <h3 className='font-semibold text-gray-900 text-lg'>
                Choose leave type
              </h3>
            </div>
            <div className='flex items-center gap-2'>
              <div className='hidden sm:flex items-center gap-2'>
                <button
                  type='button'
                  onClick={() => setLeaveTypeStart((prev) => Math.max(prev - 1, 0))}
                  disabled={!canGoPrev}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                    canGoPrev
                      ? 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                  }`}
                  aria-label='Show previous leave types'
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type='button'
                  onClick={() =>
                    setLeaveTypeStart((prev) =>
                      Math.min(prev + 1, maxLeaveTypeStart),
                    )
                  }
                  disabled={!canGoNext}
                  className={`inline-flex h-8 w-8 items-center justify-center rounded-full border transition-colors ${
                    canGoNext
                      ? 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                      : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300'
                  }`}
                  aria-label='Show next leave types'
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              <div className='flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-full font-medium text-[11px] text-gray-600'>
                <ShieldCheck size={12} className='text-primary' />
                <span>
                  {LEAVE_BALANCE_LABELS[type as LeaveType] ?? 'Balance aware'}
                </span>
              </div>
            </div>
          </div>

          <Controller
            name='type'
            control={control}
            render={({ field }) => (
              <div className='mt-3 w-full max-w-full overflow-hidden'>
                <div
                  className='flex gap-3 transition-transform duration-300 ease-out'
                  style={{
                    transform: `translateX(calc(-${leaveTypeStart} * ((100% - 1.5rem) / 3 + 0.75rem)))`,
                  }}
                >
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
                        type='button'
                        unstyled
                        onClick={() => setValue('type', key)}
                        className={`group relative flex w-[calc((100%-1.5rem)/3)] shrink-0 flex-col gap-3 rounded-xl border px-4 py-4 text-left !h-auto !bg-transparent !text-gray-800 transition-all duration-150 ${
                          isSelected
                            ? `${cfg.bg} ${cfg.border} border-2`
                            : 'border-gray-200 !bg-gray-50'
                        }`}
                      >
                        {isSelected ? (
                          <div
                            className={`absolute right-3 top-3 z-10 inline-flex h-5 w-5 translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white ${cfg.color} ${cfg.bg}`}
                          >
                            <Check size={12} strokeWidth={3} />
                          </div>
                        ) : null}
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
                            <p className='text-gray-500 text-xs'>{cfg.desc}</p>
                          </div>
                          {balanceLabel !== null ? (
                            <div
                              className={`ml-auto items-center justify-center px-2 py-1 text-xs font-semibold ${
                                isSelected
                                  ? `${cfg.border} ${cfg.color}`
                                  : 'border-gray-200 text-gray-600'
                              }`}
                            >
                              {balanceLabel}d
                            </div>
                          ) : null}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>
            )}
          />
          {errors.type ? (
            <p className='flex items-center gap-1 mt-2 text-red-500 text-xs'>
              <AlertTriangle size={11} />
              {errors.type.message}
            </p>
          ) : null}
        </section>

        <section className='bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
          <div className='flex justify-between items-start gap-3'>
            <div>
              <h3 className='font-semibold text-gray-900 text-lg'>Duration</h3>
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
                  required
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
                  required
                  {...field}
                />
              )}
            />
          </div>

          {errors.startDate || errors.endDate ? (
            <div className='space-y-1 mt-2 text-red-500 text-xs'>
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
            <p className='flex items-center gap-1 mt-2 text-red-500 text-xs'>
              <AlertTriangle size={11} />
              You already applied for one or more of these dates.
            </p>
          ) : null}

          {hasDateRange ? (
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
          ) : null}
        </section>
      </div>

      <section className='bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
        <div className='flex justify-between items-center gap-3'>
          <div>
            <h3 className='font-semibold text-gray-900 text-lg'>Reason</h3>
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
                required
                {...field}
              />
            )}
          />
          {errors.reason ? (
            <p className='flex items-center gap-1 mt-2 text-red-500 text-xs'>
              <AlertTriangle size={11} />
              {errors.reason.message}
            </p>
          ) : null}
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
            type='button'
            variant='outline'
            onClick={() => reset()}
            className='inline-flex justify-center items-center shadow-none px-5 md:px-6 py-3 font-semibold text-sm'
          >
            Reset
          </Button>
          <Button
            type='submit'
            disabled={isSubmitting || isOverdrawn || !canSubmitLeave}
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
);

export default ApplyLeaveApplyTab;
