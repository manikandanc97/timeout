import { describe, it, expect, vi, beforeEach } from 'vitest';
import './prismaMock.js';
import { mockPrisma } from './prismaMock.js';
import { ingestPolicy, reindexAllPolicies } from '../src/services/aiDocumentService.js';
import * as aiVectorService from '../src/services/aiVectorService.js';

vi.mock('../src/services/aiVectorService.js', () => ({
  storeChunk: vi.fn().mockResolvedValue(undefined),
}));

describe('aiDocumentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ingestPolicy', () => {
    it('should throw error if policy is not found', async () => {
      mockPrisma.hrPolicy.findUnique.mockResolvedValue(null);
      await expect(ingestPolicy(10, 1)).rejects.toThrow('Policy not found');
    });

    it('should split long policy text into chunks and store them', async () => {
      const longContent = 'A'.repeat(2500); // Should result in at least 2-3 chunks with 1000 size
      mockPrisma.hrPolicy.findUnique.mockResolvedValue({
        id: 1,
        title: 'Long Policy',
        category: 'Test',
        content: longContent
      });

      await ingestPolicy(10, 1);

      expect(aiVectorService.storeChunk).toHaveBeenCalled();
      const callCount = vi.mocked(aiVectorService.storeChunk).mock.calls.length;
      expect(callCount).toBeGreaterThan(1);
    });
  });

  describe('reindexAllPolicies', () => {
    it('should delete existing chunks and ingest all policies for organization', async () => {
      mockPrisma.hrDocumentChunk.deleteMany.mockResolvedValue({ count: 5 });
      mockPrisma.hrPolicy.findMany.mockResolvedValue([
        { id: 1, title: 'P1', content: 'C1'.repeat(100) },
        { id: 2, title: 'P2', content: 'C2'.repeat(100) }
      ]);
      mockPrisma.hrPolicy.findUnique.mockImplementation(async ({ where }) => {
          return { id: where.id, title: 'P'+where.id, content: 'Content'.repeat(50) };
      });

      await reindexAllPolicies(10);

      expect(mockPrisma.hrDocumentChunk.deleteMany).toHaveBeenCalledWith({
        where: { organizationId: 10 }
      });
      expect(aiVectorService.storeChunk).toHaveBeenCalled();
    });
  });
});
