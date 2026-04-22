import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import { logAIAction, getAuditLogs } from '../src/services/aiAuditService.js';

describe('aiAuditService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('logAIAction', () => {
    it('should create an audit log entry', async () => {
      mockPrisma.aiAuditLog.create.mockResolvedValue({ id: 1 });
      
      await logAIAction({
        organizationId: 10,
        userId: 1,
        userName: 'Alice',
        userRole: 'EMPLOYEE',
        intent: 'APPLY_LEAVE',
        action: 'Applied for leave through AI',
        payload: { days: 2 },
        result: { success: true }
      });

      expect(mockPrisma.aiAuditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: 10,
          intent: 'APPLY_LEAVE',
          userName: 'Alice'
        })
      });
    });

    it('should not throw if prisma fails (silent failure)', async () => {
      mockPrisma.aiAuditLog.create.mockRejectedValue(new Error('DB Down'));
      
      await expect(logAIAction({ organizationId: 10 })).resolves.not.toThrow();
    });
  });

  describe('getAuditLogs', () => {
    it('should return logs with pagination and total count', async () => {
      mockPrisma.aiAuditLog.findMany.mockResolvedValue([{ id: 1 }, { id: 2 }]);
      mockPrisma.aiAuditLog.count.mockResolvedValue(2);

      const result = await getAuditLogs(10, { page: 1, limit: 10 });

      expect(result.logs).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(mockPrisma.aiAuditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10
      }));
    });

    it('should apply filters for intent and status', async () => {
      mockPrisma.aiAuditLog.findMany.mockResolvedValue([]);
      mockPrisma.aiAuditLog.count.mockResolvedValue(0);

      await getAuditLogs(10, { intent: 'APPLY_LEAVE', status: 'SUCCESS' });

      expect(mockPrisma.aiAuditLog.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          intent: 'APPLY_LEAVE',
          status: 'SUCCESS'
        })
      }));
    });
  });
});
