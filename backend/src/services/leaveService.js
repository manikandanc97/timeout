import prisma from '../prismaClient.js';
import { findHolidaysForOrgInDateRange } from '../lib/findHolidaysForOrgInDateRange.js';

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
    console.log(`[Payroll] No active salary structure found for user ${userId} in ${month}/${year}. Skipping recalculation.`);
    return;
  }

  const monthlyNet = getMonthlyNetFromSalaryStructure(salaryStructure);
  if (monthlyNet == null || !Number.isFinite(monthlyNet)) {
    console.warn(`[Payroll] Invalid monthly net calculated for user ${userId}. Skipping.`);
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
