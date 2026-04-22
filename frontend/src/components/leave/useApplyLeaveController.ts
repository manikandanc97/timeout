import api from '@/services/api';
import { getApiErrorMessage } from '@/utils/apiError';
import { leaveSchema, type LeaveFormData } from '@/utils/leave/leaveSchema';
import type { Holiday } from '@/types/holiday';
import type { Gender } from '@/types/user';
import type { Leave, LeaveBalance, LeaveType, PermissionSummary } from '@/types/leave';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [activeTab, setActiveTab] = useState<'LEAVE_APPLY' | 'COMP_OFF' | 'PERMISSION' | 'WFH' | 'ATTENDANCE_REGULARIZATION'>('LEAVE_APPLY');
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

  // WFH State
  const [wfhStartDate, setWfhStartDate] = useState('');
  const [wfhEndDate, setWfhEndDate] = useState('');
  const [wfhReason, setWfhReason] = useState('');
  const [wfhAvailability, setWfhAvailability] = useState('');
  const [wfhManagerVisible, setWfhManagerVisible] = useState(true);
  const [wfhRemarks, setWfhRemarks] = useState('');
  const [wfhSubmitting, setWfhSubmitting] = useState(false);

  // Regularization State
  const [regDate, setRegDate] = useState('');
  const [regCheckIn, setRegCheckIn] = useState('');
  const [regCheckOut, setRegCheckOut] = useState('');
  const [regReason, setRegReason] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

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
  
  const [{ todayIso, tomorrowIso }, setDates] = useState({ todayIso: '', tomorrowIso: '' });

  const loadPermissionSummary = useCallback(async (signal?: AbortSignal) => {
    try {
      const response = await api.get<PermissionSummary>('/leaves/permissions/summary', { signal });
      setPermissionSummary(response.data);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setPermissionSummary(null);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    
    // Set dates on client only to avoid hydration mismatch
    const t = new Date();
    const tom = new Date(t);
    tom.setDate(tom.getDate() + 1);
    setDates({
      todayIso: formatDate(t),
      tomorrowIso: formatDate(tom)
    });

    void loadPermissionSummary(controller.signal);
    return () => controller.abort();
  }, [loadPermissionSummary]);

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

  const onSubmitLeave = useCallback(async (data: LeaveFormData) => {
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
  }, [hasOverlap, reset, onSuccess]);

  const onCompOffApply = useCallback(async () => {
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
  }, [compOffDate, compOffReason]);

  const onPermissionApply = useCallback(async () => {
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
  }, [permissionDate, permissionReason, todayIso, tomorrowIso, permissionStartTime, permissionEndTime, loadPermissionSummary]);

  const resetWfhForm = useCallback(() => {
    setWfhStartDate('');
    setWfhEndDate('');
    setWfhReason('');
    setWfhAvailability('');
    setWfhManagerVisible(true);
    setWfhRemarks('');
  }, []);

  const onWfhApply = useCallback(async () => {
    if (!wfhStartDate || !wfhEndDate || !wfhReason.trim() || !wfhAvailability.trim()) {
      toast.error('Date range, reason and availability are required');
      return;
    }
    setWfhSubmitting(true);
    try {
      const response = await api.post('/leaves', {
        type: 'WFH',
        startDate: wfhStartDate,
        endDate: wfhEndDate,
        reason: wfhReason.trim(),
        workAvailability: wfhAvailability.trim(),
        reportingManagerVisible: wfhManagerVisible,
        remarks: wfhRemarks.trim(),
      });
      toast.success('WFH request submitted successfully');
      resetWfhForm();
      onSuccess?.(response.data?.leave);
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to submit WFH request.'));
    } finally {
      setWfhSubmitting(false);
    }
  }, [wfhStartDate, wfhEndDate, wfhReason, wfhAvailability, wfhManagerVisible, wfhRemarks, resetWfhForm, onSuccess]);

  const resetRegForm = useCallback(() => {
    setRegDate('');
    setRegCheckIn('');
    setRegCheckOut('');
    setRegReason('');
  }, []);

  const onRegularizeApply = useCallback(async () => {
    if (!regDate || !regReason.trim() || (!regCheckIn && !regCheckOut)) {
      toast.error('Date, reason and at least one punch time are required');
      return;
    }
    setRegSubmitting(true);
    try {
      await api.post('/attendance/regularize', {
        date: regDate,
        requestedCheckIn: regCheckIn || null,
        requestedCheckOut: regCheckOut || null,
        reason: regReason.trim(),
      });
      toast.success('Attendance regularization request submitted');
      resetRegForm();
    } catch (err: unknown) {
      toast.error(getApiErrorMessage(err, 'Failed to submit regularization request.'));
    } finally {
      setRegSubmitting(false);
    }
  }, [regDate, regReason, regCheckIn, regCheckOut, resetRegForm]);

  return useMemo(() => ({
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
    resetWfhForm,
    resetRegForm,
  }), [
    form, activeTab, leaveTypeStart, compOffDate, compOffReason, compOffSubmitting,
    permissionDate, permissionStartTime, permissionEndTime, permissionReason, permissionSubmitting, permissionSummary,
    wfhStartDate, wfhEndDate, wfhReason, wfhAvailability, wfhManagerVisible, wfhRemarks, wfhSubmitting,
    regDate, regCheckIn, regCheckOut, regReason, regSubmitting,
    todayIso, tomorrowIso, leaveOptions, maxLeaveTypeStart, canGoPrev, canGoNext,
    type, startDate, endDate, dateStats, daysToDeduct, lopDays, balanceDeductedDays,
    hasDateRange, hasOverlap, isOverdrawn, canSubmitLeave,
    onSubmitLeave, onCompOffApply, onPermissionApply, onWfhApply, onRegularizeApply,
    resetWfhForm, resetRegForm
  ]);
}
