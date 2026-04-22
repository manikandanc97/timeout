import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import { executeAction } from '../src/services/aiActionExecutor.js';

vi.mock('../src/services/aiAuditService.js', () => ({
  logAIAction: vi.fn(),
  getAuditLogs: vi.fn(),
}));

vi.mock('../src/controllers/leaveController.js', () => ({
  applyLeave: vi.fn().mockImplementation(async (req, res) => {
    res.status(201).json({ message: 'Applied' });
  }),
  applyPermissionRequest: vi.fn().mockImplementation(async (req, res) => {
    res.json({ message: 'Permission Applied' });
  }),
}));

describe('aiActionExecutor', () => {
  const mockUser = {
    id: 1,
    name: 'Bob',
    role: 'EMPLOYEE',
    organizationId: 10,
    gender: 'MALE'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return error for unknown action', async () => {
    const result = await executeAction({
      action: 'UNKNOWN_MAGIC',
      user: mockUser,
      fields: {}
    });

    expect(result.success).toBe(false);
    expect(result.data.message).toContain("I don't know how to execute");
  });

  describe('APPLY_LEAVE', () => {
    it('should call applyLeave controller with mapped fields', async () => {
      const { applyLeave } = await import('../src/controllers/leaveController.js');
      
      const result = await executeAction({
        action: 'APPLY_LEAVE',
        user: mockUser,
        fields: {
          leaveType: 'annual',
          startDate: '2024-05-01',
          endDate: '2024-05-02',
          reason: 'Vacation'
        }
      });

      expect(applyLeave).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Applied');
    });
  });

  describe('CHECK_LEAVE_BALANCE', () => {
    it('should return leave balance directly from DB', async () => {
      mockPrisma.leaveBalance.findUnique.mockResolvedValue({
        annual: 10,
        sick: 5,
        compOff: 2
      });

      const result = await executeAction({
        action: 'CHECK_LEAVE_BALANCE',
        user: mockUser,
        fields: {}
      });

      expect(result.success).toBe(true);
      expect(result.data.balance.annual).toBe(10);
    });
  });

  describe('VIEW_PENDING_REQUESTS', () => {
    it('should fetch pending leaves from DB', async () => {
      mockPrisma.leave.findMany.mockResolvedValue([
        { id: 1, type: 'ANNUAL', startDate: new Date() }
      ]);

      const result = await executeAction({
        action: 'VIEW_PENDING_REQUESTS',
        user: mockUser,
        fields: {}
      });

      expect(result.success).toBe(true);
      expect(result.data.pendingLeaves).toHaveLength(1);
    });
  });
});
