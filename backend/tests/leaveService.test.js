import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  getDefaultLeaveBalance, 
  toLocalCalendarDate, 
  getWorkingDays, 
  getMonthlyNetFromSalaryStructure 
} from '../src/services/leaveService.js';
import * as holidayLib from '../src/lib/findHolidaysForOrgInDateRange.js';

vi.mock('../src/lib/findHolidaysForOrgInDateRange.js');

describe('LeaveService', () => {
  describe('getDefaultLeaveBalance', () => {
    it('should return correct balance for a FEMALE user', () => {
      const user = { id: 1, gender: 'FEMALE' };
      const balance = getDefaultLeaveBalance(user);
      expect(balance.maternity).toBe(180);
      expect(balance.paternity).toBe(0);
      expect(balance.annual).toBe(12);
    });

    it('should return correct balance for a MALE user', () => {
      const user = { id: 2, gender: 'MALE' };
      const balance = getDefaultLeaveBalance(user);
      expect(balance.maternity).toBe(0);
      expect(balance.paternity).toBe(15);
    });
  });

  describe('toLocalCalendarDate', () => {
    it('should parse YYYY-MM-DD string correctly', () => {
      const date = toLocalCalendarDate('2024-04-20');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(3); // April is index 3
      expect(date.getDate()).toBe(20);
    });

    it('should return NaN date for invalid input', () => {
      const date = toLocalCalendarDate('invalid');
      expect(isNaN(date.getTime())).toBe(true);
    });
  });

  describe('getWorkingDays', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should calculate working days correctly (no holidays)', async () => {
      // 2024-04-01 (Mon) to 2024-04-05 (Fri) = 5 days
      holidayLib.findHolidaysForOrgInDateRange.mockResolvedValue([]);
      
      const days = await getWorkingDays('2024-04-01', '2024-04-05', 1);
      expect(days).toBe(5);
    });

    it('should exclude weekends', async () => {
      // 2024-04-05 (Fri) to 2024-04-08 (Mon) = Fri, Sat, Sun, Mon
      // Should be 2 working days (Fri, Mon)
      holidayLib.findHolidaysForOrgInDateRange.mockResolvedValue([]);
      
      const days = await getWorkingDays('2024-04-05', '2024-04-08', 1);
      expect(days).toBe(2);
    });

    it('should exclude holidays', async () => {
      // 2024-04-01 (Mon) to 2024-04-03 (Wed)
      // 2nd April is a holiday
      holidayLib.findHolidaysForOrgInDateRange.mockResolvedValue([
        { date: new Date('2024-04-02T00:00:00') }
      ]);
      
      const days = await getWorkingDays('2024-04-01', '2024-04-03', 1);
      expect(days).toBe(2);
    });
  });

  describe('getMonthlyNetFromSalaryStructure', () => {
    it('should calculate net salary correctly', () => {
      const salary = {
        basicSalary: 50000,
        hra: 20000,
        allowance: 10000,
        bonus: 5000,
        pf: 5000,
        tax: 2000,
        professionalTax: 200,
      };
      // 50000 + 20000 + 10000 + 5000 - 5000 - 2000 - 200 = 77800
      const net = getMonthlyNetFromSalaryStructure(salary);
      expect(net).toBe(77800);
    });

    it('should handle missing values as 0', () => {
      const salary = { basicSalary: 50000 };
      const net = getMonthlyNetFromSalaryStructure(salary);
      expect(net).toBe(50000);
    });
  });

  describe('recalculatePayrollForMonth', () => {
    beforeEach(() => {
      vi.resetAllMocks();
    });

    it('should upsert payroll record with correct calculations', async () => {
      const userId = 1;
      const organizationId = 1;
      const year = 2024;
      const month = 4; // April (30 days)

      const mockSalaryStructure = {
        id: 10,
        basicSalary: 60000,
        hra: 20000,
        allowance: 10000,
        bonus: 5000,
        pf: 5000,
        tax: 2000,
        professionalTax: 500,
        effectiveFrom: new Date('2024-01-01'),
        isActive: true,
      };

      const mockLopAgg = { _sum: { lopDays: 2 } };

      const { default: prisma } = await import('../src/prismaClient.js');
      vi.mock('../src/prismaClient.js', () => ({
        default: {
          salaryStructure: {
            findFirst: vi.fn(),
          },
          leave: {
            aggregate: vi.fn(),
          },
          payroll: {
            findUnique: vi.fn(),
            upsert: vi.fn(),
          },
        },
      }));

      prisma.salaryStructure.findFirst.mockResolvedValue(mockSalaryStructure);
      prisma.leave.aggregate.mockResolvedValue(mockLopAgg);
      prisma.payroll.findUnique.mockResolvedValue(null);
      prisma.payroll.upsert.mockResolvedValue({});

      const { recalculatePayrollForMonth } = await import('../src/services/leaveService.js');
      await recalculatePayrollForMonth({ userId, organizationId, year, month });

      // monthlyNet = 60000 + 20000 + 10000 + 5000 - 5000 - 2000 - 500 = 87500
      // dailyRate = 87500 / 30 = 2916.666
      // lopDeduction = 2 * 2916.666 = 5833.33
      // netSalary = 87500 - 5833.33 = 81666.67

      expect(prisma.payroll.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            lopDays: 2,
            lopAmount: 5833.33,
            netSalary: 81666.67,
          }),
        })
      );
    });

    it('should ignore if salary structure is missing', async () => {
      const { default: prisma } = await import('../src/prismaClient.js');
      prisma.salaryStructure.findFirst.mockResolvedValue(null);
      
      const { recalculatePayrollForMonth } = await import('../src/services/leaveService.js');
      await recalculatePayrollForMonth({ userId: 1, organizationId: 1, year: 2024, month: 4 });
      
      expect(prisma.payroll.upsert).not.toHaveBeenCalled();
    });
  });

  describe('recalculatePayrollForLeaveRange', () => {
    it('should trigger recalculation for all months in range', async () => {
      vi.resetAllMocks();
      const { recalculatePayrollForLeaveRange } = await import('../src/services/leaveService.js');
      
      // Mock recalculatePayrollForMonth to track calls
      // but it's exported from the same module, so we need to mock the implementation
      // Since it's an ESM, we might need a different approach, but let's try calling it and verify DB calls.
      
      const { default: prisma } = await import('../src/prismaClient.js');
      prisma.salaryStructure.findFirst.mockResolvedValue({ basicSalary: 50000 });
      prisma.leave.aggregate.mockResolvedValue({ _sum: { lopDays: 0 } });
      
      const leave = {
        userId: 1,
        organizationId: 1,
        startDate: new Date('2024-03-25'),
        endDate: new Date('2024-04-05'),
      };

      await recalculatePayrollForLeaveRange(leave);

      // Should be called for March (3) and April (4)
      expect(prisma.salaryStructure.findFirst).toHaveBeenCalledTimes(2);
      expect(prisma.payroll.upsert).toHaveBeenCalledTimes(2);
    });
  });
});
