'use client';

interface SuggestionChipsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  disabled?: boolean;
}

const CHIP_ICONS: Record<string, string> = {
  'Apply Leave': '🏖️',
  'Leave Balance': '📊',
  'Holiday List': '📅',
  'Leave Policy': '📋',
  'Apply Permission': '⏰',
  'Pending Requests': '📬',
  'Team Summary': '👥',
  'Add Employee': '➕',
  'Payroll Summary': '💰',
  'AI Audit Logs': '🔍',
  'My Payslip': '📄',
  'Comp-Off Request': '🔄',
};

export function SuggestionChips({ suggestions, onSelect, disabled }: SuggestionChipsProps) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="suggestion-chips-container">
      <p className="suggestion-chips-label">Quick actions</p>
      <div className="suggestion-chips-list">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => !disabled && onSelect(suggestion)}
            disabled={disabled}
            className="suggestion-chip"
            title={suggestion}
          >
            {CHIP_ICONS[suggestion] && (
              <span className="chip-icon">{CHIP_ICONS[suggestion]}</span>
            )}
            {suggestion}
          </button>
        ))}
      </div>

      <style>{`
        .suggestion-chips-container {
          padding: 8px 16px 12px;
          border-top: 1px solid var(--border);
        }
        .suggestion-chips-label {
          font-size: 10px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          color: var(--muted-foreground);
          margin-bottom: 8px;
        }
        .suggestion-chips-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .suggestion-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 11px;
          border-radius: 20px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--foreground);
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.18s ease;
          white-space: nowrap;
        }
        .suggestion-chip:hover:not(:disabled) {
          background: var(--primary);
          color: var(--primary-foreground);
          border-color: var(--primary);
          transform: translateY(-1px);
          box-shadow: 0 3px 10px color-mix(in srgb, var(--primary) 25%, transparent);
        }
        .suggestion-chip:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .chip-icon {
          font-size: 13px;
          line-height: 1;
        }
      `}</style>
    </div>
  );
}
