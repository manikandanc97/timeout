import api from '@/services/api';
import type {
  AssistantChatResponse,
  AssistantMessage,
} from '../types';

export const postAssistantChat = async (
  messages: AssistantMessage[],
): Promise<AssistantChatResponse> => {
  const latest = [...messages].reverse().find((item) => item.role === 'user')?.content ?? '';
  console.log('[assistant-ui] USER_MESSAGE', latest);
  const response = await api.post('/ai/chat', {
    messages: messages.map((item) => ({
      role: item.role,
      content: item.content,
    })),
  });
  const payload = {
    reply: String(response.data?.reply ?? ''),
    cards: Array.isArray(response.data?.cards) ? response.data.cards : [],
    executedActions: Array.isArray(response.data?.executedActions)
      ? response.data.executedActions
      : [],
    intent: response.data?.intent ?? null,
    timestamp: response.data?.timestamp,
  };
  console.log('[assistant-ui] API_RESPONSE', {
    intent: payload.intent,
    cards: payload.cards.length,
    executedActions: payload.executedActions,
    replyPreview: payload.reply.slice(0, 100),
  });
  return payload;
};
