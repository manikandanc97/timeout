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

    const userFilter = {
      organizationId,
      role: { not: 'ADMIN' },
      ...(req.user.role === 'MANAGER' ? { reportingManagerId: req.user.id } : {}),
    };

    const [rows, totalCount, summaryData] = await Promise.all([
      prisma.payroll.findMany({
        where: { organizationId, month, year, user: userFilter },
        skip,
        take: Number(limit),
        orderBy: [{ user: { name: 'asc' } }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              designation: true,
              team: { select: { name: true, department: { select: { name: true } } } },
            },
          },
        },
      }),
      prisma.payroll.count({
        where: { organizationId, month, year, user: userFilter },
      }),
      prisma.payroll.aggregate({
        where: { organizationId, month, year, user: userFilter },
        _sum: { netSalary: true },
        _count: { id: true },
      }),
    ]);

    const paidCount = await prisma.payroll.count({
      where: { organizationId, month, year, status: 'PAID', user: userFilter },
    });

    res.json({
      payroll: rows,
      summary: {
        totalEmployees: summaryData._count.id,
        paidEmployees: paidCount,
        totalNetSalary: summaryData._sum.netSalary || 0,
      },
      pagination: {
        total: totalCount,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(totalCount / Number(limit)),
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
