import { runAssistantV1 } from '../services/assistantOrchestratorService.js';

const isValidMessage = (item) => {
  if (!item || typeof item !== 'object') return false;
  if (!['user', 'assistant'].includes(item.role)) return false;
  return typeof item.content === 'string' && item.content.trim() !== '';
};

export const postAssistantChat = async (req, res) => {
  try {
    const messages = Array.isArray(req.body?.messages) ? req.body.messages : [];
    if (messages.length === 0 || !messages.every(isValidMessage)) {
      return res.status(400).json({
        message: 'Each message must include role ("user" or "assistant") and content',
      });
    }

    const latestUserMessage = [...messages]
      .reverse()
      .find((item) => item.role === 'user')?.content;
    console.log('[assistant-route] /api/ai/chat USER_MESSAGE', String(latestUserMessage ?? ''));

    const result = await runAssistantV1({
      messages,
      userContext: req.user,
      requestContext: {
        authorizationHeader: req.headers.authorization,
        cookieHeader: req.headers.cookie,
      },
    });

    console.log('[assistant-route] RESPONSE_INTENT', result.intent ?? null);
    console.log('[assistant-route] RESPONSE_EXECUTED_ACTIONS', result.executedActions ?? []);

    return res.json({
      reply: String(result.reply ?? ''),
      cards: Array.isArray(result.cards) ? result.cards : [],
      executedActions: Array.isArray(result.executedActions) ? result.executedActions : [],
      intent: result.intent ?? null,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[assistant] error', error);
    return res.status(500).json({ message: String(error?.message ?? 'Server error') });
  }
};
