import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import * as orgController from '../src/controllers/organizationController.js';

vi.mock('../src/services/notificationService.js', () => ({
  notifyAdmins: vi.fn().mockResolvedValue(undefined),
  notifyEmployeeProfileEvent: vi.fn().mockResolvedValue(undefined),
  notifyOrgWide: vi.fn().mockResolvedValue(undefined),
  getRoleLabel: vi.fn((r) => r),
}));
vi.mock('../src/services/emailService.js', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('bcrypt', () => ({
  default: {
    hash: vi.fn().mockImplementation((p) => Promise.resolve(`hashed_${p}`)),
    compare: vi.fn(),
  },
}));
vi.mock('../src/services/payroll/payrollAuditService.js', () => ({
  logSalaryChange: vi.fn().mockResolvedValue(undefined),
}));

describe('organizationController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { user: { id: 1, organizationId: 10, role: 'ADMIN' }, body: {}, query: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      send: vi.fn(),
    };
    // Default mocks
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, organizationId: 10, role: 'ADMIN', isActive: true });
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.user.count.mockResolvedValue(0);
    mockPrisma.leave.findMany.mockResolvedValue([]);
  });

  // ─── getOrganizationEmployees ──────────────────────────────────────────────

  describe('getOrganizationEmployees', () => {
    it('should return employees list with pagination', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{
        id: 2, name: 'Bob', email: 'bob@test.com', role: 'EMPLOYEE', designation: 'Dev',
        isActive: true, gender: 'MALE', createdAt: new Date(), birthDate: null, joiningDate: null,
        team: { id: 5, name: 'Backend', department: { id: 1, name: 'Engineering' } },
        reportingManager: { id: 1, name: 'Admin' },
      }]);
      mockPrisma.user.count.mockResolvedValue(1);

      await orgController.getOrganizationEmployees(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        employees: expect.arrayContaining([expect.objectContaining({ name: 'Bob' })]),
        meta: expect.objectContaining({ total: 1 }),
      }));
    });

    it('should scope to reportingManagerId when actor is MANAGER', async () => {
      req.user.role = 'MANAGER';
      mockPrisma.user.findMany.mockResolvedValue([]);
      mockPrisma.user.count.mockResolvedValue(0);

      await orgController.getOrganizationEmployees(req, res);

      const whereArg = mockPrisma.user.findMany.mock.calls[0][0].where;
      expect(whereArg.reportingManagerId).toBe(1);
    });
  });

  // ─── getReportingManagerOptions ─────────────────────────────────────────────

  describe('getReportingManagerOptions', () => {
    it('should return 403 for non-admin', async () => {
      req.user.role = 'EMPLOYEE';

      await orgController.getReportingManagerOptions(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return options for admin', async () => {
      mockPrisma.user.findMany.mockResolvedValue([{ id: 2, name: 'Manager A' }]);

      await orgController.getReportingManagerOptions(req, res);

      expect(res.json).toHaveBeenCalledWith({ options: [{ id: 2, name: 'Manager A' }] });
    });
  });

  // ─── createOrganizationDepartment ──────────────────────────────────────────

  describe('createOrganizationDepartment', () => {
    it('should block non-admin', async () => {
      req.user.role = 'MANAGER';
      req.body = { name: 'Finance' };

      await orgController.createOrganizationDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should require a department name', async () => {
      req.body = { name: '   ' };

      await orgController.createOrganizationDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Department name is required' });
    });

    it('should create department and return 201', async () => {
      req.body = { name: 'Finance' };
      mockPrisma.department.aggregate = vi.fn().mockResolvedValue({ _max: { sortOrder: 0 } });
      mockPrisma.department.create = vi.fn().mockResolvedValue({ id: 5, name: 'Finance', sortOrder: 1 });

      await orgController.createOrganizationDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        department: expect.objectContaining({ name: 'Finance' }),
      }));
    });
  });

  // ─── deleteOrganizationDepartment ──────────────────────────────────────────

  describe('deleteOrganizationDepartment', () => {
    it('should block deletion if teams exist', async () => {
      req.params = { departmentId: '5' };
      mockPrisma.department.findFirst = vi.fn().mockResolvedValue({ id: 5, name: 'HR', _count: { teams: 3 } });

      await orgController.deleteOrganizationDepartment(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('teams'),
      }));
    });

    it('should delete department with no teams', async () => {
      req.params = { departmentId: '5' };
      mockPrisma.department.findFirst = vi.fn().mockResolvedValue({ id: 5, name: 'HR', _count: { teams: 0 } });
      mockPrisma.department.delete = vi.fn().mockResolvedValue({});

      await orgController.deleteOrganizationDepartment(req, res);

      expect(mockPrisma.department.delete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  // ─── createOrganizationTeam ─────────────────────────────────────────────────

  describe('createOrganizationTeam', () => {
    it('should block non-admin', async () => {
      req.user.role = 'EMPLOYEE';
      req.body = { name: 'Backend', departmentId: 1 };

      await orgController.createOrganizationTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should require name and departmentId', async () => {
      req.body = { name: 'Backend' }; // missing departmentId

      await orgController.createOrganizationTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should create team under valid department', async () => {
      req.body = { name: 'Backend', departmentId: 1 };
      mockPrisma.department.findFirst = vi.fn().mockResolvedValue({ id: 1, name: 'Engineering', organizationId: 10 });
      mockPrisma.team.create = vi.fn().mockResolvedValue({
        id: 10, name: 'Backend', departmentId: 1, organizationId: 10,
        department: { id: 1, name: 'Engineering' }, _count: { members: 0 }, createdAt: new Date(),
      });

      await orgController.createOrganizationTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        team: expect.objectContaining({ name: 'Backend' }),
      }));
    });
  });

  // ─── deleteOrganizationTeam ─────────────────────────────────────────────────

  describe('deleteOrganizationTeam', () => {
    it('should block deletion if team has members', async () => {
      req.params = { teamId: '10' };
      mockPrisma.team.findFirst = vi.fn().mockResolvedValue({ id: 10, name: 'Backend', _count: { members: 5 } });

      await orgController.deleteOrganizationTeam(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('employees'),
      }));
    });

    it('should delete empty team', async () => {
      req.params = { teamId: '10' };
      mockPrisma.team.findFirst = vi.fn().mockResolvedValue({ id: 10, name: 'Backend', _count: { members: 0 } });
      mockPrisma.team.delete = vi.fn().mockResolvedValue({});

      await orgController.deleteOrganizationTeam(req, res);

      expect(mockPrisma.team.delete).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(204);
    });
  });

  // ─── createEmployeeUser ─────────────────────────────────────────────────────

  describe('createEmployeeUser', () => {
    it('should block non-admin from creating employees', async () => {
      req.user.role = 'MANAGER';
      req.body = { name: 'Jane', email: 'jane@test.com', password: 'pass', teamId: 5, gender: 'FEMALE', designation: 'Dev' };

      await orgController.createEmployeeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should require designation', async () => {
      req.body = { name: 'Jane', email: 'jane@test.com', password: 'pass', teamId: 5, gender: 'FEMALE' };

      await orgController.createEmployeeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Designation is required' });
    });

    it('should reject invalid gender', async () => {
      req.body = { name: 'Jane', email: 'jane@test.com', password: 'pass', teamId: 5, gender: 'UNKNOWN', designation: 'Dev' };

      await orgController.createEmployeeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Gender is required' });
    });

    it('should create employee with all valid fields', async () => {
      req.body = {
        name: 'Jane', email: 'jane@test.com', password: 'pass123',
        teamId: 5, gender: 'FEMALE', designation: 'Developer',
        joiningDate: '2024-01-15',
      };
      // First call: findUnique for email check → null (not taken)
      // Second call also findUnique — use mockImplementationOnce for sequence
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)  // email check — not taken
        .mockResolvedValueOnce(undefined); // fallback
      mockPrisma.team.findFirst.mockResolvedValue({ id: 5, organizationId: 10 });
      mockPrisma.user.create.mockResolvedValue({
        id: 9, name: 'Jane', email: 'jane@test.com', role: 'EMPLOYEE', designation: 'Developer',
        organizationId: 10, isActive: true, gender: 'FEMALE', teamId: 5,
        birthDate: null, joiningDate: new Date('2024-01-15'), createdAt: new Date(),
        reportingManagerId: null, team: null,
      });
      mockPrisma.leaveBalance.create.mockResolvedValue({});

      await orgController.createEmployeeUser(req, res);

      expect(mockPrisma.user.create).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  // ─── deleteEmployeeUser ─────────────────────────────────────────────────────

  describe('deleteEmployeeUser', () => {
    it('should block non-admin from deleting employees', async () => {
      req.user.role = 'MANAGER';
      req.params = { userId: '9' };

      await orgController.deleteEmployeeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if employee not found', async () => {
      req.params = { userId: '999' };
      mockPrisma.user.findFirst = vi.fn().mockResolvedValue(null);

      await orgController.deleteEmployeeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─── updateEmployeeUser ───────────────────────────────────────────────────

  describe('updateEmployeeUser', () => {
    it('should block non-admin', async () => {
      req.user.role = 'MANAGER';
      req.params = { userId: '9' };

      await orgController.updateEmployeeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should update name and email', async () => {
      req.params = { userId: '9' };
      req.body = { name: 'New Name', email: 'new@test.com' };
      mockPrisma.user.findFirst
        .mockResolvedValueOnce({ id: 9, organizationId: 10, role: 'EMPLOYEE' }) // existing check
        .mockResolvedValueOnce(null); // email conflict check
      mockPrisma.user.update.mockResolvedValue({ id: 9, name: 'New Name', email: 'new@test.com' });

      await orgController.updateEmployeeUser(req, res);

      expect(mockPrisma.user.update).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ name: 'New Name', email: 'new@test.com' })
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Employee updated' }));
    });

    it('should reject duplicate email', async () => {
      req.params = { userId: '9' };
      req.body = { email: 'duplicate@test.com' };
      mockPrisma.user.findFirst
        .mockResolvedValueOnce({ id: 9, organizationId: 10, role: 'EMPLOYEE' })
        .mockResolvedValueOnce({ id: 8, email: 'duplicate@test.com' }); // conflict!

      await orgController.updateEmployeeUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email already in use' });
    });
  });

  // ─── updateAdminSettings ───────────────────────────────────────────────────

  describe('updateAdminSettings', () => {
    it('should update organization details and settings', async () => {
      req.body = {
        generalSettings: { companyName: 'New Corp', companyEmail: 'new@corp.com' },
        leavePolicySettings: { maxAnnualCarryForward: 5 }
      };
      mockPrisma.organization.findUnique.mockResolvedValue({ id: 10, name: 'New Corp', email: 'new@corp.com', adminSettings: {} });
      mockPrisma.organization.update.mockResolvedValue({ id: 10, name: 'New Corp', email: 'new@corp.com', adminSettings: { leavePolicySettings: { maxAnnualCarryForward: 5 } } });

      await orgController.updateAdminSettings(req, res);

      expect(mockPrisma.organization.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('leavePolicy', () => {
    it('should return leave policy', async () => {
      const validPolicy = {
        intro: 'Intro',
        footer: 'Footer',
        sections: [{ kind: 'text', iconKey: 'BookOpen', title: 'T1', body: 'B'.repeat(51) }]
      };
      mockPrisma.organization.findUnique.mockResolvedValue({ leavePolicy: validPolicy });
      await orgController.getLeavePolicy(req, res);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ policy: expect.objectContaining({ intro: 'Intro' }) }));
    });

    it('should update leave policy', async () => {
      req.body = {
        intro: 'New Intro',
        footer: 'New Footer',
        sections: [{ kind: 'text', iconKey: 'BookOpen', title: 'T1', body: 'B'.repeat(51) }]
      };
      mockPrisma.organization.update.mockResolvedValue({ leavePolicy: req.body });
      await orgController.updateLeavePolicy(req, res);
      expect(mockPrisma.organization.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalled();
    });

    it('should reset leave policy', async () => {
      await orgController.resetLeavePolicy(req, res);
      expect(mockPrisma.organization.update).toHaveBeenCalledWith(expect.objectContaining({
        data: { leavePolicy: null }
      }));
      expect(res.json).toHaveBeenCalled();
    });
  });

  describe('testSmtpConfiguration', () => {
    it('should send a test email', async () => {
      req.body = { targetEmail: 'test@example.com' };
      await orgController.testSmtpConfiguration(req, res);
      const { sendEmail } = await import('../src/services/emailService.js');
      expect(sendEmail).toHaveBeenCalledWith(expect.objectContaining({ to: 'test@example.com' }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('successfully') }));
    });
  });
});
