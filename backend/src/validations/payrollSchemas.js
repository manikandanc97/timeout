import { z } from 'zod';

export const payrollGenerationSchema = z.object({
  month: z.number().min(1).max(12).optional(),
  year: z.number().min(2000).max(2100).optional(),
});

export const updatePayrollStatusSchema = z.object({
  status: z.enum(['DRAFT', 'REVIEWED', 'APPROVED', 'PAID', 'VOID']),
  comment: z.string().max(500).optional(),
});

export const updateSalaryStructureSchema = z.object({
  yearlyGrossSalary: z.number().min(0).nullable().optional(),
  basicSalary: z.number().min(0),
  hra: z.number().min(0).optional(),
  conveyance: z.number().min(0).optional(),
  specialAllowance: z.number().min(0).optional(),
  allowance: z.number().min(0).optional(),
  bonus: z.number().min(0).optional(),
  pfRate: z.number().min(0).max(100).optional(),
  esiRate: z.number().min(0).max(100).optional(),
  professionalTax: z.number().min(0).optional(),
  tds: z.number().min(0).optional(),
  overtimeRate: z.number().min(0).optional(),
  effectiveFrom: z.string().datetime().optional(),
});

export const markPaidBulkSchema = z.object({
  month: z.number().min(1).max(12),
  year: z.number().min(2000).max(2100),
});
