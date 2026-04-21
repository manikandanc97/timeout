'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAIAuditLogs, type AuditLog } from '@/services/aiService';
import { useRouter } from 'next/navigation';

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  SUCCESS: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a', label: '✅ Success' },
  FAILED: { bg: 'rgba(220,38,38,0.1)', color: '#dc2626', label: '❌ Failed' },
  CANCELLED: { bg: 'rgba(107,114,128,0.1)', color: '#6b7280', label: '🚫 Cancelled' },
  REJECTED: { bg: 'rgba(234,88,12,0.1)', color: '#ea580c', label: '⛔ Rejected' },
};

const INTENT_LABELS: Record<string, string> = {
  APPLY_LEAVE: '🏖️ Apply Leave',
  APPLY_PERMISSION: '⏰ Apply Permission',
  APPLY_COMP_OFF: '🔄 Apply Comp-Off',
  CHECK_LEAVE_BALANCE: '📊 Check Balance',
  VIEW_MY_LEAVES: '📋 View Leaves',
  HOLIDAY_LIST: '📅 Holiday List',
  VIEW_PENDING_REQUESTS: '📬 View Pending',
  APPROVE_LEAVE: '✅ Approve Leave',
  REJECT_LEAVE: '❌ Reject Leave',
  APPROVE_PERMISSION: '✅ Approve Permission',
  REJECT_PERMISSION: '❌ Reject Permission',
  APPROVE_COMP_OFF: '✅ Approve Comp-Off',
  REJECT_COMP_OFF: '❌ Reject Comp-Off',
  ADD_EMPLOYEE: '👤 Add Employee',
  UPDATE_EMPLOYEE: '✏️ Update Employee',
  DELETE_EMPLOYEE: '🗑️ Delete Employee',
  DEACTIVATE_EMPLOYEE: '🔒 Deactivate',
  ACTIVATE_EMPLOYEE: '🔓 Activate',
  UPDATE_AI_SETTINGS: '⚙️ AI Settings',
  GENERAL_HR_FAQ: '💬 HR FAQ',
  LEAVE_POLICY_FAQ: '📋 Leave Policy FAQ',
};

const ROLE_BADGES: Record<string, { bg: string; color: string }> = {
  ADMIN: { bg: 'rgba(124,58,237,0.1)', color: '#7c3aed' },
  MANAGER: { bg: 'rgba(8,131,149,0.1)', color: '#088395' },
  EMPLOYEE: { bg: 'rgba(22,163,74,0.1)', color: '#16a34a' },
};

export default function AIAuditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    intent: '',
    status: '',
    startDate: '',
    endDate: '',
  });
  const [expandedLog, setExpandedLog] = useState<number | null>(null);

  const limit = 20;
  const totalPages = Math.ceil(total / limit);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getAIAuditLogs({
        page,
        limit,
        intent: filters.intent || undefined,
        status: filters.status || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setLogs(result.logs);
      setTotal(result.total);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    if (user && user.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  if (user?.role !== 'ADMIN') {
    return null;
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  return (
    <>
      <style>{auditStyles}</style>
      <div className="audit-page">
        {/* Header */}
        <div className="audit-header">
          <div>
            <div className="audit-breadcrumb">
              <a href="/settings" className="breadcrumb-link">Settings</a>
              <span className="breadcrumb-sep">›</span>
              <span>AI Audit Logs</span>
            </div>
            <h1 className="audit-title">AI Audit Logs</h1>
            <p className="audit-subtitle">
              Complete history of all AI-performed actions — {total.toLocaleString()} total records
            </p>
          </div>
          <button onClick={loadLogs} className="refresh-btn" disabled={loading}>
            {loading ? '⟳ Loading...' : '🔄 Refresh'}
          </button>
        </div>

        {/* Filters */}
        <div className="audit-filters">
          <select
            value={filters.intent}
            onChange={(e) => handleFilterChange('intent', e.target.value)}
            className="filter-select"
          >
            <option value="">All Intents</option>
            {Object.entries(INTENT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            <option value="SUCCESS">✅ Success</option>
            <option value="FAILED">❌ Failed</option>
            <option value="CANCELLED">🚫 Cancelled</option>
            <option value="REJECTED">⛔ Rejected</option>
          </select>

          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="filter-input"
            placeholder="From date"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="filter-input"
            placeholder="To date"
          />

          <button
            onClick={() => { setFilters({ intent: '', status: '', startDate: '', endDate: '' }); setPage(1); }}
            className="filter-clear-btn"
          >
            Clear
          </button>
        </div>

        {/* Table */}
        <div className="audit-card">
          {loading ? (
            <div className="audit-loading">
              <div className="loading-spinner" />
              <span>Loading audit logs...</span>
            </div>
          ) : logs.length === 0 ? (
            <div className="audit-empty">
              <span>🔍</span>
              <p>No audit logs found for the selected filters.</p>
            </div>
          ) : (
            <div className="audit-table-wrapper">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Intent</th>
                    <th>Action</th>
                    <th>Status</th>
                    <th>When</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const statusStyle = STATUS_STYLES[log.status] || STATUS_STYLES.SUCCESS;
                    const roleStyle = ROLE_BADGES[log.userRole] || ROLE_BADGES.EMPLOYEE;
                    const intentLabel = INTENT_LABELS[log.intent] || log.intent;
                    const isExpanded = expandedLog === log.id;

                    return (
                      <>
                        <tr key={log.id} className="audit-row">
                          <td className="audit-cell audit-id">#{log.id}</td>
                          <td className="audit-cell">
                            <div className="user-info">
                              <div className="user-avatar">
                                {log.userName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="user-name">{log.userName}</div>
                                <div className="user-email"></div>
                              </div>
                            </div>
                          </td>
                          <td className="audit-cell">
                            <span
                              className="role-badge"
                              style={{ background: roleStyle.bg, color: roleStyle.color }}
                            >
                              {log.userRole}
                            </span>
                          </td>
                          <td className="audit-cell">
                            <span className="intent-label">{intentLabel}</span>
                          </td>
                          <td className="audit-cell action-cell">{log.action}</td>
                          <td className="audit-cell">
                            <span
                              className="status-badge"
                              style={{ background: statusStyle.bg, color: statusStyle.color }}
                            >
                              {statusStyle.label}
                            </span>
                          </td>
                          <td className="audit-cell time-cell">
                            {new Date(log.createdAt).toLocaleString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </td>
                          <td className="audit-cell">
                            <button
                              onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                              className="expand-btn"
                            >
                              {isExpanded ? '▲' : '▼'}
                            </button>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr key={`${log.id}-detail`} className="audit-row-expanded">
                            <td colSpan={8}>
                              <div className="expand-detail">
                                {log.payload && Object.keys(log.payload).length > 0 && (
                                  <div className="expand-section">
                                    <div className="expand-section-title">Input Payload</div>
                                    <pre className="expand-code">
                                      {JSON.stringify(log.payload, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.result && Object.keys(log.result).length > 0 && (
                                  <div className="expand-section">
                                    <div className="expand-section-title">Result</div>
                                    <pre className="expand-code">
                                      {JSON.stringify(log.result, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="audit-pagination">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
              className="page-btn"
            >
              ← Prev
            </button>
            <span className="page-info">
              Page {page} of {totalPages} ({total.toLocaleString()} records)
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
              className="page-btn"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </>
  );
}

const auditStyles = `
  .audit-page {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 4px 40px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .audit-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }
  .audit-breadcrumb {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: var(--muted-foreground);
    margin-bottom: 6px;
  }
  .breadcrumb-link {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
  }
  .breadcrumb-sep { opacity: 0.5; }
  .audit-title {
    font-size: 26px;
    font-weight: 800;
    color: var(--foreground);
    margin: 0 0 4px;
  }
  .audit-subtitle {
    font-size: 13.5px;
    color: var(--muted-foreground);
    margin: 0;
  }
  .refresh-btn {
    padding: 9px 18px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: var(--muted);
    color: var(--foreground);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .refresh-btn:hover:not(:disabled) { background: var(--border); }
  .refresh-btn:disabled { opacity: 0.5; cursor: not-allowed; }
  /* Filters */
  .audit-filters {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    align-items: center;
  }
  .filter-select, .filter-input {
    padding: 9px 12px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    font-size: 13px;
    outline: none;
    cursor: pointer;
    min-width: 140px;
  }
  .filter-select:focus, .filter-input:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(8,131,149,0.1);
  }
  .filter-clear-btn {
    padding: 9px 16px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: var(--muted);
    color: var(--muted-foreground);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.18s;
  }
  .filter-clear-btn:hover { background: var(--border); color: var(--foreground); }
  /* Table */
  .audit-card {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 20px;
    overflow: hidden;
  }
  .audit-table-wrapper {
    overflow-x: auto;
  }
  .audit-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  .audit-table thead tr {
    background: var(--muted);
    border-bottom: 1px solid var(--border);
  }
  .audit-table th {
    padding: 12px 14px;
    text-align: left;
    font-weight: 700;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted-foreground);
    white-space: nowrap;
  }
  .audit-row {
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }
  .audit-row:hover { background: var(--muted); }
  .audit-row:last-child { border-bottom: none; }
  .audit-cell {
    padding: 12px 14px;
    vertical-align: middle;
  }
  .audit-id {
    font-size: 11px;
    font-weight: 700;
    color: var(--muted-foreground);
    white-space: nowrap;
  }
  .user-info { display: flex; align-items: center; gap: 10px; }
  .user-avatar {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background: linear-gradient(135deg, var(--primary-dark), var(--primary));
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 13px;
    flex-shrink: 0;
  }
  .user-name { font-weight: 600; color: var(--foreground); font-size: 13px; }
  .user-email { font-size: 11px; color: var(--muted-foreground); }
  .role-badge, .status-badge {
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 6px;
    white-space: nowrap;
  }
  .intent-label { font-size: 12.5px; color: var(--foreground); white-space: nowrap; }
  .action-cell {
    font-size: 12px;
    color: var(--muted-foreground);
    max-width: 180px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .time-cell { font-size: 12px; color: var(--muted-foreground); white-space: nowrap; }
  .expand-btn {
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted-foreground);
    cursor: pointer;
    font-size: 11px;
    transition: all 0.15s;
  }
  .expand-btn:hover { background: var(--muted); }
  .audit-row-expanded td { padding: 0; }
  .expand-detail {
    padding: 14px 16px;
    background: var(--muted);
    display: flex;
    gap: 16px;
    flex-wrap: wrap;
  }
  .expand-section { flex: 1; min-width: 200px; }
  .expand-section-title {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--muted-foreground);
    margin-bottom: 8px;
  }
  .expand-code {
    font-size: 11px;
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 10px 12px;
    overflow-x: auto;
    color: var(--foreground);
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    max-height: 200px;
    overflow-y: auto;
    margin: 0;
  }
  /* Empty / loading states */
  .audit-loading, .audit-empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 60px 20px;
    color: var(--muted-foreground);
    font-size: 14px;
  }
  .audit-empty span { font-size: 36px; }
  .loading-spinner {
    width: 22px;
    height: 22px;
    border: 2.5px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  /* Pagination */
  .audit-pagination {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16px;
  }
  .page-btn {
    padding: 8px 18px;
    border-radius: 12px;
    border: 1.5px solid var(--border);
    background: var(--card);
    color: var(--foreground);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.18s;
  }
  .page-btn:hover:not(:disabled) {
    background: var(--primary);
    color: white;
    border-color: var(--primary);
  }
  .page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .page-info { font-size: 13px; color: var(--muted-foreground); font-weight: 500; }
`;
