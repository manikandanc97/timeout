'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  getAISettings,
  updateAISettings,
  testAIConnection,
  reindexKnowledgeBase,
  type AISettings,
} from '@/services/aiService';
import {
  getAdminSettings,
  updateAdminSettings,
  resetAdminSettings,
  type AdminSettings,
} from '@/services/organizationService';

const AI_PROVIDERS = [
  {
    id: 'demo',
    label: 'Demo Mode (Local)',
    description: 'Built-in patterns for testing without an API key',
    icon: '🤖',
    requiresKey: false,
    requiresBaseUrl: false,
    models: [],
  },
  {
    id: 'gemini',
    label: 'Google Gemini',
    description: "Google's powerful AI. Supports flash and pro models.",
    icon: '✨',
    requiresKey: true,
    requiresBaseUrl: false,
    models: ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash-8b'],
  },
  {
    id: 'anthropic',
    label: 'Anthropic Claude',
    description: "Claude 3.5 Sonnet & Opus. Excellent reasoning.",
    icon: '🕊️',
    requiresKey: true,
    requiresBaseUrl: false,
    models: ['claude-3-5-sonnet-20240620', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
  },
  {
    id: 'openai',
    label: 'OpenAI (GPT)',
    description: "Industry standard models like GPT-4o and o3-mini.",
    icon: '🧠',
    requiresKey: true,
    requiresBaseUrl: false,
    models: ['gpt-4o', 'gpt-4o-mini', 'o1-preview', 'o1-mini', 'o3-mini'],
  },
  {
    id: 'groq',
    label: 'Groq (Fast)',
    description: "Ultra-fast inference for Llama 3 and Mistral.",
    icon: '⚡',
    requiresKey: true,
    requiresBaseUrl: false,
    models: ['llama3-70b-8192', 'llama3-8b-8192', 'mixtral-8x7b-32768'],
  },
  {
    id: 'ollama',
    label: 'Ollama (Local)',
    description: "Run models locally on your server for privacy.",
    icon: '🦙',
    requiresKey: false,
    requiresBaseUrl: true,
    models: ['llama3', 'mistral', 'phi3'],
  },
];

const TABS = [
  { id: 'general', label: 'General', icon: '⚙️' },
  { id: 'ai', label: 'AI Assistant', icon: '🤖' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'advanced', label: 'HR Rules', icon: '🔒' },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success?: boolean; response?: string; error?: string } | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showKey, setShowKey] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [reindexMessage, setReindexMessage] = useState<string | null>(null);

  // Form Data States
  const [aiFormData, setAiFormData] = useState<Partial<AISettings>>({});
  const [adminSettings, setAdminSettings] = useState<AdminSettings | null>(null);
  const [generalFormData, setGeneralFormData] = useState<AdminSettings['generalSettings']>({
    companyName: '',
    companyEmail: '',
    phoneNumber: '',
    officeAddress: '',
    timezone: 'Asia/Kolkata',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
  });
  const [notificationFormData, setNotificationFormData] = useState({
    theme: {
      notificationEmail: true,
      browserNotification: false,
    },
    smtp: {
      host: '',
      port: 587,
      user: '',
      pass: '',
      secure: false,
      fromEmail: '',
    },
    alerts: {
      leaveRequests: true,
      payrollPaid: true,
      employeeUpdates: true,
    }
  });
  const [advancedFormData, setAdvancedFormData] = useState({
    leave: {
      casualLeaveCount: 12,
      sickLeaveCount: 12,
      compOffEnabled: true,
      carryForwardEnabled: true,
      lopAfterLeaveLimit: true,
    },
    payroll: {
      salaryReleaseDay: 30,
      workingDaysPerMonth: 22,
      pfPercentage: 12,
      taxPercentage: 10,
      professionalTax: 200,
      autoLopDeductionEnabled: true,
    }
  });

  const loadAllSettings = useCallback(async () => {
    try {
      setLoading(true);
      const [aiData, adminData] = await Promise.all([
        getAISettings(),
        getAdminSettings(),
      ]);

      // AI Settings
      setAiFormData({
        provider: aiData.settings.provider || 'demo',
        model: aiData.settings.model || '',
        apiKey: aiData.settings.hasKey ? '••••••••••••••••••••' : '',
        baseUrl: aiData.settings.baseUrl || '',
        systemPrompt: aiData.settings.systemPrompt || '',
        isEnabled: aiData.settings.isEnabled !== false,
      });

      // Admin Settings
      setAdminSettings(adminData);
      setGeneralFormData(adminData.generalSettings);
      setNotificationFormData({
        theme: {
          notificationEmail: adminData.themePreferences.notificationEmail,
          browserNotification: adminData.themePreferences.browserNotification,
        },
        smtp: adminData.smtpSettings || { host: '', port: 587, user: '', pass: '', secure: false, fromEmail: '' },
        alerts: adminData.alertPreferences || { leaveRequests: true, payrollPaid: true, employeeUpdates: true },
      });
      setAdvancedFormData({
        leave: adminData.leavePolicySettings,
        payroll: adminData.payrollSettings,
      });
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllSettings();
  }, [loadAllSettings]);

  const handleSaveAI = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await updateAISettings(aiFormData);
      setSaveStatus('success');
      await loadAllSettings();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveGeneral = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await updateAdminSettings({
        generalSettings: generalFormData,
      });
      setSaveStatus('success');
      await loadAllSettings();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await updateAdminSettings({
        themePreferences: {
          ...adminSettings!.themePreferences,
          notificationEmail: notificationFormData.theme.notificationEmail,
          browserNotification: notificationFormData.theme.browserNotification,
        },
        smtpSettings: notificationFormData.smtp,
        alertPreferences: notificationFormData.alerts,
      });
      setSaveStatus('success');
      await loadAllSettings();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAdvanced = async () => {
    setSaving(true);
    setSaveStatus('idle');
    try {
      await updateAdminSettings({
        leavePolicySettings: advancedFormData.leave,
        payrollSettings: advancedFormData.payroll,
      });
      setSaveStatus('success');
      await loadAllSettings();
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAI = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const result = await testAIConnection();
      setTestResult(result);
    } catch (err: unknown) {
      setTestResult({ success: false, error: String((err as Error).message) });
    } finally {
      setTesting(false);
    }
  };

  const handleReindexKnowledge = async () => {
    if (!confirm('Re-indexing the knowledge base will process all company policies. This may take a few minutes. Continue?')) return;
    setReindexing(true);
    setReindexMessage(null);
    try {
      const result = await reindexKnowledgeBase();
      setReindexMessage(result.message);
    } catch (err: any) {
      setReindexMessage(`Error: ${err.message || 'Failed to start re-indexing'}`);
    } finally {
      setReindexing(false);
      setTimeout(() => setReindexMessage(null), 5000);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">
          <div className="loading-spinner" />
          <span>Loading organization settings...</span>
        </div>
      </div>
    );
  }

  const selectedAIProvider = AI_PROVIDERS.find((p) => p.id === (aiFormData.provider || 'demo'));

  return (
    <>
      <style>{settingsStyles}</style>
      <div className="settings-page">
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your organization preferences, HR rules, and AI configuration</p>
        </div>

        <div className="settings-layout">
          <nav className="settings-nav">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`settings-nav-btn ${activeTab === tab.id ? 'settings-nav-btn-active' : ''}`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {/* ── General tab ── */}
            {activeTab === 'general' && (
              <div className="settings-section">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">General Settings</h2>
                    <p className="section-desc">Organization profile and display preferences.</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <input
                      type="text"
                      className="form-input"
                      value={generalFormData.companyName}
                      onChange={(e) => setGeneralFormData({ ...generalFormData, companyName: e.target.value })}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Company Email</label>
                    <input
                      type="email"
                      className="form-input"
                      value={generalFormData.companyEmail}
                      onChange={(e) => setGeneralFormData({ ...generalFormData, companyEmail: e.target.value })}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="text"
                      className="form-input"
                      value={generalFormData.phoneNumber}
                      onChange={(e) => setGeneralFormData({ ...generalFormData, phoneNumber: e.target.value })}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Office Address</label>
                    <input
                      type="text"
                      className="form-input"
                      value={generalFormData.officeAddress}
                      onChange={(e) => setGeneralFormData({ ...generalFormData, officeAddress: e.target.value })}
                      disabled={!isAdmin}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Timezone</label>
                    <select
                      className="form-select"
                      value={generalFormData.timezone}
                      onChange={(e) => setGeneralFormData({ ...generalFormData, timezone: e.target.value })}
                      disabled={!isAdmin}
                    >
                      <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                      <option value="UTC">UTC</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Europe/London">Europe/London</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Currency</label>
                    <select
                      className="form-select"
                      value={generalFormData.currency}
                      onChange={(e) => setGeneralFormData({ ...generalFormData, currency: e.target.value })}
                      disabled={!isAdmin}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>

                {isAdmin && (
                  <div className="form-actions">
                    <button onClick={handleSaveGeneral} disabled={saving} className="btn btn-primary">
                      {saving ? <><span className="btn-spinner" /> Saving...</> : '💾 Save General Settings'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── AI Assistant tab ── */}
            {activeTab === 'ai' && (
              <div className="settings-section">
                <div className="section-header">
                  <div>
                    <h2 className="section-title">AI Assistant Configuration</h2>
                    <p className="section-desc">Manage the AI provider and context for the HR Assistant.</p>
                  </div>
                  <label className="toggle-label">
                    <span className="toggle-text">{aiFormData.isEnabled ? 'Enabled' : 'Disabled'}</span>
                    <div
                      className={`toggle-track ${aiFormData.isEnabled ? 'toggle-on' : ''}`}
                      onClick={() => isAdmin && setAiFormData((f) => ({ ...f, isEnabled: !f.isEnabled }))}
                    >
                      <div className="toggle-thumb" />
                    </div>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">AI Provider</label>
                  <div className="provider-grid">
                    {AI_PROVIDERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => isAdmin && setAiFormData((f) => ({ ...f, provider: p.id, model: p.models[0] || '' }))}
                        disabled={!isAdmin}
                        className={`provider-card ${aiFormData.provider === p.id ? 'provider-card-active' : ''}`}
                      >
                        <span className="provider-icon">{p.icon}</span>
                        <div>
                          <div className="provider-name">{p.label}</div>
                          <div className="provider-desc">{p.description}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {selectedAIProvider && selectedAIProvider.models.length > 0 && (
                  <div className="form-group">
                    <label className="form-label">Model</label>
                    <select
                      className="form-select"
                      value={aiFormData.model}
                      onChange={(e) => setAiFormData({ ...aiFormData, model: e.target.value })}
                      disabled={!isAdmin}
                    >
                      {selectedAIProvider.models.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                )}

                {selectedAIProvider?.requiresKey && (
                  <div className="form-group">
                    <label className="form-label">API Key</label>
                    <div className="input-with-action">
                      <input
                        type={showKey ? 'text' : 'password'}
                        className="form-input"
                        value={aiFormData.apiKey}
                        onChange={(e) => setAiFormData({ ...aiFormData, apiKey: e.target.value })}
                        disabled={!isAdmin}
                        placeholder="Enter your API key..."
                      />
                      <button onClick={() => setShowKey(!showKey)} className="input-action-btn">
                        {showKey ? '🙈' : '👁️'}
                      </button>
                    </div>
                  </div>
                )}

                {(selectedAIProvider?.requiresBaseUrl || aiFormData.provider === 'openai') && (
                  <div className="form-group">
                    <label className="form-label">Base URL (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={aiFormData.baseUrl}
                      onChange={(e) => setAiFormData({ ...aiFormData, baseUrl: e.target.value })}
                      disabled={!isAdmin}
                      placeholder={aiFormData.provider === 'ollama' ? 'http://localhost:11434' : 'https://api.openai.com/v1'}
                    />
                    <p className="form-help">Only needed for local models or custom API proxies.</p>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">System Prompt (Advanced)</label>
                  <textarea
                    className="form-textarea"
                    rows={4}
                    value={aiFormData.systemPrompt}
                    onChange={(e) => setAiFormData({ ...aiFormData, systemPrompt: e.target.value })}
                    disabled={!isAdmin}
                  />
                </div>

                {isAdmin && (
                  <div className="form-actions">
                    <button onClick={handleTestAI} disabled={testing || saving} className="btn btn-outline">
                      {testing ? <><span className="btn-spinner" /> Testing...</> : '🧪 Test AI Connection'}
                    </button>
                    <button onClick={handleSaveAI} disabled={saving || testing} className="btn btn-primary">
                      {saving ? <><span className="btn-spinner" /> Saving...</> : '💾 Save AI Settings'}
                    </button>
                  </div>
                )}

                {testResult && (
                  <div className={`test-result ${testResult.success ? 'test-result-success' : 'test-result-error'}`}>
                    <strong>{testResult.success ? '✅ Success: ' : '❌ Error: '}</strong>
                    {testResult.response || testResult.error}
                  </div>
                )}

                <div className="settings-subgroup">
                  <h3 className="subgroup-title">Knowledge Base (RAG)</h3>
                  <div className="rag-management">
                    <div className="rag-info">
                      <p className="section-desc">
                        Synchronize the AI with your company's latest policies, payroll rules, and office FAQs.
                        This will re-index all data for the vector search engine.
                      </p>
                    </div>
                    {isAdmin && (
                      <div className="rag-actions">
                        <button 
                          onClick={handleReindexKnowledge} 
                          disabled={reindexing || saving} 
                          className={`btn ${reindexing ? 'btn-outline' : 'btn-primary'}`}
                          style={{ background: reindexing ? 'transparent' : '#0ea5e9' }}
                        >
                          {reindexing ? <><span className="btn-spinner" /> Re-indexing...</> : '🔄 Re-index All Policies'}
                        </button>
                      </div>
                    )}
                    {reindexMessage && (
                      <div className="test-result test-result-success" style={{ marginTop: '12px' }}>
                        {reindexMessage}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ── Notifications tab ── */}
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2 className="section-title">Notification Settings</h2>
                <p className="section-desc">Manage how you and your employees receive updates.</p>

                <div className="settings-subgroup">
                  <h3 className="subgroup-title">Channels</h3>
                  <div className="toggle-list">
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <div className="toggle-name">Email Notifications</div>
                        <div className="toggle-desc">Send automated emails for leave requests and approval status.</div>
                      </div>
                      <div
                        className={`toggle-track ${notificationFormData.theme.notificationEmail ? 'toggle-on' : ''}`}
                        onClick={() => isAdmin && setNotificationFormData({
                          ...notificationFormData,
                          theme: { ...notificationFormData.theme, notificationEmail: !notificationFormData.theme.notificationEmail }
                        })}
                      >
                        <div className="toggle-thumb" />
                      </div>
                    </div>
                    <div className="toggle-item">
                      <div className="toggle-info">
                        <div className="toggle-name">Browser Push Notifications</div>
                        <div className="toggle-desc">Show real-time alerts in the browser when changes occur.</div>
                      </div>
                      <div
                        className={`toggle-track ${notificationFormData.theme.browserNotification ? 'toggle-on' : ''}`}
                        onClick={() => isAdmin && setNotificationFormData({
                          ...notificationFormData,
                          theme: { ...notificationFormData.theme, browserNotification: !notificationFormData.theme.browserNotification }
                        })}
                      >
                        <div className="toggle-thumb" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="settings-subgroup">
                  <h3 className="subgroup-title">SMTP Configuration (Real Data)</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">SMTP Host</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="smtp.gmail.com"
                        value={notificationFormData.smtp?.host || ''}
                        onChange={(e) => setNotificationFormData({
                          ...notificationFormData,
                          smtp: { ...notificationFormData.smtp, host: e.target.value }
                        })}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">SMTP Port</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="587"
                        value={notificationFormData.smtp?.port || ''}
                        onChange={(e) => setNotificationFormData({
                          ...notificationFormData,
                          smtp: { ...notificationFormData.smtp, port: Number(e.target.value) }
                        })}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">User</label>
                      <input
                        type="text"
                        className="form-input"
                        value={notificationFormData.smtp?.user || ''}
                        onChange={(e) => setNotificationFormData({
                          ...notificationFormData,
                          smtp: { ...notificationFormData.smtp, user: e.target.value }
                        })}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Password</label>
                      <input
                        type="password"
                        className="form-input"
                        value={notificationFormData.smtp?.pass || ''}
                        onChange={(e) => setNotificationFormData({
                          ...notificationFormData,
                          smtp: { ...notificationFormData.smtp, pass: e.target.value }
                        })}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="form-actions">
                    <button onClick={handleSaveNotifications} disabled={saving} className="btn btn-primary">
                      {saving ? <><span className="btn-spinner" /> Saving...</> : '💾 Save Notification Settings'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Advanced / HR Rules tab ── */}
            {activeTab === 'advanced' && (
              <div className="settings-section">
                <h2 className="section-title">HR & Payroll Rules</h2>
                <p className="section-desc">Manage leave policies and payroll calculation rules.</p>

                <div className="settings-subgroup">
                  <h3 className="subgroup-title">Leave Policy</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Casual Leaves (Per Year)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={advancedFormData.leave.casualLeaveCount}
                        onChange={(e) => setAdvancedFormData({
                          ...advancedFormData,
                          leave: { ...advancedFormData.leave, casualLeaveCount: Number(e.target.value) }
                        })}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Sick Leaves (Per Year)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={advancedFormData.leave.sickLeaveCount}
                        onChange={(e) => setAdvancedFormData({
                          ...advancedFormData,
                          leave: { ...advancedFormData.leave, sickLeaveCount: Number(e.target.value) }
                        })}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                </div>

                <div className="settings-subgroup">
                  <h3 className="subgroup-title">Payroll Configuration</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Salary Release Day</label>
                      <input
                        type="number"
                        className="form-input"
                        value={advancedFormData.payroll.salaryReleaseDay}
                        onChange={(e) => setAdvancedFormData({
                          ...advancedFormData,
                          payroll: { ...advancedFormData.payroll, salaryReleaseDay: Number(e.target.value) }
                        })}
                        disabled={!isAdmin}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Working Days (Per Month)</label>
                      <input
                        type="number"
                        className="form-input"
                        value={advancedFormData.payroll.workingDaysPerMonth}
                        onChange={(e) => setAdvancedFormData({
                          ...advancedFormData,
                          payroll: { ...advancedFormData.payroll, workingDaysPerMonth: Number(e.target.value) }
                        })}
                        disabled={!isAdmin}
                      />
                    </div>
                  </div>
                </div>

                {isAdmin && (
                  <div className="form-actions">
                    <button onClick={handleSaveAdvanced} disabled={saving} className="btn btn-primary">
                      {saving ? <><span className="btn-spinner" /> Saving...</> : '💾 Save HR Rules'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {saveStatus === 'success' && (
          <div className="status-toast status-success">✅ Changes saved successfully!</div>
        )}
        {saveStatus === 'error' && (
          <div className="status-toast status-error">❌ Failed to save. Please check your data.</div>
        )}
      </div>
    </>
  );
}

const settingsStyles = `
  .settings-page {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 10px 60px;
    position: relative;
  }
  .settings-header { margin-bottom: 32px; }
  .settings-title { font-size: 28px; font-weight: 800; color: var(--foreground); margin-bottom: 6px; }
  .settings-subtitle { font-size: 15px; color: var(--muted-foreground); }
  
  .settings-layout { display: flex; flex-direction: column; gap: 24px; }

  .settings-nav {
    display: flex; flex-direction: row; gap: 8px; width: calc(100% + 20px);
    margin: 0 -10px; padding: 10px 10px 4px;
    overflow-x: auto; border-bottom: 1px solid var(--border);
    position: sticky; top: -1px; 
    background: var(--background); 
    z-index: 100;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: all 0.3s ease;
  }
  .settings-nav-btn {
    display: flex; align-items: center; gap: 10px; padding: 10px 20px; border-radius: 12px;
    border: 1px solid transparent; background: transparent; color: var(--muted-foreground);
    font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; white-space: nowrap;
  }
  .settings-nav-btn:hover { background: var(--muted); color: var(--foreground); }
  .settings-nav-btn-active { 
    background: var(--primary); color: white; border-color: var(--primary); 
    box-shadow: 0 4px 12px rgba(8,131,149,0.2);
    font-weight: 700;
  }

  .settings-content { flex: 1; min-width: 0; width: 100%; }
  .settings-section {
    background: var(--card); border: 1px solid var(--border); border-radius: 24px;
    padding: 32px; display: flex; flex-direction: column; gap: 28px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.02);
  }

  .section-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 20px; }
  .section-title { font-size: 20px; font-weight: 800; color: var(--foreground); margin: 0 0 6px; }
  .section-desc { font-size: 14px; color: var(--muted-foreground); line-height: 1.6; margin: 0; }

  .form-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px; }
  @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }

  .form-group { display: flex; flex-direction: column; gap: 8px; }
  .form-label { font-size: 13.5px; font-weight: 700; color: var(--foreground); }
  .form-input, .form-select, .form-textarea {
    padding: 12px 16px; border-radius: 12px; border: 1.5px solid var(--border);
    background: var(--muted); color: var(--foreground); font-size: 14.5px; outline: none;
    transition: all 0.2s; font-family: inherit;
  }
  .form-input:focus, .form-select:focus, .form-textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 4px rgba(8,131,149,0.1); background: var(--card); }
  .form-input:disabled { opacity: 0.6; cursor: not-allowed; }
  .form-help { font-size: 12px; color: var(--muted-foreground); margin-top: 4px; }

  .settings-subgroup { border-top: 1px solid var(--border); padding-top: 24px; margin-top: 8px; }
  .subgroup-title { font-size: 15px; font-weight: 700; color: var(--foreground); margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; opacity: 0.8; }

  /* Toggles */
  .toggle-list { display: flex; flex-direction: column; gap: 16px; }
  .toggle-item { display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 12px 0; }
  .toggle-name { font-size: 15px; font-weight: 700; color: var(--foreground); margin-bottom: 2px; }
  .toggle-desc { font-size: 13px; color: var(--muted-foreground); }
  .toggle-track { width: 48px; height: 26px; border-radius: 13px; background: var(--border); position: relative; cursor: pointer; transition: 0.2s; }
  .toggle-on { background: var(--primary); }
  .toggle-thumb { position: absolute; width: 20px; height: 20px; border-radius: 50%; background: white; top: 3px; left: 3px; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
  .toggle-on .toggle-thumb { left: 25px; }

  /* Provider Card */
  .provider-grid { 
    display: grid; 
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
    gap: 16px; 
  }
  .provider-card {
    display: flex; flex-direction: column; align-items: flex-start; gap: 12px; padding: 24px; border-radius: 20px;
    border: 2px solid var(--border); background: var(--muted); cursor: pointer; text-align: left; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .provider-card:hover { transform: translateY(-2px); border-color: var(--primary); background: var(--card); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
  .provider-card-active { border-color: var(--primary); background: var(--card); box-shadow: 0 10px 25px rgba(8,131,149,0.1); }
  .provider-card-active .provider-name { color: var(--primary); }
  .provider-icon { font-size: 24px; }
  .provider-name { font-size: 15px; font-weight: 700; color: var(--foreground); }
  .provider-desc { font-size: 12.5px; color: var(--muted-foreground); }

  .input-with-action { display: flex; gap: 10px; }
  .input-action-btn { padding: 0 16px; border-radius: 12px; border: 1.5px solid var(--border); background: var(--muted); cursor: pointer; font-size: 18px; }

  .form-actions { display: flex; gap: 16px; margin-top: 10px; }
  .btn {
    display: inline-flex; align-items: center; gap: 10px; padding: 12px 24px; border-radius: 14px;
    font-size: 15px; font-weight: 700; cursor: pointer; border: none; transition: 0.2s;
  }
  .btn-primary { background: var(--primary); color: white; box-shadow: 0 4px 14px rgba(8,131,149,0.3); }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(8,131,149,0.4); }
  .btn-outline { background: var(--muted); border: 1.5px solid var(--border); color: var(--foreground); }

  .test-result { margin-top: 16px; padding: 16px; border-radius: 12px; font-size: 14px; background: var(--muted); border: 1px solid var(--border); }
  .test-result-success { border-color: #22c55e; color: #166534; background: #f0fdf4; }
  .test-result-error { border-color: #ef4444; color: #991b1b; background: #fef2f2; }

  .status-toast {
    position: fixed; bottom: 30px; right: 30px; padding: 16px 24px; border-radius: 16px;
    font-weight: 700; font-size: 15px; box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease-out; z-index: 1000;
  }
  .status-success { background: #15803d; color: white; }
  .status-error { background: #b91c1c; color: white; }

  @keyframes slideIn { from { transform: translateY(100px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes spin { to { transform: rotate(360deg); } }
  .btn-spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  
  .settings-loading { display: flex; align-items: center; gap: 16px; padding: 60px; justify-content: center; color: var(--muted-foreground); }
  .loading-spinner { width: 24px; height: 24px; border: 3px solid var(--border); border-top-color: var(--primary); border-radius: 50%; animation: spin 0.7s linear infinite; }
`;
