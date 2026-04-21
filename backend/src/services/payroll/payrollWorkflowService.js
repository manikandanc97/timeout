import prisma from '../../prismaClient.js';
import { logPayrollAudit } from './payrollAuditService.js';
import { logger } from '../loggerService.js';

/**
 * Payroll Workflow Service
 * Manages multi-stage approval workflow.
 * DRAFT -> REVIEWED -> APPROVED -> PAID
 */

export const updatePayrollStatus = async ({
  payrollId,
  organizationId,
  status,
  comment = '',
  actorId,
}) => {
  const payroll = await prisma.payroll.findUnique({
    where: { id: payrollId },
    include: { user: { select: { name: true } } },
  });

  if (!payroll || payroll.organizationId !== organizationId) {
    throw new Error('Payroll record not found');
  }

  // Business Rules for Transitions
  validateTransition(payroll.status, status);

  const updated = await prisma.$transaction(async (tx) => {
    const res = await tx.payroll.update({
      where: { id: payrollId },
      data: {
        status,
        paidDate: status === 'PAID' ? new Date() : undefined,
      },
    });

    await tx.payrollApprovalLog.create({
      data: {
        payrollId,
        organizationId,
        status,
        comment,
        actorId,
      },
    });

    return res;
  });

  // Audit Log
  await logPayrollAudit({
    organizationId,
    actorId,
    entityType: 'PAYROLL',
    entityId: payrollId,
    action: `STATUS_CHANGE_${status}`,
    oldValue: { status: payroll.status },
    newValue: { status: updated.status },
  });

  logger.info(`[PayrollWorkflow] ${payroll.user?.name} payroll moved to ${status} by user ${actorId}`);

  return updated;
};

/**
 * Transition validation logic
 */
const validateTransition = (current, target) => {
  const validTransitions = {
    DRAFT: ['REVIEWED', 'VOID'],
    REVIEWED: ['APPROVED', 'DRAFT', 'VOID'],
    APPROVED: ['PAID', 'REVIEWED', 'VOID'],
    PAID: ['VOID'], // Allow voiding/reversing even if paid (requires audit)
    VOID: ['DRAFT'], // Restart if needed
  };

  if (!validTransitions[current]?.includes(target)) {
    throw new Error(`Invalid transition from ${current} to ${target}`);
  }
};
