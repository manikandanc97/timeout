/**
 * AI Controller
 * Handles: POST /api/ai/chat, GET/PUT /api/ai/settings, GET /api/ai/audit-logs
 */

import prisma from '../prismaClient.js';
import {
  getSession,
  updateSession,
  resetSession,
  pushHistory,
} from '../services/aiConversationStore.js';
import { routeIntent } from '../services/aiIntentRouter.js';
import { executeAction } from '../services/aiActionExecutor.js';
import { logAIAction, getAuditLogs } from '../services/aiAuditService.js';
import {
  canPerformAction,
  ACTION_REQUIRED_FIELDS,
  CONFIRMATION_REQUIRED_ACTIONS,
  SENSITIVE_ACTIONS,
} from '../config/aiPermissions.js';
import { getAiSettings } from '../services/aiProviderService.js';
import { generateAndSendOTP, verifyOTP } from '../services/otpService.js';
import { logger } from '../services/loggerService.js';

// ─── Helper: Get full user from DB ──────────────────────────────────────────
async function getFullUser(authUser) {
  const dbUser = await prisma.user.findUnique({
    where: { id: authUser.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      gender: true,
      organizationId: true,
      designation: true,
    },
  });

  if (!dbUser) throw new Error('User not found');
  return dbUser;
}

// ─── POST /api/ai/chat ───────────────────────────────────────────────────────

export const handleChat = async (req, res) => {
  try {
    const { message, sessionId, confirm, cancel } = req.body;

    if (!sessionId) {
      return res.status(400).json({ message: 'sessionId is required' });
    }

    const user = await getFullUser(req.user);
    const session = getSession(sessionId);

    // ── Handle cancel ──────────────────────────────────────────────────────
    if (cancel) {
      resetSession(sessionId);
      await logAIAction({
        organizationId: user.organizationId,
        userId: user.id,
        userName: user.name,
        userRole: user.role,
        intent: session.intent || 'UNKNOWN',
        action: 'Action cancelled by user',
        payload: session.collectedFields,
        status: 'CANCELLED',
      });
      return res.json({
        response: '❌ Action cancelled. How else can I help you?',
        phase: 'IDLE',
        suggestions: getRoleSuggestions(user.role),
      });
    }

    // ── Handle confirmation / OTP ─────────────────────────────────────────
    if (confirm && (session.phase === 'AWAITING_CONFIRMATION' || session.phase === 'AWAITING_OTP')) {
      const { intent, collectedFields } = session;

      // Final permission check before execution
      if (!canPerformAction(user.role, intent)) {
        resetSession(sessionId);
        return res.json({
          response: '⛔ Permission denied. You are not authorized to perform this action.',
          phase: 'IDLE',
        });
      }

      updateSession(sessionId, { phase: 'EXECUTING' });

      // Check if this action required OTP and we're actually in OTP phase
      if (SENSITIVE_ACTIONS.has(intent) && session.phase === 'AWAITING_OTP') {
        const { otp } = req.body;
        if (!otp) return res.status(400).json({ message: 'OTP is required for this action' });
        
        const v = await verifyOTP(user.id, otp);
        if (!v.valid) {
          updateSession(sessionId, { phase: 'AWAITING_OTP' });
          return res.json({ response: `❌ ${v.message}`, phase: 'AWAITING_OTP' });
        }
      }

      const result = await executeAction({
        action: intent,
        user,
        fields: collectedFields,
      });

      resetSession(sessionId);

      if (result.success) {
        const successMsg = buildSuccessMessage(intent, result.data);
        return res.json({
          response: successMsg,
          phase: 'DONE',
          actionResult: result.data,
          suggestions: getRoleSuggestions(user.role),
        });
      } else {
        return res.json({
          response: `⚠️ Action failed: ${result.data?.message || 'Unknown error'}. Please try again or contact HR.`,
          phase: 'ERROR',
          suggestions: getRoleSuggestions(user.role),
        });
      }
    }

    // ── Handle OTP request ──────────────────────────────────────────────────
    if (confirm && session.phase === 'AWAITING_CONFIRMATION' && SENSITIVE_ACTIONS.has(session.intent)) {
       await generateAndSendOTP({
         userId: user.id,
         organizationId: user.organizationId,
         email: user.email,
         action: session.intent
       });
       updateSession(sessionId, { phase: 'AWAITING_OTP' });
       return res.json({
         response: "🔐 For security, I've sent a 6-digit verification code to your email. Please enter it below to proceed.",
         phase: 'AWAITING_OTP',
         intent: session.intent
       });
    }

    // ── Normal message handling ────────────────────────────────────────────
    if (!message || !String(message).trim()) {
      return res.status(400).json({ message: 'message is required' });
    }

    const userMessage = String(message).trim();
    pushHistory(sessionId, 'user', userMessage);

    // Route intent through AI
    const aiResponse = await routeIntent({
      user,
      message: userMessage,
      session,
    });

    pushHistory(sessionId, 'assistant', aiResponse.response || '');

    // Update session with any newly collected data
    const newCollected = {
      ...(session.collectedFields || {}),
      ...(aiResponse.collectedData || {}),
    };

    // If we have an intent, check required fields
    const currentIntent = aiResponse.intent || session.intent;
    const requiredFields = ACTION_REQUIRED_FIELDS[currentIntent] || [];
    const missingFields = aiResponse.missingFields?.length > 0
      ? aiResponse.missingFields
      : requiredFields.filter((f) => !newCollected[f]);

    // Determine next phase
    let nextPhase = session.phase;

    if (currentIntent && missingFields.length > 0) {
      // Still collecting fields
      nextPhase = 'COLLECTING';
      updateSession(sessionId, {
        phase: 'COLLECTING',
        intent: currentIntent,
        collectedFields: newCollected,
        missingFields,
      });

      return res.json({
        response: aiResponse.response,
        phase: 'COLLECTING',
        intent: currentIntent,
        missingFields,
        collectedFields: newCollected,
      });
    }

    // All fields collected — check if action is ready
    if (aiResponse.action && currentIntent && missingFields.length === 0) {
      const actionIntent = aiResponse.action;

      // For knowledge queries, execute immediately without confirmation
      const isKnowledgeQuery = [
        'LEAVE_POLICY_FAQ', 'ATTENDANCE_POLICY_FAQ', 'PAYROLL_FAQ',
        'HOLIDAY_LIST', 'GENERAL_HR_FAQ', 'CHECK_LEAVE_BALANCE',
        'VIEW_MY_LEAVES', 'VIEW_PENDING_REQUESTS', 'VIEW_TEAM_SUMMARY',
        'VIEW_PAYROLL_SUMMARY', 'VIEW_PAYSLIP',
      ].includes(actionIntent);

      if (isKnowledgeQuery || !CONFIRMATION_REQUIRED_ACTIONS.has(actionIntent)) {
        // Execute directly
        const result = await executeAction({
          action: actionIntent,
          user,
          fields: newCollected,
        });
        resetSession(sessionId);

        const dataResponse = buildDataResponse(actionIntent, result.data);
        return res.json({
          response: dataResponse.text || aiResponse.response,
          phase: 'DONE',
          actionResult: result.data,
          dataType: dataResponse.type,
          suggestions: getRoleSuggestions(user.role),
        });
      }

      // Requires confirmation — show preview
      updateSession(sessionId, {
        phase: 'AWAITING_CONFIRMATION',
        intent: actionIntent,
        collectedFields: newCollected,
        pendingAction: actionIntent,
      });

      return res.json({
        response: aiResponse.response,
        phase: 'AWAITING_CONFIRMATION',
        intent: actionIntent,
        collectedFields: newCollected,
        confirmationMessage: buildConfirmationMessage(actionIntent, newCollected),
      });
    }

    // Pure knowledge / FAQ response — no action needed
    if (session.phase === 'COLLECTING') {
      // User may be providing field value
      updateSession(sessionId, {
        collectedFields: newCollected,
      });
    } else {
      updateSession(sessionId, {
        phase: currentIntent ? 'COLLECTING' : 'IDLE',
        intent: currentIntent || null,
        collectedFields: newCollected,
      });
    }

    return res.json({
      response: aiResponse.response,
      phase: currentIntent ? 'COLLECTING' : 'IDLE',
      intent: currentIntent,
      missingFields: missingFields,
      collectedFields: newCollected,
      suggestions: !currentIntent ? getRoleSuggestions(user.role) : undefined,
    });
  } catch (err) {
    console.error('[AI Chat] Error:', err);
    return res.status(500).json({
      response: '⚠️ I encountered an error. Please try again.',
      phase: 'ERROR',
    });
  }
};

// ─── GET /api/ai/settings ────────────────────────────────────────────────────

export const getSettings = async (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    const settings = await getAiSettings(organizationId);

    // Never expose the raw API key to the frontend
    const safeSettings = {
      ...settings,
      apiKey: settings.apiKey ? '*'.repeat(Math.min(settings.apiKey.length, 20)) : '',
      hasKey: Boolean(settings.apiKey),
    };

    return res.json({ settings: safeSettings });
  } catch (err) {
    console.error('[AI Settings GET]', err);
    return res.status(500).json({ message: 'Failed to load AI settings' });
  }
};

// ─── PUT /api/ai/settings ────────────────────────────────────────────────────

export const updateSettings = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can update AI settings' });
    }

    const organizationId = req.user.organizationId;
    const { provider, model, apiKey, baseUrl, systemPrompt, isEnabled } = req.body;

    // Validate provider
    const validProviders = ['demo', 'gemini', 'openai', 'anthropic', 'groq', 'ollama'];
    if (provider && !validProviders.includes(provider)) {
      return res.status(400).json({ message: 'Invalid provider. Supported: demo, gemini, openai, anthropic, groq, ollama.' });
    }

    // Build update data — don't clear apiKey if not provided (stars placeholder)
    const updateData = {
      ...(provider !== undefined ? { provider } : {}),
      ...(model !== undefined ? { model } : {}),
      ...(baseUrl !== undefined ? { baseUrl } : {}),
      ...(systemPrompt !== undefined ? { systemPrompt } : {}),
      ...(isEnabled !== undefined ? { isEnabled: Boolean(isEnabled) } : {}),
    };

    // Only update apiKey if it's provided and not just placeholder stars
    if (apiKey && !apiKey.match(/^\*+$/)) {
      updateData.apiKey = apiKey;
    }

    const settings = await prisma.aiSettings.upsert({
      where: { organizationId },
      update: updateData,
      create: {
        organizationId,
        provider: provider || 'demo',
        model: model || null,
        apiKey: apiKey && !apiKey.match(/^\*+$/) ? apiKey : null,
        baseUrl: baseUrl || null,
        systemPrompt: systemPrompt || null,
        isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      },
    });

    await logAIAction({
      organizationId,
      userId: req.user.id,
      userName: req.user.name || 'Admin',
      userRole: req.user.role,
      intent: 'UPDATE_AI_SETTINGS',
      action: 'AI Settings updated',
      payload: { provider, model, hasKey: Boolean(updateData.apiKey) },
      status: 'SUCCESS',
    });

    return res.json({
      message: 'AI settings updated successfully',
      settings: { ...settings, apiKey: undefined, hasKey: Boolean(settings.apiKey) },
    });
  } catch (err) {
    console.error('[AI Settings PUT]', err);
    return res.status(500).json({ message: 'Failed to update AI settings' });
  }
};

// ─── POST /api/ai/settings/test ─────────────────────────────────────────────

export const testAI = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can test AI settings' });
    }

    const { callAI } = await import('../services/aiProviderService.js');
    const { buildSystemPrompt } = await import('../services/aiIntentRouter.js');

    const user = await getFullUser(req.user);
    const systemPrompt = buildSystemPrompt(user);

    const response = await callAI({
      organizationId: user.organizationId,
      systemPrompt,
      messages: [{ role: 'user', content: 'Hello! Please respond with a brief greeting to confirm you are working.' }],
      userMessage: 'Hello',
    });

    return res.json({ success: true, response });
  } catch (err) {
    console.error('[AI Test]', err);
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ─── GET /api/ai/audit-logs ──────────────────────────────────────────────────

export const getAuditLogsController = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can view audit logs' });
    }

    const { page, limit, intent, status, startDate, endDate } = req.query;

    const result = await getAuditLogs(req.user.organizationId, {
      page, limit, intent, status, startDate, endDate,
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to load audit logs' });
  }
};

// ─── POST /api/ai/knowledge/reindex ──────────────────────────────────────────

export const reindexKnowledgeBase = async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Only admins can perform re-indexing' });
    }

    const { reindexAllPolicies } = await import('../services/aiDocumentService.js');
    const { logAIAction } = await import('../services/aiAuditService.js');

    // Run in background to avoid timeout
    reindexAllPolicies(req.user.organizationId)
      .then(() => {
        logger.info(`[AI Knowledge] Re-indexing complete for org ${req.user.organizationId}`);
      })
      .catch((err) => {
        logger.error(`[AI Knowledge] Re-indexing failed for org ${req.user.organizationId}`, err);
      });

    await logAIAction({
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userName: req.user.name || 'Admin',
      userRole: req.user.role,
      intent: 'REINDEX_KNOWLEDGE_BASE',
      action: 'Triggered knowledge base re-indexing',
      status: 'SUCCESS',
    });

    return res.json({ message: 'Knowledge base re-indexing started in the background. This may take a few minutes.' });
  } catch (err) {
    console.error('[AI Knowledge reindex]', err);
    return res.status(500).json({ message: 'Failed to start re-indexing' });
  }
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getRoleSuggestions(role) {
  const base = ['Leave Balance', 'Holiday List', 'Leave Policy', 'Apply Leave'];
  const managerExtra = ['Pending Requests', 'Team Summary'];
  const adminExtra = ['Add Employee', 'Payroll Summary', 'AI Audit Logs'];

  if (role === 'ADMIN') return [...base, ...managerExtra, ...adminExtra];
  if (role === 'MANAGER') return [...base, ...managerExtra];
  return base;
}

function buildConfirmationMessage(intent, fields) {
  const messages = {
    APPLY_LEAVE: `Submit **${fields.leaveType}** leave from **${fields.startDate}** to **${fields.endDate}**\nReason: ${fields.reason}`,
    APPLY_PERMISSION: `Submit permission for **${fields.date}** from **${fields.startTime}** to **${fields.endTime}**\nReason: ${fields.reason}`,
    APPLY_COMP_OFF: `Submit comp-off credit for working on **${fields.workDate}**\nReason: ${fields.reason}`,
    ADD_EMPLOYEE: `Add new employee:\n• Name: **${fields.name}**\n• Email: ${fields.email}\n• Designation: ${fields.designation}\n• Joining: ${fields.joiningDate}`,
    DELETE_EMPLOYEE: `⚠️ **PERMANENTLY DELETE** employee ID **${fields.employeeId}**? This cannot be undone.`,
    DEACTIVATE_EMPLOYEE: `Deactivate employee ID **${fields.employeeId}**?`,
    REJECT_LEAVE: `Reject leave #**${fields.leaveId}**? Reason: ${fields.rejectionReason}`,
    REJECT_PERMISSION: `Reject permission #**${fields.permissionId}**?`,
    REJECT_COMP_OFF: `Reject comp-off #**${fields.compOffId}**?`,
    APPROVE_LEAVE: `Approve leave #**${fields.leaveId}**?`,
  };

  return messages[intent] || `Proceed with **${intent}**?`;
}

function buildSuccessMessage(intent, data) {
  const msgMap = {
    APPLY_LEAVE: '✅ Your leave has been submitted successfully! Your manager will review it shortly.',
    APPLY_PERMISSION: '✅ Permission request submitted! You will be notified of the decision.',
    APPLY_COMP_OFF: '✅ Comp-off credit request submitted for approval.',
    ADD_EMPLOYEE: `✅ New employee **${data?.employee?.name || 'employee'}** has been added successfully.`,
    APPROVE_LEAVE: '✅ Leave request approved. The employee has been notified.',
    REJECT_LEAVE: '✅ Leave request rejected.',
    APPROVE_PERMISSION: '✅ Permission request approved.',
    REJECT_PERMISSION: '✅ Permission request rejected.',
    APPROVE_COMP_OFF: '✅ Comp-off approved. 1 day credit added to the employee\'s balance.',
    REJECT_COMP_OFF: '✅ Comp-off request rejected.',
    DEACTIVATE_EMPLOYEE: '✅ Employee account deactivated.',
    ACTIVATE_EMPLOYEE: '✅ Employee account reactivated.',
    DELETE_EMPLOYEE: '✅ Employee permanently deleted.',
  };

  return data?.message || msgMap[intent] || '✅ Action completed successfully.';
}

function buildDataResponse(intent, data) {
  const typeMap = {
    CHECK_LEAVE_BALANCE: 'LEAVE_BALANCE',
    VIEW_MY_LEAVES: 'LEAVE_LIST',
    HOLIDAY_LIST: 'HOLIDAY_LIST',
    VIEW_PENDING_REQUESTS: 'PENDING_REQUESTS',
    VIEW_PAYROLL_SUMMARY: 'PAYROLL_SUMMARY',
    VIEW_PAYSLIP: 'PAYSLIP',
  };

  const textMap = {
    CHECK_LEAVE_BALANCE: '📊 Here is your current leave balance:',
    VIEW_MY_LEAVES: '📋 Here are your recent leave requests:',
    HOLIDAY_LIST: '🗓️ Here is the holiday calendar:',
    VIEW_PENDING_REQUESTS: '📬 Here are the pending requests:',
    VIEW_PAYROLL_SUMMARY: '💰 Payroll summary for this month:',
    VIEW_PAYSLIP: '📄 Here is your payslip:',
  };

  return {
    type: typeMap[intent] || 'TEXT',
    text: textMap[intent] || null,
  };
}
