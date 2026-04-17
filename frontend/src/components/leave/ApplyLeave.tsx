'use client';

import type { Leave, LeaveBalance } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import type { Gender } from '@/types/user';
import React from 'react';
import { CalendarClock } from 'lucide-react';
import dynamic from 'next/dynamic';
import ApplyLeaveTabSwitch from './ApplyLeaveTabSwitch';
import { useApplyLeaveController } from './useApplyLeaveController';

const ApplyLeaveApplyTab = dynamic(() => import('./ApplyLeaveApplyTab'));
const ApplyLeaveCompOffTab = dynamic(() => import('./ApplyLeaveCompOffTab'));
const ApplyLeavePermissionTab = dynamic(() => import('./ApplyLeavePermissionTab'));

type Props = {
  userGender: Gender | string;
  balance: LeaveBalance | null;
  holidays: Holiday[];
  history: Leave[];
  onSuccess?: (leave: Leave | null | undefined) => void;
};

const ApplyLeave = ({
  userGender,
  balance,
  holidays,
  history,
  onSuccess,
}: Props) => {
  const controller = useApplyLeaveController({
    userGender,
    balance,
    holidays,
    history,
    onSuccess,
  });
  const {
    form,
    activeTab,
    setActiveTab,
    leaveTypeStart,
    setLeaveTypeStart,
    compOffDate,
    setCompOffDate,
    compOffReason,
    setCompOffReason,
    compOffSubmitting,
    permissionDate,
    setPermissionDate,
    permissionStartTime,
    setPermissionStartTime,
    permissionEndTime,
    setPermissionEndTime,
    permissionReason,
    setPermissionReason,
    permissionSubmitting,
    permissionSummary,
    todayIso,
    tomorrowIso,
    leaveOptions,
    maxLeaveTypeStart,
    canGoPrev,
    canGoNext,
    type,
    startDate,
    endDate,
    dateStats,
    daysToDeduct,
    lopDays,
    balanceDeductedDays,
    hasDateRange,
    hasOverlap,
    isOverdrawn,
    canSubmitLeave,
    onSubmitLeave,
    onCompOffApply,
    onPermissionApply,
    resetCompOffForm,
    resetPermissionForm,
  } = controller;
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <div className='relative isolate overflow-hidden rounded-3xl border border-border bg-card text-card-foreground shadow-xl'>
      <div className='pointer-events-none absolute -left-32 -top-24 h-64 w-64 rounded-full bg-primary/8 blur-3xl' />
      <div className='pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent/15 blur-3xl' />
      <div className='relative z-10 flex flex-col gap-6 p-6'>
        <div className='flex flex-wrap items-start justify-between gap-4 border-b border-border'>
          <div className='flex items-start gap-3'>
            <div className='grid h-12 w-12 place-items-center rounded-2xl bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 text-primary shadow-inner shadow-primary/15'>
              <CalendarClock size={20} />
            </div>
            <div>
              <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground'>
                Leave desk
              </p>
              <h2 className='text-2xl font-bold leading-tight'>
                Apply for leave
              </h2>
            </div>
          </div>
        </div>

        <ApplyLeaveTabSwitch activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === 'LEAVE_APPLY' ? (
          <ApplyLeaveApplyTab
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={onSubmitLeave}
            handleSubmit={handleSubmit}
            reset={reset}
            setValue={setValue}
            type={type}
            startDate={startDate}
            endDate={endDate}
            todayIso={todayIso}
            leaveOptions={leaveOptions}
            leaveTypeStart={leaveTypeStart}
            setLeaveTypeStart={setLeaveTypeStart}
            canGoPrev={canGoPrev}
            canGoNext={canGoNext}
            maxLeaveTypeStart={maxLeaveTypeStart}
            balance={balance}
            dateStats={dateStats}
            daysToDeduct={daysToDeduct}
            lopDays={lopDays}
            balanceDeductedDays={balanceDeductedDays}
            hasDateRange={hasDateRange}
            hasOverlap={hasOverlap}
            isOverdrawn={isOverdrawn}
            canSubmitLeave={canSubmitLeave}
          />
        ) : null}

        {activeTab === 'COMP_OFF' ? (
          <ApplyLeaveCompOffTab
            todayIso={todayIso}
            compOffDate={compOffDate}
            setCompOffDate={setCompOffDate}
            compOffReason={compOffReason}
            setCompOffReason={setCompOffReason}
            compOffSubmitting={compOffSubmitting}
            onCompOffApply={onCompOffApply}
            onReset={resetCompOffForm}
          />
        ) : null}

        {activeTab === 'PERMISSION' ? (
          <ApplyLeavePermissionTab
            permissionSummary={permissionSummary}
            todayIso={todayIso}
            tomorrowIso={tomorrowIso}
            permissionDate={permissionDate}
            setPermissionDate={setPermissionDate}
            permissionStartTime={permissionStartTime}
            setPermissionStartTime={setPermissionStartTime}
            permissionEndTime={permissionEndTime}
            setPermissionEndTime={setPermissionEndTime}
            permissionReason={permissionReason}
            setPermissionReason={setPermissionReason}
            permissionSubmitting={permissionSubmitting}
            onPermissionApply={onPermissionApply}
            onReset={resetPermissionForm}
          />
        ) : null}
      </div>
    </div>
  );
};

export default ApplyLeave;
