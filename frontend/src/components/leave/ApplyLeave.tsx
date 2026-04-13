'use client';

import api from '@/services/api';
import { leaveSchema, type LeaveFormData } from '@/utils/leave/leaveSchema';
import type { Leave, LeaveBalance, LeaveType, PermissionSummary } from '@/types/leave';
import type { Holiday } from '@/types/holiday';
import type { Gender } from '@/types/user';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
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
  const balanceAfter =
    selectedBalance !== null ? selectedBalance - daysToDeduct : null;
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
      const response = await api.post('/leaves', {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      });
      toast.success('Leave request submitted successfully');
      reset();
      const created = response.data as { leave?: Leave } | undefined;
      onSuccess?.(created?.leave);
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
      toast.error('From and to times are required');
      return;
    }
    const startMinutes = parseTimeToMinutes(permissionStartTime);
    const endMinutes = parseTimeToMinutes(permissionEndTime);
    if (startMinutes == null || endMinutes == null) {
      toast.error('Please select valid from and to times');
      return;
    }
    if (endMinutes <= startMinutes) {
      toast.error('To time must be after from time');
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
    <div className='relative bg-white/90 shadow-xl border border-gray-100 rounded-3xl overflow-hidden'>
      <div className='-top-24 -left-32 absolute bg-primary/10 blur-3xl rounded-full w-64 h-64' />
      <div className='-right-20 -bottom-24 absolute bg-indigo-100 blur-3xl rounded-full w-64 h-64' />
      <div className='z-10 relative flex flex-col gap-6 p-6'>
        <div className='flex flex-wrap justify-between items-start gap-4 border-gray-100 border-b'>
          <div className='flex items-start gap-3'>
            <div className='place-items-center grid bg-linear-to-br from-primary/15 via-primary/10 to-primary/5 shadow-inner shadow-primary/15 rounded-2xl w-12 h-12 text-primary'>
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

        <div className='flex items-center gap-2 rounded-xl border border-gray-100 bg-white/80 p-1'>
          <Button
            type='button'
            unstyled
            onClick={() => setActiveTab('LEAVE_APPLY')}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'LEAVE_APPLY'
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
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
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
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
                ? 'bg-primary text-white'
                : 'text-gray-600 hover:bg-gray-100'
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
