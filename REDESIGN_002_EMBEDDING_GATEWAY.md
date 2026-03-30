# REDESIGN 002 — Eliminate Mock Embeddings with Unified Embedding Service

> **Status:** Proposed  
> **Priority:** 🟠 High — mock embeddings break semantic search, the core retrieval mechanism  
> **Effort:** 1-2 days  
> **Stack:** Bun + TypeScript + Z.AI Embedding API

---

## Problem Statement

The codebase has **6 independent embedding implementations**, most of which silently fall back to mock vectors:

| File | What It Does | Falls Back To |
|------|-------------|---------------|
| `embedding-service.ts` → `EmbeddingService` | OpenAI embeddings | `generateMockVector()` (sin-based hash) |
| `embedding-service.ts` → `MockEmbeddingService` | Always mock | Seeded pseudo-random |
| `zai-service.ts` → `ZAIEmbeddingService` | Z.AI embeddings | `generateMockVector()` (sin-based hash) |
| `zai-service.ts` → `createEmbeddingService()` | Factory | Returns `MockEmbeddingService` if no API key |
| `memory-conflict-detection.ts` | Inline mock | Hardcoded sin-based hash |
| `ai-storage-service.js` | Inline mock | `new Array(768).fill(0)` |

### Why This Is Broken

Mock vectors are **deterministic but not semantic**. Two phrases that mean the same thing (`"I love TypeScript"` and `"TypeScript is my favorite language"`) get completely unrelated mock vectors. This means:

1. **Semantic search returns random results** — `hybrid-retrieval.ts` uses `<=>` (cosine distance) on vectors that have no semantic meaning
2. **The Librarian can't detect related topics** — graph synthesis compares embeddings that are noise
3. **Memory conflict detection is blind** — `findSimilarMemories` uses mock embeddings to find conflicts, so it finds nothing
4. **JIT retrieval is essentially random** — the "Just In Time" knowledge the assembler injects is whatever happens to have close mock vectors

### The System Already Has the Right API Key

Z.AI's embedding endpoint is already configured via `ZAI_API_KEY`. The `zai-service.ts` has a working implementation. The issue is that **the factory function falls back to mocks when it shouldn't**, and **other services roll their own mock instead of using the shared service**.

---

## Redesigned Architecture

### Principle
**One embedding service. Zero fallbacks to mock. Fail loudly if no API key.**

```
                    ┌─────────────────────────┐
                    │  EmbeddingGateway        │  ← Singleton, shared across all consumers
                    │  (circuit breaker +      │
                    │   in-memory cache)        │
                    └───────┬─────────────────-┘
                            │
                ┌───────────┼───────────┐
                ▼           ▼           ▼
         ┌──────────┐ ┌──────────┐ ┌──────────┐
         │ Z.AI API │ │ OpenAI   │ │ Dev Mock │  ← Only if NODE_ENV=test
         │ (primary)│ │(fallback)│ │ (tests)  │
         └──────────┘ └──────────┘ └──────────┘
```

### Key Design Decisions

1. **No silent fallback to mock** — if the embedding API fails, the operation should fail (not return garbage vectors that poison the search index)
2. **Circuit breaker** — the existing `circuit-breaker-service.ts` is already present; wire it properly
3. **Cache layer** — the existing `ContextCache.embedding` namespace (1000 entries, 1h TTL) is already built; use it
4. **Dev mock only in test** — `MockEmbeddingService` is only instantiated when `NODE_ENV=test`

---

## Implementation

### 1. Create `EmbeddingGateway` (single entry point)

```typescript
// packages/backend/src/context/utils/embedding-gateway.ts

import { ContextCache, getContextCache } from '../context-cache';
import { logger } from '../../lib/logger.js';

export interface IEmbeddingGateway {
  embed(text: string): Promise<number[]>;
  embedBatch(texts: string[]): Promise<number[][]>;
  isOperational(): boolean;
}

export class EmbeddingGateway implements IEmbeddingGateway {
  private provider: IEmbeddingService;
  private cache: ContextCache;
  private failureCount = 0;
  private circuitOpen = false;
  private circuitResetAt: number = 0;
  
  private static instance: EmbeddingGateway | null = null;

  private constructor(provider: IEmbeddingService) {
    this.provider = provider;
    this.cache = getContextCache();
  }

  static create(): EmbeddingGateway {
    if (EmbeddingGateway.instance) return EmbeddingGateway.instance;

    const apiKey = process.env.ZAI_API_KEY || process.env.OPENAI_API_KEY;
    
    if (!apiKey && process.env.NODE_ENV === 'test') {
      logger.info('Test mode: using mock embeddings');
      EmbeddingGateway.instance = new EmbeddingGateway(new MockEmbeddingService(1536));
      return EmbeddingGateway.instance;
    }

    if (!apiKey) {
      throw new Error(
        'FATAL: No embedding API key configured (ZAI_API_KEY or OPENAI_API_KEY). ' +
        'Embeddings are required for semantic search. Set NODE_ENV=test to use mocks.'
      );
    }

    // Prefer Z.AI, fall back to OpenAI
    const provider = process.env.ZAI_API_KEY
      ? new ZAIEmbeddingService({ apiKey: process.env.ZAI_API_KEY })
      : new EmbeddingService({ apiKey });

    EmbeddingGateway.instance = new EmbeddingGateway(provider);
    return EmbeddingGateway.instance;
  }

  async embed(text: string): Promise<number[]> {
    if (!text?.trim()) return new Array(1536).fill(0);

    // Check cache
    const cacheKey = ContextCache.embeddingKey(text);
    const cached = this.cache.getCachedEmbedding(text);
    if (cached) return cached;

    // Circuit breaker check
    if (this.circuitOpen && Date.now() < this.circuitResetAt) {
      throw new Error('Embedding service circuit breaker is open');
    }

    try {
      const embedding = await this.provider.embed(text);
      this.cache.setCachedEmbedding(text, embedding);
      this.failureCount = 0;
      this.circuitOpen = false;
      return embedding;
    } catch (error) {
      this.failureCount++;
      if (this.failureCount >= 5) {
        this.circuitOpen = true;
        this.circuitResetAt = Date.now() + 60_000; // 1 min cooldown
        logger.error('Embedding circuit breaker OPENED after 5 failures');
      }
      throw error; // Don't swallow — let caller decide what to do
    }
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    // Split into cached vs uncached
    const results: (number[] | null)[] = texts.map(t => this.cache.getCachedEmbedding(t) || null);
    const uncachedIndices = results.map((r, i) => r === null ? i : -1).filter(i => i >= 0);
    
    if (uncachedIndices.length === 0) return results as number[][];

    const uncachedTexts = uncachedIndices.map(i => texts[i]);
    const freshEmbeddings = await this.provider.embedBatch(uncachedTexts);

    // Merge and cache
    for (let j = 0; j < uncachedIndices.length; j++) {
      const idx = uncachedIndices[j];
      results[idx] = freshEmbeddings[j];
      this.cache.setCachedEmbedding(texts[idx], freshEmbeddings[j]);
    }

    return results as number[][];
  }

  isOperational(): boolean {
    return !this.circuitOpen || Date.now() >= this.circuitResetAt;
  }
}
```

### 2. Fix the Cache Key Collision Bug

The current `embeddingKey` uses first 100 chars, which collides. Replace with a hash:

```typescript
// In context-cache.ts, replace:
static embeddingKey(text: string): string {
  const hash = Bun.hash(text).toString(36);  // Bun-native fast hash
  return `emb:${hash}`;
}
```

### 3. Consumers to Update

| Consumer | Current | After |
|----------|---------|-------|
| `DynamicContextAssembler` | Creates own `createEmbeddingService()` | `EmbeddingGateway.create()` |
| `HybridRetrievalService` | Gets embedding passed in | No change (caller uses gateway) |
| `BundleCompiler` | Creates own `createEmbeddingService()` | `EmbeddingGateway.create()` |
| `LibrarianWorker` | Creates own embedding service | `EmbeddingGateway.create()` |
| `ConflictDetectionService` | Inline `generateQueryEmbedding()` | `EmbeddingGateway.create()` |
| `ai-storage-service.js` | `new Array(768).fill(0)` | `EmbeddingGateway.create()` |
| `context-pipeline.ts` | Creates own embedding service | `EmbeddingGateway.create()` |

### 4. Delete Dead Code

After migration, delete:
- `MockEmbeddingService` from `embedding-service.ts` (move to test utils)
- `generateMockVector()` from `embedding-service.ts` and `zai-service.ts`
- `generateQueryEmbedding()` from `memory-conflict-detection.ts`
- `createEmbeddingService()` factory from `zai-service.ts` (replaced by gateway)

---

## Error Handling Strategy

The key design change: **no silent degradation to mock vectors**.

| Scenario | Current Behavior | New Behavior |
|----------|-----------------|--------------|
| No API key | Silently uses mock → garbage search | **Crash on startup** with clear error |
| API returns 429 (rate limit) | Silently uses mock | **Retry with backoff** (3 attempts) |
| API returns 500 | Silently uses mock | **Circuit breaker opens** → operations that need embedding return error to caller |
| Network timeout | Silently uses mock | **Circuit breaker opens** → auto-reset after 60s |
| Test environment | Uses mock | Uses mock (via `NODE_ENV=test`) |

### Why "Fail Loudly" Is Better

When embeddings silently fall back to mock:
1. Semantic search returns random results → user sees irrelevant context
2. The Librarian creates bad topic associations → knowledge graph becomes noise
3. Conflict detection finds nothing → contradictory memories accumulate
4. Nobody knows there's a problem because logs just say "using mock embeddings"

With the gateway: if embeddings fail, the context assembler catches the error and assembles context **without JIT knowledge** (which is a documented fallback), rather than assembling with **poisoned JIT knowledge**.
