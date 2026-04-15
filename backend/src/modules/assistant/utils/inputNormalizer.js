const TYPO_MAP = Object.freeze({
  aplly: 'apply',
  appy: 'apply',
  leev: 'leave',
  leavee: 'leave',
  tomorow: 'tomorrow',
  tmrw: 'tomorrow',
  chnge: 'change',
  dat: 'date',
  reasn: 'reason',
  aprove: 'approve',
  rejct: 'reject',
});

const PHRASE_MAP = Object.freeze({
  'make it on': 'change date to',
  'move it to': 'change date to',
  'shift to': 'change date to',
  'reschedule to': 'change date to',
  'reason should be': 'change reason to',
  'make reason': 'change reason to',
  'update reason': 'change reason to',
  'update date': 'change date',
});

export const normalizeInputText = (rawText) => {
  const lower = String(rawText ?? '').toLowerCase();
  const compact = lower.replace(/\s+/g, ' ').trim();
  const cleaned = compact.replace(/[^\w\s:/,-]/g, ' ');
  const correctedWords = cleaned
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => TYPO_MAP[token] ?? token);
  let normalized = correctedWords.join(' ').replace(/\s+/g, ' ').trim();
  for (const [from, to] of Object.entries(PHRASE_MAP)) {
    normalized = normalized.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
  }
  return normalized;
};
