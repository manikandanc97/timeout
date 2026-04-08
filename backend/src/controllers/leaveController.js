import prisma from '../prismaClient.js';

const getDefaultLeaveBalance = (user) => ({
  userId: user.id,
  sick: 0,
  annual: 12,
  maternity: user.gender === 'FEMALE' ? 180 : 0,
  paternity: user.gender === 'MALE' ? 15 : 0,
});

const getWorkingDays = async (startDate, endDate) => {
  let count = 0;
  const currentDate = new Date(startDate);

  const holidays = await prisma.holiday.findMany({
    where: {
      date: {
        gte: new Date(startDate),
        lte: new Date(endDate),
      },
    },
  });

  const holidayDates = holidays.map((h) => h.date.toDateString());

  while (currentDate <= new Date(endDate)) {
    const dayOfWeek = currentDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isHoliday = holidayDates.includes(currentDate.toDateString());
    if (!isWeekend && !isHoliday) {
      count++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return count;
};

export const applyLeave = async (req, res) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;
    if (!type || !fromDate || !toDate || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const normalizedFromDate = new Date(`${fromDate}T00:00:00`);
    const normalizedToDate = new Date(`${toDate}T00:00:00`);

    if (
      Number.isNaN(normalizedFromDate.getTime()) ||
      Number.isNaN(normalizedToDate.getTime())
    ) {
      return res.status(400).json({ message: 'Invalid leave dates provided' });
    }

    if (normalizedFromDate > normalizedToDate) {
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
    const totalDays = await getWorkingDays(fromDate, toDate);

    const existingLeave = await prisma.leave.findFirst({
      where: {
        userId,
        status: {
          in: ['PENDING', 'APPROVED'],
        },
        fromDate: {
          lte: normalizedToDate,
        },
        toDate: {
          gte: normalizedFromDate,
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
        fromDate: normalizedFromDate,
        toDate: normalizedToDate,
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
        where: { userId: user.userId },
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

    const updated = await prisma.leave.update({
      where: { id: Number(req.params.id) },
      data: { status },
    });

    res.json({ message: 'Leave status updated', leave: updated });
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
    );

    const [leaveCounts, existingBalance, monthlyLeaves] = await Promise.all([
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
          fromDate: {
            gte: currentMonthStart,
            lte: currentMonthEnd,
          },
        },
        select: {
          type: true,
          fromDate: true,
          toDate: true,
        },
      }),
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

      let current = new Date(leave.fromDate);
      const end = new Date(leave.toDate);

      while (current <= end) {
        const day = current.getDay();
        const isWeekend = day === 0 || day === 6;

        if (!isWeekend) {
          usageSet.add(current.toDateString());
        }

        current.setDate(current.getDate() + 1);
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
      take: 10,
    });
    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getUpcomingHolidays = async (req, res) => {
  try {
    const today = new Date();
    const holidays = await prisma.holiday.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      orderBy: { date: 'asc' },
      take: 10,
    });
    res.json(holidays);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
