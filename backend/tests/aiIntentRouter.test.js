import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildSystemPrompt, parseAIResponse, routeIntent } from '../src/services/aiIntentRouter.js';
import * as aiProviderService from '../src/services/aiProviderService.js';
import * as aiVectorService from '../src/services/aiVectorService.js';

vi.mock('../src/services/aiProviderService.js', () => ({
  callAI: vi.fn(),
}));

vi.mock('../src/services/aiVectorService.js', () => ({
  getEmbedding: vi.fn().mockResolvedValue([0.1, 0.2]),
  searchSimilarChunks: vi.fn().mockResolvedValue([{ content: 'Company policy: No work on Sundays.' }]),
}));

describe('aiIntentRouter', () => {
  const mockUser = {
    id: 1,
    name: 'Bob',
    role: 'EMPLOYEE',
    organizationId: 10
  };

  describe('buildSystemPrompt', () => {
    it('should include user role and name in the prompt', () => {
      const prompt = buildSystemPrompt(mockUser);
      expect(prompt).toContain('Bob');
      expect(prompt).toContain('Employee');
    });

    it('should include RAG context if provided', () => {
      const prompt = buildSystemPrompt(mockUser, 'HR Policy: 12 days leave.');
      expect(prompt).toContain('HR Policy: 12 days leave.');
    });
  });

  describe('parseAIResponse', () => {
    it('should parse valid JSON from AI', () => {
      const raw = '{"intent": "APPLY_LEAVE", "response": "Sure"}';
      const parsed = parseAIResponse(raw);
      expect(parsed.intent).toBe('APPLY_LEAVE');
    });

    it('should handle markdown code blocks', () => {
      const raw = '```json\n{"intent": "APPLY_LEAVE"}\n```';
      const parsed = parseAIResponse(raw);
      expect(parsed.intent).toBe('APPLY_LEAVE');
    });

    it('should fallback to plain text if JSON fails', () => {
      const raw = 'Hello world';
      const parsed = parseAIResponse(raw);
      expect(parsed.response).toBe('Hello world');
      expect(parsed.intent).toBe(null);
    });
  });

  describe('routeIntent', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should perform RAG search for questions', async () => {
      aiProviderService.callAI.mockResolvedValue('{"intent": null, "response": "Found policy."}');
      
      await routeIntent({
        user: mockUser,
        message: 'What is the leave policy?',
        session: { history: [] }
      });

      expect(aiVectorService.getEmbedding).toHaveBeenCalledWith(10, 'What is the leave policy?');
      expect(aiVectorService.searchSimilarChunks).toHaveBeenCalled();
    });

    it('should block actions if user role has no permission', async () => {
      // Intent was ADD_EMPLOYEE but user is EMPLOYEE
      aiProviderService.callAI.mockResolvedValue('{"intent": "ADD_EMPLOYEE", "response": "Adding student"}');
      
      const result = await routeIntent({
        user: mockUser,
        message: 'Add John Smith',
        session: { history: [] }
      });

      expect(result.intent).toBe(null);
      expect(result.response).toContain("doesn't have permission");
    });

    it('should include collection context if in COLLECTING phase', async () => {
      aiProviderService.callAI.mockResolvedValue('{"intent": "APPLY_LEAVE", "response": "Need end date"}');
      
      await routeIntent({
        user: mockUser,
        message: '2024-05-01',
        session: {
          phase: 'COLLECTING',
          intent: 'APPLY_LEAVE',
          collectedFields: { startDate: '2024-05-01' },
          history: []
        }
      });

      const callArgs = aiProviderService.callAI.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('[CONTEXT: User is continuing');
    });
  });
});
