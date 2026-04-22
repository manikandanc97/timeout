import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import * as adminController from '../src/controllers/adminController.js';

vi.mock('../src/services/notificationService.js', () => ({
  notifyAdmins: vi.fn().mockResolvedValue(undefined),
  getRoleLabel: vi.fn((r) => r),
  notifyOrgWide: vi.fn().mockResolvedValue(undefined),
}));

describe('adminController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { user: { id: 1, organizationId: 10, role: 'ADMIN' }, body: {}, query: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockPrisma.user.count.mockResolvedValue(10);
    mockPrisma.leave.count.mockResolvedValue(3);
    mockPrisma.leave.findMany.mockResolvedValue([]);
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.team.findMany.mockResolvedValue([]);
    mockPrisma.$queryRaw = vi.fn().mockResolvedValue([]);
  });

  // ─── getAdminDashboardData ─────────────────────────────────────────────────

  describe('getAdminDashboardData', () => {
    it('should return dashboard stats successfully', async () => {
      await adminController.getAdminDashboardData(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        totalEmployees: 10,
        pendingRequests: 3,
        presentToday: expect.any(Number),
        onLeaveToday: 0,
      }));
    });

    it('should include employees on leave today', async () => {
      mockPrisma.leave.findMany.mockResolvedValue([
        { type: 'ANNUAL', user: { id: 2, name: 'Bob' } },
      ]);

      await adminController.getAdminDashboardData(req, res);

      const result = res.json.mock.calls[0][0];
      expect(result.onLeaveToday).toBe(1);
      expect(result.employeesOnLeaveToday[0].userName).toBe('Bob');
    });
  });

  // ─── getAdminPermissionRequests ────────────────────────────────────────────

  describe('getAdminPermissionRequests', () => {
    it('should return empty list when no requests', async () => {
      mockPrisma.permissionRequest.findMany.mockResolvedValue([]);

      await adminController.getAdminPermissionRequests(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return permission requests for org', async () => {
      mockPrisma.permissionRequest.findMany.mockResolvedValue([
        { id: 1, userId: 2, organizationId: 10, status: 'PENDING', user: { id: 2, name: 'Bob', email: 'bob@test.com' } },
      ]);

      await adminController.getAdminPermissionRequests(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 1, status: 'PENDING' }),
      ]));
    });
  });

  // ─── getAdminCompOffRequests ────────────────────────────────────────────────

  describe('getAdminCompOffRequests', () => {
    it('should return comp off requests for org', async () => {
      mockPrisma.compOffWorkLog = { findMany: vi.fn().mockResolvedValue([
        { id: 1, userId: 2, status: 'PENDING', user: { id: 2, name: 'Bob', email: 'bob@test.com' } },
      ]) };

      await adminController.getAdminCompOffRequests(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({ id: 1 }),
      ]));
    });
  });
});
