import prisma from '../prismaClient.js';
import { findHolidaysForOrgInDateRange } from '../lib/findHolidaysForOrgInDateRange.js';

const getDefaultLeaveBalance = (user) => ({
  userId: user.id,
  sick: 0,
  annual: 12,
  maternity: user.gender === 'FEMALE' ? 180 : 0,
  paternity: user.gender === 'MALE' ? 15 : 0,
});

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

const localDayKey = (d) => d.endDateString();

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

    if (leaveType === 'SICK' && balance.sick < totalDays) {
      return res.status(400).json({ message: 'No sick leave left' });
    }

    if (leaveType === 'ANNUAL' && balance.annual < totalDays) {
      return res.status(400).json({ message: 'No annual leave left' });
    }

    const leave = await prisma.leave.create({
      data: {
        type,
        startDate: normalizedstartDate,
        endDate: normalizedendDate,
        reason,
        userId: userId,
      },
    });

    if (leaveType === 'SICK') {
      await prisma.leaveBalance.update({
        where: { userId },
        data: { sick: { decrement: totalDays } },
      });
    }

    if (leaveType === 'ANNUAL') {
      await prisma.leaveBalance.update({
        where: { userId },
        data: { annual: { decrement: totalDays } },
      });
    }

    console.log('Leave applied:', totalDays, leave);

    res.status(201).json({ message: 'Leave applied successfully', leave });
  } catch (error) {
    console.error('ERROR:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getLeaves = async (req, res) => {
  try {
    const user = req.user;
    let leaves;

    if (user.role === 'EMPLOYEE') {
      leaves = await prisma.leave.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      leaves = await prisma.leave.findMany({
        include: {
          user: {
            select: { name: true, email: true },
          },
        },
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

    const { status } = req.body;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leaveId = Number(req.params.id);
    const leave = await prisma.leave.findUnique({ where: { id: leaveId } });

    if (!leave) {
      return res.status(404).json({ message: 'Leave not found' });
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
        data: { status },
      }),
    ];

    if (status === 'REJECTED' && totalDays > 0) {
      if (leaveType === 'SICK') {
        ops.push(
          prisma.leaveBalance.update({
            where: { userId: leave.userId },
            data: { sick: { increment: totalDays } },
          }),
        );
      }
      if (leaveType === 'ANNUAL') {
        ops.push(
          prisma.leaveBalance.update({
            where: { userId: leave.userId },
            data: { annual: { increment: totalDays } },
          }),
        );
      }
    }

    const results = await prisma.$transaction(ops);
    const updated = results[0];

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

    const isManager = ['MANAGER', 'ADMIN'].includes(req.user.role);
    const isOwner = leave.userId === req.user.id;

    if (!isManager && !isOwner) {
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

    if (type === 'SICK') {
      updates.push(
        prisma.leaveBalance.update({
          where: { userId: leave.userId },
          data: { sick: { increment: totalDays } },
        }),
      );
    }

    if (type === 'ANNUAL') {
      updates.push(
        prisma.leaveBalance.update({
          where: { userId: leave.userId },
          data: { annual: { increment: totalDays } },
        }),
      );
    }

    updates.push(prisma.leave.delete({ where: { id: leaveId } }));

    await prisma.$transaction(updates);

    res.json({ message: 'Leave cancelled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const user = req.user;
    let whereCondition = {};

    if (user.role === 'EMPLOYEE') {
      whereCondition.userId = user.id;
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

    const [leaveCounts, existingBalance, monthlyLeaves, monthHolidays] =
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
      ...(user.gender === 'FEMALE' && { maternity: balance.maternity }),
      ...(user.gender === 'MALE' && { paternity: balance.paternity }),
    };

    const holidayKeys = new Set(
      monthHolidays.map((h) => localDayKey(toLocalCalendarDate(h.date))),
    );

    const usageByType = {
      SICK: new Set(),
      ANNUAL: new Set(),
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

