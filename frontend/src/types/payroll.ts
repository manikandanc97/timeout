export type PayrollStatus = 'PAID' | 'PENDING' | 'NOT_ADDED';

export type PayrollRow = {
  id: number;
  userId: number;
  employeeName: string;
  employeeActive?: boolean;
  yearlyGrossSalary?: number;
  basicSalary: number;
  hra?: number;
  allowance: number;
  bonus?: number;
  pf?: number;
  tax?: number;
  professionalTax?: number;
  deductions: number;
  lopDays?: number;
  lopAmount?: number;
  month: number;
  year: number;
  paidDate?: string | null;
  netSalary: number;
  status: PayrollStatus;
  payrollAdded?: boolean;
};
