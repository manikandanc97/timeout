export type AiChatMessageRole = 'user' | 'assistant';

export interface AiChatMessage {
  id: string;
  role: AiChatMessageRole;
  content: string;
}
