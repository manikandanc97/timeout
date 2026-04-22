'use client';

import React from 'react';
import type { LeaveBalance, LeaveType } from '@/types/leave';
import type { LeaveFormData } from '@/utils/leave/leaveSchema';
import { calculateLeaveDays } from '@/utils/leave/leaveHelpers';
import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormReset,
  UseFormSetValue,
} from 'react-hook-form';
import ApplyLeaveActionFooter from './ApplyLeaveActionFooter';
import ApplyLeaveTypeSection from './ApplyLeaveTypeSection';
import ApplyLeaveDurationSection from './ApplyLeaveDurationSection';
import ApplyLeaveReasonSection from './ApplyLeaveReasonSection';

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
  lopDays: number;
  balanceDeductedDays: number;
  hasDateRange: boolean;
  hasOverlap: boolean;
  isOverdrawn: boolean;
  canSubmitLeave: boolean;
};

const ApplyLeaveApplyTab = React.memo(({
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
  lopDays,
  balanceDeductedDays,
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
        <ApplyLeaveTypeSection
          control={control}
          errors={errors}
          type={type}
          leaveOptions={leaveOptions}
          leaveTypeStart={leaveTypeStart}
          setLeaveTypeStart={setLeaveTypeStart}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          maxLeaveTypeStart={maxLeaveTypeStart}
          balance={balance}
          setValue={setValue}
        />

        <ApplyLeaveDurationSection
          control={control}
          errors={errors}
          todayIso={todayIso}
          startDate={startDate}
          endDate={endDate}
          dateStats={dateStats}
          hasDateRange={hasDateRange}
          hasOverlap={hasOverlap}
          daysToDeduct={daysToDeduct}
          lopDays={lopDays}
          balanceDeductedDays={balanceDeductedDays}
        />
      </div>

      <ApplyLeaveReasonSection control={control} errors={errors} />

      <ApplyLeaveActionFooter
        isSubmitting={isSubmitting}
        isOverdrawn={isOverdrawn}
        canSubmitLeave={canSubmitLeave}
        onReset={() => reset()}
      />
    </div>
  </form>
));

ApplyLeaveApplyTab.displayName = 'ApplyLeaveApplyTab';

export default ApplyLeaveApplyTab;
