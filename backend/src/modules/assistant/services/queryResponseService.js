import { AssistantCardTypes } from '../types/assistantTypes.js';

export function buildQueryResponse(context) {
  if (context.kind === 'error') {
    return {
      reply: String(context.message ?? 'Something went wrong loading HR data.'),
      cards: [],
    };
  }

  if (context.kind === 'leave_balance') {
    if (!context.leaveBalance) {
      return { reply: 'Leave balance data is not available yet.', cards: [] };
    }
    return {
      reply: 'Here is your leave balance.',
      cards: [{ type: AssistantCardTypes.LEAVE_BALANCE, data: context.leaveBalance }],
    };
  }

  if (context.kind === 'greeting') {
    return {
      reply:
        'Hi! I can help with leave balance, holidays, payslips, leave request status, and leave workflows like apply/approve/reject leave.',
      cards: [],
    };
  }

  if (context.kind === 'latest_payslip') {
    if (!context.payslip) return { reply: 'No paid payslip found.', cards: [] };
    return {
      reply: 'Here is the latest available payslip.',
      cards: [{ type: AssistantCardTypes.PAYSLIP, data: context.payslip }],
    };
  }

  if (context.kind === 'holiday_list') {
    if (!Array.isArray(context.holidays) || context.holidays.length === 0) {
      return { reply: 'No upcoming holidays found in the next 60 days.', cards: [] };
    }
    return {
      reply: 'Upcoming holidays are listed below.',
      cards: [{ type: AssistantCardTypes.HOLIDAY_LIST, data: context.holidays }],
    };
  }

  if (context.kind === 'leave_request_status') {
    if (!Array.isArray(context.requests) || context.requests.length === 0) {
      return { reply: 'No leave requests were found.', cards: [] };
    }
    return {
      reply: 'Here are the recent leave requests.',
      cards: [{ type: AssistantCardTypes.REQUEST_STATUS, data: context.requests }],
    };
  }

  if (context.kind === 'hr_policy') {
    const policyRows = Array.isArray(context.policyRows) ? context.policyRows : [];
    const hasDocs = policyRows.length > 0;
    const hasOrgJson = context.leavePolicy != null;
    if (!hasDocs && !hasOrgJson) {
      return {
        reply:
          'No HR policy documents are configured yet. Admins can publish policies under Organization settings.',
        cards: [],
      };
    }
    return {
      reply: hasDocs
        ? 'Here are the latest published HR policy documents (scoped to your organization).'
        : 'Here is the organization leave policy document available for your account.',
      cards: [
        {
          type: AssistantCardTypes.POLICY,
          data: {
            leavePolicy: context.leavePolicy,
            documents: policyRows.map((row) => ({
              id: row.id,
              title: row.title,
              category: row.category,
              excerpt: String(row.content ?? '').slice(0, 600),
            })),
            audience: context.audience ?? 'employee',
          },
        },
      ],
    };
  }

  return {
    reply:
      'I can help with leave balance, holidays, payslips, leave request status, leave policy, and leave workflows.',
    cards: [],
  };
}
