# VIVIM Testing Suite Design

> Modern, comprehensive testing architecture for AI-enabled webapp

## Executive Summary

This document outlines a modern testing suite designed for VIVIM's transition from a basic webpage to an AI-enabled webapp. The suite covers **debugging utilities**, **API testing**, **memory testing**, and **context engine testing**.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Testing Pyramid](#testing-pyramid)
3. [Debugging Utilities](#debugging-utilities)
4. [API Testing Framework](#api-testing-framework)
5. [Memory Testing Suite](#memory-testing-suite)
6. [Context Engine Testing](#context-engine-testing)
7. [Frontend Testing](#frontend-testing)
8. [E2E Testing](#e2e-testing)
9. [Performance Testing](#performance-testing)
10. [Test Data Management](#test-data-management)
11. [CI/CD Integration](#cicd-integration)

---

## 1. Architecture Overview

### Technology Stack

```
Testing Stack:
├── Test Runner: Bun Test (native, fast)
├── E2E: Playwright (multi-browser)
├── API Testing: Supertest + native fetch
├── Mocking: Bun mock functions + MSW
├── Coverage: c8 (Bun compatible)
└── Reporting: Custom HTML + JUnit XML
```

### Directory Structure

```
packages/
├── backend/
│   ├── tests/
│   │   ├── unit/                    # Unit tests
│   │   │   ├── services/
│   │   │   ├── context/
│   │   │   ├── memory/
│   │   │   └── utils/
│   │   ├── integration/             # Integration tests
│   │   │   ├── api/
│   │   │   ├── database/
│   │   │   └── external/
│   │   ├── e2e/                     # End-to-end tests
│   │   ├── fixtures/                # Test data
│   │   ├── helpers/                 # Test utilities
│   │   └── setup.ts                 # Global setup
│   └── src/
│       └── __debug__/               # Debug utilities
│           ├── logger.ts
│           ├── inspector.ts
│           └── tracer.ts
├── frontend/
│   └── src/
│       ├── components/
│       │   └── *.test.tsx
│       ├── hooks/
│       │   └── *.test.ts
│       └── __tests__/
│           ├── e2e/
│           └── visual/
testing/
├── shared/                          # Shared test utilities
│   ├── factories/                   # Data factories
│   ├── mocks/                       # Mock services
│   ├── fixtures/                    # Test fixtures
│   └── helpers/                     # Helper functions
├── scripts/                         # Test runners
│   ├── test-runner.ts
│   ├── coverage-report.ts
│   └── performance-benchmark.ts
└── reports/                         # Generated reports
```

---

## 2. Testing Pyramid

```
                    ┌─────────────┐
                   │   E2E (5%)  │
                  │  (Playwright) │
                 └───────────────┘
                ┌─────────────────┐
               │ Integration (20%) │
              │  (API + Database)  │
             └───────────────────┘
            ┌─────────────────────┐
           │    Unit Tests (75%)   │
          │ (Services, Utils, etc) │
         └───────────────────────┘
```

### Test Distribution Goals

| Test Type | Coverage Goal | Execution Time | Frequency |
|-----------|---------------|----------------|-----------|
| Unit | 80%+ | < 5s | Every commit |
| Integration | 60%+ | < 30s | Every PR |
| E2E | Critical paths | < 2min | Nightly |
| Performance | Key endpoints | < 1min | Weekly |

---

## 3. Debugging Utilities

### 3.1 Context Inspector

```typescript
// packages/backend/src/__debug__/context-inspector.ts

interface ContextInspectionResult {
  assemblyId: string;
  timestamp: number;
  duration: number;
  layers: {
    name: string;
    itemsRetrieved: number;
    tokensUsed: number;
    retrievalTime: number;
    cacheHit: boolean;
  }[];
  budget: {
    totalAvailable: number;
    totalUsed: number;
    remaining: number;
    breakdown: Record<string, number>;
  };
  topics: DetectedTopic[];
  entities: DetectedEntity[];
  warnings: string[];
  recommendations: string[];
}

export class ContextInspector {
  private static history: ContextInspectionResult[] = [];

  static async inspect(
    userId: string,
    message: string,
    options?: { verbose?: boolean; includeEmbeddings?: boolean }
  ): Promise<ContextInspectionResult> {
    // Implementation traces full context assembly
  }

  static getHistory(): ContextInspectionResult[] {
    return this.history;
  }

  static exportReport(): string {
    return JSON.stringify(this.history, null, 2);
  }
}
```

### 3.2 Memory Debugger

```typescript
// packages/backend/src/__debug__/memory-debugger.ts

interface MemoryTrace {
  id: string;
  userId: string;
  content: string;
  category: string;
  embedding: number[];
  similarityScores: { query: string; score: number }[];
  retrievalPath: string[];
  conflicts: ConflictDetectionResult[];
  acuLinks: string[];
}

export class MemoryDebugger {
  static async traceMemoryRetrieval(
    userId: string,
    query: string
  ): Promise<MemoryTrace[]> {
    // Traces how memories are retrieved for a query
  }

  static async analyzeConflicts(userId: string): Promise<ConflictAnalysis> {
    // Analyzes all memory conflicts for a user
  }

  static visualizeMemoryGraph(userId: string): Promise<string> {
    // Generates SVG visualization of memory connections
  }
}
```

### 3.3 Token Budget Visualizer

```typescript
// packages/backend/src/__debug__/budget-visualizer.ts

interface BudgetVisualization {
  totalBudget: number;
  layers: {
    name: string;
    allocated: number;
    used: number;
    percentage: number;
    items: number;
  }[];
  overflow: {
    layer: string;
    requested: number;
    granted: number;
    reason: string;
  }[];
  asciiChart: string;
}

export class BudgetVisualizer {
  static visualize(budget: TokenBudget): BudgetVisualization {
    // Creates visual representation of token allocation
  }

  static toASCII(budget: BudgetVisualization): string {
    // Generates ASCII chart for CLI debugging
  }
}
```

### 3.4 Request Tracer

```typescript
// packages/backend/src/__debug__/request-tracer.ts

interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  children: TraceSpan[];
  metadata: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  error?: Error;
}

export class RequestTracer {
  private static activeTraces = new Map<string, TraceSpan>();

  static startTrace(operation: string, metadata?: Record<string, any>): string {
    // Starts a new trace span
  }

  static endSpan(traceId: string, error?: Error): void {
    // Ends a trace span
  }

  static exportTrace(traceId: string): TraceSpan | undefined {
    // Exports complete trace
  }

  static generateTimeline(traceId: string): string {
    // Generates ASCII timeline of operations
  }
}
```

### 3.5 Debug Dashboard API

```typescript
// packages/backend/src/routes/debug.ts

/**
 * Debug endpoints for development
 * NEVER enable in production
 */

router.get('/debug/context/inspect', async (req, res) => {
  const { userId, message } = req.query;
  const result = await ContextInspector.inspect(userId!, message!);
  res.json(result);
});

router.get('/debug/memory/trace', async (req, res) => {
  const { userId, query } = req.query;
  const traces = await MemoryDebugger.traceMemoryRetrieval(userId!, query!);
  res.json(traces);
});

router.get('/debug/budget/visualize', async (req, res) => {
  const { assemblyId } = req.query;
  const visualization = await BudgetVisualizer.visualize(assemblyId!);
  res.json(visualization);
});

router.get('/debug/trace/timeline', async (req, res) => {
  const { traceId } = req.query;
  const timeline = RequestTracer.generateTimeline(traceId!);
  res.send(`<pre>${timeline}</pre>`);
});
```

---

## 4. API Testing Framework

### 4.1 API Test Utilities

```typescript
// testing/shared/helpers/api-test-client.ts

export class APITestClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private requestCount: number = 0;
  private responseTimes: number[] = [];

  constructor(baseUrl: string, authToken?: string) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
    };
  }

  async request<T>(
    method: string,
    path: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    const startTime = Date.now();
    this.requestCount++;

    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: { ...this.defaultHeaders, ...headers },
      body: data ? JSON.stringify(data) : undefined,
    });

    const responseTime = Date.now() - startTime;
    this.responseTimes.push(responseTime);

    return {
      status: response.status,
      headers: Object.fromEntries(response.headers),
      data: await response.json(),
      responseTime,
    };
  }

  getStats(): { avgResponseTime: number; totalRequests: number } {
    return {
      avgResponseTime: this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length,
      totalRequests: this.requestCount,
    };
  }
}
```

### 4.2 Conversation API Tests

```typescript
// packages/backend/tests/integration/api/conversations.test.ts

import { describe, it, expect, beforeEach } from 'bun:test';
import { createTestUser, cleanupTestData } from '../../helpers/factories';
import { APITestClient } from '../../../shared/helpers/api-test-client';

describe('Conversations API', () => {
  let client: APITestClient;
  let testUser: any;
  let authToken: string;

  beforeEach(async () => {
    testUser = await createTestUser();
    authToken = await getAuthToken(testUser.id);
    client = new APITestClient('http://localhost:3001', authToken);
  });

  afterEach(async () => {
    await cleanupTestData(testUser.id);
  });

  describe('POST /api/v1/conversations', () => {
    it('should create a new conversation', async () => {
      const response = await client.request('POST', '/api/v1/conversations', {
        title: 'Test Conversation',
        sourceUrl: 'https://example.com',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('conversation');
      expect(response.data.conversation).toHaveProperty('id');
      expect(response.data.conversation.title).toBe('Test Conversation');
    });

    it('should validate required fields', async () => {
      const response = await client.request('POST', '/api/v1/conversations', {
        // Missing required title
      });

      expect(response.status).toBe(400);
      expect(response.data.errors).toBeDefined();
    });

    it('should respect rate limits', async () => {
      const requests = Array(10).fill(null).map(() =>
        client.request('POST', '/api/v1/conversations', {
          title: `Test ${Date.now()}`,
        })
      );

      const results = await Promise.all(requests);
      const rateLimited = results.some(r => r.status === 429);
      expect(rateLimited).toBe(true);
    });
  });

  describe('GET /api/v1/conversations/:id', () => {
    it('should retrieve conversation with ACUs', async () => {
      const convResponse = await client.request('POST', '/api/v1/conversations', {
        title: 'Test',
      });
      const conversationId = convResponse.data.conversation.id;

      const getResponse = await client.request(
        'GET',
        `/api/v1/conversations/${conversationId}?include=acus,memory`
      );

      expect(getResponse.status).toBe(200);
      expect(getResponse.data.conversation).toHaveProperty('acus');
      expect(getResponse.data.conversation).toHaveProperty('memoryContext');
    });

    it('should return 404 for non-existent conversation', async () => {
      const response = await client.request(
        'GET',
        '/api/v1/conversations/non-existent-id'
      );

      expect(response.status).toBe(404);
    });

    it('should enforce ownership (can\'t access others conversations)', async () => {
      const otherUser = await createTestUser();
      const otherToken = await getAuthToken(otherUser.id);
      const otherClient = new APITestClient('http://localhost:3001', otherToken);

      const convResponse = await client.request('POST', '/api/v1/conversations', {
        title: 'My Conversation',
      });

      const response = await otherClient.request(
        'GET',
        `/api/v1/conversations/${convResponse.data.conversation.id}`
      );

      expect(response.status).toBe(403);
    });
  });

  describe('PATCH /api/v1/conversations/:id', () => {
    it('should update conversation metadata', async () => {
      const convResponse = await client.request('POST', '/api/v1/conversations', {
        title: 'Original Title',
      });
      const conversationId = convResponse.data.conversation.id;

      const updateResponse = await client.request('PATCH', `/api/v1/conversations/${conversationId}`, {
        title: 'Updated Title',
        isArchived: true,
      });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.data.conversation.title).toBe('Updated Title');
      expect(updateResponse.data.conversation.isArchived).toBe(true);
    });
  });

  describe('DELETE /api/v1/conversations/:id', () => {
    it('should soft-delete conversation', async () => {
      const convResponse = await client.request('POST', '/api/v1/conversations', {
        title: 'To Delete',
      });
      const conversationId = convResponse.data.conversation.id;

      const deleteResponse = await client.request(
        'DELETE',
        `/api/v1/conversations/${conversationId}`
      );

      expect(deleteResponse.status).toBe(200);

      // Should not appear in list
      const listResponse = await client.request('GET', '/api/v1/conversations');
      const deleted = listResponse.data.conversations.find(
        (c: any) => c.id === conversationId
      );
      expect(deleted).toBeUndefined();
    });
  });
});
```

### 4.3 Context Assembly API Tests

```typescript
// packages/backend/tests/integration/api/context-assembly.test.ts

describe('Context Assembly API', () => {
  let client: APITestClient;
  let testUser: any;

  beforeEach(async () => {
    testUser = await createTestUser();
    const authToken = await getAuthToken(testUser.id);
    client = new APITestClient('http://localhost:3001', authToken);

    // Seed test memories
    await seedMemories(testUser.id, [
      { content: 'I love TypeScript', category: 'skills' },
      { content: 'I work at VIVIM', category: 'employment' },
      { content: 'I prefer dark mode', category: 'preferences' },
    ]);
  });

  describe('POST /api/v1/context/assemble', () => {
    it('should assemble context for user message', async () => {
      const response = await client.request('POST', '/api/v1/context/assemble', {
        message: 'What programming languages do I know?',
        conversationId: 'new-chat',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('systemPrompt');
      expect(response.data).toHaveProperty('context');
      expect(response.data.context).toHaveProperty('memories');
      expect(response.data.context.memories.length).toBeGreaterThan(0);
    }, 30000);

    it('should respect token budget', async () => {
      const response = await client.request('POST', '/api/v1/context/assemble', {
        message: 'Tell me about myself',
        settings: { maxContextTokens: 2000 },
      });

      expect(response.data.budget.totalUsed).toBeLessThanOrEqual(2000);
    }, 30000);

    it('should apply context recipe if provided', async () => {
      const recipe = await createTestRecipe(testUser.id, {
        name: 'Test Recipe',
        excludedLayers: ['L3_entity_profiles'],
      });

      const response = await client.request('POST', '/api/v1/context/assemble', {
        message: 'Who am I?',
        recipeId: recipe.id,
      });

      expect(response.data.metadata.recipeId).toBe(recipe.id);
      expect(response.data.context.entities).toBeUndefined();
    }, 30000);

    it('should handle circuit breaker on AI service failure', async () => {
      // Mock AI service failure
      mockZaiService.fail();

      const response = await client.request('POST', '/api/v1/context/assemble', {
        message: 'Test message',
      });

      // Should fallback gracefully
      expect(response.status).toBe(200);
      expect(response.data.warnings).toContainEqual(
        expect.stringContaining('embedding')
      );

      mockZaiService.restore();
    }, 30000);
  });
});
```

### 4.4 Authentication Tests

```typescript
// packages/backend/tests/integration/api/auth.test.ts

describe('Authentication API', () => {
  const client = new APITestClient('http://localhost:3001');

  describe('POST /api/v1/auth/login', () => {
    it('should return token for valid credentials', async () => {
      const user = await createTestUser({
        email: 'test@example.com',
        password: await hashPassword('password123'),
      });

      const response = await client.request('POST', '/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('token');
      expect(response.data.token).toMatch(/^eyJ/);
    });

    it('should reject invalid credentials', async () => {
      const response = await client.request('POST', '/api/v1/auth/login', {
        email: 'test@example.com',
        password: 'wrongpassword',
      });

      expect(response.status).toBe(401);
    });
  });

  describe('JWT Validation', () => {
    it('should reject expired tokens', async () => {
      const expiredToken = generateExpiredToken();
      const expiredClient = new APITestClient('http://localhost:3001', expiredToken);

      const response = await expiredClient.request('GET', '/api/v1/conversations');

      expect(response.status).toBe(401);
    });

    it('should reject malformed tokens', async () => {
      const malformedClient = new APITestClient('http://localhost:3001', 'invalid.token.here');

      const response = await malformedClient.request('GET', '/api/v1/conversations');

      expect(response.status).toBe(401);
    });
  });
});
```

---

## 5. Memory Testing Suite

### 5.1 Memory Service Tests

```typescript
// packages/backend/tests/unit/services/memory-service.test.ts

import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { MemoryService } from '../../../src/services/memory/memory-service';
import { createTestPrisma } from '../../helpers/database';

describe('MemoryService', () => {
  let prisma: any;
  let memoryService: MemoryService;
  let testUserId: string;

  beforeEach(async () => {
    prisma = await createTestPrisma();
    memoryService = new MemoryService(prisma);

    const testUser = await prisma.user.create({
      data: {
        did: `test_user_${Date.now()}`,
        handle: `testuser`,
        email: `test@example.com`,
      },
    });
    testUserId = testUser.id;
  });

  describe('createMemory', () => {
    it('should create memory with embedding', async () => {
      const memory = await memoryService.createMemory({
        userId: testUserId,
        content: 'I love TypeScript',
        category: 'skills',
        memoryType: 'SEMANTIC',
      });

      expect(memory).toBeDefined();
      expect(memory.id).toBeDefined();
      expect(memory.content).toBe('I love TypeScript');
      expect(memory.embedding).toBeDefined();
      expect(memory.embedding.length).toBe(1536);
    });

    it('should auto-categorize if category not provided', async () => {
      const memory = await memoryService.createMemory({
        userId: testUserId,
        content: 'I work as a software engineer at VIVIM',
        memoryType: 'SEMANTIC',
      });

      expect(memory.category).toBe('employment');
    });

    it('should calculate importance based on content', async () => {
      const memory = await memoryService.createMemory({
        userId: testUserId,
        content: 'My name is John Doe and I was born in 1990',
        memoryType: 'EPISODIC',
      });

      expect(memory.importance).toBeGreaterThan(0.5);
    });
  });

  describe('retrieveMemories', () => {
    beforeEach(async () => {
      // Seed test memories
      await Promise.all([
        memoryService.createMemory({
          userId: testUserId,
          content: 'I love TypeScript',
          category: 'skills',
        }),
        memoryService.createMemory({
          userId: testUserId,
          content: 'I prefer dark mode',
          category: 'preferences',
        }),
        memoryService.createMemory({
          userId: testUserId,
          content: 'I work at VIVIM',
          category: 'employment',
        }),
      ]);
    });

    it('should retrieve memories by semantic similarity', async () => {
      const memories = await memoryService.retrieveMemories({
        userId: testUserId,
        query: 'What programming languages do you know?',
        limit: 5,
      });

      expect(memories.length).toBeGreaterThan(0);
      expect(memories[0].content).toContain('TypeScript');
    });

    it('should filter by category', async () => {
      const memories = await memoryService.retrieveMemories({
        userId: testUserId,
        query: 'preferences',
        category: 'preferences',
      });

      expect(memories.every(m => m.category === 'preferences')).toBe(true);
    });

    it('should respect minimum similarity threshold', async () => {
      const memories = await memoryService.retrieveMemories({
        userId: testUserId,
        query: 'completely unrelated query about cooking',
        minSimilarity: 0.8,
      });

      expect(memories.length).toBe(0);
    });
  });

  describe('updateMemory', () => {
    it('should update memory content and re-embed', async () => {
      const memory = await memoryService.createMemory({
        userId: testUserId,
        content: 'Original content',
        category: 'notes',
      });

      const updated = await memoryService.updateMemory(memory.id, {
        content: 'Updated content',
      });

      expect(updated.content).toBe('Updated content');
      expect(updated.embedding).toBeDefined();
      expect(updated.embedding).not.toEqual(memory.embedding);
    });

    it('should prevent changing userId (ownership)', async () => {
      const memory = await memoryService.createMemory({
        userId: testUserId,
        content: 'My memory',
        category: 'notes',
      });

      await expect(
        memoryService.updateMemory(memory.id, { userId: 'other-user' })
      ).rejects.toThrow('Cannot change memory ownership');
    });
  });

  describe('deleteMemory', () => {
    it('should soft-delete memory', async () => {
      const memory = await memoryService.createMemory({
        userId: testUserId,
        content: 'To be deleted',
        category: 'notes',
      });

      await memoryService.deleteMemory(memory.id);

      const deleted = await prisma.memory.findUnique({
        where: { id: memory.id },
      });

      expect(deleted.deletedAt).toBeDefined();
    });

    it('should cascade delete related ACUs', async () => {
      const memory = await memoryService.createMemory({
        userId: testUserId,
        content: 'Memory with ACUs',
        category: 'notes',
      });

      await prisma.atomicChatUnit.create({
        data: {
          authorDid: testUserId,
          content: 'Related ACU',
          memoryId: memory.id,
          type: 'memory_reference',
        },
      });

      await memoryService.deleteMemory(memory.id, { cascade: true });

      const acus = await prisma.atomicChatUnit.findMany({
        where: { memoryId: memory.id },
      });

      expect(acus.every((acu: any) => acu.deletedAt)).toBe(true);
    });
  });
});
```

### 5.2 Memory Conflict Detection Tests

```typescript
// packages/backend/tests/unit/services/memory-conflict-detection.test.ts

import { describe, it, expect } from 'bun:test';
import { ConflictDetectionService } from '../../../src/services/memory-conflict-detection';

describe('ConflictDetectionService', () => {
  const service = new ConflictDetectionService();

  describe('analyzePairwiseConflict', () => {
    it('should detect direct contradictions', async () => {
      const result = await service.analyzePairwiseConflict(
        'I love coffee',
        'I hate coffee'
      );

      expect(result.hasConflict).toBe(true);
      expect(result.conflictType).toBe('contradiction');
      expect(result.confidence).toBeGreaterThan(0.7);
    });

    it('should detect frequency contradictions', async () => {
      const result = await service.analyzePairwiseConflict(
        'I always drink coffee',
        'I never drink coffee'
      );

      expect(result.hasConflict).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should not flag compatible memories', async () => {
      const result = await service.analyzePairwiseConflict(
        'I love coffee',
        'I enjoy tea'
      );

      expect(result.hasConflict).toBe(false);
    });

    it('should detect outdated information', async () => {
      const result = await service.analyzePairwiseConflict(
        'I work at Company A',
        'I work at Company B'
      );

      expect(result.hasConflict).toBe(true);
      expect(result.suggestedResolution).toBe('keep_newest');
    });
  });

  describe('checkForConflicts', () => {
    it('should find all conflicting memories for user', async () => {
      const testUserId = await createTestUser();

      await createMemory(testUserId, 'I live in New York');
      await createMemory(testUserId, 'I live in Los Angeles');

      const conflicts = await service.checkForConflicts(
        testUserId,
        'I live in San Francisco'
      );

      expect(conflicts.length).toBeGreaterThan(0);
    });
  });
});
```

### 5.3 ACU Deduplication Tests

```typescript
// packages/backend/tests/unit/services/acu-deduplication.test.ts

describe('ACUDeduplicationService', () => {
  describe('checkForDuplicates', () => {
    it('should detect exact duplicates', async () => {
      await createACU(testUserId, 'Test message content');

      const result = await acuDeduplicationService.checkForDuplicates(
        testUserId,
        'Test message content',
        conversationId
      );

      expect(result.isDuplicate).toBe(true);
      expect(result.matchType).toBe('exact');
      expect(result.recommendation).toBe('skip');
    });

    it('should detect near-duplicates', async () => {
      await createACU(testUserId, 'I love TypeScript programming');

      const result = await acuDeduplicationService.checkForDuplicates(
        testUserId,
        'I love programming in TypeScript',
        conversationId
      );

      expect(result.isDuplicate).toBe(true);
      expect(result.matchType).toBe('semantic');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should allow non-duplicates', async () => {
      const result = await acuDeduplicationService.checkForDuplicates(
        testUserId,
        'Unique message content 12345',
        conversationId
      );

      expect(result.isDuplicate).toBe(false);
      expect(result.recommendation).toBe('create_new');
    });
  });
});
```

### 5.4 Memory Timeline Tests

```typescript
// packages/backend/tests/unit/services/memory-timeline.test.ts

describe('MemoryTimelineService', () => {
  describe('generateTimeline', () => {
    it('should order memories chronologically', async () => {
      const timeline = await memoryTimelineService.generateTimeline(testUserId);

      expect(timeline.memories).toHaveLength(5);
      expect(timeline.memories[0].createdAt).toBeLessThanOrEqual(
        timeline.memories[1].createdAt
      );
    });

    it('should group memories by category', async () => {
      const timeline = await memoryTimelineService.generateTimeline(testUserId);

      expect(timeline.groups).toBeDefined();
      expect(timeline.groups.skills).toBeDefined();
      expect(timeline.groups.preferences).toBeDefined();
    });

    it('should calculate memory density metrics', async () => {
      const timeline = await memoryTimelineService.generateTimeline(testUserId);

      expect(timeline.metrics).toBeDefined();
      expect(timeline.metrics.totalMemories).toBe(5);
      expect(timeline.metrics.averagePerDay).toBeGreaterThan(0);
    });
  });
});
```

---

## 6. Context Engine Testing

### 6.1 Context Assembler Tests

```typescript
// packages/backend/tests/unit/context/context-assembler.test.ts

import { describe, it, expect, beforeEach } from 'bun:test';
import { DynamicContextAssembler } from '../../../src/context/context-assembler';
import { createMockServices } from '../../helpers/mocks';

describe('DynamicContextAssembler', () => {
  let assembler: DynamicContextAssembler;
  let testUserId: string;
  let testConversationId: string;

  beforeEach(async () => {
    const { prisma, embeddingService, tokenEstimator, bundleCompiler } =
      createMockServices();

    assembler = new DynamicContextAssembler({
      prisma,
      embeddingService,
      tokenEstimator,
      bundleCompiler,
    });

    testUserId = await createTestUser();
    testConversationId = await createTestConversation(testUserId);
  });

  describe('assemble', () => {
    it('should assemble complete context for message', async () => {
      const result = await assembler.assemble({
        userId: testUserId,
        conversationId: testConversationId,
        userMessage: 'Hello, how are you?',
        modelId: 'glm-4.7-flash',
      });

      expect(result).toHaveProperty('systemPrompt');
      expect(result).toHaveProperty('context');
      expect(result).toHaveProperty('budget');
      expect(result).toHaveProperty('metadata');
    });

    it('should detect topics from user message', async () => {
      const result = await assembler.assemble({
        userId: testUserId,
        conversationId: testConversationId,
        userMessage: 'I want to talk about TypeScript and programming',
      });

      expect(result.metadata.topics).toBeDefined();
      expect(result.metadata.topics.length).toBeGreaterThan(0);
      expect(result.metadata.topics[0].label).toMatch(
        /typescript|programming/i
      );
    });

    it('should retrieve relevant memories', async () => {
      await seedMemories(testUserId, [
        { content: 'I love TypeScript', category: 'skills' },
        { content: 'I prefer dark mode', category: 'preferences' },
      ]);

      const result = await assembler.assemble({
        userId: testUserId,
        conversationId: testConversationId,
        userMessage: 'What do I know about programming?',
      });

      expect(result.context.memories).toBeDefined();
      expect(result.context.memories.length).toBeGreaterThan(0);
      expect(result.context.memories[0].content).toContain('TypeScript');
    });

    it('should respect token budget', async () => {
      const result = await assembler.assemble({
        userId: testUserId,
        userMessage: 'Test message',
        settings: { maxContextTokens: 2000 },
      });

      expect(result.budget.totalAvailable).toBe(2000);
      expect(result.budget.totalUsed).toBeLessThanOrEqual(2000);
    });

    it('should apply layer weights from recipe', async () => {
      const recipe = await createTestRecipe(testUserId, {
        layerWeights: { L0_identity: 2.0, L2_topic: 0.5 },
      });

      const result = await assembler.assemble({
        userId: testUserId,
        recipeId: recipe.id,
        userMessage: 'Test',
      });

      expect(result.metadata.recipeId).toBe(recipe.id);
    });

    it('should exclude layers per recipe', async () => {
      const recipe = await createTestRecipe(testUserId, {
        excludedLayers: ['L3_entity_profiles'],
      });

      const result = await assembler.assemble({
        userId: testUserId,
        recipeId: recipe.id,
        userMessage: 'Test',
      });

      expect(result.context.entities).toBeUndefined();
    });

    it('should cache assembly results', async () => {
      const result1 = await assembler.assemble({
        userId: testUserId,
        conversationId: testConversationId,
        userMessage: 'Cached message',
      });

      const result2 = await assembler.assemble({
        userId: testUserId,
        conversationId: testConversationId,
        userMessage: 'Cached message',
      });

      expect(result1.budget.totalUsed).toBe(result2.budget.totalUsed);
    });

    it('should handle missing conversation gracefully', async () => {
      const result = await assembler.assemble({
        userId: testUserId,
        conversationId: 'non-existent',
        userMessage: 'Test',
      });

      expect(result).toBeDefined();
      expect(result.warnings).toContainEqual(
        expect.stringContaining('conversation not found')
      );
    });
  });

  describe('loadRecipe', () => {
    it('should load user-specific recipe', async () => {
      const recipe = await createTestRecipe(testUserId);
      const loaded = await (assembler as any).loadRecipe(testUserId, recipe.id);

      expect(loaded.id).toBe(recipe.id);
      expect(loaded.userId).toBe(testUserId);
    });

    it('should fall back to default recipe if none provided', async () => {
      const loaded = await (assembler as any).loadRecipe(testUserId, null);

      expect(loaded).toBeDefined();
      expect(loaded.isDefault).toBe(true);
    });
  });
});
```

### 6.2 Context Pipeline Tests

```typescript
// packages/backend/tests/unit/context/context-pipeline.test.ts

describe('ContextPipeline', () => {
  describe('execute', () => {
    it('should execute all pipeline stages in order', async () => {
      const pipeline = new ContextPipeline();
      const context = { message: 'Test', userId: 'user1' };

      const result = await pipeline.execute(context);

      expect(result.stages).toContain('topicDetection');
      expect(result.stages).toContain('memoryRetrieval');
      expect(result.stages).toContain('entityResolution');
      expect(result.stages).toContain('promptCompilation');
    });

    it('should handle stage failures gracefully', async () => {
      const pipeline = new ContextPipeline();
      pipeline.registerStage('failingStage', async () => {
        throw new Error('Stage failed');
      });

      const result = await pipeline.execute({ message: 'Test' });

      expect(result.errors).toBeDefined();
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should support stage middleware', async () => {
      const pipeline = new ContextPipeline();
      const middleware = jest.fn((ctx, next) => {
        ctx.middlewareRan = true;
        return next();
      });

      pipeline.use(middleware);
      await pipeline.execute({ message: 'Test' });

      expect(middleware).toHaveBeenCalled();
    });
  });
});
```

### 6.3 Budget Algorithm Tests

```typescript
// packages/backend/tests/unit/context/budget-algorithm.test.ts

describe('BudgetAlgorithm', () => {
  describe('allocate', () => {
    it('should allocate tokens proportionally by layer weight', () => {
      const algorithm = new BudgetAlgorithm();
      const layers = [
        { name: 'L0_identity', weight: 2.0 },
        { name: 'L2_topic', weight: 1.0 },
        { name: 'L3_entity', weight: 0.5 },
      ];

      const allocation = algorithm.allocate(layers, 4000);

      expect(allocation.L0_identity).toBeGreaterThan(allocation.L2_topic);
      expect(allocation.L2_topic).toBeGreaterThan(allocation.L3_entity);
      expect(Object.values(allocation).reduce((a, b) => a + b, 0)).toBe(4000);
    });

    it('should handle layer overflow', () => {
      const algorithm = new BudgetAlgorithm();
      const layers = [{ name: 'L0', weight: 1.0 }];

      const allocation = algorithm.allocate(layers, 100);

      // Layer requests 200 but only 100 available
      const result = algorithm.applyOverflow(allocation, { L0: 200 });

      expect(result.L0).toBe(100);
    });

    it('should redistribute unused tokens', () => {
      const algorithm = new BudgetAlgorithm();
      const layers = [
        { name: 'L0', weight: 1.0 },
        { name: 'L1', weight: 1.0 },
      ];

      const allocation = algorithm.allocate(layers, 200);
      const result = algorithm.redistribute(allocation, { L0: 50 });

      expect(result.L1).toBeGreaterThan(100);
    });
  });
});
```

### 6.4 Context Cache Tests

```typescript
// packages/backend/tests/unit/context/context-cache.test.ts

describe('ContextCache', () => {
  let cache: ContextCache;

  beforeEach(() => {
    cache = getContextCache();
    cache.clear();
  });

  describe('get/set', () => {
    it('should store and retrieve values', () => {
      cache.set('test:key', { data: 'value' });
      const result = cache.get('test:key');

      expect(result).toEqual({ data: 'value' });
    });

    it('should return undefined for missing keys', () => {
      const result = cache.get('nonexistent:key');
      expect(result).toBeUndefined();
    });

    it('should respect TTL', async () => {
      cache.set('ttl:key', { data: 'value' }, { ttl: 100 });
      expect(cache.get('ttl:key')).toBeDefined();

      await sleep(150);
      expect(cache.get('ttl:key')).toBeUndefined();
    });
  });

  describe('invalidation', () => {
    it('should invalidate by pattern', () => {
      cache.set('user:1:context', { data: '1' });
      cache.set('user:2:context', { data: '2' });
      cache.set('user:1:other', { data: 'other' });

      cache.invalidate('user:1:*');

      expect(cache.get('user:1:context')).toBeUndefined();
      expect(cache.get('user:1:other')).toBeUndefined();
      expect(cache.get('user:2:context')).toBeDefined();
    });

    it('should invalidate on memory update', async () => {
      const memoryId = await createMemory(testUserId, 'Test');

      cache.set(`memory:${memoryId}:context`, { data: 'cached' });
      expect(cache.get(`memory:${memoryId}:context`)).toBeDefined();

      await updateMemory(memoryId, { content: 'Updated' });

      expect(cache.get(`memory:${memoryId}:context`)).toBeUndefined();
    });
  });

  describe('stats', () => {
    it('should track cache metrics', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.get('key1');
      cache.get('key1');
      cache.get('nonexistent');

      const stats = cache.getStats();

      expect(stats.size).toBe(2);
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
      expect(stats.hitRate).toBe(2 / 3);
    });
  });
});
```

### 6.5 Context Ending Engine Tests

```typescript
// packages/backend/tests/unit/context/context-ending-engine.test.ts

describe('ContextEndingEngine', () => {
  describe('detectEnding', () => {
    it('should detect conversation ending signals', async () => {
      const result = await contextEndingEngine.detectEnding(
        'Thank you, that\'s all I needed'
      );

      expect(result.isEnding).toBe(true);
      expect(result.confidence).toBeGreaterThan(0.7);
      expect(result.signals).toContain('closing_statement');
    });

    it('should detect continuation signals', async () => {
      const result = await contextEndingEngine.detectEnding(
        'Can you tell me more about that?'
      );

      expect(result.isEnding).toBe(false);
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle ambiguous messages', async () => {
      const result = await contextEndingEngine.detectEnding('Okay');

      expect(result.isEnding).toBe(false);
      expect(result.confidence).toBeLessThan(0.5);
    });
  });

  describe('shouldCompact', () => {
    it('should trigger compaction when context is full', async () => {
      const result = await contextEndingEngine.shouldCompact({
        currentTokens: 7500,
        maxTokens: 8000,
        messageCount: 50,
      });

      expect(result.shouldCompact).toBe(true);
      expect(result.reason).toContain('token_limit');
    });

    it('should consider conversation age', async () => {
      const result = await contextEndingEngine.shouldCompact({
        currentTokens: 5000,
        maxTokens: 8000,
        messageCount: 100,
        conversationAge: 3600000, // 1 hour
      });

      expect(result.shouldCompact).toBe(true);
      expect(result.reason).toContain('conversation_age');
    });
  });

  describe('generateEndingSummary', () => {
    it('should generate summary of conversation', async () => {
      const messages = [
        { role: 'user', content: 'What is TypeScript?' },
        { role: 'assistant', content: 'TypeScript is a typed superset of JavaScript...' },
        { role: 'user', content: 'How do I install it?' },
        { role: 'assistant', content: 'You can install it with npm...' },
      ];

      const summary = await contextEndingEngine.generateEndingSummary(messages);

      expect(summary).toBeDefined();
      expect(summary.length).toBeLessThan(500);
      expect(summary).toContain('TypeScript');
    });
  });
});
```

---

## 7. Frontend Testing

### 7.1 Component Tests

```typescript
// packages/frontend/src/components/chat/chat-provider.test.tsx

import { describe, it, expect } from 'bun:test';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatProvider } from './chat-provider';

describe('ChatProvider', () => {
  it('should provide chat context to children', () => {
    render(
      <ChatProvider>
        <div data-testid="child">Child</div>
      </ChatProvider>
    );

    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('should handle message sending', async () => {
    render(<ChatProvider />);

    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.click(sendButton);

    expect(await screen.findByText('Test message')).toBeInTheDocument();
  });

  it('should show loading state during API call', async () => {
    render(<ChatProvider />);

    const input = screen.getByRole('textbox');
    const sendButton = screen.getByRole('button', { name: /send/i });

    fireEvent.change(input, { target: { value: 'Test' } });
    fireEvent.click(sendButton);

    expect(screen.getByTestId('loading-indicator')).toBeInTheDocument();
  });
});
```

### 7.2 Hook Tests

```typescript
// packages/frontend/src/hooks/use-chat.test.ts

import { renderHook, act } from '@testing-library/react';
import { useChat } from './use-chat';

describe('useChat', () => {
  it('should initialize with empty messages', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('should add user message', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0].role).toBe('user');
  });

  it('should handle API errors', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Invalid');
    });

    expect(result.current.error).toBeDefined();
  });
});
```

### 7.3 Visual Regression Tests

```typescript
// packages/frontend/src/__tests__/visual/chat.test.ts

import { test, expect } from '@playwright/test';

test.describe('Chat Page Visual Regression', () => {
  test('should render chat page correctly', async ({ page }) => {
    await page.goto('/chat');

    await expect(page).toHaveScreenshot('chat-initial.png', {
      fullPage: true,
    });
  });

  test('should render message correctly', async ({ page }) => {
    await page.goto('/chat');

    await page.fill('[role="textbox"]', 'Test message');
    await page.click('[aria-label="Send"]');

    await page.waitForSelector('.message');

    await expect(page).toHaveScreenshot('chat-with-message.png', {
      fullPage: true,
    });
  });

  test('should render dark theme correctly', async ({ page }) => {
    await page.goto('/chat');

    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });

    await expect(page).toHaveScreenshot('chat-dark-theme.png', {
      fullPage: true,
    });
  });
});
```

---

## 8. E2E Testing

### 8.1 User Journey Tests

```typescript
// testing/e2e/user-journeys/chat-flow.test.ts

import { test, expect } from '@playwright/test';

test.describe('Chat User Journey', () => {
  test('complete chat flow with memory', async ({ page }) => {
    // 1. Navigate to chat
    await page.goto('/chat');
    await expect(page).toHaveTitle(/VIVIM Chat/);

    // 2. Send initial message
    await page.fill('[role="textbox"]', 'Hello, my name is Alex');
    await page.click('[aria-label="Send"]');

    // 3. Wait for response
    await page.waitForSelector('.message.assistant');
    await expect(page.locator('.message:last-child')).toContainText(/hello|hi/i);

    // 4. Send follow-up that should use memory
    await page.fill('[role="textbox"]', 'What is my name?');
    await page.click('[aria-label="Send"]');

    // 5. Verify memory was used
    await page.waitForSelector('.message.assistant');
    const response = await page.locator('.message:last-child').textContent();
    expect(response).toContain('Alex');

    // 6. Verify context budget displayed
    await expect(page.locator('[data-testid="budget-display"]')).toBeVisible();
  });

  test('conversation persistence across reload', async ({ page }) => {
    await page.goto('/chat');

    await page.fill('[role="textbox"]', 'Persistent message');
    await page.click('[aria-label="Send"]');
    await page.waitForSelector('.message.assistant');

    await page.reload();

    await expect(page.locator('.message')).toContainText('Persistent message');
  });
});
```

### 8.2 API Integration E2E

```typescript
// testing/e2e/api/context-assembly.test.ts

import { test, expect } from '@playwright/test';

test.describe('Context Assembly E2E', () => {
  test('should assemble context with memories', async ({ request }) => {
    // Create test user
    const userResponse = await request.post('/api/v1/auth/register', {
      data: {
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
      },
    });
    expect(userResponse.ok()).toBe(true);
    const { token } = await userResponse.json();

    // Create memories
    await request.post('/api/v1/memories', {
      data: { content: 'I love TypeScript', category: 'skills' },
      headers: { Authorization: `Bearer ${token}` },
    });

    // Assemble context
    const contextResponse = await request.post('/api/v1/context/assemble', {
      data: { message: 'What do I know?' },
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(contextResponse.ok()).toBe(true);
    const context = await contextResponse.json();
    expect(context.context.memories.length).toBeGreaterThan(0);
  });
});
```

---

## 9. Performance Testing

### 9.1 Load Testing

```typescript
// testing/scripts/load-test.ts

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const contextAssemblyTime = new Trend('context_assembly_time');

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 50 },
    { duration: '2m', target: 100 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],
    errors: ['rate<0.01'],
    context_assembly_time: ['p(95)<3000'],
  },
};

export default function () {
  const token = authenticate();
  const params = { headers: { Authorization: `Bearer ${token}` } };

  const startTime = Date.now();
  const response = http.post(
    'http://localhost:3001/api/v1/context/assemble',
    JSON.stringify({ message: 'Test message' }),
    params
  );

  contextAssemblyTime.add(Date.now() - startTime);

  check(response, {
    'status is 200': (r) => r.status === 200,
    'has systemPrompt': (r) => JSON.parse(r.body).systemPrompt !== undefined,
  });

  errorRate.add(response.status !== 200);
  sleep(1);
}
```

### 9.2 Performance Benchmarks

```typescript
// testing/scripts/performance-benchmark.ts

interface BenchmarkResult {
  operation: string;
  avgTime: number;
  p95Time: number;
  p99Time: number;
  minTime: number;
  maxTime: number;
  requestsPerSecond: number;
}

export async function runBenchmarks(): Promise<BenchmarkResult[]> {
  const results: BenchmarkResult[] = [];

  // Benchmark context assembly
  results.push(await benchmark('Context Assembly', async () => {
    await assembleContext('test-user', 'Test message');
  }));

  // Benchmark memory retrieval
  results.push(await benchmark('Memory Retrieval', async () => {
    await retrieveMemories('test-user', 'query');
  }));

  // Benchmark ACU creation
  results.push(await benchmark('ACU Creation', async () => {
    await createACU('test-user', 'content');
  }));

  return results;
}

async function benchmark(
  name: string,
  fn: () => Promise<void>,
  iterations: number = 100
): Promise<BenchmarkResult> {
  const times: number[] = [];

  for (let i = 0; i < iterations; i++) {
    const start = Date.now();
    await fn();
    times.push(Date.now() - start);
  }

  times.sort((a, b) => a - b);

  return {
    operation: name,
    avgTime: times.reduce((a, b) => a + b, 0) / iterations,
    p95Time: times[Math.floor(iterations * 0.95)],
    p99Time: times[Math.floor(iterations * 0.99)],
    minTime: times[0],
    maxTime: times[times.length - 1],
    requestsPerSecond: 1000 / (times.reduce((a, b) => a + b, 0) / iterations),
  };
}
```

---

## 10. Test Data Management

### 10.1 Factories

```typescript
// testing/shared/factories/index.ts

import { faker } from '@faker-js/faker';

export function createUser(overrides = {}) {
  return {
    did: `did:key:${faker.string.uuid()}`,
    handle: faker.internet.userName(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    ...overrides,
  };
}

export function createMemory(overrides = {}) {
  return {
    content: faker.lorem.sentence(),
    category: faker.helpers.arrayElement([
      'skills',
      'preferences',
      'employment',
      'education',
    ]),
    memoryType: faker.helpers.arrayElement(['SEMANTIC', 'EPISODIC']),
    importance: faker.number.float({ min: 0.1, max: 1 }),
    ...overrides,
  };
}

export function createConversation(overrides = {}) {
  return {
    title: faker.lorem.sentence(3),
    sourceUrl: faker.internet.url(),
    status: 'ACTIVE',
    ...overrides,
  };
}

export function createACU(overrides = {}) {
  return {
    content: faker.lorem.paragraph(),
    type: 'message',
    category: 'general',
    state: 'ACTIVE',
    ...overrides,
  };
}

export function createContextRecipe(overrides = {}) {
  return {
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    layerWeights: {},
    excludedLayers: [],
    isDefault: false,
    ...overrides,
  };
}
```

### 10.2 Database Helpers

```typescript
// testing/shared/helpers/database.ts

export async function createTestPrisma(): Promise<PrismaClient> {
  const prisma = new PrismaClient({
    datasourceUrl: process.env.TEST_DATABASE_URL,
  });

  await prisma.$connect();
  return prisma;
}

export async function cleanupTestData(userId: string): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.$transaction([
    prisma.atomicChatUnit.deleteMany({ where: { authorDid: userId } }),
    prisma.memory.deleteMany({ where: { userId } }),
    prisma.conversation.deleteMany({ where: { ownerId: userId } }),
    prisma.contextRecipe.deleteMany({ where: { userId } }),
    prisma.user.delete({ where: { id: userId } }),
  ]);
}

export async function seedMemories(
  userId: string,
  memories: Array<{ content: string; category: string }>
): Promise<void> {
  const prisma = getPrismaClient();

  await prisma.memory.createMany({
    data: memories.map(m => ({
      userId,
      content: m.content,
      category: m.category,
      memoryType: 'SEMANTIC',
      importance: 0.5,
    })),
  });
}
```

---

## 11. CI/CD Integration

### 11.1 GitHub Actions Workflow

```yaml
# .github/workflows/test.yml

name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun test --coverage
      - uses: codecov/codecov-action@v3

  integration-tests:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run db:generate
      - run: bun run db:migrate
      - run: bun test tests/integration

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - uses: microsoft/playwright-github-action@v1
      - run: bun install
      - run: bun run build
      - run: bun run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run test:performance
      - uses: actions/upload-artifact@v3
        with:
          name: performance-report
          path: reports/performance/
```

### 11.2 Test Scripts

```json
// package.json

{
  "scripts": {
    "test": "bun test",
    "test:unit": "bun test tests/unit",
    "test:integration": "bun test tests/integration",
    "test:e2e": "playwright test",
    "test:performance": "bun run testing/scripts/performance-benchmark.ts",
    "test:coverage": "bun test --coverage --coverage-reporter=html",
    "test:watch": "bun test --watch",
    "test:ci": "bun test --coverage --reporter=junit"
  }
}
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Set up test directory structure
- [ ] Configure Bun Test + Playwright
- [ ] Create test utilities and factories
- [ ] Implement database helpers
- [ ] Set up CI/CD pipeline

### Phase 2: Backend Tests (Week 2-3)
- [ ] Write unit tests for services
- [ ] Write integration tests for APIs
- [ ] Implement debugging utilities
- [ ] Create memory test suite
- [ ] Create context engine tests

### Phase 3: Frontend Tests (Week 3-4)
- [ ] Set up React Testing Library
- [ ] Write component tests
- [ ] Write hook tests
- [ ] Implement visual regression tests

### Phase 4: E2E & Performance (Week 4-5)
- [ ] Write user journey tests
- [ ] Implement load testing
- [ ] Create performance benchmarks
- [ ] Set up performance monitoring

### Phase 5: Polish (Week 5-6)
- [ ] Achieve 80%+ code coverage
- [ ] Optimize test execution time
- [ ] Create test documentation
- [ ] Set up test reporting dashboard

---

## Appendix: Quick Reference

### Running Tests

```bash
# All tests
bun test

# Unit tests only
bun test tests/unit

# Integration tests only
bun test tests/integration

# With coverage
bun test --coverage

# Watch mode
bun test --watch

# Specific file
bun test path/to/test.ts

# E2E tests
bun run test:e2e

# Performance tests
bun run test:performance
```

### Debug Utilities

```typescript
// Inspect context assembly
const report = await ContextInspector.inspect(userId, message);

// Trace memory retrieval
const traces = await MemoryDebugger.traceMemoryRetrieval(userId, query);

// Visualize token budget
const viz = await BudgetVisualizer.visualize(assemblyId);

// Generate request timeline
const timeline = RequestTracer.generateTimeline(traceId);
```

### Test Data

```typescript
// Create test user
const user = await createTestUser();

// Seed memories
await seedMemories(userId, [
  { content: 'Memory 1', category: 'skills' },
]);

// Cleanup
await cleanupTestData(userId);
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-03-27  
**Maintainer:** VIVIM Engineering Team
