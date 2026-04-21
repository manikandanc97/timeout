import prisma from '../../prismaClient.js';
import { logger } from '../loggerService.js';

/**
 * Payroll Audit Service
 * Tracks changes to sensitive payroll data with before/after state.
 */

export const logPayrollAudit = async ({
  organizationId,
  actorId,
  entityType,
  entityId,
  action,
  oldValue = null,
  newValue = null,
}) => {
  try {
    await prisma.auditLog.create({
      data: {
        organizationId,
        actorId,
        entityType,
        entityId,
        action,
        oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
        newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
      },
    });
  } catch (err) {
    logger.error(`[AuditLog] Failed to log ${action} on ${entityType}:${entityId}`, err);
  }
};

/**
 * Specifically log salary structure changes
 */
export const logSalaryChange = async (oldStructure, newStructure, actorId) => {
  await logPayrollAudit({
    organizationId: newStructure.organizationId,
    actorId,
    entityType: 'SALARY_STRUCTURE',
    entityId: newStructure.id,
    action: 'UPDATE',
    oldValue: oldStructure,
    newValue: newStructure,
  });
};
