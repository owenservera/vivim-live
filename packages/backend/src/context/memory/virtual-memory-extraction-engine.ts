/**
 * Virtual Memory Extraction Engine
 *
 * Automatically extracts meaningful memories from virtual conversations using LLM.
 * Creates memories in the virtual_memories table for virtual users.
 * Supports batch extraction, incremental extraction, and re-extraction.
 *
 * @module context/memory/virtual-memory-extraction-engine
 */

import { PrismaClient, MemoryType } from '@prisma/client';
import { VirtualMemoryAdapterService, VirtualMemoryInput } from '../../services/virtual-memory-adapter.js';
import { ACUQualityScorer } from '../utils/acu-quality-scorer.js';
import { logger } from '../../lib/logger.js';

export interface VirtualExtractedMemory {
  content: string;
  summary?: string;
  memoryType: MemoryType;
  category: string;
  subcategory?: string;
  tags: string[];
  importance: number;
  confidence: number;
  evidence: string[];
}

export interface VirtualMemoryExtractionInput {
  virtualUserId: string;
  conversationId: string;
  messageRange?: { from: number; to: number };
  forceReextract?: boolean;
  priority?: number;
}

interface VirtualExtractionResult {
  success: boolean;
  memories?: VirtualExtractedMemory[];
  error?: string;
  messageCount?: number;
}

export interface VirtualMemoryExtractionConfig {
  prisma: PrismaClient;
  virtualMemoryAdapter: VirtualMemoryAdapterService;
  extractionModel?: string;
  maxMemoriesPerConversation?: number;
  minConfidenceThreshold?: number;
  enableAutoExtraction?: boolean;
}

const VIRTUAL_MEMORY_EXTRACTION_PROMPT = `You are an expert at extracting meaningful memories from conversations. Your task is to analyze the conversation and extract key memories that would be valuable for the AI to remember about this user.

For each memory, extract:
- content: The actual memory content (1-2 sentences)
- summary: A brief 5-10 word summary
- memoryType: EPISODIC (events/conversations), SEMANTIC (knowledge/facts), PROCEDURAL (how-to/skills), FACTUAL (user facts), PREFERENCE (likes/dislikes), IDENTITY (who they are), RELATIONSHIP (people/relationships), GOAL (goals/plans), PROJECT (project knowledge), CUSTOM (other)
- category: A specific category for this memory
- subcategory: Optional finer categorization
- tags: Array of relevant tags
- importance: 0.0-1.0 (how important this memory is)
- confidence: 0.0-1.0 (how confident you are in this extraction)
- evidence: Array of quotes from the conversation that support this memory

Return only valid JSON in this exact format:
[
  {
    "content": "string",
    "summary": "string",
    "memoryType": "EPISODIC",
    "category": "string",
    "subcategory": "string",
    "tags": ["tag1", "tag2"],
    "importance": 0.8,
    "confidence": 0.9,
    "evidence": ["quote from conversation"]
  }
]

Guidelines:
- Focus on user-specific information, preferences, facts, and experiences
- Extract memories that would help personalize future interactions
- Prioritize high-confidence, high-importance memories
- Don't extract generic conversational boilerplate
- Maximum 10 memories per conversation
- Be concise but informative`;

/**
 * Virtual Memory Extraction Engine
 */
export class VirtualMemoryExtractionEngine {
  private prisma: PrismaClient;
  private virtualMemoryAdapter: VirtualMemoryAdapterService;
  private qualityScorer: ACUQualityScorer;
  private extractionModel: string;
  private maxMemoriesPerConversation: number;
  private minConfidenceThreshold: number;
  private enableAutoExtraction: boolean;

  constructor(config: VirtualMemoryExtractionConfig) {
    this.prisma = config.prisma;
    this.virtualMemoryAdapter = config.virtualMemoryAdapter;
    this.qualityScorer = new ACUQualityScorer();
    this.extractionModel = config.extractionModel || 'glm-4.7';
    this.maxMemoriesPerConversation = config.maxMemoriesPerConversation || 10;
    this.minConfidenceThreshold = config.minConfidenceThreshold || 0.6;
    this.enableAutoExtraction = config.enableAutoExtraction ?? true;
  }

  /**
   * Extract memories from a virtual conversation
   */
  async extractFromVirtualConversation(
    input: VirtualMemoryExtractionInput
  ): Promise<VirtualExtractionResult> {
    const { virtualUserId, conversationId, messageRange, forceReextract = false, priority = 0 } = input;

    try {
      logger.info({ virtualUserId, conversationId }, 'Starting virtual memory extraction');

      // Get virtual conversation with messages
      const conversation = await this.prisma.virtualConversation.findUnique({
        where: { id: conversationId },
        include: {
          messages: {
            orderBy: { messageIndex: 'asc' },
            ...(messageRange && {
              skip: messageRange.from,
              take: messageRange.to - messageRange.from + 1,
            }),
          },
        },
      });

      if (!conversation) {
        return { success: false, error: 'Virtual conversation not found' };
      }

      // Check if already extracted (unless force)
      if (!forceReextract) {
        const existingMemories = await this.virtualMemoryAdapter.getMemoriesByConversation(virtualUserId, conversationId);
        if (existingMemories.length > 0) {
          logger.info({ conversationId }, 'Virtual memories already extracted, skipping');
          return {
            success: true,
            memories: [],
            messageCount: conversation.messages.length,
          };
        }
      }

      // Format conversation for extraction
      const messages = conversation.messages as Array<{
        role: string;
        content: string;
        messageIndex: number;
      }>;
      const conversationText = this.formatConversationForExtraction(messages);

      // Extract memories using LLM
      const extracted = await this.performVirtualExtraction(conversationText);

      if (!extracted.success || !extracted.memories) {
        return extracted;
      }

      // Filter by confidence and limit
      const filteredMemories = extracted.memories
        .filter((m) => m.confidence >= this.minConfidenceThreshold)
        .slice(0, this.maxMemoriesPerConversation);

      // Create virtual memories in database
      const createdMemories: VirtualMemoryInput[] = [];
      for (const memory of filteredMemories) {
        try {
          // Calculate quality score
          const quality = await this.qualityScorer.calculateScore(memory.content, memory.memoryType);

          // Create virtual memory input
          const memoryInput: VirtualMemoryInput = {
            content: memory.content,
            summary: memory.summary,
            memoryType: memory.memoryType,
            category: memory.category,
            subcategory: memory.subcategory,
            tags: memory.tags,
            importance: Math.max(memory.importance, quality.overall),
            relevance: memory.confidence, // Use confidence as initial relevance
            sourceConversationIds: [conversationId],
            metadata: {
              extractionConfidence: memory.confidence,
              qualityScore: quality,
              evidence: memory.evidence,
            }
          };

          await this.virtualMemoryAdapter.createMemory(virtualUserId, memoryInput);
          createdMemories.push(memoryInput);
        } catch (error) {
          logger.warn({ error, memory }, 'Failed to create virtual memory');
        }
      }

      logger.info(
        {
          conversationId,
          virtualUserId,
          memoryCount: createdMemories.length,
        },
        'Virtual memory extraction completed'
      );

      return {
        success: true,
        memories: filteredMemories,
        messageCount: conversation.messages.length,
      };
    } catch (error) {
      logger.error({ error, conversationId, virtualUserId }, 'Virtual memory extraction failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Extract from a single virtual message (for incremental extraction)
   */
  async extractFromVirtualMessage(
    virtualUserId: string,
    conversationId: string,
    message: { role: string; content: string }
  ): Promise<VirtualExtractedMemory[]> {
    const prompt = `${VIRTUAL_MEMORY_EXTRACTION_PROMPT}\n\nMessage:\n${message.role}: ${message.content}`;

    try {
      // Use Z.AI service for extraction
      const { createLLMService } = await import('../../context/utils/zai-service.js');
      const llmService = createLLMService();

      const response = await llmService.chat({
        model: this.extractionModel,
        messages: [{ role: 'system', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        maxTokens: 2048,
      });

      const parsed = JSON.parse(response.content);
      const memories = Array.isArray(parsed) ? parsed : parsed.memories || [];

      return memories.map((m: Record<string, unknown>) => ({
        content: String(m.content || ''),
        summary: m.summary ? String(m.summary) : undefined,
        memoryType: (m.memoryType as MemoryType) || 'EPISODIC',
        category: String(m.category || 'other'),
        subcategory: m.subcategory ? String(m.subcategory) : undefined,
        tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
        importance: Number(m.importance) || 0.5,
        confidence: Number(m.confidence) || 0.5,
        evidence: Array.isArray(m.evidence) ? m.evidence.map(String) : [],
      }));
    } catch (error) {
      logger.error({ error }, 'Failed to extract from virtual message');
      return [];
    }
  }

  /**
   * Check if auto-extraction is enabled for virtual users
   */
  isAutoExtractionEnabled(): boolean {
    return this.enableAutoExtraction;
  }

  // ==================== Private Helper Methods ====================

  /**
   * Format conversation messages for LLM extraction
   */
  private formatConversationForExtraction(messages: Array<{ role: string; content: string; messageIndex: number }>): string {
    return messages
      .map((msg, idx) => `[${msg.messageIndex}] ${msg.role}: ${msg.content}`)
      .join('\n\n');
  }

  /**
   * Perform LLM extraction for virtual conversations
   */
  private async performVirtualExtraction(conversationText: string): Promise<VirtualExtractionResult> {
    try {
      const prompt = `${VIRTUAL_MEMORY_EXTRACTION_PROMPT}\n\nConversation:\n${conversationText}`;

      // Use Z.AI service for extraction
      const { createLLMService } = await import('../../context/utils/zai-service.js');
      const llmService = createLLMService();

      const response = await llmService.chat({
        model: this.extractionModel,
        messages: [{ role: 'system', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.3,
        maxTokens: 4096,
      });

      const parsed = JSON.parse(response.content);
      const memories = Array.isArray(parsed) ? parsed : parsed.memories || [];

      if (!Array.isArray(memories)) {
        return {
          success: false,
          error: 'Invalid extraction response format'
        };
      }

      const extractedMemories: VirtualExtractedMemory[] = memories.map((m: Record<string, unknown>) => ({
        content: String(m.content || ''),
        summary: m.summary ? String(m.summary) : undefined,
        memoryType: (m.memoryType as MemoryType) || 'EPISODIC',
        category: String(m.category || 'other'),
        subcategory: m.subcategory ? String(m.subcategory) : undefined,
        tags: Array.isArray(m.tags) ? m.tags.map(String) : [],
        importance: Number(m.importance) || 0.5,
        confidence: Number(m.confidence) || 0.5,
        evidence: Array.isArray(m.evidence) ? m.evidence.map(String) : [],
      }));

      return {
        success: true,
        memories: extractedMemories,
      };
    } catch (error) {
      logger.error({ error }, 'Virtual memory extraction LLM call failed');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'LLM extraction failed',
      };
    }
  }
}