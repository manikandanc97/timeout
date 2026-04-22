import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import { callAI } from '../src/services/aiProviderService.js';

// Mocking various AI SDKs
vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      startChat: vi.fn().mockReturnValue({
        sendMessage: vi.fn().mockResolvedValue({
          response: { text: () => 'Gemini Response' }
        })
      })
    })
  }))
}));

vi.mock('openai', () => {
  const mockOpenAI = vi.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{ message: { content: 'OpenAI Response' } }]
        })
      }
    }
  }));
  return { OpenAI: mockOpenAI };
});

vi.mock('@anthropic-ai/sdk', () => ({
  Anthropic: vi.fn().mockImplementation(() => ({
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ text: 'Claude Response' }]
      })
    }
  }))
}));

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ message: { content: 'Ollama Response' } })
});

describe('aiProviderService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('callAI', () => {
    it('should use gemini provider if configured', async () => {
      mockPrisma.aiSettings.findUnique.mockResolvedValue({
        provider: 'gemini',
        apiKey: 'gemini-key',
        model: 'gemini-1.5-flash',
        isEnabled: true
      });

      const response = await callAI({
        organizationId: 10,
        messages: [{ role: 'user', content: 'Hi' }],
        systemPrompt: 'You are helpful'
      });

      expect(response).toBe('Gemini Response');
    });

    it('should use openai provider if configured', async () => {
      mockPrisma.aiSettings.findUnique.mockResolvedValue({
        provider: 'openai',
        apiKey: 'openai-key',
        isEnabled: true
      });

      const response = await callAI({
        organizationId: 10,
        messages: [{ role: 'user', content: 'Hi' }],
        systemPrompt: 'You are helpful'
      });

      expect(response).toBe('OpenAI Response');
    });

    it('should use anthropic provider if configured', async () => {
      mockPrisma.aiSettings.findUnique.mockResolvedValue({
        provider: 'anthropic',
        apiKey: 'anthropic-key',
        isEnabled: true
      });

      const response = await callAI({
        organizationId: 10,
        messages: [{ role: 'user', content: 'Hi' }],
        systemPrompt: 'You are helpful'
      });

      expect(response).toBe('Claude Response');
    });

    it('should fallback to demo mode if no settings found', async () => {
      mockPrisma.aiSettings.findUnique.mockResolvedValue(null);

      const response = await callAI({
        organizationId: 10,
        messages: [{ role: 'user', content: 'Hi' }],
        userMessage: 'test message'
      });

      expect(response).toContain('{'); // Should return JSON in demo mode
    });

    it('should fallback to demo mode if provider is demo', async () => {
      mockPrisma.aiSettings.findUnique.mockResolvedValue({ provider: 'demo', isEnabled: true });

      const response = await callAI({
        organizationId: 10,
        messages: [{ role: 'user', content: 'Hi' }],
        userMessage: 'Apply leave tomorrow'
      });

      expect(response).toContain('APPLY_LEAVE');
    });
  });
});
