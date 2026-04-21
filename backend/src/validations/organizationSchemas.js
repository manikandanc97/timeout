import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(2, 'Department name is too short'),
});

export const teamSchema = z.object({
  name: z.string().min(2, 'Team name is too short'),
  departmentId: z.number({ required_error: 'Department ID is required' }),
});

export const employeeCreateSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(2, 'Name is too short'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR']),
  teamId: z.number().int().optional().nullable(),
  reportingManagerId: z.number().int().optional().nullable(),
});

export const employeeUpdateSchema = z.object({
  name: z.string().min(2, 'Name is too short').optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE', 'HR']).optional(),
  teamId: z.number().int().optional().nullable(),
  reportingManagerId: z.number().int().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const salaryStructureSchema = z.object({
  monthlyGrossSalary: z.number().nonnegative().optional(),
  yearlyGrossSalary: z.number().nonnegative().optional(),
  basicSalary: z.number().nonnegative(),
  hra: z.number().nonnegative(),
  allowance: z.number().nonnegative(),
  bonus: z.number().nonnegative().default(0),
  pf: z.number().nonnegative().default(0),
  tax: z.number().nonnegative().default(0),
  professionalTax: z.number().nonnegative().default(0),
  effectiveFrom: z.string().optional(), // Expected ISO date string
});

export const leavePolicySchema = z.object({
  annual: z.number().int().nonnegative(),
  sick: z.number().int().nonnegative(),
  maternity: z.number().int().nonnegative().optional(),
  paternity: z.number().int().nonnegative().optional(),
});

export const adminSettingsSchema = z.object({
  smtpHost: z.string().optional(),
  smtpPort: z.number().int().optional(),
  smtpUser: z.string().optional(),
  smtpPass: z.string().optional(),
  smtpSecure: z.boolean().optional(),
  smtpFrom: z.string().email().optional(),
  enableNotifications: z.boolean().optional(),
});

export const testSmtpSchema = z.object({
  targetEmail: z.string().email('Invalid test email address'),
});
