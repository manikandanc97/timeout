export const createMessageId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const normalizeAssistantContent = (raw: string) =>
  raw
    .replace(/\r\n/g, '\n')
    .replace(/\\n/g, '\n')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
