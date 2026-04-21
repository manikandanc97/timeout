/**
 * AI Action Executor
 * Executes validated HRM actions after user confirmation.
 * All actions are delegated to existing controllers/services.
 */

import prisma from '../prismaClient.js';
import { logAIAction } from './aiAuditService.js';
import {
  updateLeaveStatus,
  updatePermissionStatus,
  updateCompOffStatus,
} from './leaveService.js';

// ─── Helper: format date for display ────────────────────────────────────────
const fmt = (d) => {
  if (!d) return 'N/A';
  return new Date(d).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

// ─── Action implementations ──────────────────────────────────────────────────

async function executeApplyLeave({ user, fields }) {
  const { leaveType, startDate, endDate, reason } = fields;

  // Normalize leave type
  const typeMap = {
    annual: 'ANNUAL', sick: 'SICK', 'comp-off': 'COMP_OFF',
    comp_off: 'COMP_OFF', compoff: 'COMP_OFF', maternity: 'MATERNITY',
    paternity: 'PATERNITY',
  };
  const normalizedType = typeMap[String(leaveType).toLowerCase()] || String(leaveType).toUpperCase();

  const { applyLeave } = await import('../controllers/leaveController.js');

  // Build mock req/res to reuse existing controller
  return await new Promise((resolve, reject) => {
    const mockReq = {
      user: { id: user.id, organizationId: user.organizationId, gender: user.gender, role: user.role },
      body: { type: normalizedType, startDate, endDate, reason },
    };
    const mockRes = {
      status: (code) => ({
        json: (data) => resolve({ success: code < 400, status: code, data }),
      }),
      json: (data) => resolve({ success: true, status: 200, data }),
    };
    applyLeave(mockReq, mockRes).catch(reject);
  });
}

async function executeApplyPermission({ user, fields }) {
  const { date, startTime, endTime, reason } = fields;
  const { applyPermissionRequest } = await import('../controllers/leaveController.js');

  return await new Promise((resolve, reject) => {
    const mockReq = {
      user: { id: user.id, organizationId: user.organizationId },
      body: { date, startTime, endTime, reason },
    };
    const mockRes = {
      status: (code) => ({
        json: (data) => resolve({ success: code < 400, status: code, data }),
      }),
      json: (data) => resolve({ success: true, status: 200, data }),
    };
    applyPermissionRequest(mockReq, mockRes).catch(reject);
  });
}

async function executeApplyCompOff({ user, fields }) {
  const { workDate, reason } = fields;
  const { applyCompOffCredit } = await import('../controllers/leaveController.js');

  return await new Promise((resolve, reject) => {
    const mockReq = {
      user: { id: user.id, organizationId: user.organizationId },
      body: { workDate, reason },
    };
    const mockRes = {
      status: (code) => ({
        json: (data) => resolve({ success: code < 400, status: code, data }),
      }),
      json: (data) => resolve({ success: true, status: 200, data }),
    };
    applyCompOffCredit(mockReq, mockRes).catch(reject);
  });
}

async function executeCheckLeaveBalance({ user }) {
  const balance = await prisma.leaveBalance.findUnique({
    where: { userId: user.id },
  });

  if (!balance) {
    return {
      success: true,
      data: {
        message: 'Default leave balance',
        balance: { annual: 12, sick: 12, compOff: 0, maternity: 0, paternity: 0 },
      },
    };
  }

  return {
    success: true,
    data: { balance },
  };
}

async function executeViewMyLeaves({ user }) {
  const leaves = await prisma.leave.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return { success: true, data: { leaves } };
}

async function executeHolidayList({ user }) {
  const holidays = await prisma.holiday.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { date: 'asc' },
  });

  return { success: true, data: { holidays } };
}

async function executeViewPendingRequests({ user }) {
  const [pendingLeaves, pendingPermissions, pendingCompOffs] = await Promise.all([
    prisma.leave.findMany({
      where: {
        organizationId: user.organizationId,
        status: 'PENDING',
        ...(user.role === 'MANAGER' ? {
          user: { reportingManagerId: user.id },
        } : {}),
      },
      include: {
        user: { select: { id: true, name: true, designation: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.permissionRequest.findMany({
      where: {
        organizationId: user.organizationId,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, designation: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.compOffWorkLog.findMany({
      where: {
        organizationId: user.organizationId,
        status: 'PENDING',
      },
      include: {
        user: { select: { id: true, name: true, designation: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  return {
    success: true,
    data: { pendingLeaves, pendingPermissions, pendingCompOffs },
  };
}

async function executeApproveLeave({ user, fields }) {
  const leaveId = Number(fields.leaveId);
  if (!leaveId) return { success: false, data: { message: 'Invalid leave ID' } };

  const updated = await updateLeaveStatus({
    leaveId,
    status: 'APPROVED',
    actorId: user.id,
  });

  return { success: true, data: { message: `Leave #${leaveId} approved successfully`, leave: updated } };
}

async function executeRejectLeave({ user, fields }) {
  const leaveId = Number(fields.leaveId);
  if (!leaveId) return { success: false, data: { message: 'Invalid leave ID' } };

  const updated = await updateLeaveStatus({
    leaveId,
    status: 'REJECTED',
    rejectionReason: fields.rejectionReason || 'Rejected via AI Assistant',
    actorId: user.id,
  });

  return { success: true, data: { message: `Leave #${leaveId} rejected`, leave: updated } };
}

async function executeApprovePermission({ user, fields }) {
  const permId = Number(fields.permissionId);
  if (!permId) return { success: false, data: { message: 'Invalid permission ID' } };

  const updated = await updatePermissionStatus({
    requestId: permId,
    status: 'APPROVED',
    actorId: user.id,
  });

  return { success: true, data: { message: `Permission #${permId} approved`, request: updated } };
}

async function executeRejectPermission({ user, fields }) {
  const permId = Number(fields.permissionId);
  if (!permId) return { success: false, data: { message: 'Invalid permission ID' } };

  const updated = await updatePermissionStatus({
    requestId: permId,
    status: 'REJECTED',
    actorId: user.id,
  });

  return { success: true, data: { message: `Permission #${permId} rejected`, request: updated } };
}

async function executeApproveCompOff({ user, fields }) {
  const compOffId = Number(fields.compOffId);
  if (!compOffId) return { success: false, data: { message: 'Invalid comp-off ID' } };

  const updated = await updateCompOffStatus({
    requestId: compOffId,
    status: 'APPROVED',
    actorId: user.id,
  });

  return { success: true, data: { message: `Comp-off #${compOffId} approved successfully`, request: updated } };
}

async function executeRejectCompOff({ user, fields }) {
  const compOffId = Number(fields.compOffId);
  if (!compOffId) return { success: false, data: { message: 'Invalid comp-off ID' } };

  const updated = await updateCompOffStatus({
    requestId: compOffId,
    status: 'REJECTED',
    actorId: user.id,
  });

  return { success: true, data: { message: `Comp-off #${compOffId} rejected`, request: updated } };
}

async function executeAddEmployee({ user, fields }) {
  const {
    createEmployeeUser,
  } = await import('../controllers/organizationController.js');

  // Find team by name or ID
  let teamId = fields.teamId;
  if (isNaN(Number(teamId))) {
    const team = await prisma.team.findFirst({
      where: {
        organizationId: user.organizationId,
        name: { contains: String(teamId), mode: 'insensitive' },
      },
    });
    teamId = team?.id;
    if (!teamId) return { success: false, data: { message: `Team "${fields.teamId}" not found` } };
  }

  return await new Promise((resolve, reject) => {
    const mockReq = {
      user: { id: user.id, organizationId: user.organizationId, role: user.role },
      body: {
        name: fields.name,
        email: fields.email,
        password: fields.password || 'TempPass@123',
        gender: String(fields.gender || '').toUpperCase() === 'FEMALE' ? 'FEMALE' : 'MALE',
        designation: fields.designation,
        teamId: Number(teamId),
        joiningDate: fields.joiningDate,
        role: fields.role || 'EMPLOYEE',
      },
    };
    const mockRes = {
      status: (code) => ({
        json: (data) => resolve({ success: code < 400, status: code, data }),
      }),
      json: (data) => resolve({ success: true, status: 200, data }),
    };
    createEmployeeUser(mockReq, mockRes).catch(reject);
  });
}

async function executeDeactivateEmployee({ user, fields }) {
  const empId = Number(fields.employeeId);
  if (!empId) return { success: false, data: { message: 'Invalid employee ID' } };

  const emp = await prisma.user.findFirst({
    where: { id: empId, organizationId: user.organizationId },
  });
  if (!emp) return { success: false, data: { message: 'Employee not found' } };

  await prisma.user.update({
    where: { id: empId },
    data: { isActive: false },
  });

  return { success: true, data: { message: `${emp.name} has been deactivated` } };
}

async function executeActivateEmployee({ user, fields }) {
  const empId = Number(fields.employeeId);
  if (!empId) return { success: false, data: { message: 'Invalid employee ID' } };

  const emp = await prisma.user.findFirst({
    where: { id: empId, organizationId: user.organizationId },
  });
  if (!emp) return { success: false, data: { message: 'Employee not found' } };

  await prisma.user.update({
    where: { id: empId },
    data: { isActive: true },
  });

  return { success: true, data: { message: `${emp.name} has been reactivated` } };
}

async function executeDeleteEmployee({ user, fields }) {
  const empId = Number(fields.employeeId);
  if (!empId) return { success: false, data: { message: 'Invalid employee ID' } };

  const emp = await prisma.user.findFirst({
    where: { id: empId, organizationId: user.organizationId, role: { not: 'ADMIN' } },
  });
  if (!emp) return { success: false, data: { message: 'Employee not found or is an admin' } };

  await prisma.user.delete({ where: { id: empId } });

  return { success: true, data: { message: `Employee ${emp.name} has been permanently deleted` } };
}

async function executeViewPayrollSummary({ user }) {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const payrolls = await prisma.payroll.findMany({
    where: { organizationId: user.organizationId, month, year },
    include: { user: { select: { name: true, designation: true } } },
    orderBy: { netSalary: 'desc' },
    take: 10,
  });

  return { success: true, data: { payrolls, month, year } };
}

async function executeViewPayslip({ user }) {
  const now = new Date();
  const payslip = await prisma.payroll.findFirst({
    where: {
      userId: user.id,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
  });

  return { success: true, data: { payslip } };
}

// ─── Action router map ───────────────────────────────────────────────────────
const ACTION_HANDLERS = {
  APPLY_LEAVE: executeApplyLeave,
  APPLY_PERMISSION: executeApplyPermission,
  APPLY_COMP_OFF: executeApplyCompOff,
  CHECK_LEAVE_BALANCE: executeCheckLeaveBalance,
  VIEW_MY_LEAVES: executeViewMyLeaves,
  HOLIDAY_LIST: executeHolidayList,
  VIEW_PENDING_REQUESTS: executeViewPendingRequests,
  APPROVE_LEAVE: executeApproveLeave,
  REJECT_LEAVE: executeRejectLeave,
  APPROVE_PERMISSION: executeApprovePermission,
  REJECT_PERMISSION: executeRejectPermission,
  APPROVE_COMP_OFF: executeApproveCompOff,
  REJECT_COMP_OFF: executeRejectCompOff,
  ADD_EMPLOYEE: executeAddEmployee,
  DEACTIVATE_EMPLOYEE: executeDeactivateEmployee,
  ACTIVATE_EMPLOYEE: executeActivateEmployee,
  DELETE_EMPLOYEE: executeDeleteEmployee,
  VIEW_PAYROLL_SUMMARY: executeViewPayrollSummary,
  VIEW_PAYSLIP: executeViewPayslip,
};

// ─── Main executor ───────────────────────────────────────────────────────────

/**
 * Execute a validated AI action.
 * @param {object} params
 * @param {string} params.action - The AI_ACTIONS constant
 * @param {object} params.user - Authenticated user
 * @param {object} params.fields - Collected field values
 * @returns {Promise<object>}
 */
export const executeAction = async ({ action, user, fields }) => {
  const handler = ACTION_HANDLERS[action];

  if (!handler) {
    await logAIAction({
      organizationId: user.organizationId,
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      intent: action,
      action: `Unknown action: ${action}`,
      payload: fields,
      status: 'FAILED',
    });
    return {
      success: false,
      data: { message: `I don't know how to execute "${action}" yet.` },
    };
  }

  let result;
  try {
    result = await handler({ user, fields });
  } catch (err) {
    console.error(`[AI Executor] ${action} failed:`, err);
    result = { success: false, data: { message: err.message || 'Action failed' } };
  }

  // Audit log every executed action
  await logAIAction({
    organizationId: user.organizationId,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    intent: action,
    action: `${action} executed`,
    payload: fields,
    result: result.data,
    status: result.success ? 'SUCCESS' : 'FAILED',
  });

  return result;
};
