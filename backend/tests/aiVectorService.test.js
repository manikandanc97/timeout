import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';

vi.mock('../src/services/aiProviderService.js', () => ({
  getAiSettings: vi.fn(),
}));

vi.mock('@google/generative-ai', () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      embedContent: vi.fn().mockResolvedValue({
        embedding: { values: [0.1, 0.2, 0.3] }
      })
    })
  }))
}));

vi.mock('openai', () => {
  const mockOpenAI = vi.fn().mockImplementation(() => ({
    embeddings: {
      create: vi.fn().mockResolvedValue({
        data: [{ embedding: [0.4, 0.5, 0.6] }]
      })
    }
  }));
  return { OpenAI: mockOpenAI };
});

describe('aiVectorService', () => {
  let aiVectorService;

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    // Re-import to reset internal state (_isVectorSupported)
    aiVectorService = await import('../src/services/aiVectorService.js');
  });

  describe('getEmbedding', () => {
    it('should return empty array for demo provider', async () => {
      const { getAiSettings } = await import('../src/services/aiProviderService.js');
      getAiSettings.mockResolvedValue({ provider: 'demo' });
      const emb = await aiVectorService.getEmbedding(10, 'hello');
      expect(emb).toEqual([]);
    });

    it('should fetch embedding from gemini', async () => {
      const { getAiSettings } = await import('../src/services/aiProviderService.js');
      getAiSettings.mockResolvedValue({ provider: 'gemini', apiKey: 'key' });
      const emb = await aiVectorService.getEmbedding(10, 'hello');
      expect(emb).toEqual([0.1, 0.2, 0.3]);
    });

    it('should fetch embedding from openai', async () => {
      const { getAiSettings } = await import('../src/services/aiProviderService.js');
      getAiSettings.mockResolvedValue({ provider: 'openai', apiKey: 'key' });
      const emb = await aiVectorService.getEmbedding(10, 'hello');
      expect(emb).toEqual([0.4, 0.5, 0.6]);
    });
  });

  describe('searchSimilarChunks', () => {
    it('should fallback to keyword search if vector is not supported', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('vector type does not exist'));
      mockPrisma.hrDocumentChunk.findMany.mockResolvedValue([{ id: 1, content: 'Fallback' }]);

      const results = await aiVectorService.searchSimilarChunks(10, [0.1], 5, 'search text');

      expect(results).toHaveLength(1);
      expect(results[0].content).toBe('Fallback');
      expect(mockPrisma.hrDocumentChunk.findMany).toHaveBeenCalled();
    });

    it('should use vector search if supported', async () => {
      // First call success for checkVectorSupport
      mockPrisma.$queryRaw.mockResolvedValue([{ ok: true }]); 
      mockPrisma.$queryRawUnsafe.mockResolvedValue([{ id: 1, content: 'Vector Result' }]);

      const results = await aiVectorService.searchSimilarChunks(10, [0.1], 5, 'search text');

      expect(results[0].content).toBe('Vector Result');
      expect(mockPrisma.$queryRawUnsafe).toHaveBeenCalled();
    });
  });

  describe('storeChunk', () => {
    it('should use executeRawUnsafe if vector is supported', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ ok: true }]);
      const { getAiSettings } = await import('../src/services/aiProviderService.js');
      getAiSettings.mockResolvedValue({ provider: 'openai', apiKey: 'key' });
      mockPrisma.$executeRawUnsafe.mockResolvedValue({});

      await aiVectorService.storeChunk({
        organizationId: 10,
        hrPolicyId: 1,
        content: 'policy content',
        metadata: {}
      });

      expect(mockPrisma.$executeRawUnsafe).toHaveBeenCalled();
    });

    it('should use create if vector is not supported', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('no vector'));
      mockPrisma.hrDocumentChunk.create.mockResolvedValue({});

      await aiVectorService.storeChunk({
        organizationId: 10,
        hrPolicyId: 1,
        content: 'policy content',
        metadata: {}
      });

      expect(mockPrisma.hrDocumentChunk.create).toHaveBeenCalled();
    });
  });
});
