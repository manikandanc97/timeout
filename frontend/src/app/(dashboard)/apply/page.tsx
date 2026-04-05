'use client';

import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import api from '@/services/api';
import React, { useEffect, useState, useMemo } from 'react';
import {
  CalendarPlus,
  Info,
  AlertTriangle,
  ShieldCheck,
  CalendarDays,
} from 'lucide-react';

type Balance = {
  casual: number;
  sick: number;
  maternity?: number;
  paternity?: number;
};

const LEAVE_POLICY: Record<string, string> = {
  CASUAL:
    'Casual leave must be applied at least 1 day in advance. Max 3 consecutive days per request.',
  SICK: 'Sick leave can be applied retroactively. A medical certificate may be required for more than 2 days.',
  MATERNITY:
    'Maternity leave is available for up to 180 days. Please notify HR at least 4 weeks before the expected date.',
  PATERNITY:
    "Paternity leave is available for 15 days within 3 months of the child's birth.",
};

const LEAVE_BALANCE_LABEL: Record<string, string> = {
  CASUAL: 'Casual',
  SICK: 'Sick',
  MATERNITY: 'Maternity',
  PATERNITY: 'Paternity',
};

const ApplyLeave = () => {
  const [userGender, setUserGender] = useState('');
  const [balance, setBalance] = useState<Balance | null>(null);
  const [type, setType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    Promise.allSettled([
      api.get('/profile'),
      api.get('/leaves/dashboard'),
    ]).then(([profileRes, statsRes]) => {
      if (profileRes.status === 'fulfilled') {
        setUserGender(profileRes.value.data.gender ?? '');
      }
      if (statsRes.status === 'fulfilled') {
        setBalance(statsRes.value.data.balance ?? null);
      }
    });
  }, []);

  const dateStats = useMemo(() => {
    if (!startDate || !endDate)
      return { totalCalendar: 0, weekends: 0, workingDays: 0 };

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) return { totalCalendar: 0, weekends: 0, workingDays: 0 };

    let weekends = 0;
    const cur = new Date(start);
    while (cur <= end) {
      const d = cur.getDay();
      if (d === 0 || d === 6) weekends++;
      cur.setDate(cur.getDate() + 1);
    }

    const totalCalendar =
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const workingDays = totalCalendar - weekends;
    return { totalCalendar, weekends, workingDays };
  }, [startDate, endDate]);

  const leaveOptions = useMemo(() => {
    const common = [
      { label: 'Casual Leave', value: 'CASUAL' },
      { label: 'Sick Leave', value: 'SICK' },
    ];
    if (userGender === 'FEMALE')
      return [...common, { label: 'Maternity Leave', value: 'MATERNITY' }];
    if (userGender === 'MALE')
      return [...common, { label: 'Paternity Leave', value: 'PATERNITY' }];
    return common;
  }, [userGender]);

  const selectedBalance = useMemo(() => {
    if (!type || !balance) return null;
    const key = type.toLowerCase() as keyof Balance;
    const val = balance[key];
    return val !== undefined ? val : null;
  }, [type, balance]);

  const isLowBalance =
    selectedBalance !== null && selectedBalance <= 3 && selectedBalance > 0;
  const isNoBalance = selectedBalance !== null && selectedBalance <= 0;

  // How many days will be deducted (working days from selected range)
  const daysToDeduct = dateStats.workingDays;
  const balanceAfter =
    selectedBalance !== null && daysToDeduct > 0
      ? selectedBalance - daysToDeduct
      : null;
  const isOverdrawn = balanceAfter !== null && balanceAfter < 0;

  return (
    <div className='flex flex-col space-y-6 h-full'>
      <div className='flex flex-col bg-white shadow-md p-5 rounded-2xl'>
        <div className='flex items-center gap-2 mb-6'>
          <div className='flex justify-center items-center bg-blue-50 rounded-lg w-8 h-8'>
            <CalendarPlus size={18} className='text-blue-500' />
          </div>
          <h2 className='font-semibold text-lg'>Apply Leave</h2>
        </div>

        <div className='space-y-4'>
          <Select
            id='leave-type'
            label='Leave Type'
            placeholder='Select Leave Type'
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={leaveOptions}
          />

          {type && (
            <div
              className={`rounded-lg border text-sm transition-all duration-200
                ${
                  isOverdrawn || isNoBalance
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : isLowBalance
                      ? 'bg-amber-50 border-amber-200 text-amber-700'
                      : 'bg-background border-accent/40 text-primary-dark'
                }`}
            >
              {/* Balance row */}
              <div className='flex items-center justify-between px-4 py-3'>
                <div className='flex items-center gap-2'>
                  <CalendarDays size={15} />
                  <span className='font-medium'>
                    {LEAVE_BALANCE_LABEL[type]} Leave Balance
                  </span>
                </div>
                <span className='font-bold text-base'>
                  {selectedBalance !== null ? (
                    <>
                      {selectedBalance}{' '}
                      <span className='font-normal text-xs opacity-70'>
                        days left
                      </span>
                    </>
                  ) : (
                    '—'
                  )}
                </span>
              </div>

              {/* Deduction preview — only when dates are picked */}
              {daysToDeduct > 0 && selectedBalance !== null && (
                <div
                  className={`flex items-center justify-between border-t px-4 py-2.5 text-xs
                    ${
                      isOverdrawn || isNoBalance
                        ? 'border-red-200'
                        : isLowBalance
                          ? 'border-amber-200'
                          : 'border-accent/30'
                    }`}
                >
                  <div className='flex items-center gap-3'>
                    <span className='opacity-70'>Will deduct</span>
                    <span className='font-semibold text-sm'>−{daysToDeduct} days</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <span className='opacity-70'>Balance after:</span>
                    <span
                      className={`font-bold text-sm ${
                        isOverdrawn ? 'text-red-600' : ''
                      }`}
                    >
                      {balanceAfter} days
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
            <Input
              id='start-date'
              label='Start Date'
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              id='end-date'
              label='End Date'
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          {startDate && endDate && dateStats.totalCalendar > 0 && (
            <div className='grid grid-cols-3 gap-2 text-center text-xs'>
              <div className='rounded-lg bg-background border border-accent/30 py-2 px-1'>
                <p className='text-gray-400 mb-0.5'>Calendar days</p>
                <p className='font-semibold text-gray-700 text-sm'>
                  {dateStats.totalCalendar}
                </p>
              </div>
              <div className='rounded-lg bg-orange-50 border border-orange-100 py-2 px-1'>
                <p className='text-orange-400 mb-0.5'>Weekends</p>
                <p className='font-semibold text-orange-600 text-sm'>
                  {dateStats.weekends}
                </p>
              </div>
              <div className='rounded-lg bg-green-50 border border-green-100 py-2 px-1'>
                <p className='text-green-500 mb-0.5'>Working days</p>
                <p className='font-semibold text-green-700 text-sm'>
                  {dateStats.workingDays}
                </p>
              </div>
            </div>
          )}

          <div className='relative w-full'>
            <textarea
              id='reason'
              className='peer block bg-transparent px-3 pt-2 pb-2 border border-gray-300 focus:border-primary rounded-md outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0 w-full text-gray-900 text-sm transition-all duration-150 ease-out'
              rows={4}
              placeholder='Reason for leave'
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          {type && LEAVE_POLICY[type] && (
            <div className='flex gap-2 rounded-lg bg-blue-50 border border-blue-100 px-4 py-3 text-xs text-blue-700'>
              <Info size={14} className='mt-0.5 shrink-0 text-blue-500' />
              <p>{LEAVE_POLICY[type]}</p>
            </div>
          )}

          <div className='flex gap-2 rounded-lg bg-amber-50 border border-amber-100 px-4 py-3 text-xs text-amber-700'>
            <AlertTriangle
              size={14}
              className='mt-0.5 shrink-0 text-amber-500'
            />
            <p>
              Your leave request will be sent to your{' '}
              <span className='font-semibold'>Manager </span> for approval.
              You&apos;ll be notified once a decision is made.
            </p>
          </div>

          <div className='flex items-center justify-between pt-1'>
            <div className='flex items-center gap-1.5 text-xs text-gray-400'>
              <ShieldCheck size={13} className='text-primary' />
              <span>Requests are reviewed within 1–2 business days</span>
            </div>
            <Button onClick={() => {}} className='px-6' disabled={isNoBalance || isOverdrawn}>
              Submit Leave Request
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplyLeave;
