/**
 * Embedding Gateway (REDESIGN 002)
 *
 * Single, authoritative entry point for all embedding operations.
 * Eliminates the 6 independent mock-falling-back implementations.
 *
 * Design principles:
 * - No silent fallback to mock vectors — fail loud or use real embeddings
 * - Circuit breaker with auto-reset
 * - In-memory cache backed by the existing ContextCache
 * - Test-only mock (NODE_ENV=test)
 */

import { getContextCache, ContextCache } from '../context-cache.js';
import { logger } from '../../lib/logger.js';
import { ZAIEmbeddingService, EmbeddingService, MockEmbeddingService } from './embedding-service.js';
import type { IEmbeddingService } from '../types.js';

// ---------------------------------------------------------------------------
// Fix: hash-based embedding key to avoid the first-100-char collision bug
// ---------------------------------------------------------------------------

/**
 * Compute a stable key for an embedding cache entry.
 * Replaces the truncated-string key in ContextCache.embeddingKey().
 */
function stableEmbeddingCacheKey(text: string): string {
  // Fast djb2-style hash on the full string
  let hash = 5381;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) + hash) ^ text.charCodeAt(i);
    hash = hash >>> 0; // keep unsigned 32-bit
  }
  return `emb:${hash.toString(36)}`;
}

// ---------------------------------------------------------------------------
// EmbeddingGateway
// ---------------------------------------------------------------------------

export interface IEmbeddingGateway {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  isOperational(): boolean;
  getModelName(): string;
}

export class EmbeddingGateway implements IEmbeddingGateway {
  private provider: IEmbeddingService;
  private cache: ReturnType<typeof getContextCache>;
  private failureCount = 0;
  private circuitOpen = false;
  private circuitResetAt = 0;
  private readonly CIRCUIT_THRESHOLD = 5;
  private readonly CIRCUIT_COOLDOWN_MS = 60_000; // 1 minute
  private readonly modelName: string;

  private static instance: EmbeddingGateway | null = null;

  private constructor(provider: IEmbeddingService, modelName: string) {
    this.provider = provider;
    this.modelName = modelName;
    this.cache = getContextCache();
  }

  // --------------------------------------------------------------------------
  // Factory
  // --------------------------------------------------------------------------

  static create(): EmbeddingGateway {
    if (EmbeddingGateway.instance) return EmbeddingGateway.instance;

    // Test mode: always use mock, no key required
    if (process.env.NODE_ENV === 'test') {
      logger.info('EmbeddingGateway: test mode — using mock embeddings');
      EmbeddingGateway.instance = new EmbeddingGateway(new MockEmbeddingService(1536), 'mock-test');
      return EmbeddingGateway.instance;
    }

    const zaiKey = process.env.ZAI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!zaiKey && !openaiKey) {
      throw new Error(
        'FATAL: EmbeddingGateway requires ZAI_API_KEY or OPENAI_API_KEY. ' +
          'Semantic search, memory conflict detection, and JIT context all depend on real embeddings. ' +
          'Set NODE_ENV=test to use mock embeddings for local development without an API key.'
      );
    }

    if (zaiKey) {
      logger.info('EmbeddingGateway: using Z.AI embedding provider');
      EmbeddingGateway.instance = new EmbeddingGateway(
        new ZAIEmbeddingService({ apiKey: zaiKey }),
        'zai-embedding'
      );
    } else {
      logger.info('EmbeddingGateway: using OpenAI embedding provider');
      EmbeddingGateway.instance = new EmbeddingGateway(
        new EmbeddingService({ apiKey: openaiKey! }),
        'text-embedding-3-small'
      );
    }

    return EmbeddingGateway.instance;
  }

  /** Reset singleton — only call in tests or after config changes */
  static reset(): void {
    EmbeddingGateway.instance = null;
  }

  // --------------------------------------------------------------------------
  // Core operations
  // --------------------------------------------------------------------------

  async embed(text: string): Promise<number[]> {
    if (!text?.trim()) {
      // Empty text gets a zero vector — semantically correct, not "mock"
      return new Array(1536).fill(0);
    }

    // Cache check
    const cacheKey = stableEmbeddingCacheKey(text);
    const cached = this.cache.get<number[]>('embedding', cacheKey);
    if (cached) return cached;

    // Circuit breaker
    this.assertCircuitClosed();

    try {
      const embedding = await this.provider.embed(text);
      this.cache.set('embedding', cacheKey, embedding);
      this.recordSuccess();
      return embedding;
    } catch (error) {
      this.recordFailure(error as Error);
      throw error; // Propagate — callers decide whether to degrade gracefully
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!texts || texts.length === 0) return [];

    // Separate cached from uncached
    const results: (number[] | null)[] = texts.map((t) => {
      const key = stableEmbeddingCacheKey(t);
      return this.cache.get<number[]>('embedding', key) || null;
    });

    const uncachedIndices = results
      .map((r, i) => (r === null ? i : -1))
      .filter((i) => i >= 0);

    if (uncachedIndices.length === 0) return results as number[][];

    // Fetch only uncached
    this.assertCircuitClosed();

    try {
      const uncachedTexts = uncachedIndices.map((i) => texts[i]);
      const freshEmbeddings = await this.provider.embedBatch(uncachedTexts);

      for (let j = 0; j < uncachedIndices.length; j++) {
        const idx = uncachedIndices[j];
        results[idx] = freshEmbeddings[j];
        const key = stableEmbeddingCacheKey(texts[idx]);
        this.cache.set('embedding', key, freshEmbeddings[j]);
      }

      this.recordSuccess();
      return results as number[][];
    } catch (error) {
      this.recordFailure(error as Error);
      throw error;
    }
  }

  isOperational(): boolean {
    if (!this.circuitOpen) return true;
    if (Date.now() >= this.circuitResetAt) {
      // Auto-reset half-open
      this.circuitOpen = false;
      this.failureCount = 0;
      logger.info('EmbeddingGateway: circuit breaker auto-reset (half-open probe)');
      return true;
    }
    return false;
  }

  getModelName(): string {
    return this.modelName;
  }

  // --------------------------------------------------------------------------
  // Circuit breaker internals
  // --------------------------------------------------------------------------

  private assertCircuitClosed(): void {
    if (this.circuitOpen && Date.now() < this.circuitResetAt) {
      throw new Error(
        `EmbeddingGateway: circuit breaker is open (reset in ${Math.ceil((this.circuitResetAt - Date.now()) / 1000)}s). ` +
          'Context assembly will proceed without JIT embeddings.'
      );
    }
    // Half-open: reset counters and let the next call through as a probe
    if (this.circuitOpen) {
      this.circuitOpen = false;
      this.failureCount = 0;
    }
  }

  private recordSuccess(): void {
    this.failureCount = 0;
    this.circuitOpen = false;
  }

  private recordFailure(error: Error): void {
    this.failureCount++;
    logger.warn(
      { failures: this.failureCount, threshold: this.CIRCUIT_THRESHOLD, error: error.message },
      'EmbeddingGateway: provider failure recorded'
    );

    if (this.failureCount >= this.CIRCUIT_THRESHOLD) {
      this.circuitOpen = true;
      this.circuitResetAt = Date.now() + this.CIRCUIT_COOLDOWN_MS;
      logger.error(
        { resetAt: new Date(this.circuitResetAt).toISOString() },
        'EmbeddingGateway: circuit breaker OPENED after repeated failures'
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Convenience singleton accessor (mirrors the createEmbeddingService pattern)
// ---------------------------------------------------------------------------

export function getEmbeddingGateway(): EmbeddingGateway {
  return EmbeddingGateway.create();
}
