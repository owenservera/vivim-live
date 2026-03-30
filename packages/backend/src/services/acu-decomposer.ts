/**
 * ACU Decomposer Service (REDESIGN 001)
 *
 * Replaces the permanently-mocked Rust core with LLM-powered conversation decomposition.
 * Uses GLM-4.7-Flash to intelligently identify Atomic Chat Units (ACUs) from conversations.
 *
 * Key improvements over the mock:
 * - Semantic boundary detection across message boundaries
 * - Intent classification (fact / instruction / question / answer / etc.)
 * - Entity + topic extraction
 * - LLM-assigned importance scores
 * - Relationship detection via cosine similarity of embeddings
 */

import crypto from 'crypto';
import { logger } from '../lib/logger.js';
import { createLLMService, createEmbeddingService } from '../context/utils/zai-service.js';
import type { ILLMService, IEmbeddingService } from '../context/types.js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ConversationMessage {
  id: string;
  role: string;
  content: string;
  index: number;
  createdAt?: string;
}

interface MessageWindow {
  messages: ConversationMessage[];
  tokenCount: number;
}

export interface RawACU {
  id: string;
  content: string;
  type: ACUType;
  category: ACUCategory;
  entities: string[];
  topics: string[];
  importance: number;
  sourceMessageIds: string[];
  provenance: {
    conversation_id: string;
    message_id: string;
    message_index: number;
    source_timestamp: string;
  };
}

export interface EnrichedACU extends RawACU {
  embedding: number[];
  embeddingModel: string;
}

export interface ACULink {
  sourceId: string;
  targetId: string;
  relation: 'related' | 'duplicate' | 'answered_by' | 'explains' | 'next';
  weight: number;
  metadata: Record<string, unknown>;
}

export interface QualityScores {
  overall: number;
  richness: number;
  integrity: number;
  uniqueness: number;
}

type ACUType =
  | 'fact'
  | 'opinion'
  | 'instruction'
  | 'question'
  | 'answer'
  | 'code_snippet'
  | 'decision'
  | 'preference'
  | 'statement';

type ACUCategory = 'technical' | 'personal' | 'creative' | 'business' | 'general';

// ---------------------------------------------------------------------------
// Token estimation (heuristic: 1 token ≈ 4 chars)
// ---------------------------------------------------------------------------

function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ---------------------------------------------------------------------------
// Hash helper
// ---------------------------------------------------------------------------

function generateContentHash(content: string): string {
  return crypto.createHash('sha256').update(content.trim()).digest('hex');
}

// ---------------------------------------------------------------------------
// 1. Message Chunker (deterministic, no LLM)
// ---------------------------------------------------------------------------

function chunkConversation(messages: ConversationMessage[], maxTokens = 4000): MessageWindow[] {
  const windows: MessageWindow[] = [];
  let current: MessageWindow = { messages: [], tokenCount: 0 };

  for (const msg of messages) {
    if (!msg.content?.trim()) continue;
    const msgTokens = estimateTokens(msg.content);

    // If single message exceeds window, it gets its own window
    if (msgTokens > maxTokens) {
      if (current.messages.length > 0) windows.push(current);
      windows.push({ messages: [msg], tokenCount: msgTokens });
      current = { messages: [], tokenCount: 0 };
      continue;
    }

    // If adding this message would exceed window, start new window
    if (current.tokenCount + msgTokens > maxTokens) {
      windows.push(current);
      current = { messages: [], tokenCount: 0 };
    }

    current.messages.push(msg);
    current.tokenCount += msgTokens;
  }

  if (current.messages.length > 0) windows.push(current);
  return windows;
}

// ---------------------------------------------------------------------------
// 2. LLM Decomposer (one call per chunk)
// ---------------------------------------------------------------------------

const DECOMPOSE_PROMPT = `You are an ACU (Atomic Chat Unit) decomposer for a personal AI memory system.
Analyze this conversation segment and extract distinct knowledge atoms.

Each ACU should be:
- Self-contained (understandable without the full conversation)
- Atomic (one concept per ACU)
- Classified by type and category

Return a JSON object with an "acus" array:
{
  "acus": [
    {
      "content": "The self-contained knowledge statement",
      "type": "fact" | "opinion" | "instruction" | "question" | "answer" | "code_snippet" | "decision" | "preference",
      "category": "technical" | "personal" | "creative" | "business" | "general",
      "entities": ["named entities mentioned"],
      "topics": ["topic slugs in kebab-case"],
      "importance": 0.0-1.0,
      "sourceMessageIndices": [0, 1]
    }
  ]
}

Rules:
- Skip greetings, filler, meta-commentary ("sure!", "let me help", "of course")
- Merge related statements into one ACU (don't split "X because Y" into two)
- Code blocks always get their own ACU with surrounding explanation merged in
- Questions paired with their direct answers become a single "answer" ACU
- Maximum 15 ACUs per chunk
- importance: 1.0 = core fact/decision; 0.5 = useful context; 0.2 = minor detail`;

async function decomposeChunk(
  llmService: ILLMService,
  window: MessageWindow,
  conversationId: string
): Promise<RawACU[]> {
  if (window.messages.length === 0) return [];

  const messagesText = window.messages
    .map((m) => `[${m.role.toUpperCase()}] (msg #${m.index}): ${m.content}`)
    .join('\n\n');

  try {
    const response = await llmService.chat({
      messages: [
        { role: 'system', content: DECOMPOSE_PROMPT },
        { role: 'user', content: messagesText },
      ],
      temperature: 0.1,
      maxTokens: 2000,
    });

    let parsed: any;
    try {
      // Strip markdown fences if present
      let cleaned = response.content.trim();
      if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
      else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
      if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
      parsed = JSON.parse(cleaned.trim());
    } catch {
      logger.warn({ preview: response.content.slice(0, 200) }, 'ACU decomposer: JSON parse failed');
      return [];
    }

    const acus: any[] = Array.isArray(parsed) ? parsed : (parsed.acus || []);

    return acus
      .filter((acu) => acu?.content?.trim().length >= 20)
      .map((acu, i) => {
        const sourceIds = (acu.sourceMessageIndices || [])
          .map((idx: number) => window.messages[idx]?.id)
          .filter(Boolean);

        const firstMsg = window.messages[0];
        return {
          id: generateContentHash(`${conversationId}:${firstMsg.index}:${i}:${acu.content}`),
          content: acu.content.trim(),
          type: (acu.type || 'statement') as ACUType,
          category: (acu.category || 'general') as ACUCategory,
          entities: Array.isArray(acu.entities) ? acu.entities : [],
          topics: Array.isArray(acu.topics) ? acu.topics : [],
          importance: typeof acu.importance === 'number' ? Math.min(1, Math.max(0, acu.importance)) : 0.5,
          sourceMessageIds: sourceIds.length > 0 ? sourceIds : [firstMsg.id],
          provenance: {
            conversation_id: conversationId,
            message_id: firstMsg.id,
            message_index: firstMsg.index,
            source_timestamp: firstMsg.createdAt || new Date().toISOString(),
          },
        } as RawACU;
      });
  } catch (error) {
    logger.error({ error: (error as Error).message }, 'ACU decomposer LLM call failed');
    return [];
  }
}

// ---------------------------------------------------------------------------
// 3. Quality Scorer (enhanced heuristics, no external call)
// ---------------------------------------------------------------------------

export function scoreACUQuality(acu: RawACU): QualityScores {
  const content = acu.content;
  const wordCount = content.split(/\s+/).length;
  const hasSpecifics = /\d+|"[^"]+"|'[^']+'/.test(content);
  const hasStructure = /\n|•|[-*]\s/.test(content);
  const hasCode = /```|`[^`]+`/.test(content);

  let richness = Math.min(
    100,
    (wordCount > 30 ? 40 : wordCount * 1.3) +
      (hasSpecifics ? 20 : 0) +
      (hasStructure ? 15 : 0) +
      (hasCode ? 25 : 0)
  );

  // LLM assigned a real type → inherently better structured
  const integrity = acu.type !== 'statement' ? 85 : 70;
  const uniqueness = 75; // Base; refined after embedding comparison
  const llmImportance = acu.importance * 100;

  const overall = richness * 0.3 + integrity * 0.2 + uniqueness * 0.2 + llmImportance * 0.3;

  return {
    overall: Math.round(overall),
    richness: Math.round(richness),
    integrity: Math.round(integrity),
    uniqueness: Math.round(uniqueness),
  };
}

// ---------------------------------------------------------------------------
// 4. Cosine similarity helper
// ---------------------------------------------------------------------------

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

// ---------------------------------------------------------------------------
// 5. Embedding + Link Detection
// ---------------------------------------------------------------------------

async function generateEmbeddingsAndLinks(
  embeddingService: IEmbeddingService,
  acus: RawACU[]
): Promise<{ acus: EnrichedACU[]; links: ACULink[] }> {
  if (acus.length === 0) return { acus: [], links: [] };

  const contents = acus.map((a) => a.content);
  const embeddings = await embeddingService.embedBatch(contents);

  const enrichedAcus: EnrichedACU[] = acus.map((acu, i) => ({
    ...acu,
    embedding: embeddings[i] || [],
    embeddingModel: 'zai-embedding',
  }));

  const links: ACULink[] = [];

  // Semantic links via cosine similarity
  for (let i = 0; i < enrichedAcus.length; i++) {
    for (let j = i + 1; j < enrichedAcus.length; j++) {
      if (!enrichedAcus[i].embedding.length || !enrichedAcus[j].embedding.length) continue;
      const similarity = cosineSimilarity(enrichedAcus[i].embedding, enrichedAcus[j].embedding);

      if (similarity > 0.9) {
        links.push({
          sourceId: enrichedAcus[i].id,
          targetId: enrichedAcus[j].id,
          relation: 'duplicate',
          weight: similarity,
          metadata: { type: 'semantic', similarity },
        });
      } else if (similarity > 0.75) {
        links.push({
          sourceId: enrichedAcus[i].id,
          targetId: enrichedAcus[j].id,
          relation: 'related',
          weight: similarity,
          metadata: { type: 'semantic', similarity },
        });
      }
    }
  }

  // Structural Q&A links
  for (let i = 0; i < enrichedAcus.length - 1; i++) {
    if (enrichedAcus[i].type === 'question' && enrichedAcus[i + 1].type === 'answer') {
      links.push({
        sourceId: enrichedAcus[i].id,
        targetId: enrichedAcus[i + 1].id,
        relation: 'answered_by',
        weight: 0.95,
        metadata: { type: 'structural' },
      });
    }
    if (enrichedAcus[i].type === 'instruction' && enrichedAcus[i + 1].type === 'code_snippet') {
      links.push({
        sourceId: enrichedAcus[i].id,
        targetId: enrichedAcus[i + 1].id,
        relation: 'explains',
        weight: 0.9,
        metadata: { type: 'structural' },
      });
    }
  }

  return { acus: enrichedAcus, links };
}

// ---------------------------------------------------------------------------
// Main export: decomposeConversation
// ---------------------------------------------------------------------------

export interface DecompositionResult {
  acus: EnrichedACU[];
  links: ACULink[];
  qualityScores: Map<string, QualityScores>;
  stats: {
    messageCount: number;
    chunkCount: number;
    rawAcuCount: number;
    enrichedAcuCount: number;
    linkCount: number;
  };
}

export async function decomposeConversation(
  messages: ConversationMessage[],
  conversationId: string,
  options: {
    maxTokensPerChunk?: number;
    generateEmbeddings?: boolean;
    llmService?: ILLMService;
    embeddingService?: IEmbeddingService;
  } = {}
): Promise<DecompositionResult> {
  const {
    maxTokensPerChunk = 4000,
    generateEmbeddings = true,
    llmService = createLLMService(),
    embeddingService = createEmbeddingService(),
  } = options;

  logger.info(
    { conversationId, messageCount: messages.length },
    'ACU Decomposer: starting LLM decomposition'
  );

  // Chunk messages
  const windows = chunkConversation(messages, maxTokensPerChunk);
  logger.debug({ chunkCount: windows.length }, 'ACU Decomposer: conversation chunked');

  // Decompose each chunk
  const rawAcuGroups = await Promise.all(
    windows.map((window) => decomposeChunk(llmService, window, conversationId))
  );

  const rawAcus: RawACU[] = rawAcuGroups.flat();
  logger.info({ rawAcuCount: rawAcus.length }, 'ACU Decomposer: raw ACUs generated');

  // Score quality
  const qualityScores = new Map<string, QualityScores>();
  for (const acu of rawAcus) {
    qualityScores.set(acu.id, scoreACUQuality(acu));
  }

  // Generate embeddings + detect links
  let enrichedAcus: EnrichedACU[];
  let links: ACULink[];

  if (generateEmbeddings && rawAcus.length > 0) {
    const result = await generateEmbeddingsAndLinks(embeddingService, rawAcus);
    enrichedAcus = result.acus;
    links = result.links;
  } else {
    enrichedAcus = rawAcus.map((acu) => ({ ...acu, embedding: [], embeddingModel: 'none' }));
    links = [];
  }

  logger.info(
    { enrichedAcuCount: enrichedAcus.length, linkCount: links.length },
    'ACU Decomposer: enrichment complete'
  );

  return {
    acus: enrichedAcus,
    links,
    qualityScores,
    stats: {
      messageCount: messages.length,
      chunkCount: windows.length,
      rawAcuCount: rawAcus.length,
      enrichedAcuCount: enrichedAcus.length,
      linkCount: links.length,
    },
  };
}
