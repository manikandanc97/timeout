'use client';

interface ConfirmationCardProps {
  message: string;
  intent: string;
  collectedFields?: Record<string, string>;
  onConfirm: () => void;
  onCancel: () => void;
  disabled?: boolean;
}

const INTENT_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  APPLY_LEAVE: { label: 'Submit Leave Request', color: '#2563eb', icon: '🏖️' },
  APPLY_PERMISSION: { label: 'Submit Permission', color: '#7c3aed', icon: '⏰' },
  APPLY_COMP_OFF: { label: 'Submit Comp-Off', color: '#059669', icon: '🔄' },
  ADD_EMPLOYEE: { label: 'Add New Employee', color: '#0891b2', icon: '👤' },
  DELETE_EMPLOYEE: { label: 'Delete Employee', color: '#dc2626', icon: '⚠️' },
  DEACTIVATE_EMPLOYEE: { label: 'Deactivate Employee', color: '#ea580c', icon: '🔒' },
  ACTIVATE_EMPLOYEE: { label: 'Activate Employee', color: '#16a34a', icon: '✅' },
  APPROVE_LEAVE: { label: 'Approve Leave', color: '#16a34a', icon: '✅' },
  REJECT_LEAVE: { label: 'Reject Leave', color: '#dc2626', icon: '❌' },
  APPROVE_PERMISSION: { label: 'Approve Permission', color: '#16a34a', icon: '✅' },
  REJECT_PERMISSION: { label: 'Reject Permission', color: '#dc2626', icon: '❌' },
  APPROVE_COMP_OFF: { label: 'Approve Comp-Off', color: '#16a34a', icon: '✅' },
  REJECT_COMP_OFF: { label: 'Reject Comp-Off', color: '#dc2626', icon: '❌' },
  ASSIGN_ROLE: { label: 'Assign Role', color: '#7c3aed', icon: '🔑' },
};

const isDestructive = (intent: string) =>
  ['DELETE_EMPLOYEE', 'DEACTIVATE_EMPLOYEE', 'REJECT_LEAVE', 'REJECT_PERMISSION', 'REJECT_COMP_OFF'].includes(intent);

/** Render markdown-like bold text */
function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} style={{ fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export function ConfirmationCard({
  message,
  intent,
  collectedFields,
  onConfirm,
  onCancel,
  disabled,
}: ConfirmationCardProps) {
  const meta = INTENT_LABELS[intent] || { label: intent, color: '#088395', icon: '🤖' };
  const destructive = isDestructive(intent);

  return (
    <div
      className="confirm-card"
      style={{ borderLeftColor: meta.color }}
    >
      {/* Header */}
      <div className="confirm-card-header">
        <span className="confirm-card-icon">{meta.icon}</span>
        <div>
          <p className="confirm-card-label" style={{ color: meta.color }}>
            Confirm Action
          </p>
          <p className="confirm-card-title">{meta.label}</p>
        </div>
      </div>

      {/* Message */}
      <div className="confirm-card-body">
        {message.split('\n').map((line, i) => (
          <p key={i} className="confirm-card-line">
            {renderMarkdown(line)}
          </p>
        ))}
      </div>

      {/* Collected fields preview */}
      {collectedFields && Object.keys(collectedFields).length > 0 && (
        <div className="confirm-card-fields">
          {Object.entries(collectedFields).map(([key, val]) => (
            <div key={key} className="confirm-field-row">
              <span className="confirm-field-key">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="confirm-field-val">{String(val)}</span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="confirm-card-actions">
        <button
          onClick={onCancel}
          disabled={disabled}
          className="confirm-btn confirm-btn-cancel"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          disabled={disabled}
          className={`confirm-btn confirm-btn-confirm ${destructive ? 'confirm-btn-destructive' : ''}`}
          style={!destructive ? { background: meta.color } : undefined}
        >
          {destructive ? '⚠️ Confirm' : '✅ Confirm'}
        </button>
      </div>

      <style>{`
        .confirm-card {
          background: var(--card);
          border: 1px solid var(--border);
          border-left: 4px solid;
          border-radius: 14px;
          padding: 16px;
          margin: 4px 0;
          box-shadow: 0 4px 16px rgba(0,0,0,0.08);
          max-width: 100%;
        }
        .confirm-card-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }
        .confirm-card-icon {
          font-size: 22px;
          line-height: 1;
          flex-shrink: 0;
        }
        .confirm-card-label {
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }
        .confirm-card-title {
          font-size: 14px;
          font-weight: 700;
          color: var(--foreground);
        }
        .confirm-card-body {
          font-size: 13px;
          color: var(--muted-foreground);
          margin-bottom: 12px;
          line-height: 1.6;
        }
        .confirm-card-line {
          margin-bottom: 3px;
        }
        .confirm-card-fields {
          background: var(--muted);
          border-radius: 10px;
          padding: 10px 12px;
          margin-bottom: 14px;
        }
        .confirm-field-row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 3px 0;
          font-size: 12px;
        }
        .confirm-field-key {
          color: var(--muted-foreground);
          font-weight: 500;
          text-transform: capitalize;
          flex-shrink: 0;
        }
        .confirm-field-val {
          color: var(--foreground);
          font-weight: 600;
          text-align: right;
          word-break: break-word;
        }
        .confirm-card-actions {
          display: flex;
          gap: 8px;
          justify-content: flex-end;
        }
        .confirm-btn {
          padding: 8px 18px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          transition: all 0.18s ease;
        }
        .confirm-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .confirm-btn-cancel {
          background: var(--muted);
          color: var(--muted-foreground);
        }
        .confirm-btn-cancel:hover:not(:disabled) {
          background: var(--border);
          color: var(--foreground);
        }
        .confirm-btn-confirm {
          color: white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }
        .confirm-btn-confirm:hover:not(:disabled) {
          opacity: 0.88;
          transform: translateY(-1px);
        }
        .confirm-btn-destructive {
          background: #dc2626 !important;
        }
      `}</style>
    </div>
  );
}
