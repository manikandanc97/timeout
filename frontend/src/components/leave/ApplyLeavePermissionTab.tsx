'use client';

import type { PermissionSummary } from '@/types/leave';
import { useMemo } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

function timeStringToMinutes(value: string): number | null {
  if (!value?.trim()) return null;
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (
    !Number.isFinite(hh) ||
    !Number.isFinite(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    return null;
  }
  return hh * 60 + mm;
}

export type ApplyLeavePermissionTabProps = {
  permissionSummary: PermissionSummary | null;
  todayIso: string;
  tomorrowIso: string;
  permissionDate: string;
  setPermissionDate: (value: string) => void;
  permissionStartTime: string;
  setPermissionStartTime: (value: string) => void;
  permissionEndTime: string;
  setPermissionEndTime: (value: string) => void;
  permissionReason: string;
  setPermissionReason: (value: string) => void;
  permissionSubmitting: boolean;
  onPermissionApply: () => void | Promise<void>;
  onReset: () => void;
};

const ApplyLeavePermissionTab = ({
  permissionSummary,
  todayIso,
  tomorrowIso,
  permissionDate,
  setPermissionDate,
  permissionStartTime,
  setPermissionStartTime,
  permissionEndTime,
  setPermissionEndTime,
  permissionReason,
  setPermissionReason,
  permissionSubmitting,
  onPermissionApply,
  onReset,
}: ApplyLeavePermissionTabProps) => {
  const inBetweenMinutes = useMemo(() => {
    const start = timeStringToMinutes(permissionStartTime);
    const end = timeStringToMinutes(permissionEndTime);
    if (start == null || end == null || end <= start) return null;
    return end - start;
  }, [permissionStartTime, permissionEndTime]);

  const requestedMinutes = useMemo(() => {
    return inBetweenMinutes;
  }, [inBetweenMinutes]);

  const validationWarning = useMemo(() => {
    if (permissionDate && permissionDate !== todayIso && permissionDate !== tomorrowIso) {
      return 'Permission can only be applied for today or tomorrow.';
    }
    if (!permissionStartTime || !permissionEndTime) return null;
    const start = timeStringToMinutes(permissionStartTime);
    const end = timeStringToMinutes(permissionEndTime);
    if (start == null || end == null) return 'Please select valid from and to times.';
    if (end <= start) return 'To time must be after from time.';
    if (end - start > 240)
      return 'In-between permission cannot exceed 240 minutes.';
    if (
      permissionSummary &&
      end - start > permissionSummary.remainingMinutes
    ) {
      return `Monthly limit exceeded. Remaining ${permissionSummary.remainingMinutes} minutes.`;
    }
    return null;
  }, [
    permissionStartTime,
    permissionEndTime,
    permissionSummary,
  ]);

  const projectedRemaining = useMemo(() => {
    if (!permissionSummary || requestedMinutes == null) return null;
    return permissionSummary.remainingMinutes - requestedMinutes;
  }, [permissionSummary, requestedMinutes]);

  const canSubmitPermission =
    Boolean(permissionDate) &&
    Boolean(permissionStartTime) &&
    Boolean(permissionEndTime) &&
    Boolean(permissionReason.trim()) &&
    !validationWarning;

  return (
    <section className='bg-white/80 shadow-sm backdrop-blur-sm p-4 md:p-5 border border-gray-100 rounded-2xl'>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div>
          <h3 className='font-semibold text-gray-900 text-lg'>
            Permission request
          </h3>
          <p className='text-gray-500 text-xs'>
            Select your in-between away time. Monthly total limit is 4 hours.
          </p>
        </div>
        <div className='rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700'>
          Remaining:{' '}
          {permissionSummary
            ? `${Math.floor(permissionSummary.remainingMinutes / 60)}h ${permissionSummary.remainingMinutes % 60}m`
            : '—'}
        </div>
      </div>

      <div className='mt-4 grid gap-3 sm:grid-cols-2'>
        <Input
          id='permission-date'
          type='date'
          label='Date'
          min={todayIso}
          max={tomorrowIso}
          required
          value={permissionDate}
          onChange={(e) => setPermissionDate(e.target.value)}
        />
        <Input
          id='permission-start-time'
          type='time'
          label='From'
          required
          value={permissionStartTime}
          onChange={(e) => setPermissionStartTime(e.target.value)}
        />
        <Input
          id='permission-end-time'
          type='time'
          label='To'
          required
          value={permissionEndTime}
          onChange={(e) => setPermissionEndTime(e.target.value)}
        />
        {validationWarning ? (
          <p className='text-xs font-medium text-red-600 sm:col-span-2'>
            {validationWarning}
          </p>
        ) : projectedRemaining != null ? (
          <p className='text-xs text-gray-600 sm:col-span-2'>
            After this request:{' '}
            <span className='font-semibold text-gray-800'>
              {Math.max(projectedRemaining, 0)} minutes remaining
            </span>
          </p>
        ) : null}
        {inBetweenMinutes != null ? (
          <p className='text-gray-600 text-xs sm:col-span-2'>
            Permission length:{' '}
            <span className='font-semibold text-gray-800'>
              {inBetweenMinutes} minutes
            </span>{' '}
            (counts toward your monthly limit; max 240 minutes per request)
          </p>
        ) : (
          <p className='text-gray-500 text-xs sm:col-span-2'>
            Same day only and &quot;To&quot; must be after &quot;From&quot;.
          </p>
        )}
        <div className='sm:col-span-2'>
          <Input
            id='permission-reason'
            type='text'
            label='Reason'
            placeholder='e.g. Medical appointment'
            required
            value={permissionReason}
            onChange={(e) => setPermissionReason(e.target.value)}
          />
        </div>
      </div>

      <div className='mt-3 flex flex-wrap items-center gap-3'>
        <Button
          type='button'
          variant='outline'
          onClick={onReset}
          disabled={permissionSubmitting}
          className='inline-flex justify-center items-center shadow-none px-5 py-2.5 text-sm font-semibold'
        >
          Reset
        </Button>
        <Button
          type='button'
          onClick={onPermissionApply}
          disabled={permissionSubmitting || !canSubmitPermission}
          className='px-5 py-2.5 text-sm'
        >
          {permissionSubmitting ? 'Submitting...' : 'Apply permission'}
        </Button>
      </div>
    </section>
  );
};

export default ApplyLeavePermissionTab;
