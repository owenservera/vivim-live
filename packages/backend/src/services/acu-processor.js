/**
 * ACU Processor Service (REDESIGN 001 — LLM-Powered Decomposition)
 *
 * Replaces the permanently-mocked Rust core with semantic decomposition via GLM-4.7-Flash.
 * The flow is now:
 *   1. Fetch conversation + messages
 *   2. Chunk messages into token windows
 *   3. LLM decomposes each chunk into structured ACUs
 *   4. Score quality (heuristic, no external call)
 *   5. Embed all ACU contents (batch)
 *   6. Detect semantic + structural links via cosine similarity
 *   7. Save to database
 *
 * Crypto/DID fields that were permanently stubbed are now honestly null.
 * See REDESIGN_004_STRIP_PHANTOM_CRYPTO.md for background.
 */

import { getPrismaClient } from '../lib/database.js';
import { logger } from '../lib/logger.js';
import { decomposeConversation, type ConversationMessage } from './acu-decomposer.js';

// ---------------------------------------------------------------------------
// Main export: processConversationToACUs
// ---------------------------------------------------------------------------

/**
 * Process a single conversation into ACUs using LLM decomposition.
 * Replaces the mockProcessCapture + Rust core approach.
 */
export async function processConversationToACUs(conversationId: string, options: any = {}) {
  const { calculateQuality = true, detectLinks = true } = options;
  const startTime = Date.now();

  try {
    logger.info({ conversationId }, 'Processing conversation to ACUs (LLM decomposer)');

    // 1. Fetch conversation with messages
    const conversation = await getPrismaClient().conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { messageIndex: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error(`Conversation ${conversationId} not found`);
    }

    logger.info({ messageCount: conversation.messages.length }, 'Conversation fetched');

    // 2. Build ConversationMessage array
    const messages: ConversationMessage[] = conversation.messages.map((msg: any) => ({
      id: msg.id,
      role: msg.role,
      content: convertPartsToContent(msg.parts),
      index: msg.messageIndex,
      createdAt: msg.createdAt.toISOString(),
    }));

    // 3. Run LLM decomposition (includes embedding + link detection)
    const result = await decomposeConversation(messages, conversationId, {
      generateEmbeddings: true,
    });

    logger.info(result.stats, 'Decomposition complete');

    // 4. Save ACUs to database
    const savedAcus = [];
    for (const acu of result.acus) {
      try {
        const quality = calculateQuality ? result.qualityScores.get(acu.id) : null;

        const acuData = {
          id: acu.id,
          // REDESIGN 004: No fake DIDs or placeholder keys
          authorDid: null,
          signature: null,          // Explicitly null — no phantom crypto
          content: acu.content,     // Plaintext — honest about crypto state
          language: null,
          type: acu.type,
          category: acu.category,
          embedding: acu.embedding?.length > 0 ? acu.embedding : null,
          embeddingModel: acu.embedding?.length > 0 ? acu.embeddingModel : null,
          conversationId,
          messageId: acu.provenance.message_id,
          messageIndex: acu.provenance.message_index,
          provider: conversation.provider,
          model: conversation.model,
          sourceTimestamp: new Date(acu.provenance.source_timestamp),
          extractorVersion: '2.0.0-llm',
          parserVersion: '2.0.0-llm',
          qualityOverall: quality?.overall ?? null,
          contentRichness: quality?.richness ?? null,
          structuralIntegrity: quality?.integrity ?? null,
          uniqueness: quality?.uniqueness ?? null,
          sharingPolicy: 'self',
          sharingCircles: [],
          metadata: {
            entities: acu.entities,
            topics: acu.topics,
            importance: acu.importance,
            sourceMessageIds: acu.sourceMessageIds,
            decomposerVersion: '2.0.0-llm',
          },
        };

        const saved = await getPrismaClient().atomicChatUnit.upsert({
          where: { id: acu.id },
          update: acuData,
          create: acuData,
        });

        savedAcus.push(saved);
      } catch (error: any) {
        logger.error({ acuId: acu.id, error: error.message }, 'Failed to save ACU — skipping');
      }
    }

    // 5. Save ACU links
    if (detectLinks && result.links.length > 0) {
      for (const link of result.links) {
        try {
          await getPrismaClient().acuLink.create({ data: link });
        } catch (error: any) {
          if (!error.message?.includes('Unique constraint')) {
            logger.warn({ link, error: error.message }, 'Failed to create ACU link');
          }
        }
      }
      logger.info({ linkCount: result.links.length }, 'ACU links saved');
    }

    const duration = Date.now() - startTime;
    logger.info({ conversationId, acuCount: savedAcus.length, duration }, 'ACU processing complete');

    return {
      success: true,
      conversationId,
      acuCount: savedAcus.length,
      linkCount: result.links.length,
      duration,
      stats: result.stats,
      acus: savedAcus,
    };
  } catch (error: any) {
    const duration = Date.now() - startTime;
    logger.error({ conversationId, error: error.message, stack: error.stack, duration }, 'ACU processing failed');
    return {
      success: false,
      conversationId,
      error: error.message,
      duration,
    };
  }
}

// ---------------------------------------------------------------------------
// Batch processing
// ---------------------------------------------------------------------------

export async function processAllConversations(options: any = {}) {
  const { batchSize = 10, delayMs = 1000, ...processingOptions } = options;

  logger.info('Starting batch ACU processing of all conversations');

  const conversations = await getPrismaClient().conversation.findMany({
    select: { id: true },
    orderBy: { capturedAt: 'desc' },
  });

  logger.info({ total: conversations.length }, 'Conversations to process');

  const results = { total: conversations.length, successful: 0, failed: 0, errors: [] as any[] };

  for (let i = 0; i < conversations.length; i += batchSize) {
    const batch = conversations.slice(i, i + batchSize);
    const batchNum = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(conversations.length / batchSize);

    logger.info({ batchNum, totalBatches }, 'Processing batch');

    const batchResults = await Promise.allSettled(
      batch.map((conv: any) => processConversationToACUs(conv.id, processingOptions))
    );

    for (const result of batchResults) {
      if (result.status === 'fulfilled' && result.value.success) {
        results.successful++;
      } else {
        results.failed++;
        results.errors.push({
          conversationId: (result as any).value?.conversationId,
          error: (result as any).reason?.message || (result as any).value?.error,
        });
      }
    }

    if (i + batchSize < conversations.length) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  logger.info(results, 'Batch ACU processing complete');
  return results;
}

// ---------------------------------------------------------------------------
// Helper: convert message parts to plain text
// ---------------------------------------------------------------------------

function convertPartsToContent(parts: any): string {
  if (typeof parts === 'string') return parts;
  if (!Array.isArray(parts)) return JSON.stringify(parts);

  return parts
    .map((part: any) => {
      if (typeof part === 'string') return part;
      if (part.type === 'text') return part.content;
      if (part.type === 'code') {
        const lang = part.metadata?.language || '';
        return `\`\`\`${lang}\n${part.content}\n\`\`\``;
      }
      if (part.type === 'latex') return `$$${part.content}$$`;
      if (part.type === 'table') {
        if (part.content?.headers && part.content?.rows) {
          const headers = part.content.headers.join(' | ');
          const sep = part.content.headers.map(() => '---').join(' | ');
          const rows = part.content.rows.map((r: any[]) => r.join(' | ')).join('\n');
          return `${headers}\n${sep}\n${rows}`;
        }
        return JSON.stringify(part.content);
      }
      return part.content || JSON.stringify(part);
    })
    .join('\n\n');
}

export default { processConversationToACUs, processAllConversations };
