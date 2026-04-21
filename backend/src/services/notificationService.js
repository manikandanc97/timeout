import prisma from '../prismaClient.js';
import { emitNotification } from '../socket/socketServer.js';

function formatDateOnly(d) {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function leaveTypeLabel(type) {
  if (!type) return 'Leave';
  return String(type).replace(/_/g, ' ');
}

function roleLabel(role) {
  const v = String(role ?? '').toUpperCase();
  if (v === 'ADMIN') return 'Admin';
  if (v === 'MANAGER') return 'Manager';
  if (v === 'HR') return 'HR';
  return 'Employee';
}

async function getActiveUserIdsInOrg(organizationId) {
  const rows = await prisma.user.findMany({
    where: { organizationId, isActive: true },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

async function getActiveAdminIdsInOrg(organizationId) {
  const rows = await prisma.user.findMany({
    where: { organizationId, role: 'ADMIN', isActive: true },
    select: { id: true },
  });
  return rows.map((r) => r.id);
}

async function notifyUsersByIds(userIds, buildData) {
  const ids = [...new Set(userIds)].filter((id) => Number.isFinite(Number(id)));
  if (!ids.length) return;
  await Promise.all(
    ids.map((userId) =>
      createAndEmitNotification(
        buildData(Number(userId)) ?? {
          user: { connect: { id: Number(userId) } },
        },
      ),
    ),
  );
}

export function toNotificationPayload(record) {
  return {
    id: record.id,
    userId: record.userId,
    organizationId: record.organizationId,
    type: record.type,
    title: record.title,
    body: record.body,
    readAt: record.readAt ? record.readAt.toISOString() : null,
    leaveId: record.leaveId,
    createdAt: record.createdAt.toISOString(),
  };
}

/** Persist notification then push to the user's Socket.IO room. */
export async function createAndEmitNotification(data) {
  const row = await prisma.notification.create({ data });
  emitNotification(row.userId, toNotificationPayload(row));
  return row;
}

/**
 * Notify org admins and the employee's reporting manager when leave is applied.
 * Does not notify the applicant.
 */
export async function notifyLeaveAppliedRecipients({
  leave,
  applicantId,
  applicantName,
  organizationId,
}) {
  const recipientIds = new Set();

  const admins = await prisma.user.findMany({
    where: {
      organizationId,
      role: 'ADMIN',
      isActive: true,
    },
    select: { id: true },
  });
  admins.forEach((a) => recipientIds.add(a.id));

  const applicant = await prisma.user.findUnique({
    where: { id: applicantId },
    select: { reportingManagerId: true },
  });
  if (applicant?.reportingManagerId) {
    recipientIds.add(applicant.reportingManagerId);
  }

  recipientIds.delete(applicantId);

  const range = `${formatDateOnly(leave.startDate)} → ${formatDateOnly(leave.endDate)}`;
  const body = `${applicantName} requested ${leaveTypeLabel(leave.type)} (${range}).`;

  await Promise.all(
    [...recipientIds].map((userId) =>
      createAndEmitNotification({
        user: { connect: { id: userId } },
        organization: { connect: { id: organizationId } },
        type: 'LEAVE_APPLIED',
        title: 'New leave request',
        body,
        leave: { connect: { id: leave.id } },
      }),
    ),
  );
}

/**
 * Notify the employee when their leave is approved or rejected.
 */
export async function notifyEmployeeLeaveDecision({
  leave,
  employeeId,
  organizationId,
  status,
  actorName,
  rejectionReason,
}) {
  const isApproved = status === 'APPROVED';
  const type = isApproved ? 'LEAVE_APPROVED' : 'LEAVE_REJECTED';
  const title = isApproved ? 'Leave approved' : 'Leave rejected';
  const range = `${formatDateOnly(leave.startDate)} → ${formatDateOnly(leave.endDate)}`;
  let body = `${actorName} ${isApproved ? 'approved' : 'rejected'} your ${leaveTypeLabel(leave.type)} (${range}).`;
  if (!isApproved && rejectionReason) {
    body += ` Reason: ${rejectionReason}`;
  }

  await createAndEmitNotification({
    user: { connect: { id: employeeId } },
    organization: { connect: { id: organizationId } },
    type,
    title,
    body,
    leave: { connect: { id: leave.id } },
  });
}

function payslipPeriodLabel(month, year) {
  const m = Number(month);
  const y = Number(year);
  if (!Number.isFinite(m) || !Number.isFinite(y)) return '';
  try {
    return new Date(y, m - 1, 1).toLocaleString('en-IN', {
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return `${m}/${y}`;
  }
}

/** Notify employee when payroll for a month is marked paid (payslip available). */
export async function notifyEmployeePayslipPaid({
  userId,
  organizationId,
  month,
  year,
}) {
  const period = payslipPeriodLabel(month, year);
  const body = period
    ? `Your payslip for ${period} is ready. View or download it from Payslip.`
    : 'Your payslip is ready. View or download it from Payslip.';

  await createAndEmitNotification({
    user: { connect: { id: userId } },
    organization: { connect: { id: organizationId } },
    type: 'PAYSLIP_PAID',
    title: 'Payslip available',
    body,
  });
}

export async function notifyLeaveCancelledRecipients({
  leave,
  organizationId,
  cancelledByUserId,
  cancelledByName,
}) {
  const applicant = await prisma.user.findUnique({
    where: { id: leave.userId },
    select: { name: true, reportingManagerId: true },
  });

  const adminIds = await getActiveAdminIdsInOrg(organizationId);
  const recipientIds = new Set(adminIds);
  if (applicant?.reportingManagerId) recipientIds.add(applicant.reportingManagerId);
  recipientIds.delete(leave.userId);
  recipientIds.delete(cancelledByUserId);

  const range = `${formatDateOnly(leave.startDate)} → ${formatDateOnly(leave.endDate)}`;
  const body = `${applicant?.name ?? 'Employee'} cancelled ${leaveTypeLabel(leave.type)} (${range}).`;
  await notifyUsersByIds([...recipientIds], (userId) => ({
    user: { connect: { id: userId } },
    organization: { connect: { id: organizationId } },
    type: 'LEAVE_CANCELLED',
    title: 'Leave request cancelled',
    body: cancelledByName ? `${body} By ${cancelledByName}.` : body,
  }));
}

async function resolveAdminAndManagerRecipients(organizationId, userId) {
  const recipientIds = new Set(await getActiveAdminIdsInOrg(organizationId));
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { reportingManagerId: true },
  });
  if (user?.reportingManagerId) recipientIds.add(user.reportingManagerId);
  recipientIds.delete(userId);
  return [...recipientIds];
}

export async function notifyPermissionAppliedRecipients({
  organizationId,
  applicantId,
  applicantName,
  date,
}) {
  const recipients = await resolveAdminAndManagerRecipients(organizationId, applicantId);
  const body = `${applicantName} submitted a permission request for ${formatDateOnly(date)}.`;
  await notifyUsersByIds(recipients, (userId) => ({
    user: { connect: { id: userId } },
    organization: { connect: { id: organizationId } },
    type: 'PERMISSION_APPLIED',
    title: 'New permission request',
    body,
  }));
}

export async function notifyPermissionDecision({
  organizationId,
  employeeId,
  status,
  actorName,
  date,
}) {
  const isApproved = status === 'APPROVED';
  await createAndEmitNotification({
    user: { connect: { id: employeeId } },
    organization: { connect: { id: organizationId } },
    type: isApproved ? 'PERMISSION_APPROVED' : 'PERMISSION_REJECTED',
    title: isApproved ? 'Permission approved' : 'Permission rejected',
    body: `${actorName} ${isApproved ? 'approved' : 'rejected'} your permission request (${formatDateOnly(date)}).`,
  });
}

export async function notifyCompOffAppliedRecipients({
  organizationId,
  applicantId,
  applicantName,
  workDate,
}) {
  const recipients = await resolveAdminAndManagerRecipients(organizationId, applicantId);
  const body = `${applicantName} submitted a comp-off request for ${formatDateOnly(workDate)}.`;
  await notifyUsersByIds(recipients, (userId) => ({
    user: { connect: { id: userId } },
    organization: { connect: { id: organizationId } },
    type: 'COMP_OFF_APPLIED',
    title: 'New comp-off request',
    body,
  }));
}

export async function notifyCompOffDecision({
  organizationId,
  employeeId,
  status,
  actorName,
  workDate,
}) {
  const isApproved = status === 'APPROVED';
  await createAndEmitNotification({
    user: { connect: { id: employeeId } },
    organization: { connect: { id: organizationId } },
    type: isApproved ? 'COMP_OFF_APPROVED' : 'COMP_OFF_REJECTED',
    title: isApproved ? 'Comp-off approved' : 'Comp-off rejected',
    body: `${actorName} ${isApproved ? 'approved' : 'rejected'} your comp-off request (${formatDateOnly(workDate)}).`,
  });
}

export async function notifyHolidayBroadcast({
  organizationId,
  type,
  title,
  holidayName,
  holidayDate,
}) {
  const userIds = await getActiveUserIdsInOrg(organizationId);
  const body = `${holidayName} on ${formatDateOnly(holidayDate)}.`;
  await notifyUsersByIds(userIds, (userId) => ({
    user: { connect: { id: userId } },
    organization: { connect: { id: organizationId } },
    type,
    title,
    body,
  }));
}

export async function notifyOrgWide({
  organizationId,
  type,
  title,
  body,
}) {
  const userIds = await getActiveUserIdsInOrg(organizationId);
  await notifyUsersByIds(userIds, (userId) => ({
    user: { connect: { id: userId } },
    organization: { connect: { id: organizationId } },
    type,
    title,
    body,
  }));
}

export async function notifyEmployeeProfileEvent({
  organizationId,
  userId,
  type,
  title,
  body,
}) {
  await createAndEmitNotification({
    user: { connect: { id: userId } },
    organization: { connect: { id: organizationId } },
    type,
    title,
    body,
  });
}

/** 
 * Wrappers for leaveService - resolve IDs and call the decision notification 
 */

export async function notifyLeaveStatusUpdate({ leaveId, status, rejectionReason, actorId }) {
  const [leave, actor] = await Promise.all([
    prisma.leave.findUnique({ where: { id: leaveId } }),
    prisma.user.findUnique({ where: { id: actorId }, select: { name: true } })
  ]);
  if (!leave) return;
  await notifyEmployeeLeaveDecision({
    leave,
    employeeId: leave.userId,
    organizationId: leave.organizationId,
    status,
    actorName: actor?.name || 'Manager',
    rejectionReason
  });
}

export async function notifyPermissionStatusUpdate({ requestId, status, actorId }) {
  const [req, actor] = await Promise.all([
    prisma.permissionRequest.findUnique({ where: { id: requestId } }),
    prisma.user.findUnique({ where: { id: actorId }, select: { name: true } })
  ]);
  if (!req) return;
  await notifyPermissionDecision({
    organizationId: req.organizationId,
    employeeId: req.userId,
    status,
    actorName: actor?.name || 'Manager',
    date: req.date
  });
}

export async function notifyCompOffStatusUpdate({ requestId, status, actorId }) {
  const [req, actor] = await Promise.all([
    prisma.compOffWorkLog.findUnique({ where: { id: requestId } }),
    prisma.user.findUnique({ where: { id: actorId }, select: { name: true } })
  ]);
  if (!req) return;
  await notifyCompOffDecision({
    organizationId: req.organizationId,
    employeeId: req.userId,
    status,
    actorName: actor?.name || 'Manager',
    workDate: req.workDate
  });
}

export async function notifyAdmins({
  organizationId,
  type,
  title,
  body,
}) {
  const adminIds = await getActiveAdminIdsInOrg(organizationId);
  await notifyUsersByIds(adminIds, (userId) => ({
    user: { connect: { id: userId } },
    organization: { connect: { id: organizationId } },
    type,
    title,
    body,
  }));
}

export function getRoleLabel(role) {
  return roleLabel(role);
}
