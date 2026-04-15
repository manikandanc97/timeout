export const buildPrompt = (context, userMessage) => {
  const safeContext = JSON.stringify(context ?? {}, null, 2);
  return [
    'You are a professional HR assistant.',
    'Use only the provided context.',
    'Do not guess or hallucinate values.',
    'If context is missing, explicitly say data is unavailable.',
    '',
    `User message: ${String(userMessage ?? '')}`,
    `Context: ${safeContext}`,
  ].join('\n');
};
