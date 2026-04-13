import { z } from 'zod';

export const leaveSchema = z
  .object({
    type: z.enum(['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'COMP_OFF'], {
      message: 'Leave type is required',
    }),
    startDate: z.string().min(1, 'Start date is required'),
    endDate: z.string().min(1, 'End date is required'),
    reason: z
      .string()
      .min(5, 'Reason must be at least 5 characters')
      .max(500, 'Reason must be under 500 characters'),
  })
  .refine(
    ({ startDate, endDate }) => new Date(startDate) <= new Date(endDate),
    {
      path: ['endDate'],
      message: 'Invalid date range: end date must be after start date',
    },
  );

export type LeaveFormData = z.infer<typeof leaveSchema>;
