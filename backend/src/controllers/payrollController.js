import prisma from '../prismaClient.js';
import { calculatePayroll } from '../services/payroll/payrollCalculator.js';
import { updatePayrollStatus } from '../services/payroll/payrollWorkflowService.js';
import { generatePayslipPDF } from '../services/payroll/payslipService.js';
import { logPayrollAudit } from '../services/payroll/payrollAuditService.js';
import { logger } from '../services/loggerService.js';

const ADMIN_ROLES = new Set(['ADMIN', 'MANAGER', 'HR']);

/**
 * List all payroll records for an organization/month/year
 */
export const listPayroll = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { month: m, year: y, page = 1, limit = 50 } = req.query;
    
    const month = Number(m || new Date().getMonth() + 1);
    const year = Number(y || new Date().getFullYear());
    const skip = (Number(page) - 1) * Number(limit);
    const pageSize = Number(limit);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    const userFilter = {
      organizationId,
      role: { not: 'ADMIN' },
      ...(req.user.role === 'MANAGER' ? { reportingManagerId: req.user.id } : {}),
    };

    const [users, payrollRows] = await Promise.all([
      prisma.user.findMany({
        where: userFilter,
        orderBy: [{ name: 'asc' }],
        include: {
          salaryStructures: {
            where: { isActive: true, effectiveFrom: { lte: monthEnd } },
            orderBy: { effectiveFrom: 'desc' },
            take: 1,
          },
          team: {
            select: {
              name: true,
              department: { select: { name: true } },
            },
          },
        },
      }),
      prisma.payroll.findMany({
        where: { organizationId, month, year, user: userFilter },
        orderBy: [{ user: { name: 'asc' } }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              designation: true,
              isActive: true,
              team: { select: { name: true, department: { select: { name: true } } } },
            },
          },
        },
      }),
    ]);
    const payrollByUserId = new Map(payrollRows.map((row) => [row.userId, row]));
    const mergedRows = users.map((user) => {
      const payroll = payrollByUserId.get(user.id);
      const salary = user.salaryStructures[0] ?? null;

      if (payroll) {
        const deductions =
          Number(payroll.pf || 0) +
          Number(payroll.tax || 0) +
          Number(payroll.professionalTax || 0) +
          Number(payroll.esi || 0) +
          Number(payroll.tds || 0) +
          Number(payroll.lopAmount || 0);

        return {
          id: payroll.id,
          userId: payroll.userId,
          employeeName: payroll.user?.name ?? user.name,
          employeeActive: payroll.user?.isActive ?? user.isActive,
          yearlyGrossSalary: payroll.yearlyGrossSalary,
          basicSalary: payroll.basicSalary,
          hra: payroll.hra,
          allowance: payroll.allowance,
          bonus: payroll.bonus,
          pf: payroll.pf,
          tax: payroll.tax,
          professionalTax: payroll.professionalTax,
          deductions,
          lopDays: payroll.lopDays,
          lopAmount: payroll.lopAmount,
          month: payroll.month,
          year: payroll.year,
          paidDate: payroll.paidDate,
          netSalary: payroll.netSalary,
          status: payroll.status === 'PAID' ? 'PAID' : 'PENDING',
          payrollAdded: true,
        };
      }

      return {
        id: -user.id,
        userId: user.id,
        employeeName: user.name,
        employeeActive: user.isActive,
        yearlyGrossSalary: salary?.yearlyGrossSalary ?? 0,
        basicSalary: 0,
        hra: 0,
        allowance: 0,
        bonus: 0,
        pf: 0,
        tax: 0,
        professionalTax: 0,
        deductions: 0,
        lopDays: 0,
        lopAmount: 0,
        month,
        year,
        paidDate: null,
        netSalary: 0,
        status: 'NOT_ADDED',
        payrollAdded: false,
      };
    });

    const totalCount = mergedRows.length;
    const pagedRows = mergedRows.slice(skip, skip + pageSize);
    const payrollProcessed = mergedRows.filter((row) => row.status === 'PAID').length;
    const pendingPayroll = mergedRows.filter((row) => row.status !== 'PAID').length;
    const totalSalaryPaid = mergedRows
      .filter((row) => row.status === 'PAID')
      .reduce((sum, row) => sum + Number(row.netSalary || 0), 0);
    const currentMonth = new Date(year, month - 1, 1).toLocaleString('en-IN', {
      month: 'short',
      year: 'numeric',
    });

    res.json({
      payroll: pagedRows,
      summary: {
        totalEmployees: totalCount,
        payrollProcessed,
        pendingPayroll,
        totalSalaryPaid,
        currentMonth,
      },
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: pageSize,
        totalPages: Math.ceil(totalCount / pageSize),
      },
    });
  } catch (error) {
    logger.error('[PayrollController] Failed to list payroll', error);
    res.status(500).json({ message: 'Failed to load payroll' });
  }
};

/**
 * Generate (or recalculate) payroll for a month
 */
export const generatePayroll = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const { month: m, year: y } = req.body;
    const month = Number(m || new Date().getMonth() + 1);
    const year = Number(y || new Date().getFullYear());

    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);

    // 1. Fetch Users & Their Active Salary Structures
    const users = await prisma.user.findMany({
      where: { organizationId, role: { not: 'ADMIN' }, isActive: true },
      include: {
        salaryStructures: {
          where: { isActive: true, effectiveFrom: { lte: monthEnd } },
          orderBy: { effectiveFrom: 'desc' },
          take: 1,
        },
      },
    });

    // 2. Fetch LOP data from Leaves
    const lopData = await prisma.leave.groupBy({
      by: ['userId'],
      where: {
        organizationId,
        status: 'APPROVED',
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      _sum: { lopDays: true },
    });

    const lopMap = new Map(lopData.map(d => [d.userId, d._sum.lopDays || 0]));

    let created = 0;
    let updated = 0;

    for (const user of users) {
      if (user.salaryStructures.length === 0) continue;

      const salary = user.salaryStructures[0];
      const lopDays = lopMap.get(user.id) || 0;
      
      const calculated = calculatePayroll(salary, { lopDays });

      await prisma.payroll.upsert({
        where: { userId_month_year: { userId: user.id, month, year } },
        create: {
          userId: user.id,
          organizationId,
          month,
          year,
          yearlyGrossSalary: salary.yearlyGrossSalary || 0,
          ...calculated.components,
          ...calculated.deductions,
          ...calculated.overtime,
          netSalary: calculated.netSalary,
          status: 'DRAFT',
        },
        update: {
          yearlyGrossSalary: salary.yearlyGrossSalary || 0,
          ...calculated.components,
          ...calculated.deductions,
          ...calculated.overtime,
          netSalary: calculated.netSalary,
        },
      });
      
      user.payrollId ? updated++ : created++;
    }

    await logPayrollAudit({
      organizationId,
      actorId: req.user.id,
      entityType: 'PAYROLL_BULK',
      entityId: 0,
      action: 'GENERATE',
      newValue: { month, year, created, updated },
    });

    res.json({ message: `Payroll processed: ${created} created, ${updated} updated` });
  } catch (error) {
    logger.error('[PayrollController] Generation failed', error);
    res.status(500).json({ message: 'Failed to generate payroll' });
  }
};

/**
 * Handle Workflow Status Updates
 */
export const updatePayrollWorkflowStatus = async (req, res) => {
  try {
    const { payrollId } = req.params;
    const { status, comment } = req.body;
    
    const result = await updatePayrollStatus({
      payrollId: Number(payrollId),
      organizationId: req.user.organizationId,
      status,
      comment,
      actorId: req.user.id,
    });

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const markPayrollPaid = async (req, res) => {
  try {
    const payrollId = Number(req.params.payrollId);
    const organizationId = req.user.organizationId;

    const payroll = await prisma.payroll.findUnique({
      where: { id: payrollId },
      include: { user: { select: { name: true } } },
    });

    if (!payroll || payroll.organizationId !== organizationId) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    if (payroll.status === 'PAID') {
      return res.json({ message: 'Payroll already marked as paid', payroll });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const nextPayroll = await tx.payroll.update({
        where: { id: payrollId },
        data: {
          status: 'PAID',
          paidDate: new Date(),
        },
      });

      await tx.payrollApprovalLog.create({
        data: {
          payrollId,
          organizationId,
          status: 'PAID',
          comment: 'Marked as paid from payroll page',
          actorId: req.user.id,
        },
      });

      return nextPayroll;
    });

    await logPayrollAudit({
      organizationId,
      actorId: req.user.id,
      entityType: 'PAYROLL',
      entityId: payrollId,
      action: 'MARK_PAID',
      oldValue: { status: payroll.status },
      newValue: { status: updated.status },
    });

    res.json({ message: 'Payroll marked as paid', payroll: updated });
  } catch (error) {
    logger.error('[PayrollController] Failed to mark payroll paid', error);
    res.status(500).json({ message: 'Failed to mark payroll paid' });
  }
};

export const bulkMarkPayrollPaid = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const month = Number(req.body.month);
    const year = Number(req.body.year);

    const payrolls = await prisma.payroll.findMany({
      where: {
        organizationId,
        month,
        year,
        status: { not: 'PAID' },
      },
      select: { id: true, status: true },
    });

    if (payrolls.length === 0) {
      return res.json({ message: 'No pending payroll records found', updatedCount: 0 });
    }

    const paidAt = new Date();
    await prisma.$transaction(async (tx) => {
      for (const payroll of payrolls) {
        await tx.payroll.update({
          where: { id: payroll.id },
          data: {
            status: 'PAID',
            paidDate: paidAt,
          },
        });

        await tx.payrollApprovalLog.create({
          data: {
            payrollId: payroll.id,
            organizationId,
            status: 'PAID',
            comment: 'Bulk marked as paid from payroll page',
            actorId: req.user.id,
          },
        });
      }
    });

    await logPayrollAudit({
      organizationId,
      actorId: req.user.id,
      entityType: 'PAYROLL_BULK',
      entityId: 0,
      action: 'MARK_PAID_BULK',
      oldValue: { month, year, updatedCount: 0 },
      newValue: { month, year, updatedCount: payrolls.length },
    });

    res.json({
      message: `Marked ${payrolls.length} payroll record(s) as paid`,
      updatedCount: payrolls.length,
    });
  } catch (error) {
    logger.error('[PayrollController] Failed to bulk mark payroll paid', error);
    res.status(500).json({ message: 'Failed to mark all payroll as paid' });
  }
};

/**
 * Download Payslip PDF
 */
export const downloadPayslip = async (req, res) => {
  try {
    const { payrollId } = req.params;
    const organizationId = req.user.organizationId;

    const payroll = await prisma.payroll.findUnique({
      where: { id: Number(payrollId) },
      include: {
        user: { 
          select: { 
            name: true, 
            designation: true,
            team: { select: { department: { select: { name: true } } } }
          } 
        }
      }
    });

    if (!payroll || payroll.organizationId !== organizationId) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    // Security check: Employees can only download their own
    if (req.user.role === 'EMPLOYEE' && payroll.userId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });

    const pdfBuffer = await generatePayslipPDF(payroll, organization);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=payslip_${payroll.month}_${payroll.year}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    logger.error('[PayrollController] PDF generation failed', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
};

/**
 * List My Payslips (Employee View)
 */
export const listMyPayslips = async (req, res) => {
  try {
    const rows = await prisma.payroll.findMany({
      where: { userId: req.user.id, status: 'PAID' },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    res.json({ payslips: rows });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load payslips' });
  }
};
