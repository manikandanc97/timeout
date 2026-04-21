/**
 * AI Vector Service
 * Handles embeddings and similarity search using PostgreSQL with pgvector.
 */

import prisma from '../prismaClient.js';
import { getAiSettings } from './aiProviderService.js';

let _isVectorSupported = null;

/**
 * Check if the database supports pgvector.
 */
async function checkVectorSupport() {
  if (_isVectorSupported !== null) return _isVectorSupported;
  try {
    await prisma.$queryRaw`SELECT '[]'::vector;`;
    _isVectorSupported = true;
  } catch (err) {
    console.warn('[AI Vector] pgvector extension NOT detected. Falling back to basic keyword search.');
    _isVectorSupported = false;
  }
  return _isVectorSupported;
}

/**
 * Get embeddings for a text string using the configured provider.
 * @param {number} organizationId
 * @param {string} text
 * @returns {Promise<number[]>}
 */
export const getEmbedding = async (organizationId, text) => {
  const settings = await getAiSettings(organizationId);
  const provider = settings.provider || 'demo';

  if (provider === 'demo') return [];

  try {
    if (provider === 'gemini') {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(settings.apiKey);
      const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
      const result = await model.embedContent(text);
      return result.embedding.values;
    }

    if (provider === 'openai') {
      const { OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: settings.apiKey });
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });
      return response.data[0].embedding;
    }
  } catch (err) {
    console.error(`[AI Embedding] Failed to fetch embedding from ${provider}:`, err.message);
    return [];
  }

  return [];
};

/**
 * Perform vector similarity search with a keyword fallback.
 * @param {number} organizationId
 * @param {number[]} queryEmbedding
 * @param {number} limit
 * @param {string} originalQuery - The original text for keyword fallback
 * @returns {Promise<Array>}
 */
export const searchSimilarChunks = async (organizationId, queryEmbedding, limit = 5, originalQuery = '') => {
  const hasVector = await checkVectorSupport();

  if (hasVector && queryEmbedding && queryEmbedding.length > 0) {
    try {
      const vectorStr = `[${queryEmbedding.join(',')}]`;
      const results = await prisma.$queryRawUnsafe(`
        SELECT 
          id, 
          content, 
          metadata,
          1 - (embedding <=> $1::vector) as similarity
        FROM "HrDocumentChunk"
        WHERE "organizationId" = $2
        ORDER BY similarity DESC
        LIMIT $3
      `, vectorStr, organizationId, limit);
      return results;
    } catch (err) {
      console.error('[AI Vector] Vector search failed, falling back to keyword search:', err.message);
    }
  }

  // Fallback: Keyword search using ILIKE
  // This ensures the RAG functionality works (though less accurately) without pgvector.
  const keywords = originalQuery ? originalQuery.split(/\s+/).filter(k => k.length > 2) : [];
  
  if (keywords.length === 0) {
    return await prisma.hrDocumentChunk.findMany({
      where: { organizationId },
      take: limit,
    });
  }

  // Basic rank-by-frequency approximation using manual filter or raw SQL
  const results = await prisma.hrDocumentChunk.findMany({
    where: {
      organizationId,
      OR: keywords.map(k => ({ content: { contains: k, mode: 'insensitive' } })),
    },
    take: limit,
  });

  return results.map(r => ({ ...r, similarity: 0.5 })); // Static similarity for fallback
};

/**
 * Store a chunk with its embedding (if supported).
 * @param {object} params
 */
export const storeChunk = async ({ organizationId, hrPolicyId, content, metadata }) => {
  const hasVector = await checkVectorSupport();
  let embedding = null;
  
  if (hasVector) {
    embedding = await getEmbedding(organizationId, content);
  }

  if (hasVector && embedding && embedding.length > 0) {
    const vectorStr = `[${embedding.join(',')}]`;
    await prisma.$executeRawUnsafe(`
      INSERT INTO "HrDocumentChunk" ("organizationId", "hrPolicyId", "content", "embedding", "metadata")
      VALUES ($1, $2, $3, $4::vector, $5)
    `, organizationId, hrPolicyId, content, vectorStr, JSON.stringify(metadata || {}));
  } else {
    // Normal Prisma insert without the embedding field (or null)
    await prisma.hrDocumentChunk.create({
      data: {
        organizationId,
        hrPolicyId,
        content,
        metadata: metadata || {},
      },
    });
  }
};
