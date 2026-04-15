import { AssistantIntentType } from '../types/assistantTypes.js';
import { normalizeInputText } from '../utils/inputNormalizer.js';

const ACTION_PATTERNS = [
  { intent: 'apply_leave', pattern: /\b(apply|request)\b.*\bleave\b|\bleave apply\b/i },
  { intent: 'approve_leave', pattern: /\bapprove\b.*\bleave\b|\bleave\b.*\bapprove\b/i },
  { intent: 'reject_leave', pattern: /\breject\b.*\bleave\b|\bleave\b.*\breject\b/i },
];

const QUERY_PATTERNS = [
  {
    intent: 'leave_balance',
    pattern:
      /\bleave balance\b|\bmy leave balance\b|\bhow many leaves?\b|\bhow much leave\b|\bleaves?\s+(left|remaining|available)\b|\bsick leave remaining\b|\bleave(s)?\s+do i have\b/i,
  },
  { intent: 'holiday_list', pattern: /\bholiday\b|\bupcoming holidays?\b/i },
  { intent: 'latest_payslip', pattern: /\bpayslip\b|\bsalary slip\b/i },
  { intent: 'leave_request_status', pattern: /\brequest status\b|\bleave status\b|\bstatus of\b/i },
  { intent: 'hr_policy', pattern: /\bpolicy\b|\bleave policy\b|\bhr policy\b/i },
];

const GREETING_PATTERN = /^(hi|hello|hey|yo|hola|good morning|good evening|good afternoon)\b/i;

export const detectIntent = (userMessage) => {
  const text = normalizeInputText(userMessage);
  if (GREETING_PATTERN.test(text)) {
    return { type: AssistantIntentType.QUERY, intent: 'greeting' };
  }
  for (const item of ACTION_PATTERNS) {
    if (item.pattern.test(text)) {
      return { type: AssistantIntentType.ACTION, intent: item.intent };
    }
  }
  for (const item of QUERY_PATTERNS) {
    if (item.pattern.test(text)) {
      return { type: AssistantIntentType.QUERY, intent: item.intent };
    }
  }
  return null;
};
