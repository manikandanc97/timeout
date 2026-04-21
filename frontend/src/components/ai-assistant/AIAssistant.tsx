'use client';

import { useState } from 'react';
import { ChatWindow } from './ChatWindow';
import { useAIChat } from '@/hooks/useAIChat';

interface AIAssistantProps {
  userRole?: string;
}

export function AIAssistant({ userRole = 'EMPLOYEE' }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  const {
    messages,
    isLoading,
    phase,
    send,
    confirm,
    cancel,
    clearChat,
    sendSuggestion,
  } = useAIChat(userRole);

  const handleOpen = () => {
    setIsOpen(true);
    setHasUnread(false);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSend = (message: string) => {
    send(message);
  };

  return (
    <>
      <style>{fabStyles}</style>

      {/* Floating Action Button */}
      <div className="ai-fab-container" aria-label="AI HR Assistant">
        {/* Chat window */}
        {isOpen && (
          <div className="ai-chat-popup">
            <ChatWindow
              messages={messages}
              isLoading={isLoading}
              phase={phase}
              onSend={handleSend}
              onConfirm={confirm}
              onCancel={cancel}
              onClear={clearChat}
              onSuggestion={sendSuggestion}
              onClose={handleClose}
              userRole={userRole}
            />
          </div>
        )}

        {/* FAB button */}
        <button
          onClick={isOpen ? handleClose : handleOpen}
          className={`ai-fab ${isOpen ? 'ai-fab-open' : ''}`}
          aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
          id="ai-assistant-fab"
          title="AI HR Assistant"
        >
          {/* Unread indicator */}
          {hasUnread && !isOpen && <span className="ai-fab-unread" />}

          {/* Icon — toggles between AI and X */}
          <span className={`ai-fab-icon ${isOpen ? 'ai-fab-icon-hidden' : 'ai-fab-icon-visible'}`}>
            {/* AI bot icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 9a5 5 0 0 0-5 5v3a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-3a5 5 0 0 0-5-5H9m3 2a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 1-1z" fill="currentColor" />
            </svg>
          </span>
          <span className={`ai-fab-icon ${isOpen ? 'ai-fab-icon-visible' : 'ai-fab-icon-hidden'}`}>
            {/* Close icon */}
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor" />
            </svg>
          </span>

          {/* Animated ring when not open */}
          {!isOpen && <span className="ai-fab-ring" />}
        </button>

        {/* Tooltip label */}
        {!isOpen && (
          <div className="ai-fab-tooltip">HR Assistant</div>
        )}
      </div>
    </>
  );
}

const fabStyles = `
  .ai-fab-container {
    position: fixed;
    bottom: 28px;
    right: 28px;
    z-index: 9999;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 16px;
  }
  @media (max-width: 480px) {
    .ai-fab-container {
      bottom: 20px;
      right: 20px;
    }
    .ai-fab {
      width: 50px !important;
      height: 50px !important;
    }
  }
  .ai-chat-popup {
    position: absolute;
    bottom: calc(100% + 16px);
    right: 0;
    z-index: 9998;
  }
  .ai-fab {
    position: relative;
    width: 58px;
    height: 58px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #09637e, #088395);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow:
      0 8px 25px rgba(8,131,149,0.45),
      0 3px 10px rgba(0,0,0,0.2);
    transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
    overflow: visible;
    flex-shrink: 0;
  }
  .ai-fab:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow:
      0 12px 30px rgba(8,131,149,0.55),
      0 5px 15px rgba(0,0,0,0.25);
  }
  .ai-fab:active {
    transform: scale(0.96);
  }
  .ai-fab-open {
    background: linear-gradient(135deg, #374151, #4b5563);
    box-shadow: 0 4px 15px rgba(0,0,0,0.25);
  }
  .ai-fab-open:hover {
    background: linear-gradient(135deg, #1f2937, #374151);
  }
  .ai-fab-icon {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  .ai-fab-icon-visible {
    opacity: 1;
    transform: rotate(0deg) scale(1);
  }
  .ai-fab-icon-hidden {
    opacity: 0;
    transform: rotate(90deg) scale(0.6);
    pointer-events: none;
  }
  .ai-fab-unread {
    position: absolute;
    top: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #ef4444;
    border: 2px solid white;
    z-index: 1;
    animation: unreadPulse 1.5s ease-in-out infinite;
  }
  @keyframes unreadPulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
  }
  .ai-fab-ring {
    position: absolute;
    inset: -6px;
    border-radius: 50%;
    border: 2.5px solid rgba(8,131,149,0.35);
    animation: fabRing 2.5s ease-in-out infinite;
    pointer-events: none;
  }
  @keyframes fabRing {
    0% { transform: scale(1); opacity: 0.7; }
    50% { transform: scale(1.18); opacity: 0; }
    100% { transform: scale(1); opacity: 0.7; }
  }
  .ai-fab-tooltip {
    position: absolute;
    right: 68px;
    bottom: 50%;
    transform: translateY(50%);
    background: var(--foreground);
    color: var(--background);
    padding: 5px 10px;
    border-radius: 8px;
    font-size: 12px;
    font-weight: 600;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s ease;
  }
  .ai-fab-tooltip::after {
    content: '';
    position: absolute;
    right: -5px;
    top: 50%;
    transform: translateY(-50%);
    border: 5px solid transparent;
    border-left-color: var(--foreground);
    border-right: none;
  }
  .ai-fab-container:hover .ai-fab-tooltip {
    opacity: 1;
  }
`;
