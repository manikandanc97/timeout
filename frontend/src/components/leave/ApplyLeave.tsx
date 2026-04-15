'use client';

import api from '@/services/api';
import { leaveSchema, type LeaveFormData } from '@/utils/leave/leaveSchema';
import type { Leave, LeaveBalance, LeaveType, PermissionSummary } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import type { Gender } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import { CalendarClock } from 'lucide-react';
import { calculateLeaveDays, startDate as formatDate } from '@/utils/leave/leaveHelpers';
import ApplyLeaveApplyTab from './ApplyLeaveApplyTab';
import ApplyLeaveCompOffTab from './ApplyLeaveCompOffTab';
import ApplyLeavePermissionTab from './ApplyLeavePermissionTab';
import { balanceKeyMap } from './applyLeaveConfig';

type Props = {
  userGender: Gender | string;
  balance: LeaveBalance | null;
  holidays: Holiday[];
  history: Leave[];
  onSuccess?: (leave: Leave | null | undefined) => void;
};

const parseTimeToMinutes = (value: string): number | null => {
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
};

const ApplyLeave = ({
  userGender,
  balance,
  holidays,
  history,
  onSuccess,
}: Props) => {
  const [activeTab, setActiveTab] = useState<
    'LEAVE_APPLY' | 'COMP_OFF' | 'PERMISSION'
  >('LEAVE_APPLY');
  const [leaveTypeStart, setLeaveTypeStart] = useState(0);
  const [compOffDate, setCompOffDate] = useState('');
  const [compOffReason, setCompOffReason] = useState('');
  const [compOffSubmitting, setCompOffSubmitting] = useState(false);
  const [permissionDate, setPermissionDate] = useState('');
  const [permissionStartTime, setPermissionStartTime] = useState('');
  const [permissionEndTime, setPermissionEndTime] = useState('');
  const [permissionReason, setPermissionReason] = useState('');
  const [permissionSubmitting, setPermissionSubmitting] = useState(false);
  const [permissionSummary, setPermissionSummary] = useState<PermissionSummary | null>(null);
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
  const reason = watch('reason');

  const dateStats = useMemo(
    () => calculateLeaveDays(startDate, endDate, holidays),
    [startDate, endDate, holidays],
  );

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayIso = formatDate(today);
  const tomorrowIso = formatDate(tomorrow);

  const leaveOptions = useMemo<LeaveType[]>(() => {
    const options: LeaveType[] = ['ANNUAL', 'SICK', 'COMP_OFF'];
    if (userGender === 'FEMALE') options.push('MATERNITY');
    else if (userGender === 'MALE') options.push('PATERNITY');
    return options;
  }, [userGender]);

  const VISIBLE_LEAVE_TYPES = 3;
  const maxLeaveTypeStart = Math.max(0, leaveOptions.length - VISIBLE_LEAVE_TYPES);
  const canGoPrev = leaveTypeStart > 0;
  const canGoNext = leaveTypeStart < maxLeaveTypeStart;

  const selectedBalance = useMemo(() => {
    if (!type || !balance) return null;
    const key = balanceKeyMap[type as LeaveType];
    return key ? (balance[key] ?? null) : null;
  }, [type, balance]);

  const daysToDeduct = dateStats.workingDays;
  const isAnnualOrSick = type === 'ANNUAL' || type === 'SICK';
  const lopDays =
    selectedBalance !== null && isAnnualOrSick
      ? Math.max(daysToDeduct - selectedBalance, 0)
      : 0;
  const balanceDeductedDays = Math.max(daysToDeduct - lopDays, 0);
  const balanceAfter =
    selectedBalance !== null ? selectedBalance - balanceDeductedDays : null;
  const isOverdrawn = balanceAfter !== null && balanceAfter < 0;
  const hasDateRange = Boolean(startDate && endDate);
  const hasOverlap = useMemo(() => {
    if (!hasDateRange || !history?.length) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return false;

    return history.some((leave) => {
      const leaveStart = new Date(leave.startDate ?? leave.startDate ?? '');
      const leaveEnd = new Date(leave.endDate ?? leave.endDate ?? '');
      if (
        Number.isNaN(leaveStart.getTime()) ||
        Number.isNaN(leaveEnd.getTime()) ||
        leave.status === 'REJECTED'
      )
        return false;
      return leaveStart <= end && start <= leaveEnd;
    });
  }, [hasDateRange, history, startDate, endDate]);
  const canSubmitLeave =
    Boolean(type) &&
    Boolean(startDate) &&
    Boolean(endDate) &&
    Boolean(reason?.trim()) &&
    daysToDeduct > 0 &&
    !hasOverlap &&
    !isOverdrawn;

  const onSubmit = async (data: LeaveFormData) => {
    try {
      if (hasOverlap) {
        toast.error('You already have a leave for these dates.');
        return;
      }
      const response = await api.post<{
        leave?: Leave;
        leaveImpact?: {
          lopDays?: number;
          lopAmount?: number;
        };
      }>('/leaves', {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      });
      const lopDaysFromApi = Number(response.data?.leaveImpact?.lopDays ?? 0);
      if (lopDaysFromApi > 0) {
        toast.success(
          `Leave applied with LOP: ${lopDaysFromApi} day(s)`,
        );
      } else {
        toast.success('Leave request submitted successfully');
      }
      reset();
      onSuccess?.(response.data?.leave);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ??
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ??
        'Failed to submit leave request. Please try again.';
      toast.error(msg);
    }
  };

  const onCompOffApply = async () => {
    if (!compOffDate || !compOffReason.trim()) {
      toast.error('Work date and reason are required');
      return;
    }
    setCompOffSubmitting(true);
    try {
      await api.post('/leaves/comp-off-credit', {
        workDate: compOffDate,
        reason: compOffReason.trim(),
      });
      toast.success('Comp off credit added');
      setCompOffDate('');
      setCompOffReason('');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ??
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ??
        'Failed to add comp off credit.';
      toast.error(msg);
    } finally {
      setCompOffSubmitting(false);
    }
  };

  const resetCompOffForm = () => {
    setCompOffDate('');
    setCompOffReason('');
  };

  const resetPermissionForm = () => {
    setPermissionDate('');
    setPermissionStartTime('');
    setPermissionEndTime('');
    setPermissionReason('');
  };

  const loadPermissionSummary = async () => {
    try {
      const response = await api.get<PermissionSummary>('/leaves/permissions/summary');
      setPermissionSummary(response.data);
    } catch {
      setPermissionSummary(null);
    }
  };

  useEffect(() => {
    void loadPermissionSummary();
  }, []);

  const onPermissionApply = async () => {
    if (!permissionDate || !permissionReason.trim()) {
      toast.error('Date and reason are required');
      return;
    }

    if (permissionDate !== todayIso && permissionDate !== tomorrowIso) {
      toast.error('Permission can only be applied for today or tomorrow');
      return;
    }

    if (!permissionStartTime || !permissionEndTime) {
      toast.error('Start time and end time are required');
      return;
    }
    const startMinutes = parseTimeToMinutes(permissionStartTime);
    const endMinutes = parseTimeToMinutes(permissionEndTime);
    if (startMinutes == null || endMinutes == null) {
      toast.error('Please select valid start and end times');
      return;
    }
    if (endMinutes <= startMinutes) {
      toast.error('End time must be after start time');
      return;
    }
    if (endMinutes - startMinutes > 240) {
      toast.error('In-between permission cannot exceed 240 minutes');
      return;
    }

    setPermissionSubmitting(true);
    try {
      const response = await api.post<{
        monthly?: {
          limitMinutes: number;
          usedMinutes: number;
          remainingMinutes: number;
        };
      }>('/leaves/permissions', {
        date: permissionDate,
        startTime: permissionStartTime,
        endTime: permissionEndTime,
        reason: permissionReason.trim(),
      });
      toast.success('Permission request submitted');
      setPermissionDate('');
      setPermissionReason('');
      setPermissionStartTime('');
      setPermissionEndTime('');
      if (response.data.monthly) {
        setPermissionSummary((prev) => ({
          limitMinutes: response.data.monthly?.limitMinutes ?? prev?.limitMinutes ?? 240,
          usedMinutes: response.data.monthly?.usedMinutes ?? prev?.usedMinutes ?? 0,
          remainingMinutes:
            response.data.monthly?.remainingMinutes ?? prev?.remainingMinutes ?? 240,
          requests: prev?.requests ?? [],
        }));
      } else {
        await loadPermissionSummary();
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.message ??
        (err as { response?: { data?: { message?: string; error?: string } } })
          ?.response?.data?.error ??
        'Failed to submit permission request.';
      toast.error(msg);
    } finally {
      setPermissionSubmitting(false);
    }
  };

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

        <div className='flex items-center gap-2 rounded-xl border border-border bg-muted/50 p-1'>
          <Button
            type='button'
            unstyled
            onClick={() => setActiveTab('LEAVE_APPLY')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'LEAVE_APPLY'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Leave apply
          </Button>
          <Button
            type='button'
            unstyled
            onClick={() => setActiveTab('PERMISSION')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'PERMISSION'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Permission
          </Button>
          <Button
            type='button'
            unstyled
            onClick={() => setActiveTab('COMP_OFF')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'COMP_OFF'
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            Comp off
          </Button>
        </div>

        {activeTab === 'LEAVE_APPLY' ? (
          <ApplyLeaveApplyTab
            control={control}
            errors={errors}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
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
