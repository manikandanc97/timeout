import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getSession, updateSession, resetSession, deleteSession, pushHistory, getSessionCount } from '../src/services/aiConversationStore.js';

describe('aiConversationStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Since sessions is a module-level Map, we need to clear it.
    // We can do this by deleting the session we create.
    deleteSession('test-session');
    deleteSession('session-1');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should create a new session if it does not exist', () => {
    const session = getSession('test-session');
    expect(session).toBeDefined();
    expect(session.phase).toBe('IDLE');
    expect(getSessionCount()).toBe(1);
  });

  it('should return existing session on subsequent calls', () => {
    const s1 = getSession('test-session');
    s1.phase = 'COLLECTING';
    const s2 = getSession('test-session');
    expect(s2.phase).toBe('COLLECTING');
  });

  it('should update session state', () => {
    updateSession('test-session', { phase: 'EXECUTING', intent: 'APPLY_LEAVE' });
    const session = getSession('test-session');
    expect(session.phase).toBe('EXECUTING');
    expect(session.intent).toBe('APPLY_LEAVE');
  });

  it('should reset session to idle state', () => {
    updateSession('test-session', { phase: 'COLLECTING' });
    resetSession('test-session');
    const session = getSession('test-session');
    expect(session.phase).toBe('IDLE');
  });

  it('should delete a session manually', () => {
    getSession('test-session');
    deleteSession('test-session');
    expect(getSessionCount()).toBe(0);
  });

  it('should expire session after 30 minutes of inactivity', () => {
    getSession('test-session');
    expect(getSessionCount()).toBe(1);

    // Fast-forward 31 minutes
    vi.advanceTimersByTime(31 * 60 * 1000);

    expect(getSessionCount()).toBe(0);
  });

  it('should refresh TTL on access', () => {
    getSession('test-session');
    
    // Fast-forward 20 minutes
    vi.advanceTimersByTime(20 * 60 * 1000);
    
    // Access again
    getSession('test-session');
    
    // Fast-forward another 20 minutes
    vi.advanceTimersByTime(20 * 60 * 1000);
    
    // Should still be alive (total 40 mins since start, but only 20 since last access)
    expect(getSessionCount()).toBe(1);

    // Wait another 11 mins
    vi.advanceTimersByTime(11 * 60 * 1000);
    expect(getSessionCount()).toBe(0);
  });

  it('should push history and cap at 12 messages', () => {
    for (let i = 0; i < 15; i++) {
      pushHistory('test-session', i % 2 === 0 ? 'user' : 'assistant', `Msg ${i}`);
    }
    const session = getSession('test-session');
    expect(session.history).toHaveLength(12);
    expect(session.history[0].content).toBe('Msg 3');
    expect(session.history[11].content).toBe('Msg 14');
  });
});
