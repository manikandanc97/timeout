import prisma from '../prismaClient.js';
import { toLocalCalendarDate } from '../services/leaveService.js';
import {
  notifyAttendanceRegularizationApplied,
  notifyAttendanceRegularizationDecision,
} from '../services/notificationService.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const localDayStart = (value) => {
  const d = toLocalCalendarDate(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
};

const localDayEnd = (value) => {
  const d = toLocalCalendarDate(value);
  if (Number.isNaN(d.getTime())) return null;
  return new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);
};

const calcWorkHours = (checkIn, checkOut) => {
  if (!checkIn || !checkOut) return null;
  const ms = new Date(checkOut) - new Date(checkIn);
  if (ms <= 0) return null;
  return Math.round((ms / 3_600_000) * 100) / 100;
};

const resolveActor = async (authUser) => {
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: { id: true, role: true, organizationId: true, reportingManagerId: true },
  });
  return dbUser || authUser;
};

const canModerateRegularization = async (actor, requestUserId) => {
  // ── CRITICAL: No self-approval ever ──────────────────────────────────────
  if (actor.id === requestUserId) return false;
  if (actor.role === 'ADMIN') return true;
  if (actor.role !== 'MANAGER') return false;
  const applicant = await prisma.user.findUnique({
    where: { id: requestUserId },
    select: { reportingManagerId: true },
  });
  return applicant?.reportingManagerId === actor.id;
};

// ─── Punch In ────────────────────────────────────────────────────────────────

export const punchIn = async (req, res) => {
  try {
    const userId = req.user.id;
    const organizationId = req.user.organizationId;
    const now = new Date();
    const todayStart = localDayStart(now);
    const todayEnd = localDayEnd(now);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organizationId: true },
    });
    if (!user || user.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Check for existing punch-in today
    const existing = await prisma.attendanceLog.findUnique({
      where: { userId_date: { userId, date: todayStart } },
    });

    if (existing?.checkIn) {
      return res.status(400).json({ message: 'Already punched in today' });
    }

    const log = await prisma.attendanceLog.upsert({
      where: { userId_date: { userId, date: todayStart } },
      create: {
        userId,
        organizationId,
        date: todayStart,
        checkIn: now,
        status: 'PRESENT',
      },
      update: {
        checkIn: now,
        status: 'PRESENT',
      },
    });

    return res.status(201).json({ message: 'Punched in successfully', attendance: log });
  } catch (err) {
    console.error('[Attendance] punchIn error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Punch Out ───────────────────────────────────────────────────────────────

export const punchOut = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const todayStart = localDayStart(now);

    const existing = await prisma.attendanceLog.findUnique({
      where: { userId_date: { userId, date: todayStart } },
    });

    if (!existing) {
      return res.status(400).json({ message: 'No punch-in found for today. Please punch in first.' });
    }
    if (!existing.checkIn) {
      return res.status(400).json({ message: 'No punch-in found for today' });
    }
    if (existing.checkOut) {
      return res.status(400).json({ message: 'Already punched out today' });
    }

    const workHours = calcWorkHours(existing.checkIn, now);
    // Half-day if < 4.5 hours
    const status = workHours != null && workHours < 4.5 ? 'HALF_DAY' : 'PRESENT';

    const updated = await prisma.attendanceLog.update({
      where: { userId_date: { userId, date: todayStart } },
      data: { checkOut: now, workHours, status },
    });

    return res.json({ message: 'Punched out successfully', attendance: updated });
  } catch (err) {
    console.error('[Attendance] punchOut error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get My Attendance ────────────────────────────────────────────────────────

export const getMyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 31);
    const skip = (page - 1) * limit;
    const dateParam = req.query.date;
    const targetDate = dateParam ? localDayStart(dateParam) : null;

    if (dateParam && !targetDate) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const where = {
      userId,
      ...(targetDate ? { date: targetDate } : {}),
    };

    const [logs, total] = await Promise.all([
      prisma.attendanceLog.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.attendanceLog.count({ where }),
    ]);

    return res.json({
      data: logs,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Attendance] getMyAttendance error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get Today's Status ───────────────────────────────────────────────────────

export const getTodayStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const todayStart = localDayStart(new Date());

    const log = await prisma.attendanceLog.findUnique({
      where: { userId_date: { userId, date: todayStart } },
    });

    return res.json({ today: log ?? null });
  } catch (err) {
    console.error('[Attendance] getTodayStatus error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Request Regularization ───────────────────────────────────────────────────

export const requestRegularization = async (req, res) => {
  try {
    const { date, requestedCheckIn, requestedCheckOut, reason } = req.body;

    if (!date || !reason || !String(reason).trim()) {
      return res.status(400).json({ message: 'Date and reason are required' });
    }
    if (String(reason).trim().length < 5) {
      return res.status(400).json({ message: 'Reason must be at least 5 characters' });
    }

    const targetDay = localDayStart(date);
    if (!targetDay) {
      return res.status(400).json({ message: 'Invalid date' });
    }

    const today = localDayStart(new Date());
    if (targetDay > today) {
      return res.status(400).json({ message: 'Cannot regularize a future date' });
    }

    const userId = req.user.id;
    const organizationId = req.user.organizationId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, organizationId: true },
    });
    if (!user || user.organizationId !== organizationId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // Prevent duplicate pending request for same date
    const existing = await prisma.regularizationRequest.findFirst({
      where: { userId, date: targetDay, status: 'PENDING' },
    });
    if (existing) {
      return res.status(400).json({ message: 'A pending regularization request already exists for this date' });
    }

    // Validate requested times if provided
    let parsedCheckIn = null;
    let parsedCheckOut = null;

    if (requestedCheckIn) {
      parsedCheckIn = new Date(requestedCheckIn);
      if (Number.isNaN(parsedCheckIn.getTime())) {
        return res.status(400).json({ message: 'Invalid requested check-in time' });
      }
    }
    if (requestedCheckOut) {
      parsedCheckOut = new Date(requestedCheckOut);
      if (Number.isNaN(parsedCheckOut.getTime())) {
        return res.status(400).json({ message: 'Invalid requested check-out time' });
      }
    }
    if (parsedCheckIn && parsedCheckOut && parsedCheckOut <= parsedCheckIn) {
      return res.status(400).json({ message: 'Check-out must be after check-in' });
    }

    const request = await prisma.regularizationRequest.create({
      data: {
        userId,
        organizationId,
        date: targetDay,
        requestedCheckIn: parsedCheckIn,
        requestedCheckOut: parsedCheckOut,
        reason: String(reason).trim(),
        status: 'PENDING',
      },
    });

    try {
      const applicant = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true },
      });
      await notifyAttendanceRegularizationApplied({
        organizationId,
        applicantId: userId,
        applicantName: applicant?.name ?? 'Employee',
        date: targetDay,
      });
    } catch (notifyErr) {
      console.error('[Attendance] regularization notify error:', notifyErr);
    }

    return res.status(201).json({ message: 'Regularization request submitted', request });
  } catch (err) {
    console.error('[Attendance] requestRegularization error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get Regularization Requests ─────────────────────────────────────────────

export const getRegularizationRequests = async (req, res) => {
  try {
    const actor = await resolveActor(req.user);
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 50);
    const skip = (page - 1) * limit;

    let where;
    if (actor.role === 'ADMIN') {
      where = { organizationId: actor.organizationId };
    } else if (actor.role === 'MANAGER') {
      where = {
        organizationId: actor.organizationId,
        OR: [
          { userId: actor.id },
          { user: { reportingManagerId: actor.id } },
        ],
      };
    } else {
      where = { userId: actor.id };
    }

    const [rows, total] = await Promise.all([
      prisma.regularizationRequest.findMany({
        where,
        orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
        include: { user: { select: { id: true, name: true, email: true, designation: true } } },
        skip,
        take: limit,
      }),
      prisma.regularizationRequest.count({ where }),
    ]);

    return res.json({
      data: rows,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('[Attendance] getRegularizationRequests error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Approve / Reject Regularization ──────────────────────────────────────────

export const updateRegularizationStatus = async (req, res) => {
  try {
    const actor = await resolveActor(req.user);
    const requestId = Number(req.params.id);
    const { status, rejectionReason } = req.body ?? {};

    if (!Number.isFinite(requestId)) {
      return res.status(400).json({ message: 'Invalid regularization request ID' });
    }
    if (!['APPROVED', 'REJECTED'].includes(String(status))) {
      return res.status(400).json({ message: 'Invalid status. Must be APPROVED or REJECTED' });
    }
    if (status === 'REJECTED' && !String(rejectionReason ?? '').trim()) {
      return res.status(400).json({ message: 'Rejection reason is required when rejecting a request' });
    }

    const row = await prisma.regularizationRequest.findUnique({
      where: { id: requestId },
      select: { id: true, userId: true, organizationId: true, status: true, date: true, requestedCheckIn: true, requestedCheckOut: true },
    });

    if (!row) return res.status(404).json({ message: 'Regularization request not found' });
    if (row.organizationId !== actor.organizationId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    // ── CRITICAL SELF-APPROVAL BLOCK ────────────────────────────────────────
    if (!(await canModerateRegularization(actor, row.userId))) {
      if (actor.id === row.userId) {
        return res.status(403).json({ message: 'Self-approval is not allowed. Your regularization request must be approved by your manager or HR.' });
      }
      return res.status(403).json({ message: 'Not authorized to approve this request' });
    }

    if (row.status !== 'PENDING') {
      return res.status(400).json({ message: 'Only pending requests can be updated' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const result = await tx.regularizationRequest.update({
        where: { id: requestId },
        data: {
          status,
          approvedById: actor.id,
          rejectionReason: status === 'REJECTED' ? String(rejectionReason).trim() : null,
        },
      });

      // If approved, update or create the attendance log with corrected times
      if (status === 'APPROVED') {
        const workHours = calcWorkHours(row.requestedCheckIn, row.requestedCheckOut);
        const attendanceStatus = workHours != null && workHours < 4.5 ? 'HALF_DAY' : 'PRESENT';

        await tx.attendanceLog.upsert({
          where: { userId_date: { userId: row.userId, date: row.date } },
          create: {
            userId: row.userId,
            organizationId: row.organizationId,
            date: row.date,
            checkIn: row.requestedCheckIn,
            checkOut: row.requestedCheckOut,
            workHours,
            status: attendanceStatus,
          },
          update: {
            checkIn: row.requestedCheckIn ?? undefined,
            checkOut: row.requestedCheckOut ?? undefined,
            workHours: workHours ?? undefined,
            status: attendanceStatus,
          },
        });
      }

      return result;
    });

    try {
      const actor_name = await prisma.user.findUnique({
        where: { id: actor.id },
        select: { name: true },
      });
      await notifyAttendanceRegularizationDecision({
        organizationId: row.organizationId,
        employeeId: row.userId,
        status,
        actorName: actor_name?.name ?? 'HR',
        date: row.date,
      });
    } catch (notifyErr) {
      console.error('[Attendance] regularization decision notify error:', notifyErr);
    }

    return res.json({ message: `Regularization request ${status.toLowerCase()}`, request: updated });
  } catch (err) {
    console.error('[Attendance] updateRegularizationStatus error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};

// ─── Get Team / Org Attendance (Manager+Admin) ────────────────────────────────

export const getTeamAttendance = async (req, res) => {
  try {
    const actor = await resolveActor(req.user);
    if (!['MANAGER', 'ADMIN'].includes(actor.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const dateParam = req.query.date;
    const targetDate = dateParam ? localDayStart(dateParam) : localDayStart(new Date());
    if (!targetDate) return res.status(400).json({ message: 'Invalid date' });

    const targetEnd = localDayEnd(targetDate);

    let userWhere;
    if (actor.role === 'ADMIN') {
      userWhere = {
        organizationId: actor.organizationId,
        isActive: true,
        role: { not: 'ADMIN' },
      };
    } else {
      userWhere = {
        reportingManagerId: actor.id,
        isActive: true,
        role: { not: 'ADMIN' },
      };
    }

    const members = await prisma.user.findMany({
      where: userWhere,
      select: {
        id: true,
        name: true,
        designation: true,
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        attendanceLogs: {
          where: { date: { gte: targetDate, lte: targetEnd } },
          select: { checkIn: true, checkOut: true, status: true, workHours: true },
          take: 1,
        },
      },
      orderBy: [{ team: { name: 'asc' } }, { name: 'asc' }],
    });

    return res.json({ date: targetDate, members });
  } catch (err) {
    console.error('[Attendance] getTeamAttendance error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};
