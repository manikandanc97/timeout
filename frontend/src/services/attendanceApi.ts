import api from './api';
import type {
  AttendanceLog,
  RegularizationRequest,
  TeamAttendanceResponse,
} from '@/types/attendance';

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const getTodayStatus = async () => {
  const { data } = await api.get<{ today: AttendanceLog | null }>('/attendance/today');
  return data;
};

export const getMyAttendance = async (page = 1, limit = 31, date?: string) => {
  const { data } = await api.get<{ data: AttendanceLog[]; pagination: PaginationMeta }>(
    '/attendance/history',
    { params: { page, limit, ...(date ? { date } : {}) } },
  );
  return data;
};

export const punchIn = async () => {
  const { data } = await api.post<{ message: string; attendance: AttendanceLog }>('/attendance/punch-in');
  return data;
};

export const punchOut = async () => {
  const { data } = await api.post<{ message: string; attendance: AttendanceLog }>('/attendance/punch-out');
  return data;
};

export const getRegularizationRequests = async () => {
  const { data } = await api.get<{
    data: RegularizationRequest[];
    pagination: PaginationMeta;
  }>('/attendance/regularize');
  return data;
};

export const requestRegularization = async (payload: { date: string; reason: string; requestedCheckIn?: string | null; requestedCheckOut?: string | null }) => {
  const { data } = await api.post('/attendance/regularize', payload);
  return data;
};

export const updateRegularizationStatus = async (id: number, payload: { status: 'APPROVED' | 'REJECTED'; rejectionReason?: string }) => {
  const { data } = await api.put(`/attendance/regularize/${id}`, payload);
  return data;
};

export const getTeamAttendance = async (date?: string) => {
  const { data } = await api.get<TeamAttendanceResponse>('/attendance/team', {
    params: date ? { date } : undefined,
  });
  return data;
};
