import {
  applyLeaveAction,
  approveLeaveAction,
  rejectLeaveAction,
} from '../handlers/leaveActionHandlers.js';
import { AssistantCardTypes } from '../types/assistantTypes.js';
import { isAdminLikeRole } from '../utils/roleAccess.js';
import { normalizeInputText } from '../utils/inputNormalizer.js';
import { parseNaturalDate } from '../utils/dateParser.js';

const sessionStore = new Map();

const YES_PATTERN = /\b(yes|confirm|submit|proceed|ok)\b/i;
const NO_PATTERN = /\b(no|cancel|stop)\b/i;

export const hasActiveWorkflowSession = (userId) => sessionStore.has(userId);

const toLocalIso = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const normalizeDateToIso = (value) => {
  const text = String(value ?? '').trim();
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const dmy = text.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return null;
};

const parseDateRange = (message) => {
  const text = String(message);
  const matches = text.match(/\b(\d{4}-\d{2}-\d{2}|\d{2}-\d{2}-\d{4})\b/g) ?? [];
  if (matches.length >= 2) {
    const first = normalizeDateToIso(matches[0]);
    const second = normalizeDateToIso(matches[1]);
    if (first && second) return { startDate: first, endDate: second };
  }
  if (matches.length === 1) {
    const day = normalizeDateToIso(matches[0]);
    if (day) return { startDate: day, endDate: day };
  }
  if (/\btomorrow\b/i.test(text)) {
    const date = new Date();
    date.setDate(date.getDate() + 1);
    const iso = toLocalIso(date);
    if (!iso) return null;
    return { startDate: iso, endDate: iso };
  }
  if (/\btoday\b/i.test(text)) {
    const iso = toLocalIso(new Date());
    if (!iso) return null;
    return { startDate: iso, endDate: iso };
  }
  const natural = parseNaturalDate(text);
  if (natural) {
    return { startDate: natural, endDate: natural };
  }
  const dateFieldTail = text.match(/\bdate\s*[:=-]?\s*(.+)$/i);
  if (dateFieldTail?.[1]) {
    const tailDate = parseNaturalDate(dateFieldTail[1]);
    if (tailDate) {
      return { startDate: tailDate, endDate: tailDate };
    }
  }
  return null;
};

const parseLeaveType = (message) => {
  const upper = String(message).toUpperCase();
  if (/\bSICK\b|\bSICK LEAVE\b/i.test(message)) return 'SICK';
  if (/\bANNUAL\b|\bCASUAL\b|\bANNUAL LEAVE\b/i.test(message)) return 'ANNUAL';
  if (/\bCOMP[\s-]?OFF\b|\bCOMPOFF\b/i.test(upper)) return 'COMP_OFF';
  if (/\bMATERNITY\b/i.test(message)) return 'MATERNITY';
  if (/\bPATERNITY\b/i.test(message)) return 'PATERNITY';
  return null;
};

const parseRequestId = (message) => {
  const explicit = String(message).match(/\b(?:id|request)\s*#?\s*(\d+)\b/i);
  if (explicit) return Number(explicit[1]);
  const approveMatch = String(message).match(/\b(?:approve|reject)\b[^\d]{0,40}(\d{2,})\b/i);
  if (approveMatch) return Number(approveMatch[1]);
  const lone = String(message).match(/^\s*(\d{1,})\s*$/);
  if (lone) return Number(lone[1]);
  return null;
};

const extractReason = (message) => {
  const text = normalizeInputText(message);
  const match =
    text.match(/\bchange(?:\s+the)?\s+reason\s+to\s+(.+)$/i) ??
    text.match(/\b(?:change|update|make)\s+reason(?:\s+to)?\s+(.+)$/i) ??
    text.match(/\breason\s*(?:is|:|to)?\s*(.+)$/i) ??
    text.match(/\b(?:because|due to)\s+(.+)$/i);
  if (match?.[1]) return match[1].trim();

  const csvParts = text
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  if (csvParts.length >= 3) return csvParts[csvParts.length - 1];
  return null;
};

const mergePayload = (base, updates) => ({ ...(base ?? {}), ...(updates ?? {}) });

const detectFollowUpUpdateType = (message) => {
  const text = normalizeInputText(message);
  if (/\b(cancel|stop)\b/.test(text)) return 'CANCEL';
  if (/\b(confirm|submit|yes|ok|proceed)\b/.test(text)) return 'CONFIRM_SUBMIT';
  if (/(change|update|make).*(date)|\b(change date|reschedule|move|shift)\b/.test(text)) return 'UPDATE_DATE';
  if (/(change|update|make).*(reason)|reason should be/.test(text)) return 'UPDATE_REASON';
  if (/(change|update|make).*(leave|type)|\b(sick|annual|casual|comp off|maternity|paternity)\b/.test(text)) return 'UPDATE_LEAVE_TYPE';
  return 'GENERAL';
};

const extractApplyLeaveUpdates = (message, currentPayload) => {
  const normalizedText = normalizeInputText(message);
  const updateType = detectFollowUpUpdateType(normalizedText);
  const updates = {};
  const leaveType = parseLeaveType(normalizedText);
  if (leaveType) updates.type = leaveType;

  const dates = parseDateRange(normalizedText);
  if (dates) {
    updates.startDate = dates.startDate;
    updates.endDate = dates.endDate;
  }
  if (!dates && /\bdate\b/i.test(normalizedText)) {
    const explicitDate = normalizedText.match(/\bdate\s*[:=-]?\s*(.+)$/i)?.[1];
    const parsed = parseNaturalDate(explicitDate ?? '');
    if (parsed) {
      updates.startDate = parsed;
      updates.endDate = parsed;
    }
  }

  const reason = extractReason(normalizedText);
  if (reason) updates.reason = reason;

  if (
    !updates.reason &&
    !currentPayload?.reason &&
    /\b(trip|vacation|medical|fever|personal|wedding|family)\b/i.test(normalizedText)
  ) {
    updates.reason = normalizedText.trim();
  }

  console.log('[assistant-workflow] NORMALIZED_TEXT', normalizedText);
  console.log('[assistant-workflow] DETECTED_UPDATE', updateType);
  console.log('[assistant-workflow] PARSED_DATE', dates ?? null);
  console.log('[assistant-workflow] EXTRACTED_UPDATES', updates);
  return updates;
};

const extractApproveRejectUpdates = (action, message) => {
  const normalizedText = normalizeInputText(message);
  const updateType = detectFollowUpUpdateType(normalizedText);
  const updates = {};
  const requestId = parseRequestId(normalizedText);
  if (requestId) updates.requestId = requestId;
  if (action === 'reject_leave') {
    const reason = extractReason(normalizedText);
    if (reason) updates.rejectionReason = reason;
  }
  if (/\bapprove\s+\w+\s+leave\b/i.test(normalizedText) && !requestId) {
    updates.employeeName = normalizedText.replace(/\bapprove\s+/, '').replace(/\s+leave\b/, '').trim();
  }
  console.log('[assistant-workflow] NORMALIZED_TEXT', normalizedText);
  console.log('[assistant-workflow] DETECTED_UPDATE', updateType);
  console.log('[assistant-workflow] EXTRACTED_UPDATES', updates);
  return updates;
};

const updateActionPayload = (action, currentPayload, message) => {
  if (action === 'apply_leave') {
    return mergePayload(currentPayload, extractApplyLeaveUpdates(message, currentPayload));
  }
  if (action === 'approve_leave' || action === 'reject_leave') {
    return mergePayload(currentPayload, extractApproveRejectUpdates(action, message));
  }
  return { ...(currentPayload ?? {}) };
};

const getMissingFields = (action, payload) => {
  if (action === 'apply_leave') {
    return ['type', 'startDate', 'endDate', 'reason'].filter((field) => !payload?.[field]);
  }
  if (action === 'approve_leave') return payload?.requestId ? [] : ['requestId'];
  if (action === 'reject_leave') {
    return ['requestId', 'rejectionReason'].filter((field) => !payload?.[field]);
  }
  return [];
};

const getActionPrompt = (action, missingFields, payload) => {
  if (action === 'apply_leave' && missingFields.length > 0) {
    return `Please provide: ${missingFields.join(', ')}.`;
  }
  if (action === 'approve_leave' && missingFields.length > 0) {
    if (payload?.employeeName) {
      return `I understood you want to approve ${payload.employeeName}'s leave. Please provide the leave request id to approve.`;
    }
    return 'Please provide the leave request id to approve.';
  }
  if (action === 'reject_leave' && missingFields.length > 0) {
    return 'Please provide the leave request id and rejection reason.';
  }
  return 'Please provide required details.';
};

const renderConfirmationText = (action, payload) => {
  if (action === 'apply_leave') {
    return `Please confirm:\n${payload.type} leave from ${payload.startDate} to ${payload.endDate}\nReason: ${payload.reason}\n\nShall I submit?`;
  }
  if (action === 'approve_leave') {
    return `Please confirm approving leave request #${payload.requestId}. Shall I proceed?`;
  }
  return `Please confirm rejecting leave request #${payload.requestId}.\nReason: ${payload.rejectionReason}\n\nShall I proceed?`;
};

export async function runActionWorkflow({
  userId,
  role,
  actionIntent,
  message,
  requestContext,
}) {
  if ((actionIntent === 'approve_leave' || actionIntent === 'reject_leave') && !isAdminLikeRole(role)) {
    return {
      reply: 'You are not authorized for leave approvals. Please contact your manager or admin.',
      cards: [],
      executedActions: [],
    };
  }

  const current = sessionStore.get(userId);
  if (current?.action && actionIntent && current.action !== actionIntent) {
    sessionStore.delete(userId);
  }

  const nextCurrent = sessionStore.get(userId);
  const action = nextCurrent?.action ?? actionIntent;
  if (!action) {
    return {
      reply: 'Please tell me what action you want to perform (apply, approve, or reject leave).',
      cards: [],
      executedActions: [],
    };
  }
  const payload = updateActionPayload(action, nextCurrent?.payload, message);
  console.log('[assistant-workflow] UPDATED_STATE', {
    userId,
    action,
    previousPayload: nextCurrent?.payload ?? null,
    payload,
    awaitingConfirmation: nextCurrent?.awaitingConfirmation === true,
  });
  const awaitingConfirmation = nextCurrent?.awaitingConfirmation === true;

  if (NO_PATTERN.test(message)) {
    sessionStore.delete(userId);
    return { reply: 'Action cancelled.', cards: [], executedActions: [] };
  }

  if (awaitingConfirmation && YES_PATTERN.test(message)) {
    try {
      let result = null;
      if (action === 'apply_leave') result = await applyLeaveAction(payload, requestContext);
      if (action === 'approve_leave') result = await approveLeaveAction(payload, requestContext);
      if (action === 'reject_leave') result = await rejectLeaveAction(payload, requestContext);
      sessionStore.delete(userId);
      return {
        reply: result?.message ?? 'Action completed successfully.',
        cards: [{ type: AssistantCardTypes.APPROVAL, data: { action, result } }],
        executedActions: [action],
      };
    } catch (error) {
      sessionStore.set(userId, { action, payload, awaitingConfirmation: true });
      return {
        reply: String(error?.message ?? 'Action failed. Please review the details and try again.'),
        cards: [],
        executedActions: [],
      };
    }
  }

  const missingFields = getMissingFields(action, payload);
  if (missingFields.length > 0) {
    sessionStore.set(userId, { action, payload, awaitingConfirmation: false });
    return {
      reply: getActionPrompt(action, missingFields, payload),
      cards: [],
      executedActions: [],
    };
  }

  sessionStore.set(userId, { action, payload, awaitingConfirmation: true });
  return {
    reply: renderConfirmationText(action, payload),
    cards: [{ type: AssistantCardTypes.CONFIRMATION, data: { action, payload } }],
    executedActions: [],
  };
}
