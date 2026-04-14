import prisma from '../prismaClient.js';
import { findHolidaysForOrgInDateRange } from '../lib/findHolidaysForOrgInDateRange.js';

const MONTHLY_PERMISSION_LIMIT_MINUTES = 4 * 60;

const getDefaultLeaveBalance = (user) => ({
  userId: user.id,
  sick: 12,
  annual: 12,
  compOff: 0,
  maternity: user.gender === 'FEMALE' ? 180 : 0,
  paternity: user.gender === 'MALE' ? 15 : 0,
});

const resolveActorContext = async (authUser) => {
  const fallback = {
    id: authUser?.id,
    role: authUser?.role,
    organizationId: authUser?.organizationId,
    gender: authUser?.gender ?? null,
  };

  if (authUser?.id == null) {
    return fallback;
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      role: true,
      organizationId: true,
      gender: true,
    },
  });

  if (!dbUser) {
    return fallback;
  }

  return {
    id: dbUser.id,
    role: dbUser.role,
    organizationId: dbUser.organizationId,
    gender: dbUser.gender ?? authUser?.gender ?? null,
  };
};

const isMissingReportingManagerColumn = (error) => {
  if (!error) return false;
  const message = String(error.message ?? '');
  if (
    message.includes('reportingManagerId') ||
    message.includes('Unknown field `reportingManagerId`')
  ) {
    return true;
  }
  const column = error.meta?.column;
  return column != null && String(column).includes('reportingManager');
};

const toLocalCalendarDate = (value) => {
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

const isWeekendDate = (value) => {
  const day = toLocalCalendarDate(value);
  if (Number.isNaN(day.getTime())) return false;
  const dow = day.getDay();
  return dow === 0 || dow === 6;
};

const getMonthBounds = (value) => {
  const date = toLocalCalendarDate(value);
  if (Number.isNaN(date.getTime())) return null;
  const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

/** Parses "HH:mm", "HH:mm:ss", or "hh:mm AM/PM" to minutes; NaN if invalid */
const parseTimeToMinutes = (value) => {
  if (value == null || String(value).trim() === '') return NaN;
  const input = String(value).trim();
  const m12 = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(input);
  if (m12) {
    const hh12 = Number(m12[1]);
    const mm = Number(m12[2]);
    const meridiem = m12[3].toUpperCase();
    if (
      !Number.isFinite(hh12) ||
      !Number.isFinite(mm) ||
      hh12 < 1 ||
      hh12 > 12 ||
      mm < 0 ||
      mm > 59
    ) {
      return NaN;
    }
    const hh24 = hh12 % 12 + (meridiem === 'PM' ? 12 : 0);
    return hh24 * 60 + mm;
  }

  const m24 = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/.exec(input);
  if (!m24) return NaN;
  const hh = Number(m24[1]);
  const mm = Number(m24[2]);
  if (
    !Number.isFinite(hh) ||
    !Number.isFinite(mm) ||
    hh < 0 ||
    hh > 23 ||
    mm < 0 ||
    mm > 59
  ) {
    return NaN;
  }
  return hh * 60 + mm;
};

const getWorkingDays = async (startDate, endDate, organizationId) => {
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

const getMonthlyNetFromSalaryStructure = (salary) => {
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

const recalculatePayrollForMonth = async ({
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
        status: { in: ['PENDING', 'APPROVED'] },
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      _sum: { lopAmount: true, lopDays: true },
    }),
  ]);

  if (!salaryStructure) return;

  const monthlyNet = getMonthlyNetFromSalaryStructure(salaryStructure);
  if (monthlyNet == null || !Number.isFinite(monthlyNet)) return;

  const lopDeduction = Number(lopAgg?._sum?.lopAmount ?? 0);
  const lopDays = Number(lopAgg?._sum?.lopDays ?? 0);
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

const recalculatePayrollForLeaveRange = async (leave) => {
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

export const applyLeave = async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;
    if (!type || !startDate || !endDate || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const normalizedstartDate = new Date(`${startDate}T00:00:00`);
    const normalizedendDate = new Date(`${endDate}T00:00:00`);

    if (
      Number.isNaN(normalizedstartDate.getTime()) ||
      Number.isNaN(normalizedendDate.getTime())
    ) {
      return res.status(400).json({ message: 'Invalid leave dates provided' });
    }

    if (normalizedstartDate > normalizedendDate) {
      return res
        .status(400)
        .json({ message: 'From date cannot be after To date' });
    }

    const userId = req.user.id;

    const applicant = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true, teamId: true },
    });

    if (!applicant) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (applicant.organizationId !== req.user.organizationId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    let balance = await prisma.leaveBalance.findUnique({
      where: { userId },
    });

    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: getDefaultLeaveBalance(req.user),
      });
    }

    const leaveType = type.toUpperCase();
    const totalDays = await getWorkingDays(
      startDate,
      endDate,
      req.user.organizationId,
    );

    const existingLeave = await prisma.leave.findFirst({
      where: {
        userId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
        startDate: {
          lte: normalizedendDate,
        },
        endDate: {
          gte: normalizedstartDate,
        },
      },
    });

    if (existingLeave) {
      return res.status(400).json({
        message: 'You already have a leave request for the selected dates',
      });
    }

    const isBalanceManagedType = leaveType === 'SICK' || leaveType === 'ANNUAL';
    let balanceAvailable = 0;
    let balanceDeductedDays = 0;
    let lopDays = 0;
    let lopAmount = 0;
    let activeSalaryStructureId = null;

    if (leaveType === 'SICK') {
      balanceAvailable = Number(balance.sick ?? 0);
      balanceDeductedDays = Math.min(balanceAvailable, totalDays);
      lopDays = Math.max(totalDays - balanceDeductedDays, 0);
    }

    if (leaveType === 'ANNUAL') {
      balanceAvailable = Number(balance.annual ?? 0);
      balanceDeductedDays = Math.min(balanceAvailable, totalDays);
      lopDays = Math.max(totalDays - balanceDeductedDays, 0);
    }

    if (leaveType === 'COMP_OFF' && (balance.compOff ?? 0) < totalDays) {
      return res.status(400).json({ message: 'No comp off balance left' });
    }

    if (isBalanceManagedType && lopDays > 0) {
      const monthDays = new Date(
        normalizedstartDate.getFullYear(),
        normalizedstartDate.getMonth() + 1,
        0,
      ).getDate();
      const salaryStructure = await prisma.salaryStructure.findFirst({
        where: {
          userId,
          organizationId: applicant.organizationId,
          isActive: true,
          effectiveFrom: { lte: normalizedstartDate },
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

    const leave = await prisma.leave.create({
      data: {
        type: leaveType,
        startDate: normalizedstartDate,
        endDate: normalizedendDate,
        reason,
        balanceDeductedDays: isBalanceManagedType ? balanceDeductedDays : totalDays,
        lopDays: isBalanceManagedType ? lopDays : 0,
        lopAmount: isBalanceManagedType ? lopAmount : 0,
        userId,
        organizationId: applicant.organizationId,
        teamId: applicant.teamId ?? undefined,
      },
    });

    if (leaveType === 'SICK' && balanceDeductedDays > 0) {
      await prisma.leaveBalance.update({
        where: { userId },
        data: { sick: { decrement: balanceDeductedDays } },
      });
    }

    if (leaveType === 'ANNUAL' && balanceDeductedDays > 0) {
      await prisma.leaveBalance.update({
        where: { userId },
        data: { annual: { decrement: balanceDeductedDays } },
      });
    }

    if (leaveType === 'COMP_OFF') {
      await prisma.leaveBalance.update({
        where: { userId },
        data: { compOff: { decrement: totalDays } },
      });
    }

    if (isBalanceManagedType && lopDays > 0 && activeSalaryStructureId != null) {
      await prisma.salaryStructure.update({
        where: { id: activeSalaryStructureId },
        data: {
          lopDays: { increment: lopDays },
          lopAmount: { increment: lopAmount },
        },
      });
    }

    if (leaveType === 'SICK' || leaveType === 'ANNUAL') {
      await recalculatePayrollForLeaveRange({
        userId,
        organizationId: applicant.organizationId,
        startDate: normalizedstartDate,
        endDate: normalizedendDate,
      });
    }

    console.log('Leave applied:', totalDays, leave);

    res.status(201).json({
      message:
        isBalanceManagedType && lopDays > 0
          ? `Leave applied. ${lopDays} day(s) will be treated as Loss of Pay.`
          : 'Leave applied successfully',
      leave,
      leaveImpact: {
        totalDays,
        balanceDeductedDays: isBalanceManagedType ? balanceDeductedDays : totalDays,
        lopDays: isBalanceManagedType ? lopDays : 0,
        lopAmount: isBalanceManagedType ? lopAmount : 0,
      },
    });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const applyCompOffCredit = async (req, res) => {
  try {
    const { workDate, reason } = req.body;
    if (!workDate || !reason || !String(reason).trim()) {
      return res
        .status(400)
        .json({ message: 'Work date and reason are required' });
    }

    const normalizedWorkDate = toLocalCalendarDate(workDate);
    if (Number.isNaN(normalizedWorkDate.getTime())) {
      return res.status(400).json({ message: 'Invalid work date' });
    }
    if (!isWeekendDate(normalizedWorkDate)) {
      return res
        .status(400)
        .json({ message: 'Comp off can only be claimed for weekend work' });
    }

    const today = toLocalCalendarDate(new Date());
    if (normalizedWorkDate > today) {
      return res
        .status(400)
        .json({ message: 'Work date cannot be in the future' });
    }

    const userId = req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organizationId: true, gender: true },
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.organizationId !== req.user.organizationId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const workDateStart = new Date(
      normalizedWorkDate.getFullYear(),
      normalizedWorkDate.getMonth(),
      normalizedWorkDate.getDate(),
      0,
      0,
      0,
      0,
    );

    const existing = await prisma.compOffWorkLog.findUnique({
      where: {
        userId_workDate: { userId, workDate: workDateStart },
      },
    });
    if (existing) {
      return res
        .status(400)
        .json({ message: 'Comp off already claimed for this date' });
    }

    await prisma.compOffWorkLog.create({
      data: {
        userId,
        organizationId: user.organizationId,
        workDate: workDateStart,
        reason: String(reason).trim(),
        status: 'PENDING',
      },
    });

    return res.status(201).json({ message: 'Comp off request submitted' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const applyPermissionRequest = async (req, res) => {
  try {
    const { date, reason, startTime, endTime } = req.body;
    if (!date || !reason || !String(reason).trim()) {
      return res.status(400).json({
        message: 'Date and reason are required',
      });
    }

    let parsedDuration;
    let startTimeMinutes = null;
    let endTimeMinutes = null;
    const startM = parseTimeToMinutes(startTime);
    const endM = parseTimeToMinutes(endTime);
    if (Number.isNaN(startM) || Number.isNaN(endM)) {
      return res.status(400).json({
        message: 'Valid start and end times are required',
      });
    }
    if (endM <= startM) {
      return res.status(400).json({
        message: 'End time must be after start time on the same day',
      });
    }
    parsedDuration = endM - startM;
    if (parsedDuration > 240) {
      return res.status(400).json({
        message: 'In-between permission cannot exceed 240 minutes',
      });
    }
    startTimeMinutes = startM;
    endTimeMinutes = endM;

    const permissionDate = toLocalCalendarDate(date);
    if (Number.isNaN(permissionDate.getTime())) {
      return res.status(400).json({ message: 'Invalid permission date' });
    }

    const todayLocal = toLocalCalendarDate(new Date());
    const tomorrowLocal = new Date(todayLocal);
    tomorrowLocal.setDate(tomorrowLocal.getDate() + 1);
    const isSameLocalDay = (a, b) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();
    if (
      !isSameLocalDay(permissionDate, todayLocal) &&
      !isSameLocalDay(permissionDate, tomorrowLocal)
    ) {
      return res.status(400).json({
        message: 'Permission can only be applied for today or tomorrow',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, organizationId: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.organizationId !== req.user.organizationId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const monthBounds = getMonthBounds(permissionDate);
    if (!monthBounds) {
      return res.status(400).json({ message: 'Invalid permission date' });
    }

    const aggregate = await prisma.permissionRequest.aggregate({
      where: {
        userId: user.id,
        status: { in: ['PENDING', 'APPROVED'] },
        date: { gte: monthBounds.start, lte: monthBounds.end },
      },
      _sum: { durationMinutes: true },
    });

    const usedMinutes = aggregate._sum.durationMinutes ?? 0;
    const remainingMinutes = MONTHLY_PERMISSION_LIMIT_MINUTES - usedMinutes;
    if (parsedDuration > remainingMinutes) {
      return res.status(400).json({
        message: `Monthly permission limit exceeded. Remaining ${remainingMinutes} minutes`,
      });
    }

    const created = await prisma.permissionRequest.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        date: new Date(
          permissionDate.getFullYear(),
          permissionDate.getMonth(),
          permissionDate.getDate(),
          12,
          0,
          0,
          0,
        ),
        durationMinutes: parsedDuration,
        startTimeMinutes,
        endTimeMinutes,
        reason: String(reason).trim(),
        status: 'PENDING',
      },
    });

    return res.status(201).json({
      message: 'Permission request submitted',
      request: created,
      monthly: {
        limitMinutes: MONTHLY_PERMISSION_LIMIT_MINUTES,
        usedMinutes: usedMinutes + parsedDuration,
        remainingMinutes: remainingMinutes - parsedDuration,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getPermissionSummary = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { id: true, organizationId: true },
    });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const inputDate =
      req.query?.month != null && String(req.query.month).trim() !== ''
        ? `${String(req.query.month).trim()}-01`
        : new Date();
    const bounds = getMonthBounds(inputDate);
    if (!bounds) return res.status(400).json({ message: 'Invalid month' });

    const [aggregate, recent] = await Promise.all([
      prisma.permissionRequest.aggregate({
        where: {
          userId: user.id,
          organizationId: user.organizationId,
          status: { in: ['PENDING', 'APPROVED'] },
          date: { gte: bounds.start, lte: bounds.end },
        },
        _sum: { durationMinutes: true },
      }),
      prisma.permissionRequest.findMany({
        where: {
          userId: user.id,
          organizationId: user.organizationId,
          date: { gte: bounds.start, lte: bounds.end },
        },
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        take: 10,
      }),
    ]);

    const usedMinutes = aggregate._sum.durationMinutes ?? 0;
    return res.json({
      limitMinutes: MONTHLY_PERMISSION_LIMIT_MINUTES,
      usedMinutes,
      remainingMinutes: Math.max(MONTHLY_PERMISSION_LIMIT_MINUTES - usedMinutes, 0),
      requests: recent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getPermissionRequests = async (req, res) => {
  try {
    const user = await resolveActorContext(req.user);

    let where;
    if (user.role === 'ADMIN') {
      where = { organizationId: user.organizationId };
    } else if (user.role === 'MANAGER') {
      where = {
        organizationId: user.organizationId,
        OR: [{ userId: user.id }, { user: { reportingManagerId: user.id } }],
      };
    } else {
      where = { userId: user.id };
    }

    const rows = await prisma.permissionRequest.findMany({
      where,
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const getCompOffRequests = async (req, res) => {
  try {
    const user = await resolveActorContext(req.user);

    let where;
    if (user.role === 'ADMIN') {
      where = { organizationId: user.organizationId };
    } else if (user.role === 'MANAGER') {
      where = {
        organizationId: user.organizationId,
        OR: [{ userId: user.id }, { user: { reportingManagerId: user.id } }],
      };
    } else {
      where = { userId: user.id };
    }

    const rows = await prisma.compOffWorkLog.findMany({
      where,
      orderBy: [{ workDate: 'desc' }, { createdAt: 'desc' }],
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.json(rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

const canModerateUserRequest = async (actor, requestUserId) => {
  if (actor.role === 'ADMIN') return true;
  if (actor.role !== 'MANAGER') return false;

  const applicant = await prisma.user.findUnique({
    where: { id: requestUserId },
    select: { reportingManagerId: true },
  });
  return applicant?.reportingManagerId === actor.id;
};

export const updatePermissionRequestStatus = async (req, res) => {
  try {
    const actor = await resolveActorContext(req.user);
    const requestId = Number(req.params.id);
    const { status } = req.body ?? {};
    if (!Number.isFinite(requestId)) {
      return res.status(400).json({ message: 'Invalid permission request id' });
    }
    if (!['APPROVED', 'REJECTED'].includes(String(status))) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const row = await prisma.permissionRequest.findUnique({
      where: { id: requestId },
      select: { id: true, userId: true, organizationId: true, status: true },
    });
    if (!row) return res.status(404).json({ message: 'Request not found' });
    if (row.organizationId !== actor.organizationId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!(await canModerateUserRequest(actor, row.userId))) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (row.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    const updated = await prisma.permissionRequest.update({
      where: { id: requestId },
      data: { status },
    });
    return res.json({ message: 'Permission request updated', request: updated });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

export const updateCompOffRequestStatus = async (req, res) => {
  try {
    const actor = await resolveActorContext(req.user);
    const requestId = Number(req.params.id);
    const { status } = req.body ?? {};
    if (!Number.isFinite(requestId)) {
      return res.status(400).json({ message: 'Invalid comp off request id' });
    }
    if (!['APPROVED', 'REJECTED'].includes(String(status))) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const row = await prisma.compOffWorkLog.findUnique({
      where: { id: requestId },
      select: { id: true, userId: true, organizationId: true, status: true },
    });
    if (!row) return res.status(404).json({ message: 'Request not found' });
    if (row.organizationId !== actor.organizationId) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (!(await canModerateUserRequest(actor, row.userId))) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    if (row.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const next = await tx.compOffWorkLog.update({
        where: { id: requestId },
        data: { status },
      });
      if (status === 'APPROVED') {
        const existingBalance = await tx.leaveBalance.findUnique({
          where: { userId: row.userId },
        });
        if (!existingBalance) {
          const u = await tx.user.findUnique({
            where: { id: row.userId },
            select: { id: true, gender: true },
          });
          await tx.leaveBalance.create({
            data: getDefaultLeaveBalance(
              u ?? { id: row.userId, gender: 'MALE' },
            ),
          });
        }
        await tx.leaveBalance.update({
          where: { userId: row.userId },
          data: { compOff: { increment: 1 } },
        });
      }
      return next;
    });

    const leaveBalance = await prisma.leaveBalance.findUnique({
      where: { userId: row.userId },
      select: { compOff: true },
    });

    return res.json({
      message: 'Comp off request updated',
      request: updated,
      leaveBalance:
        leaveBalance != null
          ? { compOff: leaveBalance.compOff ?? 0 }
          : undefined,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error' });
  }
};

const leaveListIncludeUser = {
  user: {
    select: { name: true, email: true },
  },
};

export const getLeaves = async (req, res) => {
  try {
    const user = await resolveActorContext(req.user);
    let leaves;

    if (user.role === 'EMPLOYEE') {
      leaves = await prisma.leave.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'ADMIN') {
      leaves = await prisma.leave.findMany({
        where: { organizationId: user.organizationId },
        include: leaveListIncludeUser,
        orderBy: { createdAt: 'desc' },
      });
    } else if (user.role === 'MANAGER') {
      try {
        leaves = await prisma.leave.findMany({
          where: {
            organizationId: user.organizationId,
            OR: [
              { userId: user.id },
              { user: { reportingManagerId: user.id } },
            ],
          },
          include: leaveListIncludeUser,
          orderBy: { createdAt: 'desc' },
        });
      } catch (error) {
        if (!isMissingReportingManagerColumn(error)) throw error;
        // Backward-compatible fallback when Prisma client/db is behind reporting-manager schema.
        leaves = await prisma.leave.findMany({
          where: { userId: user.id },
          include: leaveListIncludeUser,
          orderBy: { createdAt: 'desc' },
        });
      }
    } else {
      leaves = await prisma.leave.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json(leaves);
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: 'Body is required' });
    }

    const { status, rejectionReason } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const normalizedRejectionReason =
      typeof rejectionReason === 'string' ? rejectionReason.trim() : '';

    if (status === 'REJECTED' && !normalizedRejectionReason) {
      return res.status(400).json({
        message: 'Rejection reason is required when rejecting a leave request',
      });
    }

    const leaveId = Number(req.params.id);
    const leave = await prisma.leave.findUnique({ where: { id: leaveId } });

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    if (leave.organizationId !== req.user.organizationId) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (req.user.role === 'MANAGER') {
      let applicant;
      try {
        applicant = await prisma.user.findUnique({
          where: { id: leave.userId },
          select: { reportingManagerId: true },
        });
      } catch (error) {
        if (!isMissingReportingManagerColumn(error)) throw error;
        return res.status(503).json({
          message:
            'Reporting manager mapping is unavailable. Please run database migrations and prisma generate.',
        });
      }
      if (applicant?.reportingManagerId !== req.user.id) {
        return res.status(403).json({
          message:
            "Only an admin or the employee's reporting manager can approve or reject this request",
        });
      }
    }

    if (leave.status !== 'PENDING') {
      return res.status(400).json({
        message: 'Only pending leave requests can be approved or rejected',
      });
    }

    const leaveType = leave.type?.toUpperCase();
    const totalDays = await getWorkingDays(
      leave.startDate,
      leave.endDate,
      leave.organizationId,
    );

    if (status === 'REJECTED' && totalDays > 0) {
      let bal = await prisma.leaveBalance.findUnique({
        where: { userId: leave.userId },
      });
      if (!bal) {
        const u = await prisma.user.findUnique({
          where: { id: leave.userId },
          select: { id: true, gender: true },
        });
        await prisma.leaveBalance.create({
          data: getDefaultLeaveBalance(
            u ?? { id: leave.userId, gender: 'MALE' },
          ),
        });
      }
    }

    const ops = [
      prisma.leave.update({
        where: { id: leaveId },
        data: {
          status,
          rejectionReason:
            status === 'REJECTED' ? normalizedRejectionReason : null,
        },
      }),
    ];

    const deductedDays =
      typeof leave.balanceDeductedDays === 'number'
        ? leave.balanceDeductedDays
        : totalDays;

    if (status === 'REJECTED' && deductedDays > 0) {
      if (leaveType === 'SICK') {
        ops.push(
          prisma.leaveBalance.update({
            where: { userId: leave.userId },
            data: { sick: { increment: deductedDays } },
          }),
        );
      }
      if (leaveType === 'ANNUAL') {
        ops.push(
          prisma.leaveBalance.update({
            where: { userId: leave.userId },
            data: { annual: { increment: deductedDays } },
          }),
        );
      }
      if (leaveType === 'COMP_OFF') {
        ops.push(
          prisma.leaveBalance.update({
            where: { userId: leave.userId },
            data: { compOff: { increment: totalDays } },
          }),
        );
      }
    }

    const results = await prisma.$transaction(ops);
    const updated = results[0];

    if (
      status === 'REJECTED' &&
      (leaveType === 'SICK' || leaveType === 'ANNUAL') &&
      Number(leave.lopDays ?? 0) > 0
    ) {
      const salaryStructure = await prisma.salaryStructure.findFirst({
        where: {
          userId: leave.userId,
          organizationId: leave.organizationId,
          isActive: true,
          effectiveFrom: { lte: new Date(leave.startDate) },
        },
        orderBy: [{ effectiveFrom: 'desc' }],
        select: { id: true },
      });
      if (salaryStructure) {
        await prisma.salaryStructure.update({
          where: { id: salaryStructure.id },
          data: {
            lopDays: { decrement: Number(leave.lopDays ?? 0) },
            lopAmount: { decrement: Number(leave.lopAmount ?? 0) },
          },
        });
      }
    }

    if (leaveType === 'SICK' || leaveType === 'ANNUAL') {
      await recalculatePayrollForLeaveRange(leave);
    }

    res.json({ message: 'Leave status updated', leave: updated });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const cancelLeave = async (req, res) => {
  try {
    const leaveId = Number(req.params.id);

    if (Number.isNaN(leaveId)) {
      return res.status(400).json({ message: 'Invalid leave id' });
    }

    const leave = await prisma.leave.findUnique({ where: { id: leaveId } });

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
    }

    const isOwner = leave.userId === req.user.id;
    const sameOrg = leave.organizationId === req.user.organizationId;

    if (!sameOrg) {
      return res.status(403).json({ message: 'Not authorized to cancel' });
    }

    if (isOwner) {
      // employee (or anyone) cancelling own pending leave
    } else if (req.user.role === 'ADMIN') {
      // admin may cancel any pending leave in org
    } else if (req.user.role === 'MANAGER') {
      let applicant;
      try {
        applicant = await prisma.user.findUnique({
          where: { id: leave.userId },
          select: { reportingManagerId: true },
        });
      } catch (error) {
        if (!isMissingReportingManagerColumn(error)) throw error;
        return res.status(503).json({
          message:
            'Reporting manager mapping is unavailable. Please run database migrations and prisma generate.',
        });
      }
      if (applicant?.reportingManagerId !== req.user.id) {
        return res.status(403).json({ message: 'Not authorized to cancel' });
      }
    } else {
      return res.status(403).json({ message: 'Not authorized to cancel' });
    }

    if (leave.status !== 'PENDING') {
      return res
        .status(400)
        .json({ message: 'Only pending leave requests can be cancelled' });
    }

    const user = await prisma.user.findUnique({
      where: { id: leave.userId },
      select: { id: true, gender: true },
    });

    let balance = await prisma.leaveBalance.findUnique({
      where: { userId: leave.userId },
    });

    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: getDefaultLeaveBalance(
          user ?? { id: leave.userId, gender: 'MALE' },
        ),
      });
    }

    const totalDays = await getWorkingDays(
      leave.startDate,
      leave.endDate,
      leave.organizationId,
    );
    const type = leave.type?.toUpperCase();

    const updates = [];

    const deductedDays =
      typeof leave.balanceDeductedDays === 'number'
        ? leave.balanceDeductedDays
        : totalDays;

    if (type === 'SICK' && deductedDays > 0) {
      updates.push(
        prisma.leaveBalance.update({
          where: { userId: leave.userId },
          data: { sick: { increment: deductedDays } },
        }),
      );
    }

    if (type === 'ANNUAL' && deductedDays > 0) {
      updates.push(
        prisma.leaveBalance.update({
          where: { userId: leave.userId },
          data: { annual: { increment: deductedDays } },
        }),
      );
    }

    if (type === 'COMP_OFF') {
      updates.push(
        prisma.leaveBalance.update({
          where: { userId: leave.userId },
          data: { compOff: { increment: totalDays } },
        }),
      );
    }

    updates.push(prisma.leave.delete({ where: { id: leaveId } }));

    await prisma.$transaction(updates);

    if (
      (type === 'SICK' || type === 'ANNUAL') &&
      Number(leave.lopDays ?? 0) > 0
    ) {
      const salaryStructure = await prisma.salaryStructure.findFirst({
        where: {
          userId: leave.userId,
          organizationId: leave.organizationId,
          isActive: true,
          effectiveFrom: { lte: new Date(leave.startDate) },
        },
        orderBy: [{ effectiveFrom: 'desc' }],
        select: { id: true },
      });
      if (salaryStructure) {
        await prisma.salaryStructure.update({
          where: { id: salaryStructure.id },
          data: {
            lopDays: { decrement: Number(leave.lopDays ?? 0) },
            lopAmount: { decrement: Number(leave.lopAmount ?? 0) },
          },
        });
      }
    }

    if (type === 'SICK' || type === 'ANNUAL') {
      await recalculatePayrollForLeaveRange(leave);
    }

    res.json({ message: 'Leave cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const user = await resolveActorContext(req.user);

    if (user.organizationId == null) {
      return res.status(400).json({ message: 'Missing organization' });
    }

    let whereCondition = {};

    if (user.role === 'EMPLOYEE') {
      whereCondition = { userId: user.id };
    } else if (user.role === 'ADMIN') {
      whereCondition = { organizationId: user.organizationId };
    } else if (user.role === 'MANAGER') {
      whereCondition = {
        organizationId: user.organizationId,
        OR: [
          { userId: user.id },
          { user: { reportingManagerId: user.id } },
        ],
      };
    } else {
      whereCondition = { userId: user.id };
    }

    const currentDate = new Date();
    const currentMonthStart = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );

    const currentMonthEnd = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    let leaveCounts;
    let existingBalance;
    let monthlyLeaves;
    let monthHolidays;

    try {
      [leaveCounts, existingBalance, monthlyLeaves, monthHolidays] =
        await Promise.all([
          prisma.leave.groupBy({
            by: ['status'],
            where: whereCondition,
            _count: {
              status: true,
            },
          }),
          prisma.leaveBalance.findUnique({
            where: { userId: user.id },
          }),
          prisma.leave.findMany({
            where: {
              ...whereCondition,
              status: { in: ['PENDING', 'APPROVED'] },
              startDate: { lte: currentMonthEnd },
              endDate: { gte: currentMonthStart },
            },
            select: {
              type: true,
              startDate: true,
              endDate: true,
            },
          }),
          findHolidaysForOrgInDateRange(
            user.organizationId,
            currentMonthStart,
            currentMonthEnd,
          ),
        ]);
    } catch (error) {
      if (!(user.role === 'MANAGER' && isMissingReportingManagerColumn(error))) {
        throw error;
      }
      const fallbackWhere = { userId: user.id };
      [leaveCounts, existingBalance, monthlyLeaves, monthHolidays] =
        await Promise.all([
          prisma.leave.groupBy({
            by: ['status'],
            where: fallbackWhere,
            _count: {
              status: true,
            },
          }),
          prisma.leaveBalance.findUnique({
            where: { userId: user.id },
          }),
          prisma.leave.findMany({
            where: {
              ...fallbackWhere,
              status: { in: ['PENDING', 'APPROVED'] },
              startDate: { lte: currentMonthEnd },
              endDate: { gte: currentMonthStart },
            },
            select: {
              type: true,
              startDate: true,
              endDate: true,
            },
          }),
          findHolidaysForOrgInDateRange(
            user.organizationId,
            currentMonthStart,
            currentMonthEnd,
          ),
        ]);
    }

    const balance =
      existingBalance ??
      (await prisma.leaveBalance.create({
        data: getDefaultLeaveBalance(user),
      }));

    const statusCounts = leaveCounts.reduce((acc, row) => {
      acc[row.status] = row._count.status;
      return acc;
    }, {});

    const totalLeaves = leaveCounts.reduce(
      (sum, row) => sum + row._count.status,
      0,
    );
    const pending = statusCounts.PENDING ?? 0;
    const approved = statusCounts.APPROVED ?? 0;
    const rejected = statusCounts.REJECTED ?? 0;

    const filteredBalance = {
      sick: balance.sick,
      annual: balance.annual,
      compOff: balance.compOff ?? 0,
      ...(user.gender === 'FEMALE' && { maternity: balance.maternity }),
      ...(user.gender === 'MALE' && { paternity: balance.paternity }),
    };

    const holidayKeys = new Set(
      monthHolidays.map((h) => localDayKey(toLocalCalendarDate(h.date))),
    );

    const usageByType = {
      SICK: new Set(),
      ANNUAL: new Set(),
      COMP_OFF: new Set(),
      MATERNITY: new Set(),
      PATERNITY: new Set(),
    };

    for (const leave of monthlyLeaves) {
      const usageSet = usageByType[leave.type];

      if (!usageSet) {
        continue;
      }

      const rangeStart = toLocalCalendarDate(leave.startDate);
      const rangeEnd = toLocalCalendarDate(leave.endDate);
      const monthStartDay = toLocalCalendarDate(currentMonthStart);
      const monthEndDay = toLocalCalendarDate(currentMonthEnd);
      const clipStart = rangeStart > monthStartDay ? rangeStart : monthStartDay;
      const clipEnd = rangeEnd < monthEndDay ? rangeEnd : monthEndDay;

      if (
        Number.isNaN(clipStart.getTime()) ||
        Number.isNaN(clipEnd.getTime())
      ) {
        continue;
      }
      if (clipStart > clipEnd) {
        continue;
      }

      const cur = new Date(clipStart);
      while (cur <= clipEnd) {
        const dow = cur.getDay();
        const isWeekend = dow === 0 || dow === 6;
        const isHoliday = holidayKeys.has(localDayKey(cur));

        if (!isWeekend && !isHoliday) {
          usageSet.add(localDayKey(cur));
        }

        cur.setDate(cur.getDate() + 1);
      }
    }

    const monthlyUsage = {
      sick: usageByType.SICK.size,
      annual: usageByType.ANNUAL.size,
      compOff: usageByType.COMP_OFF.size,
      maternity: usageByType.MATERNITY.size,
      paternity: usageByType.PATERNITY.size,
    };

    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const currentMonthIndex = new Date().getMonth();

    const chartData = {
      annual: months.map((month, index) => ({
        month,
        value: index === currentMonthIndex ? monthlyUsage.annual : 0,
      })),
      sick: months.map((month, index) => ({
        month,
        value: index === currentMonthIndex ? monthlyUsage.sick : 0,
      })),
      compOff: months.map((month, index) => ({
        month,
        value: index === currentMonthIndex ? monthlyUsage.compOff : 0,
      })),
    };

    res.json({
      totalLeaves,
      pending,
      approved,
      rejected,
      balance: filteredBalance,
      monthlyUsage,
      chartData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getLeaveHistory = async (req, res) => {
  try {
    const leaves = await prisma.leave.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

