'use client';

import { TypingIndicator } from './TypingIndicator';
import { ConfirmationCard } from './ConfirmationCard';
import type { ChatMessage } from '@/services/aiService';

interface LeaveBalance {
  annual?: number;
  sick?: number;
  compOff?: number;
  maternity?: number;
  paternity?: number;
}

interface MessageBubbleProps {
  message: ChatMessage;
  onConfirm?: () => void;
  onCancel?: () => void;
  disabled?: boolean;
}

/** Render bold markdown  */
function renderMarkdown(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    const rendered = parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
      }
      return <span key={i}>{part}</span>;
    });
    return (
      <span key={lineIdx}>
        {rendered}
        {lineIdx < lines.length - 1 && <br />}
      </span>
    );
  });
}

/** Render leave balance data card */
function LeaveBalanceCard({ balance }: { balance: LeaveBalance }) {
  const items = [
    { label: 'Annual', value: balance.annual ?? 12, color: '#2563eb', icon: '🏖️' },
    { label: 'Sick', value: balance.sick ?? 12, color: '#dc2626', icon: '🤒' },
    { label: 'Comp-Off', value: balance.compOff ?? 0, color: '#7c3aed', icon: '🔄' },
    { label: 'Maternity', value: balance.maternity ?? 0, color: '#db2777', icon: '👶' },
    { label: 'Paternity', value: balance.paternity ?? 0, color: '#0891b2', icon: '👨' },
  ];

  return (
    <div className="data-card">
      <div className="data-card-title">📊 Leave Balance</div>
      <div className="balance-grid">
        {items.map((item) => (
          <div key={item.label} className="balance-item">
            <span className="balance-icon">{item.icon}</span>
            <span className="balance-label">{item.label}</span>
            <span className="balance-value" style={{ color: item.color }}>
              {item.value} days
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Render holiday list data card */
function HolidayListCard({ holidays }: { holidays: Array<{ date: string; name: string }> }) {
  if (!holidays?.length) {
    return <div className="data-card"><p className="empty-msg">No upcoming holidays found.</p></div>;
  }
  return (
    <div className="data-card">
      <div className="data-card-title">🗓️ Holiday Calendar</div>
      <div className="holiday-list">
        {holidays.slice(0, 10).map((h, i) => (
          <div key={i} className="holiday-row">
            <span className="holiday-date">
              {new Date(h.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
            </span>
            <span className="holiday-name">{h.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Render pending requests card */
function PendingRequestsCard({ data }: {
  data: {
    pendingLeaves?: Array<{ id: number; type: string; user?: { name: string } }>;
    pendingPermissions?: Array<{ id: number; user?: { name: string } }>;
    pendingCompOffs?: Array<{ id: number; user?: { name: string } }>;
  }
}) {
  const leaves = data.pendingLeaves || [];
  const perms = data.pendingPermissions || [];
  const comps = data.pendingCompOffs || [];
  const total = leaves.length + perms.length + comps.length;

  return (
    <div className="data-card">
      <div className="data-card-title">📬 Pending Requests ({total})</div>
      {total === 0 ? (
        <p className="empty-msg">🎉 No pending requests! All caught up.</p>
      ) : (
        <>
          {leaves.length > 0 && (
            <div className="pending-section">
              <div className="pending-section-title">Leave Requests ({leaves.length})</div>
              {leaves.slice(0, 5).map((l) => (
                <div key={l.id} className="pending-item">
                  <span>#{l.id}</span>
                  <span>{l.user?.name}</span>
                  <span className="pending-type">{l.type}</span>
                </div>
              ))}
            </div>
          )}
          {perms.length > 0 && (
            <div className="pending-section">
              <div className="pending-section-title">Permissions ({perms.length})</div>
              {perms.slice(0, 3).map((p) => (
                <div key={p.id} className="pending-item">
                  <span>#{p.id}</span>
                  <span>{p.user?.name}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function MessageBubble({ message, onConfirm, onCancel, disabled }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (message.isLoading) {
    return (
      <div className="msg-row msg-row-assistant">
        <div className="msg-avatar msg-avatar-ai">
          <AIAvatarIcon />
        </div>
        <TypingIndicator />
      </div>
    );
  }

  const showConfirmation =
    !isUser &&
    message.phase === 'AWAITING_CONFIRMATION' &&
    message.confirmationMessage;

  const showLeaveBalance =
    !isUser && message.dataType === 'LEAVE_BALANCE' && message.actionResult;
  const showHolidays =
    !isUser && message.dataType === 'HOLIDAY_LIST' && message.actionResult;
  const showPending =
    !isUser && message.dataType === 'PENDING_REQUESTS' && message.actionResult;

  return (
    <div className={`msg-row ${isUser ? 'msg-row-user' : 'msg-row-assistant'}`}>
      {!isUser && (
        <div className="msg-avatar msg-avatar-ai">
          <AIAvatarIcon />
        </div>
      )}

      <div className={`msg-content ${isUser ? 'msg-content-user' : 'msg-content-ai'}`}>
        {/* Text bubble */}
        {message.content && (
          <div
            className={`msg-bubble ${isUser ? 'msg-bubble-user' : 'msg-bubble-ai'} ${message.isError ? 'msg-bubble-error' : ''}`}
          >
            <div className="msg-text">{renderMarkdown(message.content)}</div>
          </div>
        )}

        {/* Data cards */}
        {showLeaveBalance && (
          <LeaveBalanceCard balance={(message.actionResult as { balance: LeaveBalance }).balance} />
        )}
        {showHolidays && (
          <HolidayListCard holidays={(message.actionResult as { holidays: Array<{ date: string; name: string }> }).holidays} />
        )}
        {showPending && (
          <PendingRequestsCard data={message.actionResult as Parameters<typeof PendingRequestsCard>[0]['data']} />
        )}

        {/* Confirmation card */}
        {showConfirmation && onConfirm && onCancel && (
          <ConfirmationCard
            message={message.confirmationMessage!}
            intent={message.intent || ''}
            collectedFields={message.collectedFields}
            onConfirm={onConfirm}
            onCancel={onCancel}
            disabled={disabled}
          />
        )}

        {/* Timestamp */}
        <span className={`msg-time ${isUser ? 'msg-time-user' : ''}`}>
          {message.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {isUser && (
        <div className="msg-avatar msg-avatar-user">
          <UserAvatarIcon />
        </div>
      )}
    </div>
  );
}

function AIAvatarIcon() {
  return (
    <div className="avatar-circle avatar-ai">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1a7 7 0 0 1-7 7H9a7 7 0 0 1-7-7H1a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2M9 9a5 5 0 0 0-5 5v3a5 5 0 0 0 5 5h6a5 5 0 0 0 5-5v-3a5 5 0 0 0-5-5H9m3 2a1 1 0 0 1 1 1v1h1a1 1 0 0 1 0 2h-1v1a1 1 0 0 1-2 0v-1h-1a1 1 0 0 1 0-2h1v-1a1 1 0 0 1 1-1z" fill="currentColor"/>
      </svg>
    </div>
  );
}

function UserAvatarIcon() {
  return (
    <div className="avatar-circle avatar-user">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" fill="currentColor"/>
      </svg>
    </div>
  );
}

// Shared styles exported with the component
export const messageBubbleStyles = `
  .msg-row {
    display: flex;
    gap: 8px;
    align-items: flex-end;
    margin-bottom: 16px;
    animation: msgSlideIn 0.22s ease-out;
  }
  @keyframes msgSlideIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  .msg-row-user {
    flex-direction: row-reverse;
  }
  .msg-content {
    display: flex;
    flex-direction: column;
    max-width: 78%;
    gap: 6px;
  }
  .msg-content-user {
    align-items: flex-end;
  }
  .msg-content-ai {
    align-items: flex-start;
  }
  .msg-bubble {
    padding: 10px 14px;
    border-radius: 18px;
    font-size: 13.5px;
    line-height: 1.6;
    word-break: break-word;
  }
  .msg-bubble-user {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    color: #fff;
    border-bottom-right-radius: 4px;
    box-shadow: 0 2px 12px rgba(8,131,149,0.25);
  }
  .msg-bubble-ai {
    background: var(--card);
    color: var(--foreground);
    border: 1px solid var(--border);
    border-bottom-left-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .msg-bubble-error {
    border-color: #fca5a5;
    background: var(--danger-muted);
    color: var(--danger-muted-foreground);
  }
  .msg-text {
    white-space: pre-wrap;
  }
  .msg-time {
    font-size: 10px;
    color: var(--muted-foreground);
    padding: 0 4px;
  }
  .msg-time-user {
    text-align: right;
  }
  .avatar-circle {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .avatar-ai {
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    color: white;
    box-shadow: 0 2px 8px rgba(8,131,149,0.3);
  }
  .avatar-user {
    background: var(--muted);
    color: var(--muted-foreground);
  }
  .data-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 14px;
    max-width: 100%;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
  .data-card-title {
    font-size: 13px;
    font-weight: 700;
    color: var(--foreground);
    margin-bottom: 12px;
    padding-bottom: 8px;
    border-bottom: 1px solid var(--border);
  }
  .balance-grid {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .balance-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
  }
  .balance-icon { font-size: 15px; }
  .balance-label { flex: 1; color: var(--muted-foreground); font-weight: 500; }
  .balance-value { font-weight: 700; font-size: 13px; }
  .holiday-list { display: flex; flex-direction: column; gap: 6px; }
  .holiday-row {
    display: flex;
    gap: 12px;
    align-items: center;
    font-size: 12.5px;
    padding: 4px 0;
    border-bottom: 1px solid var(--border);
  }
  .holiday-row:last-child { border-bottom: none; }
  .holiday-date {
    font-weight: 700;
    color: var(--primary);
    min-width: 48px;
    font-size: 11px;
  }
  .holiday-name { color: var(--foreground); }
  .pending-section { margin-bottom: 10px; }
  .pending-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted-foreground);
    margin-bottom: 6px;
  }
  .pending-item {
    display: flex;
    gap: 10px;
    font-size: 12px;
    padding: 4px 0;
    border-bottom: 1px solid var(--border);
    color: var(--foreground);
  }
  .pending-type {
    margin-left: auto;
    font-size: 10px;
    font-weight: 600;
    background: var(--muted);
    padding: 2px 6px;
    border-radius: 6px;
  }
  .empty-msg {
    font-size: 13px;
    color: var(--muted-foreground);
    text-align: center;
    padding: 8px 0;
  }
`;
