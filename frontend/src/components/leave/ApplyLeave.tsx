'use client';

import type { Leave, LeaveBalance } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import type { Gender } from '@/types/user';
import React from 'react';
import { CalendarClock } from 'lucide-react';
import ApplyLeaveTabSwitch from './ApplyLeaveTabSwitch';
import { useApplyLeaveController } from './useApplyLeaveController';
import ApplyLeaveApplyTab from './ApplyLeaveApplyTab';
import ApplyLeaveCompOffTab from './ApplyLeaveCompOffTab';
import ApplyLeavePermissionTab from './ApplyLeavePermissionTab';
import ApplyLeaveWFHTab from './ApplyLeaveWFHTab';
import ApplyLeaveAttendanceRegularizationTab from './ApplyLeaveAttendanceRegularizationTab';

type Props = {
  userGender: Gender | string;
  balance: LeaveBalance | null;
  holidays: Holiday[];
  history: Leave[];
  onSuccess?: (leave: Leave | null | undefined) => void;
};

export default function ApplyLeave({
  userGender,
  balance,
  holidays,
  history,
  onSuccess,
}: Props) {
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
    wfhStartDate,
    setWfhStartDate,
    wfhEndDate,
    setWfhEndDate,
    wfhReason,
    setWfhReason,
    wfhAvailability,
    setWfhAvailability,
    wfhManagerVisible,
    setWfhManagerVisible,
    wfhRemarks,
    setWfhRemarks,
    wfhSubmitting,
    regDate,
    setRegDate,
    regCheckIn,
    setRegCheckIn,
    regCheckOut,
    setRegCheckOut,
    regReason,
    setRegReason,
    regSubmitting,
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
    onWfhApply,
    onRegularizeApply,
    resetCompOffForm,
    resetPermissionForm,
    resetWfhForm,
    resetRegForm,
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

        <div className='will-change-[transform,opacity]'>
          {activeTab === 'LEAVE_APPLY' && (
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
          )}

          {activeTab === 'COMP_OFF' && (
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
          )}

          {activeTab === 'PERMISSION' && (
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
          )}

          {activeTab === 'WFH' && (
            <ApplyLeaveWFHTab
              todayIso={todayIso}
              wfhStartDate={wfhStartDate}
              setWfhStartDate={setWfhStartDate}
              wfhEndDate={wfhEndDate}
              setWfhEndDate={setWfhEndDate}
              wfhReason={wfhReason}
              setWfhReason={setWfhReason}
              wfhAvailability={wfhAvailability}
              setWfhAvailability={setWfhAvailability}
              wfhManagerVisible={wfhManagerVisible}
              setWfhManagerVisible={setWfhManagerVisible}
              wfhRemarks={wfhRemarks}
              setWfhRemarks={setWfhRemarks}
              isSubmitting={wfhSubmitting}
              onSubmit={onWfhApply}
              onReset={resetWfhForm}
            />
          )}

          {activeTab === 'ATTENDANCE_REGULARIZATION' && (
            <ApplyLeaveAttendanceRegularizationTab
              regDate={regDate}
              setRegDate={setRegDate}
              regCheckIn={regCheckIn}
              setRegCheckIn={setRegCheckIn}
              regCheckOut={regCheckOut}
              setRegCheckOut={setRegCheckOut}
              regReason={regReason}
              setRegReason={setRegReason}
              isSubmitting={regSubmitting}
              onSubmit={onRegularizeApply}
              onReset={resetRegForm}
            />
          )}
        </div>
      </div>
    </div>
  );
}
