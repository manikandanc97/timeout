import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import { updatePayrollStatus } from '../src/services/payroll/payrollWorkflowService.js';

vi.mock('../src/services/payroll/payrollAuditService.js', () => ({
  logPayrollAudit: vi.fn().mockResolvedValue(undefined),
}));

describe('payrollWorkflowService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('updatePayrollStatus', () => {
    it('should throw error if payroll record not found', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue(null);

      await expect(updatePayrollStatus({
        payrollId: 1,
        organizationId: 10,
        status: 'REVIEWED',
        actorId: 5
      })).rejects.toThrow('Payroll record not found');
    });

    it('should throw error for invalid status transition', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 1,
        organizationId: 10,
        status: 'DRAFT',
        user: { name: 'Bob' }
      });

      // DRAFT to APPROVED is invalid (must go to REVIEWED first)
      await expect(updatePayrollStatus({
        payrollId: 1,
        organizationId: 10,
        status: 'APPROVED',
        actorId: 5
      })).rejects.toThrow(/Invalid transition/);
    });

    it('should update status and create log on valid transition', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 1,
        organizationId: 10,
        status: 'DRAFT',
        user: { name: 'Bob' }
      });

      mockPrisma.$transaction.mockImplementation(async (cb) => {
        return await cb(mockPrisma);
      });

      mockPrisma.payroll.update.mockResolvedValue({ id: 1, status: 'REVIEWED' });
      mockPrisma.payrollApprovalLog.create.mockResolvedValue({ id: 100 });

      const result = await updatePayrollStatus({
        payrollId: 1,
        organizationId: 10,
        status: 'REVIEWED',
        actorId: 5,
        comment: 'Looks good'
      });

      expect(result.status).toBe('REVIEWED');
      expect(mockPrisma.payroll.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'REVIEWED' })
      }));
      expect(mockPrisma.payrollApprovalLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ status: 'REVIEWED', comment: 'Looks good' })
      }));
    });

    it('should set paidDate when moving to PAID status', async () => {
      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 1,
        organizationId: 10,
        status: 'APPROVED',
        user: { name: 'Bob' }
      });

      mockPrisma.$transaction.mockImplementation(async (cb) => {
        return await cb(mockPrisma);
      });

      mockPrisma.payroll.update.mockResolvedValue({ id: 1, status: 'PAID' });

      await updatePayrollStatus({
        payrollId: 1,
        organizationId: 10,
        status: 'PAID',
        actorId: 5
      });

      expect(mockPrisma.payroll.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          status: 'PAID',
          paidDate: expect.any(Date)
        })
      }));
    });
  });
});
