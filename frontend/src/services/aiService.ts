import api from './api';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  phase?: string;
  intent?: string;
  collectedFields?: Record<string, string>;
  missingFields?: string[];
  actionResult?: Record<string, unknown>;
  dataType?: string;
  confirmationMessage?: string;
  suggestions?: string[];
  isLoading?: boolean;
  isError?: boolean;
}

export interface ChatResponse {
  response: string;
  phase: string;
  intent?: string;
  missingFields?: string[];
  collectedFields?: Record<string, string>;
  actionResult?: Record<string, unknown>;
  dataType?: string;
  confirmationMessage?: string;
  suggestions?: string[];
}

export interface AISettings {
  id?: number;
  provider: string;
  model?: string;
  apiKey?: string;
  hasKey?: boolean;
  baseUrl?: string;
  systemPrompt?: string;
  isEnabled: boolean;
}

export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  userRole: string;
  intent: string;
  action: string;
  payload?: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: string;
  createdAt: string;
}

/**
 * Send a chat message to the AI assistant.
 */
export const sendMessage = async (
  message: string,
  sessionId: string,
  otp?: string,
): Promise<ChatResponse> => {
  const response = await api.post('/ai/chat', { message, sessionId, otp });
  return response.data;
};

/**
 * Confirm a pending action.
 */
export const confirmAction = async (sessionId: string): Promise<ChatResponse> => {
  const response = await api.post('/ai/chat', { confirm: true, sessionId });
  return response.data;
};

/**
 * Cancel the current action.
 */
export const cancelAction = async (sessionId: string): Promise<ChatResponse> => {
  const response = await api.post('/ai/chat', { cancel: true, sessionId });
  return response.data;
};

/**
 * Get AI settings (admin-only for full details).
 */
export const getAISettings = async (): Promise<{ settings: AISettings }> => {
  const response = await api.get('/ai/settings');
  return response.data;
};

/**
 * Update AI settings (admin only).
 */
export const updateAISettings = async (settings: Partial<AISettings>) => {
  const response = await api.put('/ai/settings', settings);
  return response.data;
};

/**
 * Test AI configuration with a sample message.
 */
export const testAIConnection = async () => {
  const response = await api.post('/ai/settings/test');
  return response.data;
};

/**
 * Get AI audit logs (admin only).
 */
export const getAIAuditLogs = async (params?: {
  page?: number;
  limit?: number;
  intent?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{ logs: AuditLog[]; total: number; page: number; limit: number }> => {
  const response = await api.get('/ai/audit-logs', { params });
  return response.data;
};

/**
 * Re-index the HR knowledge base (admin only).
 */
export const reindexKnowledgeBase = async (): Promise<{ message: string }> => {
  const response = await api.post('/ai/knowledge/reindex');
  return response.data;
};
