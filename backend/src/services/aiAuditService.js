/**
 * AI Audit Service
 * Writes immutable audit log entries for every AI-performed action.
 */

import prisma from '../prismaClient.js';

/**
 * Log an AI action to the audit trail.
 * @param {object} params
 * @param {number} params.organizationId
 * @param {number} params.userId
 * @param {string} params.userName
 * @param {string} params.userRole
 * @param {string} params.intent - The AI intent (e.g. APPLY_LEAVE)
 * @param {string} params.action - Human-readable action description
 * @param {object} [params.payload] - Input data used for the action
 * @param {object} [params.result] - Result/response data
 * @param {'SUCCESS'|'FAILED'|'REJECTED'|'CANCELLED'} [params.status]
 */
export const logAIAction = async ({
  organizationId,
  userId,
  userName,
  userRole,
  intent,
  action,
  payload = null,
  result = null,
  status = 'SUCCESS',
}) => {
  try {
    await prisma.aiAuditLog.create({
      data: {
        organizationId,
        userId,
        userName,
        userRole,
        intent,
        action,
        payload: payload ? JSON.parse(JSON.stringify(payload)) : null,
        result: result ? JSON.parse(JSON.stringify(result)) : null,
        status,
      },
    });
  } catch (err) {
    // Audit logging must never break the main flow
    console.error('[AiAudit] Failed to write audit log:', err.message);
  }
};

/**
 * Get audit logs for an organization (admin only).
 * @param {number} organizationId
 * @param {object} [filters]
 * @param {number} [filters.page]
 * @param {number} [filters.limit]
 * @param {string} [filters.intent]
 * @param {string} [filters.status]
 * @param {string} [filters.startDate]
 * @param {string} [filters.endDate]
 */
export const getAuditLogs = async (organizationId, filters = {}) => {
  const {
    page = 1,
    limit = 20,
    intent,
    status,
    startDate,
    endDate,
  } = filters;

  const skip = (Number(page) - 1) * Number(limit);

  const where = {
    organizationId,
    ...(intent ? { intent } : {}),
    ...(status ? { status } : {}),
    ...(startDate || endDate
      ? {
          createdAt: {
            ...(startDate ? { gte: new Date(startDate) } : {}),
            ...(endDate ? { lte: new Date(endDate + 'T23:59:59') } : {}),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.aiAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit),
    }),
    prisma.aiAuditLog.count({ where }),
  ]);

  return { logs, total, page: Number(page), limit: Number(limit) };
};
