import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import * as leaveController from '../src/controllers/leaveController.js';
import * as leaveService from '../src/services/leaveService.js';
import { findHolidaysForOrgInDateRange } from '../src/lib/findHolidaysForOrgInDateRange.js';

vi.mock('../src/services/leaveService.js', async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    applyLeave: vi.fn(),
    getWorkingDays: vi.fn().mockResolvedValue(1),
  };
});

vi.mock('../src/services/notificationService.js', () => ({
  notifyLeaveAppliedRecipients: vi.fn().mockResolvedValue(undefined),
  notifyEmployeeLeaveDecision: vi.fn().mockResolvedValue(undefined),
  notifyLeaveCancelledRecipients: vi.fn().mockResolvedValue(undefined),
  notifyPermissionAppliedRecipients: vi.fn().mockResolvedValue(undefined),
  notifyPermissionDecision: vi.fn().mockResolvedValue(undefined),
  notifyCompOffAppliedRecipients: vi.fn().mockResolvedValue(undefined),
  notifyCompOffDecision: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/lib/findHolidaysForOrgInDateRange.js', () => ({
  findHolidaysForOrgInDateRange: vi.fn().mockResolvedValue([]),
}));

describe('leaveController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { user: { id: 1, organizationId: 10, role: 'EMPLOYEE' }, body: {}, query: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, organizationId: 10, role: 'EMPLOYEE', reportingManagerId: 2, isActive: true });
    mockPrisma.salaryStructure.findFirst.mockResolvedValue(null);
    mockPrisma.leaveBalance.findUnique.mockResolvedValue({ userId: 2, annual: 10, sick: 5 });
    mockPrisma.leaveBalance.update.mockResolvedValue({});
    mockPrisma.leave.update.mockResolvedValue({ id: 100, status: 'APPROVED' });
    vi.mocked(leaveService.getWorkingDays).mockResolvedValue(1);
    vi.mocked(findHolidaysForOrgInDateRange).mockResolvedValue([]);
  });

  describe('updateLeaveStatus', () => {
    it('should block self-approval', async () => {
      req.params = { id: 100 };
      req.body = { status: 'APPROVED' };
      mockPrisma.leave.findUnique.mockResolvedValue({ id: 100, userId: 1, organizationId: 10, status: 'PENDING' });
      await leaveController.updateLeaveStatus(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should approve leave if actor is the reporting manager', async () => {
      req.params = { id: 100 };
      req.body = { status: 'APPROVED' };
      req.user = { id: 1, organizationId: 10, role: 'MANAGER' };
      mockPrisma.leave.findUnique.mockResolvedValue({ id: 100, userId: 2, organizationId: 10, status: 'PENDING', startDate: new Date(), endDate: new Date(), type: 'ANNUAL' });
      mockPrisma.user.findUnique.mockResolvedValue({ id: 2, role: 'EMPLOYEE', reportingManagerId: 1, organizationId: 10 });

      await leaveController.updateLeaveStatus(req, res);
      expect(mockPrisma.leave.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Leave status updated' }));
    });
  });

  describe('applyCompOffCredit', () => {
    it('should reject non-weekend work dates', async () => {
      req.body = { workDate: '2024-04-22', reason: 'Worked late' }; // Monday
      await leaveController.applyCompOffCredit(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should successfully create comp-off request for weekend', async () => {
      req.body = { workDate: '2024-04-20', reason: 'Sat work' }; // Saturday
      mockPrisma.compOffWorkLog.findUnique.mockResolvedValue(null);
      mockPrisma.compOffWorkLog.create.mockResolvedValue({ id: 1, workDate: new Date('2024-04-20') });
      await leaveController.applyCompOffCredit(req, res);
      expect(mockPrisma.compOffWorkLog.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('applyPermissionRequest', () => {
    it('should reject if monthly limit exceeded', async () => {
      req.body = { date: new Date().toISOString(), startTime: '10:00', endTime: '12:00', reason: 'Short' };
      mockPrisma.permissionRequest.aggregate.mockResolvedValue({ _sum: { durationMinutes: 180 } });
      await leaveController.applyPermissionRequest(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('getDashboardStats', () => {
    it('should return combined stats for employee', async () => {
      mockPrisma.leave.groupBy.mockResolvedValue([{ status: 'APPROVED', _count: { status: 5 } }]);
      mockPrisma.leaveBalance.findUnique.mockResolvedValue({ sick: 5, annual: 10, compOff: 2 });
      mockPrisma.leave.findMany.mockResolvedValue([]);
      
      await leaveController.getDashboardStats(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        totalLeaves: 5,
        balance: expect.objectContaining({ annual: 10 })
      }));
    });
  });
});
