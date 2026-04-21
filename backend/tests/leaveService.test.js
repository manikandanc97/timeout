import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js'; // Must be first to mock prismaClient
import { mockPrisma } from './prismaMock.js';
import { 
  getDefaultLeaveBalance, 
  toLocalCalendarDate, 
  getWorkingDays, 
  getMonthlyNetFromSalaryStructure,
  recalculatePayrollForMonth,
  recalculatePayrollForLeaveRange,
  applyLeave
} from '../src/services/leaveService.js';
import * as holidayLib from '../src/lib/findHolidaysForOrgInDateRange.js';

vi.mock('../src/lib/findHolidaysForOrgInDateRange.js');

describe('LeaveService', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('getDefaultLeaveBalance', () => {
    it('should return correct balance for a FEMALE user', () => {
      const user = { id: 1, gender: 'FEMALE' };
      const balance = getDefaultLeaveBalance(user);
      expect(balance.maternity).toBe(180);
      expect(balance.annual).toBe(12);
    });

    it('should return correct balance for a MALE user', () => {
      const user = { id: 2, gender: 'MALE' };
      const balance = getDefaultLeaveBalance(user);
      expect(balance.paternity).toBe(15);
    });
  });

  describe('getWorkingDays', () => {
    it('should calculate working days correctly (no holidays)', async () => {
      vi.mocked(holidayLib.findHolidaysForOrgInDateRange).mockResolvedValue([]);
      const days = await getWorkingDays('2024-04-01', '2024-04-05', 1);
      expect(days).toBe(5);
    });

    it('should exclude weekends', async () => {
      vi.mocked(holidayLib.findHolidaysForOrgInDateRange).mockResolvedValue([]);
      const days = await getWorkingDays('2024-04-05', '2024-04-08', 1);
      expect(days).toBe(2); // Fri, Mon
    });
  });

  describe('recalculatePayrollForMonth', () => {
    it('should upsert payroll record with correct calculations', async () => {
      const mockSalaryStructure = {
        id: 10,
        basicSalary: 60000,
        hra: 20000,
        allowance: 10000,
        effectiveFrom: new Date('2024-01-01'),
        isActive: true,
      };

      mockPrisma.salaryStructure.findFirst.mockResolvedValue(mockSalaryStructure);
      mockPrisma.leave.aggregate.mockResolvedValue({ _sum: { lopDays: 2 } });
      mockPrisma.payroll.findUnique.mockResolvedValue(null);

      await recalculatePayrollForMonth({ userId: 1, organizationId: 1, year: 2024, month: 4 });

      expect(mockPrisma.payroll.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          update: expect.objectContaining({
            lopDays: 2,
            lopAmount: 6000, // (60k+20k+10k) / 30 * 2 = 90k / 30 * 2 = 6k
            netSalary: 84000,
          }),
        })
      );
    });
  });

  describe('applyLeave', () => {
    const mockUser = {
      id: 1,
      organizationId: 101,
      teamId: 5,
      name: 'Test Employee',
      gender: 'MALE',
    };

    it('should create a leave and update balance when balance is sufficient', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.leaveBalance.findUnique.mockResolvedValue({ userId: 1, annual: 10, sick: 5 });
      mockPrisma.leave.findFirst.mockResolvedValue(null);
      vi.mocked(holidayLib.findHolidaysForOrgInDateRange).mockResolvedValue([]);
      
      mockPrisma.leave.create.mockResolvedValue({ id: 1, userId: 1, organizationId: 101, startDate: new Date('2024-04-01'), endDate: new Date('2024-04-02') });

      const result = await applyLeave({
        userId: 1,
        organizationId: 101,
        type: 'ANNUAL',
        startDate: '2024-04-01',
        endDate: '2024-04-02',
        reason: 'Vacation',
      });

      expect(result.impact.totalDays).toBe(2);
      expect(mockPrisma.leaveBalance.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { annual: { decrement: 2 } }
      }));
    });

    it('should calculate LOP when balance is insufficient', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.leaveBalance.findUnique.mockResolvedValue({ userId: 1, annual: 1 });
      mockPrisma.leave.findFirst.mockResolvedValue(null);
      vi.mocked(holidayLib.findHolidaysForOrgInDateRange).mockResolvedValue([]);
      mockPrisma.salaryStructure.findFirst.mockResolvedValue({ id: 1, basicSalary: 30000, isActive: true });
      mockPrisma.leave.create.mockResolvedValue({ id: 1, userId: 1, organizationId: 101, startDate: new Date('2024-04-01'), endDate: new Date('2024-04-03') });

      const result = await applyLeave({
        userId: 1,
        organizationId: 101,
        type: 'ANNUAL',
        startDate: '2024-04-01',
        endDate: '2024-04-03',
        reason: 'Vacation',
      });

      expect(result.impact.lopDays).toBe(2);
      expect(result.impact.lopAmount).toBe(2000); // 30k / 30 * 2
    });

    it('should throw error if dates are invalid', async () => {
      await expect(applyLeave({
        userId: 1,
        organizationId: 101,
        type: 'ANNUAL',
        startDate: '2024-04-10',
        endDate: '2024-04-01',
        reason: 'Oops',
      })).rejects.toThrow('From date cannot be after To date');
    });
  });
});
