/**
 * AI Conversation Store (In-Memory with TTL)
 * Manages multi-turn conversation state per user session.
 * Sessions expire after 30 minutes of inactivity.
 */

const SESSION_TTL_MS = 30 * 60 * 1000; // 30 minutes

/** @type {Map<string, { state: object, timer: NodeJS.Timeout }>} */
const sessions = new Map();

/**
 * Get or create a conversation session.
 * @param {string} sessionId
 * @returns {object} session state
 */
export const getSession = (sessionId) => {
  const entry = sessions.get(sessionId);
  if (!entry) {
    return createSession(sessionId);
  }
  // Reset TTL on access
  refreshTTL(sessionId, entry);
  return entry.state;
};

/**
 * Update session state (merges with existing).
 * @param {string} sessionId
 * @param {object} updates
 */
export const updateSession = (sessionId, updates) => {
  const entry = sessions.get(sessionId);
  if (!entry) {
    const state = { ...getDefaultState(), ...updates };
    const timer = scheduleExpiry(sessionId);
    sessions.set(sessionId, { state, timer });
    return state;
  }
  Object.assign(entry.state, updates);
  refreshTTL(sessionId, entry);
  return entry.state;
};

/**
 * Reset a session to idle state.
 * @param {string} sessionId
 */
export const resetSession = (sessionId) => {
  const entry = sessions.get(sessionId);
  if (entry) {
    clearTimeout(entry.timer);
    const timer = scheduleExpiry(sessionId);
    entry.state = getDefaultState();
    entry.timer = timer;
  } else {
    createSession(sessionId);
  }
};

/**
 * Delete a session.
 * @param {string} sessionId
 */
export const deleteSession = (sessionId) => {
  const entry = sessions.get(sessionId);
  if (entry) {
    clearTimeout(entry.timer);
    sessions.delete(sessionId);
  }
};

// ─── Internal helpers ────────────────────────────────────────────────────────

const getDefaultState = () => ({
  /** Conversation phase */
  phase: 'IDLE', // IDLE | COLLECTING | AWAITING_CONFIRMATION | EXECUTING
  /** Detected intent/action */
  intent: null,
  /** Fields collected so far */
  collectedFields: {},
  /** Fields still needed */
  missingFields: [],
  /** The full action payload ready to execute */
  pendingAction: null,
  /** History of messages for context (last 10) */
  history: [],
  /** Timestamp of last activity */
  lastActivity: Date.now(),
});

const createSession = (sessionId) => {
  const state = getDefaultState();
  const timer = scheduleExpiry(sessionId);
  sessions.set(sessionId, { state, timer });
  return state;
};

const scheduleExpiry = (sessionId) => {
  return setTimeout(() => {
    sessions.delete(sessionId);
  }, SESSION_TTL_MS);
};

const refreshTTL = (sessionId, entry) => {
  clearTimeout(entry.timer);
  entry.timer = scheduleExpiry(sessionId);
  entry.state.lastActivity = Date.now();
};

/** Push a message to session history (keep last 12) */
export const pushHistory = (sessionId, role, content) => {
  const session = getSession(sessionId);
  session.history.push({ role, content, ts: Date.now() });
  if (session.history.length > 12) {
    session.history = session.history.slice(-12);
  }
};

export const getSessionCount = () => sessions.size;
