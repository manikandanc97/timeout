'use client';

import api from '@/services/api';
import { leaveSchema, type LeaveFormData } from '@/utils/leave/leaveSchema';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import Button from '../ui/Button';
import { AlertTriangle, Info, ShieldCheck } from 'lucide-react';
import {
  LEAVE_BALANCE_LABELS,
  LEAVE_POLICY,
  type LeavePolicyKey,
} from '@/utils/leave/leaveConstants';
import Select from '../ui/Select';
import Input from '../ui/Input';
import { calculateLeaveDays } from '@/utils/leave/leaveHelpers';
import { startDate as formatDate } from '@/utils/leave/leaveHelpers';

type Balance = {
  annual: number;
  sick: number;
  maternity?: number;
  paternity?: number;
};

type Holiday = {
  id: number;
  date: string;
  name: string;
};

type Leave = {
  id: number;
  type: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
};

type Props = {
  userGender: string;
  balance: Balance | null;
  holidays: Holiday[];
  history: Leave[];
};

const ApplyLeave = ({ userGender, balance }: Props) => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: '',
      startDate: '',
      endDate: '',
      reason: '',
    },
  });

  const type = watch('type');
  const startDate = watch('startDate');
  const endDate = watch('endDate');

  const selectedType = type as LeavePolicyKey;

  const dateStats = useMemo(() => {
    return calculateLeaveDays(startDate, endDate);
  }, [startDate, endDate]);

  const todayIso = useMemo(() => formatDate(new Date()), []);

  const leaveOptions = useMemo(() => {
    const options = [
      { value: 'ANNUAL_LEAVE', label: 'Annual Leave' },
      { value: 'SICK_LEAVE', label: 'Sick Leave' },
    ];
    if (userGender === 'FEMALE') {
      options.push({ value: 'MATERNITY_LEAVE', label: 'Maternity Leave' });
    } else if (userGender === 'MALE') {
      options.push({ value: 'PATERNITY_LEAVE', label: 'Paternity Leave' });
    }
    return options;
  }, [userGender]);

  const selectedBalance = useMemo(() => {
    if (!type || !balance) return null;

    const balanceKeyMap: Record<string, keyof Balance> = {
      ANNUAL_LEAVE: 'annual',
      SICK_LEAVE: 'sick',
      MATERNITY_LEAVE: 'maternity',
      PATERNITY_LEAVE: 'paternity',
    };

    const key = balanceKeyMap[type];

    return key ? (balance[key] ?? null) : null;
  }, [type, balance]);

  const daysToDeduct = dateStats.workingDays;
  const balanceAfter =
    selectedBalance !== null ? selectedBalance - daysToDeduct : null;

  const isOverdrawn = balanceAfter !== null && balanceAfter < 0;
  const hasDateRange = startDate && endDate;

  const onSubmit = async (data: LeaveFormData) => {
    try {
      await api.post('/leave/apply', {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      });
      toast.success('Leave request submitted successfully');
      reset();
    } catch (error) {
      toast.error('Failed to submit leave request. Please try again.');
    }
  };

  return (
    <div className='space-y-6 bg-white shadow-md p-5 rounded-2xl'>
      <div className='flex justify-between items-center'>
        <h2 className='font-semibold text-lg'>Apply Leave</h2>
        {hasDateRange && (
          <div className='text-gray-500 text-xs'>
            Leave days:{' '}
            <span className='font-semibold text-primary'>
              {daysToDeduct || 0}
            </span>
          </div>
        )}
      </div>

      <form className='space-y-4' onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name='type'
          control={control}
          render={({ field }) => (
            <Select
              id='leave-type'
              label='Leave Type'
              value={field.value}
              onChange={field.onChange}
              options={leaveOptions}
              placeholder='Select leave type'
              hideLabel
              selectClassName='bg-gray-50 focus:bg-white border-gray-200'
            />
          )}
        />
        {errors.type && (
          <p className='text-red-600 text-xs'>{errors.type.message}</p>
        )}

        <div className='gap-3 grid sm:grid-cols-2'>
          <Controller
            name='startDate'
            control={control}
            render={({ field }) => (
              <Input
                id='startDate'
                label='Start Date'
                type='date'
                placeholder='Start Date'
                hideLabel
                min={todayIso}
                max={endDate || undefined}
                {...field}
                inputClassName='bg-gray-50 focus:bg-white border-gray-200'
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
                placeholder='End Date'
                hideLabel
                min={startDate || todayIso}
                {...field}
                inputClassName='bg-gray-50 focus:bg-white border-gray-200'
              />
            )}
          />
        </div>
        {(errors.startDate || errors.endDate) && (
          <div className='space-y-1 text-red-600 text-xs'>
            {errors.startDate?.message && <p>{errors.startDate.message}</p>}
            {errors.endDate?.message && <p>{errors.endDate.message}</p>}
          </div>
        )}

        <Controller
          name='reason'
          control={control}
          render={({ field }) => (
            <Input
              id='reason'
              label='Reason'
              type='textarea'
              rows={4}
              placeholder='Reason'
              hideLabel
              {...field}
              inputClassName='bg-gray-50 focus:bg-white border-gray-200'
            />
          )}
        />
        {errors.reason && (
          <p className='text-red-600 text-xs'>{errors.reason.message}</p>
        )}

        {type && LEAVE_POLICY[selectedType] && (
          <div className='flex items-start gap-2 bg-primary/5 px-4 py-3 border border-primary/15 rounded-xl text-gray-700 text-sm'>
            <Info size={16} className='mt-0.5 text-primary' />
            <div>
              <p className='font-semibold text-primary'>
                {LEAVE_BALANCE_LABELS[selectedType]} leave policy
              </p>
              <p className='mt-1 leading-relaxed'>
                {LEAVE_POLICY[selectedType]}
              </p>
            </div>
          </div>
        )}

        {type && (
          <div className='gap-3 grid sm:grid-cols-3 text-sm'>
            <div className='bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg'>
              <p className='text-gray-500 text-xs'>Current balance</p>
              <p className='font-semibold text-gray-800'>
                {selectedBalance ?? '-'}
              </p>
            </div>
            <div className='bg-gray-50 px-3 py-2 border border-gray-200 rounded-lg'>
              <p className='text-gray-500 text-xs'>Requested</p>
              <p className='font-semibold text-gray-800'>
                {daysToDeduct || 0} days
              </p>
            </div>
            <div
              className={`px-3 py-2 rounded-lg border ${
                isOverdrawn
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
              }`}
            >
              <p className='text-xs'>
                {isOverdrawn ? 'Overdrawn' : 'After approval'}
              </p>
              <p className='font-semibold'>{balanceAfter ?? '-'}</p>
            </div>
          </div>
        )}

        <div className='flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3 pt-3 border-gray-200 border-t'>
          <div className='space-y-1 text-gray-600 text-sm'>
            <div className='flex items-center gap-2'>
              <AlertTriangle size={15} className='text-amber-500' />
              <span>Request will be sent to your manager for approval.</span>
            </div>
            <div className='flex items-center gap-2'>
              <ShieldCheck size={15} className='text-primary' />
              <span>Reviewed in 1-2 business days.</span>
            </div>
          </div>

          <Button
            type='submit'
            disabled={isSubmitting || isOverdrawn}
            className='shadow-md px-6 py-3 font-semibold'
          >
            {isSubmitting ? 'Submitting...' : 'Submit Request'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ApplyLeave;
