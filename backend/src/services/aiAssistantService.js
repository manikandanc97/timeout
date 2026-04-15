import { runAssistantV1 } from '../modules/assistant/services/assistantOrchestratorService.js';

export async function runAiAssistantChat({ messages, requestContext, userContext }) {
  return runAssistantV1({ messages, requestContext, userContext });
}

