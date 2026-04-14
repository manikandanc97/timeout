import prisma from '../prismaClient.js';

const VIEW_ROLES = new Set(['ADMIN', 'MANAGER', 'HR']);
const MARK_PAID_ROLES = new Set(['ADMIN', 'MANAGER']);

const toNumber = (value) => Number(value ?? 0);

export const listPayroll = async (req, res) => {
  try {
    if (!VIEW_ROLES.has(String(req.user.role ?? ''))) {
      return res.status(403).json({ message: 'Not allowed to view payroll' });
    }

    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const now = new Date();
    const month = Number(req.query.month ?? now.getMonth() + 1);
    const year = Number(req.query.year ?? now.getFullYear());
    if (!Number.isFinite(month) || !Number.isFinite(year)) {
      return res.status(400).json({ message: 'Invalid month or year' });
    }

    const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);
    const [users, existingRows, salaryStructures, lopByUser] = await Promise.all([
      prisma.user.findMany({
        where: {
          organizationId,
          role: { not: 'ADMIN' },
        },
        orderBy: [{ name: 'asc' }],
        select: {
          id: true,
          name: true,
          email: true,
          isActive: true,
          team: {
            select: {
              department: { select: { name: true } },
            },
          },
        },
      }),
      prisma.payroll.findMany({
        where: { organizationId, month, year },
        orderBy: [{ user: { name: 'asc' } }],
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              team: {
                select: {
                  department: { select: { name: true } },
                },
              },
              isActive: true,
            },
          },
        },
      }),
      prisma.salaryStructure.findMany({
        where: {
          organizationId,
          isActive: true,
          effectiveFrom: { lte: monthEnd },
        },
        orderBy: [{ effectiveFrom: 'desc' }],
      }),
      prisma.leave.groupBy({
        by: ['userId'],
        where: {
          organizationId,
          status: 'APPROVED',
          startDate: { lte: monthEnd },
          endDate: { gte: monthStart },
        },
        _sum: {
          lopDays: true,
          lopAmount: true,
        },
      }),
    ]);

    const payrollByUser = new Map(existingRows.map((row) => [row.userId, row]));
    const salaryByUser = new Map();
    salaryStructures.forEach((row) => {
      if (!salaryByUser.has(row.userId)) {
        salaryByUser.set(row.userId, row);
      }
    });
    const lopByUserMap = new Map(
      lopByUser.map((row) => [
        row.userId,
        {
          lopDays: toNumber(row._sum?.lopDays),
          lopAmount: toNumber(row._sum?.lopAmount),
        },
      ]),
    );

    const rowsToCreate = users
      .filter((user) => user.isActive && !payrollByUser.has(user.id) && salaryByUser.has(user.id))
      .map((user) => {
        const salary = salaryByUser.get(user.id);
        const lop = lopByUserMap.get(user.id) ?? { lopDays: 0, lopAmount: 0 };
        const basicSalary = toNumber(salary?.basicSalary);
        const hra = toNumber(salary?.hra);
        const allowance = toNumber(salary?.allowance);
        const bonus = toNumber(salary?.bonus);
        const pf = toNumber(salary?.pf);
        const tax = toNumber(salary?.tax);
        const professionalTax = toNumber(salary?.professionalTax);
        const yearlyGrossSalary = toNumber(salary?.yearlyGrossSalary);
        const lopAmount = toNumber(lop.lopAmount);
        const deductions = pf + tax + professionalTax + lopAmount;
        const netSalary = Math.max(basicSalary + hra + allowance + bonus - deductions, 0);
        return {
          userId: user.id,
          organizationId,
          month,
          year,
          yearlyGrossSalary,
          basicSalary,
          hra,
          allowance,
          bonus,
          pf,
          tax,
          professionalTax,
          lopDays: toNumber(lop.lopDays),
          lopAmount,
          netSalary,
          status: 'PENDING',
        };
      });

    if (rowsToCreate.length > 0) {
      await prisma.payroll.createMany({
        data: rowsToCreate,
        skipDuplicates: true,
      });
    }

    const rows = await prisma.payroll.findMany({
      where: { organizationId, month, year },
      orderBy: [{ user: { name: 'asc' } }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            team: {
              select: {
                department: { select: { name: true } },
              },
            },
            isActive: true,
          },
        },
      },
    });

    const refreshedPayrollByUser = new Map(rows.map((row) => [row.userId, row]));

    const payroll = users.map((user) => {
      const row = refreshedPayrollByUser.get(user.id);
      if (!row) {
        return {
          id: -user.id,
          userId: user.id,
          employeeName: user.name ?? 'Employee',
          email: user.email ?? null,
          department: user.team?.department?.name ?? null,
          employeeActive: Boolean(user.isActive),
          basicSalary: 0,
          allowance: 0,
          deductions: 0,
          bonus: 0,
          pf: 0,
          tax: 0,
          professionalTax: 0,
          lopDays: 0,
          lopAmount: 0,
          netSalary: 0,
          status: 'NOT_ADDED',
          paidDate: null,
          month,
          year,
          payrollAdded: false,
        };
      }
      const lopAmount = toNumber(row.lopAmount);
      const deductions =
        toNumber(row.pf) +
        toNumber(row.tax) +
        toNumber(row.professionalTax) +
        lopAmount;
      return {
        id: row.id,
        userId: row.userId,
        employeeName: row.user?.name ?? 'Employee',
        email: row.user?.email ?? null,
        department: row.user?.team?.department?.name ?? null,
        employeeActive: Boolean(row.user?.isActive ?? true),
        basicSalary: row.basicSalary,
        allowance: row.allowance,
        deductions,
        bonus: row.bonus,
        pf: row.pf,
        tax: row.tax,
        professionalTax: row.professionalTax,
        lopDays: toNumber(row.lopDays),
        lopAmount,
        netSalary: row.netSalary,
        status: row.status,
        paidDate: row.paidDate ? row.paidDate.toISOString() : null,
        month: row.month,
        year: row.year,
        payrollAdded: true,
      };
    });

    res.json({ payroll, month, year });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load payroll' });
  }
};

export const markPayrollPaid = async (req, res) => {
  try {
    if (!MARK_PAID_ROLES.has(String(req.user.role ?? ''))) {
      return res.status(403).json({ message: 'Not allowed to mark payroll paid' });
    }
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const payrollId = Number(req.params.payrollId);
    if (Number.isNaN(payrollId)) {
      return res.status(400).json({ message: 'Invalid payroll id' });
    }

    const existing = await prisma.payroll.findFirst({
      where: { id: payrollId, organizationId },
      include: { user: { select: { name: true } } },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    if (existing.status === 'PAID') {
      return res.json({
        payroll: {
          id: existing.id,
          status: existing.status,
          paidDate: existing.paidDate ? existing.paidDate.toISOString() : null,
          employeeName: existing.user?.name ?? null,
        },
      });
    }

    const updated = await prisma.payroll.update({
      where: { id: payrollId },
      data: { status: 'PAID', paidDate: new Date() },
      include: { user: { select: { name: true } } },
    });

    res.json({
      payroll: {
        id: updated.id,
        status: updated.status,
        paidDate: updated.paidDate ? updated.paidDate.toISOString() : null,
        employeeName: updated.user?.name ?? null,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update payroll status' });
  }
};

export const markPayrollPaidBulk = async (req, res) => {
  try {
    if (!MARK_PAID_ROLES.has(String(req.user.role ?? ''))) {
      return res.status(403).json({ message: 'Not allowed to mark payroll paid' });
    }
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const now = new Date();
    const month = Number(req.body?.month ?? now.getMonth() + 1);
    const year = Number(req.body?.year ?? now.getFullYear());
    if (!Number.isFinite(month) || !Number.isFinite(year)) {
      return res.status(400).json({ message: 'Invalid month or year' });
    }

    const result = await prisma.payroll.updateMany({
      where: {
        organizationId,
        month,
        year,
        status: { not: 'PAID' },
        user: { isActive: true },
      },
      data: {
        status: 'PAID',
        paidDate: new Date(),
      },
    });

    return res.json({
      message: `Marked ${result.count} payroll record(s) as paid`,
      updatedCount: result.count,
      month,
      year,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update payroll status' });
  }
};

export const generatePayrollSlip = async (req, res) => {
  try {
    if (!VIEW_ROLES.has(String(req.user.role ?? ''))) {
      return res.status(403).json({ message: 'Not allowed to generate payslip' });
    }
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }
    const payrollId = Number(req.params.payrollId);
    if (Number.isNaN(payrollId)) {
      return res.status(400).json({ message: 'Invalid payroll id' });
    }

    const existing = await prisma.payroll.findFirst({
      where: { id: payrollId, organizationId },
      include: { user: { select: { name: true } } },
    });
    if (!existing) {
      return res.status(404).json({ message: 'Payroll record not found' });
    }

    res.json({
      message: `Payslip generated for ${existing.user?.name ?? 'employee'}`,
      payrollId: existing.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate payslip' });
  }
};

export const generatePayrollSlipBulk = async (req, res) => {
  try {
    if (!VIEW_ROLES.has(String(req.user.role ?? ''))) {
      return res.status(403).json({ message: 'Not allowed to generate payslip' });
    }
    const organizationId = req.user.organizationId;
    if (organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    const now = new Date();
    const month = Number(req.body?.month ?? now.getMonth() + 1);
    const year = Number(req.body?.year ?? now.getFullYear());
    if (!Number.isFinite(month) || !Number.isFinite(year)) {
      return res.status(400).json({ message: 'Invalid month or year' });
    }

    const existing = await prisma.payroll.findMany({
      where: {
        organizationId,
        month,
        year,
        user: { isActive: true },
      },
      select: { id: true },
    });

    return res.json({
      message: `Payslip generated for ${existing.length} employee(s)`,
      generatedCount: existing.length,
      month,
      year,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to generate payslip' });
  }
};
