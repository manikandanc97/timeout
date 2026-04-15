import { detectIntent } from './intentService.js';
import { retrieveContext } from './retrieverService.js';
import { buildPrompt } from './promptBuilderService.js';
import { hasActiveWorkflowSession, runActionWorkflow } from './workflowEngineService.js';
import { buildQueryResponse } from './queryResponseService.js';
import { AssistantIntentType } from '../types/assistantTypes.js';

const assistantDebugEnabled = process.env.ASSISTANT_DEBUG !== 'false';
const debugLog = (...args) => {
  if (!assistantDebugEnabled) return;
  console.log('[assistant-debug]', ...args);
};

export async function runAssistantV1({ messages, userContext, requestContext }) {
  const latestUserMessage = [...messages]
    .reverse()
    .find((item) => item.role === 'user')?.content;

  const userMessage = String(latestUserMessage ?? '').trim();
  debugLog('USER_MESSAGE', userMessage);
  debugLog('USER_CONTEXT', {
    id: userContext?.id,
    role: userContext?.role,
    organizationId: userContext?.organizationId,
  });

  if (hasActiveWorkflowSession(userContext.id)) {
    debugLog('ROUTE', 'workflow_follow_up');
    const actionResult = await runActionWorkflow({
      userId: userContext.id,
      role: userContext.role,
      actionIntent: null,
      message: userMessage,
      requestContext,
    });
    return {
      ...actionResult,
      intent: { type: AssistantIntentType.ACTION, intent: 'workflow_follow_up' },
    };
  }

  const intent = detectIntent(userMessage);
  debugLog('DETECTED_INTENT', intent);

  if (!intent) {
    const fallback = {
      reply:
        'I can help with leave balance, holidays, payslips, leave request status, leave policy, and leave workflows.',
      cards: [],
      executedActions: [],
      intent: null,
    };
    debugLog('FINAL_RESPONSE', fallback);
    return fallback;
  }

  if (intent.type === AssistantIntentType.ACTION) {
    debugLog('ROUTE', 'action_workflow');
    const actionResult = await runActionWorkflow({
      userId: userContext.id,
      role: userContext.role,
      actionIntent: intent.intent,
      message: userMessage,
      requestContext,
    });
    const output = { ...actionResult, intent };
    debugLog('FINAL_RESPONSE', output);
    return output;
  }

  debugLog('ROUTE', `rag_query:${intent.intent}`);
  const context = await retrieveContext(
    intent.intent,
    userContext.id,
    userContext.role,
    userContext.organizationId,
  );
  debugLog('RETRIEVED_CONTEXT', { kind: context?.kind, intent: intent.intent });
  if (context?.kind === 'error') {
    const output = {
      reply: String(context.message ?? 'Unable to load HR context.'),
      cards: [],
      executedActions: [],
      intent,
    };
    debugLog('FINAL_RESPONSE', output);
    return output;
  }
  buildPrompt(context, userMessage);
  const response = buildQueryResponse(context);

  const output = {
    ...response,
    executedActions: [],
    intent,
  };
  debugLog('FINAL_RESPONSE', {
    intent,
    replyPreview: String(output.reply ?? '').slice(0, 120),
    cardsCount: Array.isArray(output.cards) ? output.cards.length : 0,
  });
  return output;
}
