import { z } from 'zod';

export const leaveSchema = z.object({
  type: z.enum(['ANNUAL', 'SICK', 'COMP_OFF', 'MATERNITY', 'PATERNITY', 'WFH']),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  reason: z.string().min(5, 'Reason must be at least 5 characters').max(500),
});

export const compOffSchema = z.object({
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().min(5).max(500),
});

export const permissionSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s*[AP]M)?$/i, 'Invalid time format (HH:mm)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9](\s*[AP]M)?$/i, 'Invalid time format (HH:mm)'),
  reason: z.string().min(5).max(500),
});

export const updateRequestStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  rejectionReason: z.string().max(500).optional(),
}).refine(data => {
  if (data.status === 'REJECTED' && !data.rejectionReason?.trim()) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is required when rejecting a request',
  path: ['rejectionReason'],
});

export const updateSimpleStatusSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
