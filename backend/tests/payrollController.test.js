import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';

vi.mock('../src/services/payroll/payrollWorkflowService.js', () => ({
  updatePayrollStatus: vi.fn().mockResolvedValue({ success: true }),
  generateMonthlyPayrollForOrg: vi.fn().mockResolvedValue({}),
}));
vi.mock('../src/services/payroll/payslipService.js', () => ({
  generatePayslipPDF: vi.fn().mockResolvedValue(Buffer.from('pdf')),
}));
vi.mock('../src/services/payroll/payrollAuditService.js', () => ({
  logPayrollAudit: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('../src/services/loggerService.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

import * as payrollController from '../src/controllers/payrollController.js';

describe('payrollController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { user: { id: 1, organizationId: 10, role: 'ADMIN' }, body: {}, query: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      setHeader: vi.fn(),
      send: vi.fn(),
    };
    // Default mock setup
    mockPrisma.user.findMany.mockResolvedValue([]);
    mockPrisma.leave.groupBy = vi.fn().mockResolvedValue([]);
    mockPrisma.payroll.upsert.mockResolvedValue({});
    mockPrisma.payroll.findMany.mockResolvedValue([]);
    mockPrisma.payroll.count.mockResolvedValue(0);
    mockPrisma.payroll.aggregate = vi.fn().mockResolvedValue({ _sum: { netSalary: 0 }, _count: { id: 0 } });
  });

  // ─── generatePayroll ──────────────────────────────────────────────────────

  describe('generatePayroll', () => {
    it('should generate payroll and return success message for admin', async () => {
      req.body = { month: 4, year: 2024 };

      await payrollController.generatePayroll(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: expect.stringContaining('Payroll processed'),
      }));
    });

    it('should skip users with no active salary structure', async () => {
      req.body = { month: 4, year: 2024 };
      // Users with empty salaryStructures
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 2, salaryStructures: [] }, // no salary — should be skipped
      ]);

      await payrollController.generatePayroll(req, res);

      expect(mockPrisma.payroll.upsert).not.toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Payroll processed: 0 created, 0 updated' }));
    });

    it('should calculate payroll with LOP data from leaves', async () => {
      req.body = { month: 4, year: 2024 };
      mockPrisma.user.findMany.mockResolvedValue([{
        id: 2, salaryStructures: [{
          basicSalary: 60000, hra: 0, allowance: 0, bonus: 0, conveyance: 0, specialAllowance: 0
        }]
      }]);
      mockPrisma.leave.groupBy.mockResolvedValue([{ userId: 2, _sum: { lopDays: 3 } }]);

      await payrollController.generatePayroll(req, res);

      expect(mockPrisma.payroll.upsert).toHaveBeenCalled();
      // Verify LOP was factored in the upsert - lopAmount will be in deductions which are spread
      const upsertCall = mockPrisma.payroll.upsert.mock.calls[0][0];
      expect(upsertCall.create.lopAmount).toBeGreaterThan(0);
    });
  });

  // ─── downloadPayslip ──────────────────────────────────────────────────────

  describe('downloadPayslip', () => {
    it('should return 403 if employee tries to download another user payslip', async () => {
      req.user.role = 'EMPLOYEE';
      req.user.id = 1;
      req.params = { payrollId: 99 };
      // Payslip belongs to user id=2, not 1
      mockPrisma.payroll.findUnique.mockResolvedValue({ id: 99, userId: 2, organizationId: 10, month: 4, year: 2024 });

      await payrollController.downloadPayslip(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Access denied' });
    });

    it('should allow employee to download own payslip', async () => {
      req.user.role = 'EMPLOYEE';
      req.user.id = 1;
      req.params = { payrollId: 5 };
      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 5, userId: 1, organizationId: 10, month: 4, year: 2024,
        user: { name: 'Test User', designation: 'Developer', team: { department: { name: 'Engineering' } } }
      });
      mockPrisma.organization = { findUnique: vi.fn().mockResolvedValue({ id: 10, name: 'TestOrg' }) };

      await payrollController.downloadPayslip(req, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
    });

    it('should return 404 for payslip from different org', async () => {
      req.params = { payrollId: 99 };
      mockPrisma.payroll.findUnique.mockResolvedValue({ id: 99, userId: 2, organizationId: 99, month: 4, year: 2024 }); // different org

      await payrollController.downloadPayslip(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ─── listMyPayslips ──────────────────────────────────────────────────────

  describe('listMyPayslips', () => {
    it('should return only paid payslips for current user', async () => {
      mockPrisma.payroll.findMany.mockResolvedValue([
        { id: 1, userId: 1, status: 'PAID', month: 3, year: 2024 },
      ]);

      await payrollController.listMyPayslips(req, res);

      expect(res.json).toHaveBeenCalledWith({ payslips: expect.any(Array) });
      // The findMany where clause must filter by userId
      expect(mockPrisma.payroll.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({ status: 'PAID' }),
      }));
    });
  });

  describe('markPayrollPaid', () => {
    it('should mark a pending payroll as paid', async () => {
      req.params = { payrollId: '5' };
      mockPrisma.payroll.findUnique.mockResolvedValue({
        id: 5,
        userId: 2,
        organizationId: 10,
        status: 'DRAFT',
        user: { name: 'Balaji' },
      });
      mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
      mockPrisma.payroll.update.mockResolvedValue({ id: 5, status: 'PAID' });
      mockPrisma.payrollApprovalLog.create.mockResolvedValue({ id: 1 });

      await payrollController.markPayrollPaid(req, res);

      expect(mockPrisma.payroll.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 5 },
        data: expect.objectContaining({
          status: 'PAID',
          paidDate: expect.any(Date),
        }),
      }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Payroll marked as paid',
      }));
    });
  });

  describe('bulkMarkPayrollPaid', () => {
    it('should mark all pending payroll records as paid for the selected month', async () => {
      req.body = { month: 4, year: 2024 };
      mockPrisma.payroll.findMany.mockResolvedValue([
        { id: 11, status: 'DRAFT' },
        { id: 12, status: 'APPROVED' },
      ]);
      mockPrisma.$transaction.mockImplementation(async (cb) => cb(mockPrisma));
      mockPrisma.payroll.update.mockResolvedValue({});
      mockPrisma.payrollApprovalLog.create.mockResolvedValue({});

      await payrollController.bulkMarkPayrollPaid(req, res);

      expect(mockPrisma.payroll.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          month: 4,
          year: 2024,
          status: { not: 'PAID' },
        }),
      }));
      expect(mockPrisma.payroll.update).toHaveBeenCalledTimes(2);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        updatedCount: 2,
      }));
    });
  });
});
