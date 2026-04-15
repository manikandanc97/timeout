export type AssistantIntentType = 'QUERY' | 'ACTION';

export interface AssistantIntent {
  type: AssistantIntentType;
  intent: string;
}

export type AssistantCardType =
  | 'leave_balance_card'
  | 'holiday_card'
  | 'payslip_card'
  | 'request_status_card'
  | 'policy_card'
  | 'confirmation_card'
  | 'approval_card';

export interface AssistantCard {
  type: AssistantCardType;
  data: Record<string, unknown> | unknown[] | null;
}

export type AssistantMessageRole = 'user' | 'assistant';

export interface AssistantMessage {
  id: string;
  role: AssistantMessageRole;
  content: string;
  cards?: AssistantCard[];
}

export interface AssistantChatResponse {
  reply: string;
  cards: AssistantCard[];
  executedActions: string[];
  intent?: AssistantIntent | null;
  timestamp?: string;
}
