import prisma from '../prismaClient.js';
import { findHolidaysForOrgInDateRange } from '../lib/findHolidaysForOrgInDateRange.js';
import { logger } from './loggerService.js';
import { notifyLeaveStatusUpdate, notifyPermissionStatusUpdate, notifyCompOffStatusUpdate } from './notificationService.js';

export const getDefaultLeaveBalance = (user) => ({
  userId: user.id,
  sick: 12,
  annual: 12,
  compOff: 0,
  maternity: user.gender === 'FEMALE' ? 180 : 0,
  paternity: user.gender === 'MALE' ? 15 : 0,
});

export const toLocalCalendarDate = (value) => {
  if (value == null || value === '') return new Date(NaN);
  const s = String(value).trim();
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]) - 1;
    const d = Number(ymd[3]);
    return new Date(y, m, d);
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return parsed;
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
};

const localDayKey = (d) => {
  if (!d || Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getWorkingDays = async (startDate, endDate, organizationId) => {
  const start = toLocalCalendarDate(startDate);
  const end = toLocalCalendarDate(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  if (start > end) return 0;

  const endInclusive = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
    23,
    59,
    59,
    999,
  );

  const holidays = await findHolidaysForOrgInDateRange(
    organizationId,
    start,
    endInclusive,
  );

  const holidayKeys = new Set(
    holidays.map((h) => localDayKey(toLocalCalendarDate(h.date))),
  );

  let count = 0;
  const cur = new Date(start);
  while (cur <= end) {
    const dayOfWeek = cur.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidayKeys.has(localDayKey(cur));
    if (!isWeekend && !isHoliday) {
      count++;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count;
};

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

export const getMonthlyNetFromSalaryStructure = (salary) => {
  if (!salary) return null;
  const basic = Number(salary.basicSalary ?? 0);
  const hra = Number(salary.hra ?? 0);
  const allowance = Number(salary.allowance ?? 0);
  const bonus = Number(salary.bonus ?? 0);
  const pf = Number(salary.pf ?? 0);
  const tax = Number(salary.tax ?? 0);
  const professionalTax = Number(salary.professionalTax ?? 0);
  return basic + hra + allowance + bonus - pf - tax - professionalTax;
};

export const recalculatePayrollForMonth = async ({
  userId,
  organizationId,
  year,
  month,
}) => {
  const monthStart = new Date(year, month - 1, 1, 0, 0, 0, 0);
  const monthEnd = new Date(year, month, 0, 23, 59, 59, 999);

  const [salaryStructure, lopAgg] = await Promise.all([
    prisma.salaryStructure.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        effectiveFrom: { lte: monthEnd },
      },
      orderBy: [{ effectiveFrom: 'desc' }],
    }),
    prisma.leave.aggregate({
      where: {
        userId,
        organizationId,
        type: { in: ['ANNUAL', 'SICK'] },
        status: 'APPROVED',
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      _sum: { lopDays: true },
    }),
  ]);

  if (!salaryStructure) {
    logger.info(`[Payroll] No active salary structure found for user ${userId} in ${month}/${year}. Skipping recalculation.`);
    return;
  }

  const monthlyNet = getMonthlyNetFromSalaryStructure(salaryStructure);
  if (monthlyNet == null || !Number.isFinite(monthlyNet)) {
    logger.warn(`[Payroll] Invalid monthly net calculated for user ${userId}. Skipping.`);
    return;
  }

  const lopDays = Number(lopAgg?._sum?.lopDays ?? 0);
  const monthDays = new Date(year, month, 0).getDate();
  const dailyRate = monthDays > 0 ? monthlyNet / monthDays : 0;
  const lopDeduction = round2(Math.max(lopDays, 0) * Math.max(dailyRate, 0));
  const netSalary = Math.max(round2(monthlyNet - lopDeduction), 0);

  const existing = await prisma.payroll.findUnique({
    where: { userId_month_year: { userId, month, year } },
    select: { status: true, paidDate: true },
  });

  await prisma.payroll.upsert({
    where: { userId_month_year: { userId, month, year } },
    update: {
      basicSalary: Number(salaryStructure.basicSalary ?? 0),
      yearlyGrossSalary: salaryStructure.yearlyGrossSalary ?? null,
      hra: Number(salaryStructure.hra ?? 0),
      allowance: Number(salaryStructure.allowance ?? 0),
      bonus: Number(salaryStructure.bonus ?? 0),
      pf: Number(salaryStructure.pf ?? 0),
      tax: Number(salaryStructure.tax ?? 0),
      professionalTax: Number(salaryStructure.professionalTax ?? 0),
      lopDays,
      lopAmount: lopDeduction,
      netSalary,
      status: existing?.status ?? 'PENDING',
      paidDate: existing?.status === 'PAID' ? existing.paidDate : null,
    },
    create: {
      userId,
      organizationId,
      month,
      year,
      basicSalary: Number(salaryStructure.basicSalary ?? 0),
      yearlyGrossSalary: salaryStructure.yearlyGrossSalary ?? null,
      hra: Number(salaryStructure.hra ?? 0),
      allowance: Number(salaryStructure.allowance ?? 0),
      bonus: Number(salaryStructure.bonus ?? 0),
      pf: Number(salaryStructure.pf ?? 0),
      tax: Number(salaryStructure.tax ?? 0),
      professionalTax: Number(salaryStructure.professionalTax ?? 0),
      lopDays,
      lopAmount: lopDeduction,
      netSalary,
      status: 'PENDING',
    },
  });
};

const eachMonthBetween = (startDateValue, endDateValue) => {
  const start = toLocalCalendarDate(startDateValue);
  const end = toLocalCalendarDate(endDateValue);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  const months = [];
  while (cursor <= last) {
    months.push({ year: cursor.getFullYear(), month: cursor.getMonth() + 1 });
    cursor.setMonth(cursor.getMonth() + 1, 1);
  }
  return months;
};

export const recalculatePayrollForLeaveRange = async (leave) => {
  const months = eachMonthBetween(leave.startDate, leave.endDate);
  for (const item of months) {
    await recalculatePayrollForMonth({
      userId: leave.userId,
      organizationId: leave.organizationId,
      year: item.year,
      month: item.month,
    });
  }
};

/**
 * Core business logic for applying for leave.
 * Handles validation, balance checks, LOP calculation, and DB updates.
 */
export const applyLeave = async ({
  userId,
  organizationId,
  type,
  startDate,
  endDate,
  reason,
  workAvailability,
  reportingManagerVisible,
}) => {
  const normalizedStartDate = new Date(`${startDate}T00:00:00`);
  const normalizedEndDate = new Date(`${endDate}T00:00:00`);

  if (normalizedStartDate > normalizedEndDate) {
    throw new Error('From date cannot be after To date');
  }

  const applicant = await prisma.user.findUnique({
    where: { id: userId },
    select: { organizationId: true, teamId: true, name: true, gender: true },
  });

  if (!applicant || applicant.organizationId !== organizationId) {
    throw new Error('User not found or access denied');
  }

  // Ensure balance exists
  let balance = await prisma.leaveBalance.findUnique({
    where: { userId },
  });

  if (!balance) {
    balance = await prisma.leaveBalance.create({
      data: getDefaultLeaveBalance(applicant),
    });
  }

  const leaveType = type.toUpperCase();
  const totalDays = await getWorkingDays(
    startDate,
    endDate,
    organizationId,
  );

  // Overlap check
  const existingLeave = await prisma.leave.findFirst({
    where: {
      userId,
      status: { in: ['PENDING', 'APPROVED'] },
      startDate: { lte: normalizedEndDate },
      endDate: { gte: normalizedStartDate },
    },
  });

  if (existingLeave) {
    throw new Error('You already have a leave request for the selected dates');
  }

  const isBalanceManagedType = ['SICK', 'ANNUAL'].includes(leaveType);
  let balanceDeductedDays = 0;
  let lopDays = 0;
  let lopAmount = 0;
  let activeSalaryStructureId = null;

  if (leaveType === 'SICK') {
    const available = Number(balance.sick ?? 0);
    balanceDeductedDays = Math.min(available, totalDays);
    lopDays = Math.max(totalDays - balanceDeductedDays, 0);
  } else if (leaveType === 'ANNUAL') {
    const available = Number(balance.annual ?? 0);
    balanceDeductedDays = Math.min(available, totalDays);
    lopDays = Math.max(totalDays - balanceDeductedDays, 0);
  } else if (leaveType === 'COMP_OFF') {
    if ((balance.compOff ?? 0) < totalDays) {
      throw new Error('No comp off balance left');
    }
    balanceDeductedDays = totalDays;
  } else if (leaveType === 'WFH') {
    // WFH does not deduct from any leave balance — it is purely an approval request
    balanceDeductedDays = 0;
    lopDays = 0;
    lopAmount = 0;
  } else {
    // Maternity / Paternity — managed separately, no numeric deduction here
    balanceDeductedDays = totalDays;
  }

  // LOP Calculation
  if (isBalanceManagedType && lopDays > 0) {
    const monthDays = new Date(
      normalizedStartDate.getFullYear(),
      normalizedStartDate.getMonth() + 1,
      0,
    ).getDate();
    const salaryStructure = await prisma.salaryStructure.findFirst({
      where: {
        userId,
        organizationId,
        isActive: true,
        effectiveFrom: { lte: normalizedStartDate },
      },
      orderBy: [{ effectiveFrom: 'desc' }],
    });

    const monthlyNet = getMonthlyNetFromSalaryStructure(salaryStructure);
    activeSalaryStructureId = salaryStructure?.id ?? null;
    if (monthlyNet != null && Number.isFinite(monthlyNet) && monthDays > 0) {
      const dailyRate = monthlyNet / monthDays;
      lopAmount = round2(lopDays * dailyRate);
    }
  }

  // Database updates in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const leave = await tx.leave.create({
      data: {
        type: leaveType,
        startDate: normalizedStartDate,
        endDate: normalizedEndDate,
        reason,
        workAvailability: type === 'WFH' ? workAvailability : null,
        reportingManagerVisible: type === 'WFH' ? reportingManagerVisible : true,
        balanceDeductedDays,
        lopDays,
        lopAmount,
        userId,
        organizationId,
        teamId: applicant.teamId ?? undefined,
      },
    });

    // Update balances
    if (leaveType === 'SICK' && balanceDeductedDays > 0) {
      await tx.leaveBalance.update({
        where: { userId },
        data: { sick: { decrement: balanceDeductedDays } },
      });
    } else if (leaveType === 'ANNUAL' && balanceDeductedDays > 0) {
      await tx.leaveBalance.update({
        where: { userId },
        data: { annual: { decrement: balanceDeductedDays } },
      });
    } else if (leaveType === 'COMP_OFF' && balanceDeductedDays > 0) {
      await tx.leaveBalance.update({
        where: { userId },
        data: { compOff: { decrement: balanceDeductedDays } },
      });
    }

    // Update salary structure LOP stats
    if (isBalanceManagedType && lopDays > 0 && activeSalaryStructureId != null) {
      await tx.salaryStructure.update({
        where: { id: activeSalaryStructureId },
        data: {
          lopDays: { increment: lopDays },
          lopAmount: { increment: lopAmount },
        },
      });
    }

    return leave;
  });

  // Trigger side effects
  if (isBalanceManagedType) {
    await recalculatePayrollForLeaveRange(result);
  }

  return {
    leave: result,
    impact: {
      totalDays,
      balanceDeductedDays,
      lopDays,
      lopAmount,
    },
  };
};

/**
 * Update the status of a leave request (APPROVE/REJECT).
 * Includes side effects like balance reversals and payroll recalculation.
 */
export const updateLeaveStatus = async ({ leaveId, status, rejectionReason, actorId }) => {
  const leave = await prisma.leave.findUnique({
    where: { id: leaveId },
    include: { user: { select: { id: true, gender: true, organizationId: true } } }
  });

  if (!leave) throw new Error('Leave request not found');
  if (leave.status !== 'PENDING') throw new Error('Only pending requests can be updated');

  const leaveType = leave.type.toUpperCase();
  const totalDays = await getWorkingDays(leave.startDate, leave.endDate, leave.organizationId);
  const deductedDays = leave.balanceDeductedDays ?? totalDays;

  const results = await prisma.$transaction(async (tx) => {
    const updated = await tx.leave.update({
      where: { id: leaveId },
      data: {
        status,
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
        approvedById: actorId,
      },
    });

    if (status === 'REJECTED' && deductedDays > 0) {
      if (['SICK', 'ANNUAL', 'COMP_OFF'].includes(leaveType)) {
        await tx.leaveBalance.update({
          where: { userId: leave.userId },
          data: { [leaveType.toLowerCase()]: { increment: deductedDays } }
        });
      }
    }

    // Revert LOP if rejected
    if (status === 'REJECTED' && ['SICK', 'ANNUAL'].includes(leaveType) && Number(leave.lopDays ?? 0) > 0) {
      const salaryStructure = await tx.salaryStructure.findFirst({
        where: { userId: leave.userId, organizationId: leave.organizationId, isActive: true },
        orderBy: { effectiveFrom: 'desc' }
      });
      if (salaryStructure) {
        await tx.salaryStructure.update({
          where: { id: salaryStructure.id },
          data: {
            lopDays: { decrement: Number(leave.lopDays ?? 0) },
            lopAmount: { decrement: Number(leave.lopAmount ?? 0) }
          }
        });
      }
    }

    return updated;
  });

  // Re-calculate payroll if needed
  if (['SICK', 'ANNUAL'].includes(leaveType)) {
    await recalculatePayrollForLeaveRange(results);
  }

  // Notify employee
  try {
    await notifyLeaveStatusUpdate({
      leaveId: results.id,
      status,
      rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      actorId
    });
  } catch (err) {
    logger.error('Failed to send status update notification', err);
  }

  return results;
};

export const updatePermissionStatus = async ({ requestId, status, actorId, rejectionReason }) => {
  const row = await prisma.permissionRequest.findUnique({
    where: { id: requestId },
    select: { id: true, status: true, userId: true },
  });
  if (!row) throw new Error('Permission request not found');
  if (row.status !== 'PENDING') throw new Error('Only pending requests can be updated');

  const updated = await prisma.permissionRequest.update({
    where: { id: requestId },
    data: {
      status,
      approvedById: actorId,
      rejectionReason: status === 'REJECTED' ? (rejectionReason || 'Rejected') : null,
    },
  });

  try {
    await notifyPermissionStatusUpdate({ requestId, status, actorId });
  } catch (err) {
    logger.error('Failed to send permission status notification', err);
  }

  return updated;
};

export const updateCompOffStatus = async ({ requestId, status, actorId, rejectionReason }) => {
  const request = await prisma.compOffWorkLog.findUnique({ where: { id: requestId } });
  if (!request) throw new Error('Request not found');
  if (request.status !== 'PENDING') throw new Error('Only pending requests can be updated');

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.compOffWorkLog.update({
      where: { id: requestId },
      data: {
        status,
        approvedById: actorId,
        rejectionReason: status === 'REJECTED' ? (rejectionReason || 'Rejected') : null,
      },
    });

    if (status === 'APPROVED') {
      await tx.leaveBalance.upsert({
        where: { userId: request.userId },
        update: { compOff: { increment: 1 } },
        create: { userId: request.userId, compOff: 1 },
      });
    }

    return res;
  });

  try {
    await notifyCompOffStatusUpdate({ requestId, status, actorId });
  } catch (err) {
    logger.error('Failed to send comp-off status notification', err);
  }

  return updated;
};
