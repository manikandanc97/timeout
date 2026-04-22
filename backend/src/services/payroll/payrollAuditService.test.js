import { describe, it, expect, vi, beforeEach } from 'vitest';
import '../../../tests/prismaMock.js';
import { mockPrisma } from '../../../tests/prismaMock.js';
import * as payrollAuditService from './payrollAuditService.js';

describe('payrollAuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logPayrollAudit', () => {
    it('should create an audit log entry', async () => {
      const payload = {
        organizationId: 1,
        actorId: 2,
        entityType: 'SALARY_STRUCTURE',
        entityId: 10,
        action: 'UPDATE',
        oldValue: { amount: 100 },
        newValue: { amount: 120 },
      };

      await payrollAuditService.logPayrollAudit(payload);

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 1,
          action: 'UPDATE',
          oldValue: expect.anything(),
          newValue: expect.anything(),
        })
      });
    });

    it('should handle errors silently and log them', async () => {
      mockPrisma.auditLog.create.mockRejectedValue(new Error('DB error'));
      // Should not throw
      await expect(payrollAuditService.logPayrollAudit({})).resolves.not.toThrow();
    });
  });

  describe('logSalaryChange', () => {
    it('should call logPayrollAudit with correct parameters', async () => {
      const oldStructure = { id: 10, organizationId: 1, amount: 100 };
      const newStructure = { id: 10, organizationId: 1, amount: 120 };
      
      await payrollAuditService.logSalaryChange(oldStructure, newStructure, 2);

      expect(mockPrisma.auditLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          entityType: 'SALARY_STRUCTURE',
          action: 'UPDATE',
        })
      }));
    });
  });
});
