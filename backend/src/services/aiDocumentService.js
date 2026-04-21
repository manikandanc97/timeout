/**
 * AI Document Service
 * Handles policy document chunking and ingestion into the vector store.
 */

import { storeChunk } from './aiVectorService.js';
import prisma from '../prismaClient.js';
import { logger } from './loggerService.js';

const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

/**
 * Split text into overlapping chunks.
 * @param {string} text
 * @returns {string[]}
 */
const splitText = (text) => {
  const chunks = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + CHUNK_SIZE;
    
    // Find a good breaking point (newline or space) near the end of the chunk
    if (endIndex < text.length) {
      const lastNewline = text.lastIndexOf('\n', endIndex);
      if (lastNewline > startIndex + CHUNK_SIZE / 2) {
        endIndex = lastNewline;
      } else {
        const lastSpace = text.lastIndexOf(' ', endIndex);
        if (lastSpace > startIndex + CHUNK_SIZE / 2) {
          endIndex = lastSpace;
        }
      }
    }

    chunks.push(text.substring(startIndex, endIndex).trim());
    startIndex = endIndex - CHUNK_OVERLAP;
    
    // Safety check for small overlap or infinite loop
    if (startIndex < 0) startIndex = 0;
    if (CHUNK_SIZE <= CHUNK_OVERLAP) break; 
  }

  return chunks.filter(c => c.length > 50); // Filter out too small chunks
};

/**
 * Ingest an HR policy into the knowledge base.
 * @param {number} organizationId
 * @param {number} hrPolicyId
 */
export const ingestPolicy = async (organizationId, hrPolicyId) => {
  const policy = await prisma.hrPolicy.findUnique({
    where: { id: hrPolicyId },
  });

  if (!policy) throw new Error('Policy not found');

  const fullText = `# ${policy.title}\nCategory: ${policy.category}\n\n${policy.content}`;
  const chunks = splitText(fullText);

  logger.info(`[RAG] Chunking policy "${policy.title}" into ${chunks.length} segments...`);

  for (let i = 0; i < chunks.length; i++) {
    await storeChunk({
      organizationId,
      hrPolicyId,
      content: chunks[i],
      metadata: {
        policyTitle: policy.title,
        policyCategory: policy.category,
        chunkIndex: i,
        totalChunks: chunks.length,
      },
    });
  }

  logger.info(`[RAG] Policy "${policy.title}" ingestion complete.`);
};

/**
 * Re-index all policies for an organization.
 * @param {number} organizationId
 */
export const reindexAllPolicies = async (organizationId) => {
  // Clear existing chunks for this organization
  await prisma.hrDocumentChunk.deleteMany({
    where: { organizationId },
  });

  const policies = await prisma.hrPolicy.findMany({
    where: { organizationId },
  });

  for (const policy of policies) {
    await ingestPolicy(organizationId, policy.id);
  }
};
