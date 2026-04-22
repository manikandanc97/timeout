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
    mockPrisma.attendanceLog.findMany.mockResolvedValue([]);
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
        employeeAttendanceHoursToday: expect.any(Array),
        teamAttendanceHoursToday: expect.any(Array),
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

    it('should include employee and team attendance hours for today', async () => {
      mockPrisma.attendanceLog.findMany.mockResolvedValue([
        {
          workHours: 8.5,
          checkIn: new Date('2026-04-22T09:00:00.000Z'),
          checkOut: new Date('2026-04-22T17:30:00.000Z'),
          user: { id: 2, name: 'Balaji', team: { name: 'Payroll Team' } },
        },
        {
          workHours: 6.25,
          checkIn: new Date('2026-04-22T09:30:00.000Z'),
          checkOut: new Date('2026-04-22T15:45:00.000Z'),
          user: { id: 3, name: 'Karthik', team: { name: 'Payroll Team' } },
        },
      ]);

      await adminController.getAdminDashboardData(req, res);

      const result = res.json.mock.calls[0][0];
      expect(result.employeeAttendanceHoursToday).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ userName: 'Balaji', hours: 8.5 }),
          expect.objectContaining({ userName: 'Karthik', hours: 6.25 }),
        ]),
      );
      expect(result.teamAttendanceHoursToday).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ teamName: 'Payroll Team', hours: 14.75 }),
        ]),
      );
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
