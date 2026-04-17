import api from '@/services/api';
import { getApiErrorMessage } from '@/utils/apiError';
import { leaveSchema, type LeaveFormData } from '@/utils/leave/leaveSchema';
import type { Holiday } from '@/types/holiday';
import type { Gender } from '@/types/user';
import type { Leave, LeaveBalance, LeaveType, PermissionSummary } from '@/types/leave';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { calculateLeaveDays, startDate as formatDate } from '@/utils/leave/leaveHelpers';
import { balanceKeyMap } from './applyLeaveConfig';

type Params = {
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
  if (!Number.isFinite(hh) || !Number.isFinite(mm) || hh < 0 || hh > 23 || mm < 0 || mm > 59) {
    return null;
  }
  return hh * 60 + mm;
};

export function useApplyLeaveController({
  userGender,
  balance,
  holidays,
  history,
  onSuccess,
}: Params) {
  const [activeTab, setActiveTab] = useState<'LEAVE_APPLY' | 'COMP_OFF' | 'PERMISSION'>('LEAVE_APPLY');
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

  const form = useForm<LeaveFormData>({
    resolver: zodResolver(leaveSchema),
    defaultValues: {
      type: undefined,
      startDate: '',
      endDate: '',
      reason: '',
    } as Partial<LeaveFormData>,
  });

  const { watch, reset } = form;
  const type = watch('type');
  const startDate = watch('startDate');
  const endDate = watch('endDate');
  const reason = watch('reason');

  const dateStats = useMemo(() => calculateLeaveDays(startDate, endDate, holidays), [startDate, endDate, holidays]);
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
  const lopDays = selectedBalance !== null && isAnnualOrSick ? Math.max(daysToDeduct - selectedBalance, 0) : 0;
  const balanceDeductedDays = Math.max(daysToDeduct - lopDays, 0);
  const balanceAfter = selectedBalance !== null ? selectedBalance - balanceDeductedDays : null;
  const isOverdrawn = balanceAfter !== null && balanceAfter < 0;
  const hasDateRange = Boolean(startDate && endDate);
  const hasOverlap = useMemo(() => {
    if (!hasDateRange || !history?.length) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;
    return history.some((leave) => {
      const leaveStart = new Date(leave.startDate ?? '');
      const leaveEnd = new Date(leave.endDate ?? '');
      if (Number.isNaN(leaveStart.getTime()) || Number.isNaN(leaveEnd.getTime()) || leave.status === 'REJECTED') {
        return false;
      }
      return leaveStart <= end && start <= leaveEnd;
    });
  }, [hasDateRange, history, startDate, endDate]);

  const canSubmitLeave =
    Boolean(type) && Boolean(startDate) && Boolean(endDate) && Boolean(reason?.trim()) && daysToDeduct > 0 && !hasOverlap && !isOverdrawn;

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

  const onSubmitLeave = async (data: LeaveFormData) => {
    try {
      if (hasOverlap) {
        toast.error('You already have a leave for these dates.');
        return;
      }
      const response = await api.post<{ leave?: Leave; leaveImpact?: { lopDays?: number } }>('/leaves', {
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      });
      const lopDaysFromApi = Number(response.data?.leaveImpact?.lopDays ?? 0);
      toast.success(lopDaysFromApi > 0 ? `Leave applied with LOP: ${lopDaysFromApi} day(s)` : 'Leave request submitted successfully');
      reset();
      onSuccess?.(response.data?.leave);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to submit leave request. Please try again.'));
    }
  };

  const onCompOffApply = async () => {
    if (!compOffDate || !compOffReason.trim()) {
      toast.error('Work date and reason are required');
      return;
    }
    setCompOffSubmitting(true);
    try {
      await api.post('/leaves/comp-off-credit', { workDate: compOffDate, reason: compOffReason.trim() });
      toast.success('Comp off credit added');
      setCompOffDate('');
      setCompOffReason('');
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to add comp off credit.'));
    } finally {
      setCompOffSubmitting(false);
    }
  };

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
      const response = await api.post<{ monthly?: { limitMinutes: number; usedMinutes: number; remainingMinutes: number } }>(
        '/leaves/permissions',
        {
          date: permissionDate,
          startTime: permissionStartTime,
          endTime: permissionEndTime,
          reason: permissionReason.trim(),
        },
      );
      toast.success('Permission request submitted');
      setPermissionDate('');
      setPermissionReason('');
      setPermissionStartTime('');
      setPermissionEndTime('');
      if (response.data.monthly) {
        setPermissionSummary((prev) => ({
          limitMinutes: response.data.monthly?.limitMinutes ?? prev?.limitMinutes ?? 240,
          usedMinutes: response.data.monthly?.usedMinutes ?? prev?.usedMinutes ?? 0,
          remainingMinutes: response.data.monthly?.remainingMinutes ?? prev?.remainingMinutes ?? 240,
          requests: prev?.requests ?? [],
        }));
      } else {
        await loadPermissionSummary();
      }
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to submit permission request.'));
    } finally {
      setPermissionSubmitting(false);
    }
  };

  return {
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
    resetCompOffForm: () => {
      setCompOffDate('');
      setCompOffReason('');
    },
    resetPermissionForm: () => {
      setPermissionDate('');
      setPermissionStartTime('');
      setPermissionEndTime('');
      setPermissionReason('');
    },
  };
}
