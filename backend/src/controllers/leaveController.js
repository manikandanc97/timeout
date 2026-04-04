import prisma from '../prismaClient.js';

export const applyLeave = async (req, res) => {
  try {
    const { type, fromDate, toDate, reason } = req.body;
    if (!type || !fromDate || !toDate || !reason) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (new Date(fromDate) > new Date(toDate)) {
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
        data: {
          userId,
          sick: 0,
          casual: 12,
          maternity: 0,
          paternity: 0,
        },
      });
    }

    const leaveType = type.toUpperCase();
    const totalDays = Math.ceil(
      (new Date(toDate) - new Date(fromDate)) / (1000 * 60 * 60 * 24) + 1,
    );

    if (leaveType === 'SICK' && balance.sick < totalDays) {
      return res.status(400).json({ message: 'No sick leave left' });
    }

    if (leaveType === 'CASUAL' && balance.casual < totalDays) {
      return res.status(400).json({ message: 'No casual leave left' });
    }

    const leave = await prisma.leave.create({
      data: {
        type,
        fromDate: new Date(fromDate),
        toDate: new Date(toDate),
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

    if (leaveType === 'CASUAL') {
      await prisma.leaveBalance.update({
        where: { userId },
        data: { casual: { decrement: totalDays } },
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

    const totalLeaves = await prisma.leave.count({ where: whereCondition });
    const pending = await prisma.leave.count({
      where: { ...whereCondition, status: 'PENDING' },
    });
    const approved = await prisma.leave.count({
      where: { ...whereCondition, status: 'APPROVED' },
    });
    const rejected = await prisma.leave.count({
      where: { ...whereCondition, status: 'REJECTED' },
    });

    const balance = await prisma.leaveBalance.findUnique({
      where: { userId: user.id },
    });

    if (!balance) {
      balance = await prisma.leaveBalance.create({
        data: {
          userId: user.id,
          sick: 0,
          casual: 12,
          maternity: 0,
          paternity: 0,
        },
      });
    }

    let filteredBalance = {
      sick: balance.sick,
      casual: balance.casual,
    };

    if (user.gender === 'FEMALE') {
      filteredBalance.maternity = balance.maternity;
    }
    if (user.gender === 'MALE') {
      filteredBalance.paternity = balance.paternity;
    }

    res.json({
      totalLeaves,
      pending,
      approved,
      rejected,
      balance: filteredBalance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
