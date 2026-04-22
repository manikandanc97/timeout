'use client';

export function TypingIndicator() {
  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-bubble">
        <div className="typing-topline">
          <div className="typing-avatar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" fill="currentColor" />
            </svg>
          </div>
          <div className="typing-dots">
            <span className="typing-dot" style={{ animationDelay: '0ms' }} />
            <span className="typing-dot" style={{ animationDelay: '180ms' }} />
            <span className="typing-dot" style={{ animationDelay: '360ms' }} />
          </div>
        </div>
        <div className="typing-lines">
          <span className="typing-line typing-line-lg" />
          <span className="typing-line typing-line-sm" />
        </div>
      </div>

      <style>{`
        .typing-indicator-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 4px 0;
        }
        .typing-bubble {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 10px;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 18px 18px 18px 4px;
          padding: 10px 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        .typing-topline {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .typing-avatar {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary), var(--accent));
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }
        .typing-dots {
          display: flex;
          gap: 4px;
          align-items: center;
        }
        .typing-lines {
          display: flex;
          flex-direction: column;
          gap: 6px;
          min-width: 140px;
        }
        .typing-line {
          display: block;
          height: 8px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--muted) 0%, var(--border) 50%, var(--muted) 100%);
          background-size: 200% 100%;
          animation: typingShimmer 1.6s linear infinite;
        }
        .typing-line-lg { width: 150px; }
        .typing-line-sm { width: 98px; }
        .typing-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--muted-foreground);
          display: inline-block;
          animation: typingBounce 1.2s infinite ease-in-out;
          opacity: 0.6;
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes typingShimmer {
          from { background-position: 200% 0; }
          to { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
