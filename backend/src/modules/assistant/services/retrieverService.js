import prisma from '../../../prismaClient.js';
import { AssistantRoles } from '../types/assistantTypes.js';
import { isAdminLikeRole, normalizeRole } from '../utils/roleAccess.js';

const assistantDebugEnabled = process.env.ASSISTANT_DEBUG !== 'false';
const debugLog = (...args) => {
  if (!assistantDebugEnabled) return;
  console.log('[assistant-retriever]', ...args);
};

const toIsoDate = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
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

const getDefaultLeaveBalance = (user) => ({
  userId: user.id,
  sick: 12,
  annual: 12,
  compOff: 0,
  maternity: user.gender === 'FEMALE' ? 180 : 0,
  paternity: user.gender === 'MALE' ? 15 : 0,
});

const buildLeaveRequestWhere = (userId, role, organizationId) => {
  const normalized = normalizeRole(role);
  if (normalized === AssistantRoles.ADMIN) {
    return { organizationId };
  }
  if (normalized === AssistantRoles.MANAGER) {
    return {
      organizationId,
      OR: [{ userId }, { user: { reportingManagerId: userId } }],
    };
  }
  return { userId };
};

export async function retrieveContext(queryIntent, userId, role, organizationId) {
  debugLog('retrieveContext()', { queryIntent, userId, role, organizationId });
  if (organizationId == null) {
    return { kind: 'error', message: 'Missing organization context for this user.' };
  }

  const normalizedRole = normalizeRole(role);

  if (queryIntent === 'greeting') {
    return { kind: 'greeting' };
  }

  if (queryIntent === 'leave_balance') {
    let leaveBalance = await prisma.leaveBalance.findUnique({ where: { userId } });
    if (!leaveBalance) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, gender: true },
      });
      if (!user) {
        return { kind: 'leave_balance', leaveBalance: null };
      }
      leaveBalance = await prisma.leaveBalance.create({
        data: getDefaultLeaveBalance(user),
      });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { gender: true },
    });
    const gender = String(user?.gender ?? '').toUpperCase();
    const filteredBalance = {
      sick: leaveBalance.sick,
      annual: leaveBalance.annual,
      compOff: leaveBalance.compOff ?? 0,
      ...(gender === 'FEMALE' && { maternity: leaveBalance.maternity }),
      ...(gender === 'MALE' && { paternity: leaveBalance.paternity }),
    };
    const output = { kind: 'leave_balance', leaveBalance: filteredBalance };
    debugLog('leave_balance', output);
    return output;
  }

  if (queryIntent === 'latest_payslip') {
    const payslip = await prisma.payroll.findFirst({
      where: {
        organizationId,
        userId,
        status: 'PAID',
      },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
    const output = { kind: 'latest_payslip', payslip };
    debugLog('latest_payslip', { found: payslip != null });
    return output;
  }

  if (queryIntent === 'holiday_list') {
    const now = new Date();
    const next60Days = new Date();
    next60Days.setDate(next60Days.getDate() + 60);
    const holidays = await prisma.holiday.findMany({
      where: {
        organizationId,
        date: { gte: now, lte: next60Days },
      },
      orderBy: [{ date: 'asc' }],
      take: 20,
    });
    const output = {
      kind: 'holiday_list',
      holidays: holidays.map((item) => ({ ...item, isoDate: toIsoDate(item.date) })),
    };
    debugLog('holiday_list', { count: output.holidays.length });
    return output;
  }

  if (queryIntent === 'leave_request_status') {
    const where = buildLeaveRequestWhere(userId, normalizedRole, organizationId);
    let requests;
    try {
      requests = await prisma.leave.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }],
        include: { user: { select: { id: true, name: true } } },
        take: 20,
      });
    } catch (error) {
      if (!(normalizedRole === AssistantRoles.MANAGER && isMissingReportingManagerColumn(error))) {
        throw error;
      }
      requests = await prisma.leave.findMany({
        where: { userId },
        orderBy: [{ createdAt: 'desc' }],
        include: { user: { select: { id: true, name: true } } },
        take: 20,
      });
    }
    const output = { kind: 'leave_request_status', requests };
    debugLog('leave_request_status', { count: requests.length });
    return output;
  }

  if (queryIntent === 'hr_policy') {
    const org = await prisma.organization.findUnique({
      where: { id: organizationId },
      select: { leavePolicy: true },
    });

    let policyRows = [];
    if (isAdminLikeRole(normalizedRole)) {
      policyRows = await prisma.hrPolicy.findMany({
        where: { organizationId },
        orderBy: [{ createdAt: 'desc' }],
        take: 10,
      });
    }

    const output = {
      kind: 'hr_policy',
      leavePolicy: org?.leavePolicy ?? null,
      policyRows,
      audience: isAdminLikeRole(normalizedRole) ? 'admin' : 'employee',
    };
    debugLog('hr_policy', {
      policyRows: policyRows.length,
      hasLeavePolicy: output.leavePolicy != null,
      audience: output.audience,
    });
    return output;
  }

  return { kind: 'unknown' };
}
