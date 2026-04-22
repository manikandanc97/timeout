import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import * as aiController from '../src/controllers/aiController.js';
import * as aiDocumentService from '../src/services/aiDocumentService.js';
import * as aiAuditService from '../src/services/aiAuditService.js';
import * as aiProviderService from '../src/services/aiProviderService.js';
import * as otpService from '../src/services/otpService.js';
import * as aiConversationStore from '../src/services/aiConversationStore.js';
import * as aiIntentRouter from '../src/services/aiIntentRouter.js';
import * as aiActionExecutor from '../src/services/aiActionExecutor.js';

// Mock AI Services
vi.mock('../src/services/aiConversationStore.js', () => ({
  getSession: vi.fn(() => ({})),
  updateSession: vi.fn(),
  resetSession: vi.fn(),
  pushHistory: vi.fn(),
}));

vi.mock('../src/services/aiIntentRouter.js', () => ({
  routeIntent: vi.fn().mockResolvedValue({
    intent: 'GENERAL_HR_FAQ',
    response: 'Hello!',
    action: null,
    missingFields: [],
  }),
  buildSystemPrompt: vi.fn().mockReturnValue('system prompt'),
}));

vi.mock('../src/services/aiActionExecutor.js', () => ({
  executeAction: vi.fn().mockResolvedValue({ success: true, data: { message: 'Success' } }),
}));

vi.mock('../src/services/aiAuditService.js', () => ({
  logAIAction: vi.fn().mockResolvedValue(undefined),
  getAuditLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
}));

vi.mock('../src/services/aiProviderService.js', () => ({
  getAiSettings: vi.fn().mockResolvedValue({ provider: 'demo', isEnabled: true }),
  callAI: vi.fn().mockResolvedValue('AI Response'),
}));

vi.mock('../src/services/otpService.js', () => ({
  generateAndSendOTP: vi.fn().mockResolvedValue(true),
  verifyOTP: vi.fn().mockResolvedValue({ valid: true }),
}));

vi.mock('../src/services/aiDocumentService.js', () => ({
  reindexAllPolicies: vi.fn().mockResolvedValue(undefined),
}));

describe('aiController', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { user: { id: 1, organizationId: 10, role: 'EMPLOYEE' }, body: {}, query: {}, params: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    mockPrisma.user.findUnique.mockResolvedValue({ id: 1, organizationId: 10, role: 'EMPLOYEE', name: 'Bob', email: 'bob@test.com' });
  });

  describe('handleChat', () => {
    it('should return 400 if sessionId is missing', async () => {
      req.body = { message: 'hello' };
      await aiController.handleChat(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'sessionId is required' });
    });

    it('should handle cancel properly', async () => {
      req.body = { sessionId: 'sid1', cancel: true };
      vi.mocked(aiConversationStore.getSession).mockReturnValue({ intent: 'APPLY_LEAVE', collectedFields: {} });
      
      await aiController.handleChat(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        phase: 'IDLE',
        response: expect.stringContaining('cancelled'),
      }));
    });

    it('should handle confirmation and execute action', async () => {
      req.body = { sessionId: 'sid1', confirm: true };
      vi.mocked(aiConversationStore.getSession).mockReturnValue({
        phase: 'AWAITING_CONFIRMATION',
        intent: 'APPLY_LEAVE',
        collectedFields: { leaveType: 'ANNUAL' }
      });

      await aiController.handleChat(req, res);

      expect(aiActionExecutor.executeAction).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        phase: 'DONE',
      }));
    });

    it('should handle intent routing for regular messages', async () => {
      req.body = { sessionId: 'sid1', message: 'I want to apply for leave' };
      
      await aiController.handleChat(req, res);

      expect(aiIntentRouter.routeIntent).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        response: 'Hello!',
      }));
    });

    it('should handle OTP verification', async () => {
      req.user.role = 'ADMIN';
      mockPrisma.user.findUnique.mockResolvedValue({ id: 1, organizationId: 10, role: 'ADMIN', name: 'Admin', email: 'admin@test.com' });
      
      req.body = { sessionId: 'sid1', confirm: true, otp: '123456' };
      vi.mocked(aiConversationStore.getSession).mockReturnValue({
        phase: 'AWAITING_OTP',
        intent: 'DELETE_EMPLOYEE', // Sensitive action
        collectedFields: { employeeId: 2 }
      });
      vi.mocked(otpService.verifyOTP).mockResolvedValue({ valid: true });

      await aiController.handleChat(req, res);

      expect(otpService.verifyOTP).toHaveBeenCalledWith(1, '123456');
      expect(aiActionExecutor.executeAction).toHaveBeenCalled();
    });

    it('should handle knowledge queries without confirmation', async () => {
      req.body = { sessionId: 'sid1', message: 'What is the leave policy?' };
      vi.mocked(aiIntentRouter.routeIntent).mockResolvedValue({
        intent: 'LEAVE_POLICY_FAQ',
        action: 'LEAVE_POLICY_FAQ',
        response: 'Here is the policy...',
        missingFields: []
      });

      await aiController.handleChat(req, res);

      expect(aiActionExecutor.executeAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'LEAVE_POLICY_FAQ' }));
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ phase: 'DONE' }));
    });
  });

  describe('getSettings', () => {
    it('should return safe settings (masking apiKey)', async () => {
      vi.mocked(aiProviderService.getAiSettings).mockResolvedValue({ provider: 'gemini', apiKey: 'secret-key-1234567890' });

      await aiController.getSettings(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        settings: expect.objectContaining({
          apiKey: expect.stringContaining('*'),
          hasKey: true
        })
      }));
    });
  });

  describe('updateSettings', () => {
    it('should block non-admins from updating settings', async () => {
      req.user.role = 'MANAGER';
      await aiController.updateSettings(req, res);
      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should upsert settings if admin', async () => {
      req.user.role = 'ADMIN';
      req.body = { provider: 'gemini', isEnabled: true };
      mockPrisma.aiSettings.upsert.mockResolvedValue({ provider: 'gemini', organizationId: 10 });

      await aiController.updateSettings(req, res);

      expect(mockPrisma.aiSettings.upsert).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'AI settings updated successfully'
      }));
    });

    it('should not update apiKey if only stars are provided', async () => {
      req.user.role = 'ADMIN';
      req.body = { provider: 'gemini', apiKey: '**********' };
      mockPrisma.aiSettings.upsert.mockResolvedValue({ provider: 'gemini' });

      await aiController.updateSettings(req, res);

      expect(mockPrisma.aiSettings.upsert).toHaveBeenCalledWith(expect.objectContaining({
        update: expect.not.objectContaining({ apiKey: expect.any(String) })
      }));
    });
  });

  describe('reindexKnowledgeBase', () => {
    it('should trigger re-indexing in background', async () => {
      req.user.role = 'ADMIN';
      await aiController.reindexKnowledgeBase(req, res);
      // Background call doesn't need to be awaited or spied on if non-deterministic path
      // But we check response at least
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining('started') }));
    });
  });

  describe('testAI', () => {
    it('should call callAI service', async () => {
        req.user.role = 'ADMIN';
        await aiController.testAI(req, res);
        expect(aiProviderService.callAI).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });
  });

  describe('getAuditLogsController', () => {
    it('should return audit logs from service', async () => {
        req.user.role = 'ADMIN';
        vi.mocked(aiAuditService.getAuditLogs).mockResolvedValue({ logs: [{ id: 1 }], total: 1 });
        
        await aiController.getAuditLogsController(req, res);
        expect(aiAuditService.getAuditLogs).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ total: 1 }));
    });
  });

  describe('helpers', () => {
    it('should generate correct suggestions based on role', async () => {
      req.body = { sessionId: 'sid1', cancel: true };
      vi.mocked(aiConversationStore.getSession).mockReturnValue({});
      
      await aiController.handleChat(req, res);
      const result = res.json.mock.calls[0][0];
      expect(result.suggestions).toContain('Leave Balance');
    });
  });
});
