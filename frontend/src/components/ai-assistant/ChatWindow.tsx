'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { MessageBubble, messageBubbleStyles } from './MessageBubble';
import { SuggestionChips } from './SuggestionChips';
import type { ChatMessage } from '@/services/aiService';

interface ChatWindowProps {
  messages: ChatMessage[];
  isLoading: boolean;
  phase: string;
  onSend: (message: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onClear: () => void;
  onSuggestion: (s: string) => void;
  onClose: () => void;
  userRole?: string;
}

const WELCOME_SUGGESTIONS: Record<string, string[]> = {
  ADMIN: ['Leave Balance', 'Pending Requests', 'Add Employee', 'Holiday List'],
  MANAGER: ['Pending Requests', 'Team Summary', 'Apply Leave', 'Leave Policy'],
  EMPLOYEE: ['Apply Leave', 'Leave Balance', 'Holiday List', 'Leave Policy'],
};

export function ChatWindow({
  messages,
  isLoading,
  phase,
  onSend,
  onConfirm,
  onCancel,
  onClear,
  onSuggestion,
  onClose,
  userRole = 'EMPLOYEE',
}: ChatWindowProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    onSend(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const isAwaitingConfirmation = phase === 'AWAITING_CONFIRMATION';
  const lastMessage = messages[messages.length - 1];
  const showSuggestions =
    !isLoading &&
    phase === 'IDLE' &&
    lastMessage?.suggestions &&
    lastMessage.suggestions.length > 0;

  const initSuggestions = WELCOME_SUGGESTIONS[userRole] || WELCOME_SUGGESTIONS.EMPLOYEE;

  return (
    <>
      <style>{messageBubbleStyles}</style>
      <style>{chatWindowStyles}</style>

      <div className="chat-window">
        {/* Header */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-ai-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 9a5 5 0 0 0-5 5v3a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-3a5 5 0 0 0-5-5H9m3 2a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 1-1z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="chat-ai-name">HR Assistant</div>
              <div className="chat-ai-status">
                <span className="status-dot" />
                <span>
                  {isLoading ? 'Thinking...' : phase === 'COLLECTING' ? 'Collecting details' : 'Online'}
                </span>
              </div>
            </div>
          </div>

          <div className="chat-header-actions">
            <button
              onClick={onClear}
              className="chat-header-btn"
              title="New conversation"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="chat-header-btn chat-header-btn-close"
              title="Close"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="chat-messages scroll-area-hrm">
          {/* Welcome state */}
          {messages.length === 0 && (
            <div className="chat-welcome">
              <div className="welcome-avatar">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z" fill="currentColor" />
                </svg>
              </div>
              <h3 className="welcome-title">Hi! I&apos;m your HR Assistant 👋</h3>
              <p className="welcome-subtitle">
                I can help you apply for leaves, check balances, answer HR policy questions, and more.
              </p>
              <div className="welcome-chips">
                {initSuggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => onSuggestion(s)}
                    className="welcome-chip"
                    disabled={isLoading}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onConfirm={onConfirm}
              onCancel={onCancel}
              disabled={isLoading}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion chips */}
        {showSuggestions && lastMessage?.suggestions && (
          <SuggestionChips
            suggestions={lastMessage.suggestions}
            onSelect={onSuggestion}
            disabled={isLoading}
          />
        )}

        {/* Input area */}
        <div className="chat-input-area">
          {isAwaitingConfirmation && (
            <div className="confirmation-banner">
              <span>⏳ Waiting for your confirmation above</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="chat-input-form">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isLoading
                  ? 'Waiting for response...'
                  : phase === 'COLLECTING'
                    ? 'Type your answer...'
                    : 'Ask me anything about HR...'
              }
              disabled={isLoading}
              className="chat-input"
              autoComplete="off"
              id="ai-chat-input"
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="chat-send-btn"
              aria-label="Send message"
            >
              {isLoading ? (
                <span className="send-spinner" />
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" fill="currentColor" />
                </svg>
              )}
            </button>
          </form>
          <p className="chat-footer-note">AI can make mistakes. Verify important info.</p>
        </div>
      </div>
    </>
  );
}

const chatWindowStyles = `
  .chat-window {
    display: flex;
    flex-direction: column;
    width: 380px;
    height: 600px;
    max-width: calc(100vw - 40px);
    max-height: calc(100dvh - 120px);
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 22px;
    overflow: hidden;
    box-shadow:
      0 25px 50px -12px rgba(0,0,0,0.18),
      0 0 0 1px rgba(255,255,255,0.05);
    animation: chatWindowIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }

  @media (max-width: 480px) {
    .chat-window {
      width: calc(100vw - 24px);
      height: calc(100dvh - 100px);
      border-radius: 18px;
    }
  }
  @keyframes chatWindowIn {
    from { opacity: 0; transform: scale(0.85) translateY(20px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  /* Header */
  .chat-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    color: white;
    flex-shrink: 0;
  }
  .chat-header-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .chat-ai-avatar {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid rgba(255,255,255,0.3);
  }
  .chat-ai-name {
    font-weight: 700;
    font-size: 14px;
    color: white;
    line-height: 1.2;
  }
  .chat-ai-status {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11px;
    color: rgba(255,255,255,0.75);
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #4ade80;
    box-shadow: 0 0 6px #4ade80;
    animation: pulse 2s infinite;
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .chat-header-actions {
    display: flex;
    gap: 6px;
  }
  .chat-header-btn {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: none;
    background: rgba(255,255,255,0.15);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .chat-header-btn:hover {
    background: rgba(255,255,255,0.28);
  }
  .chat-header-btn-close:hover {
    background: rgba(239,68,68,0.5);
  }
  /* Messages */
  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
  }
  /* Welcome */
  .chat-welcome {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 20px 12px;
    gap: 10px;
    flex: 1;
    justify-content: center;
  }
  .welcome-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(8,131,149,0.3);
  }
  .welcome-title {
    font-size: 16px;
    font-weight: 700;
    color: var(--foreground);
    margin: 0;
  }
  .welcome-subtitle {
    font-size: 13px;
    color: var(--muted-foreground);
    line-height: 1.5;
    max-width: 280px;
    margin: 0;
  }
  .welcome-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    justify-content: center;
    margin-top: 8px;
  }
  .welcome-chip {
    padding: 7px 14px;
    border-radius: 20px;
    border: 1px solid var(--border);
    background: var(--muted);
    color: var(--foreground);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s ease;
  }
  .welcome-chip:hover:not(:disabled) {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(8,131,149,0.25);
  }
  .welcome-chip:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  /* Input area */
  .chat-input-area {
    border-top: 1px solid var(--border);
    background: var(--card);
    flex-shrink: 0;
  }
  .confirmation-banner {
    padding: 8px 14px;
    background: var(--warning-muted);
    color: var(--warning-muted-foreground);
    font-size: 12px;
    font-weight: 500;
    text-align: center;
  }
  .chat-input-form {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
  }
  .chat-input {
    flex: 1;
    padding: 10px 14px;
    border-radius: 22px;
    border: 1.5px solid var(--border);
    background: var(--muted);
    color: var(--foreground);
    font-size: 13.5px;
    outline: none;
    transition: border-color 0.18s, box-shadow 0.18s;
  }
  .chat-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(8,131,149,0.12);
  }
  .chat-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .chat-input::placeholder { color: var(--muted-foreground); }
  .chat-send-btn {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.18s ease;
    box-shadow: 0 3px 10px rgba(8,131,149,0.3);
  }
  .chat-send-btn:hover:not(:disabled) {
    transform: scale(1.08);
    box-shadow: 0 5px 16px rgba(8,131,149,0.4);
  }
  .chat-send-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
  }
  .send-spinner {
    width: 15px;
    height: 15px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .chat-footer-note {
    font-size: 10px;
    color: var(--muted-foreground);
    text-align: center;
    padding: 0 12px 8px;
    opacity: 0.7;
  }
`;
