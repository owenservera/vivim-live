# Global Internal Rate Limiter Design

## Overview

A centralized request funnel that enforces a **global 2-second interval** between all outgoing AI API requests, with automatic queuing for excess requests.

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         APPLICATION LAYER                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ Translate│  │   Chat   │  │ Embedding│  │  Other   │                 │
│  │  Route   │  │   Route  │  │  Service │  │ Services │                 │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘                 │
│       │             │             │             │                        │
│       └─────────────┴─────────────┴─────────────┘                        │
│                         │                                                │
│                         ▼                                                │
│       ┌───────────────────────────────────────────────────┐              │
│       │         GlobalRateLimiter (Singleton)             │              │
│       │  ┌─────────────────────────────────────────────┐  │              │
│       │  │            Request Queue                    │  │              │
│       │  │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │  │              │
│       │  │  │Req 1│→│Req 2│→│Req 3│→│Req 4│→│Req 5│   │  │              │
│       │  │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘   │  │              │
│       │  └─────────────────────────────────────────────┘  │              │
│       │                                                   │              │
│       │  ┌─────────────────────────────────────────────┐  │              │
│       │  │         Token Bucket Controller             │  │              │
│       │  │  - Last Request: timestamp                  │  │              │
│       │  │  - Min Interval: 2000ms                     │  │              │
│       │  │  - Processing: boolean                      │  │              │
│       │  └─────────────────────────────────────────────┘  │              │
│       └───────────────────────────────────────────────────┘              │
│                         │                                                │
│                         ▼                                                │
└──────────────────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL AI APIs                                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │
│  │   Z.AI API      │  │   OpenAI API    │  │  Other Providers│           │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Core Design Principles

| Principle | Implementation |
|-----------|----------------|
| **Singleton** | Single instance across application (Node.js process) |
| **FIFO Queue** | First-come-first-served request processing |
| **Fixed Interval** | Enforce 2-second minimum between request starts |
| **Non-blocking Submit** | `submit()` returns Promise that resolves when request completes |
| **Graceful Shutdown** | Drain queue on process exit |
| **Observable** | Emit events for queue state, wait times, processing |
| **Priority Support** | Optional priority levels (CRITICAL, HIGH, NORMAL, LOW) |

---

## API Design

### Interface

```typescript
interface GlobalRateLimiterConfig {
  minIntervalMs: number;        // Minimum time between requests (default: 2000)
  maxQueueSize: number;         // Maximum queue size (default: 1000)
  timeoutMs: number;            // Request timeout (default: 60000)
  enablePriority: boolean;      // Enable priority queues (default: false)
}

interface QueuedRequest<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: RequestPriority;
  submittedAt: number;
  startedAt?: number;
  completedAt?: number;
}

enum RequestPriority {
  CRITICAL = 0,  // Bypass queue if possible
  HIGH = 1,
  NORMAL = 2,
  LOW = 3
}

interface QueueStats {
  queueLength: number;
  processingCount: number;
  totalProcessed: number;
  totalFailed: number;
  avgWaitTimeMs: number;
  avgProcessingTimeMs: number;
  lastRequestAt?: number;
  nextRequestAt?: number;
}
```

### Methods

```typescript
class GlobalRateLimiter {
  // Submit a request to the queue
  submit<T>(fn: () => Promise<T>, options?: { priority?: RequestPriority }): Promise<T>
  
  // Get current queue statistics
  getStats(): QueueStats
  
  // Clear pending requests (optionally cancel in-flight)
  clear(cancelInFlight?: boolean): void
  
  // Pause processing (queue accepts but doesn't process)
  pause(): void
  
  // Resume processing
  resume(): void
  
  // Get current queue length
  getQueueLength(): number
  
  // Check if limiter is healthy
  isHealthy(): boolean
}
```

---

## Implementation

### File: `src/lib/rate-limiter/global-rate-limiter.ts`

```typescript
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export enum RequestPriority {
  CRITICAL = 0,
  HIGH = 1,
  NORMAL = 2,
  LOW = 3
}

export interface GlobalRateLimiterConfig {
  minIntervalMs: number;
  maxQueueSize: number;
  timeoutMs: number;
  enablePriority: boolean;
}

const DEFAULT_CONFIG: GlobalRateLimiterConfig = {
  minIntervalMs: 2000,
  maxQueueSize: 1000,
  timeoutMs: 60000,
  enablePriority: false
};

interface QueuedRequest<T> {
  id: string;
  fn: () => Promise<T>;
  resolve: (value: T) => void;
  reject: (error: Error) => void;
  priority: RequestPriority;
  submittedAt: number;
  startedAt?: number;
  completedAt?: number;
}

export interface QueueStats {
  queueLength: number;
  processingCount: number;
  totalProcessed: number;
  totalFailed: number;
  avgWaitTimeMs: number;
  avgProcessingTimeMs: number;
  lastRequestAt?: number;
  nextRequestAt?: number;
}

export class GlobalRateLimiter extends EventEmitter {
  private queue: QueuedRequest<unknown>[] = [];
  private processingCount = 0;
  private lastRequestAt = 0;
  private isProcessing = false;
  private isPaused = false;
  private totalProcessed = 0;
  private totalFailed = 0;
  private totalWaitTime = 0;
  private totalProcessingTime = 0;
  private config: GlobalRateLimiterConfig;

  private static instance: GlobalRateLimiter;

  private constructor(config: Partial<GlobalRateLimiterConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  static getInstance(config?: Partial<GlobalRateLimiterConfig>): GlobalRateLimiter {
    if (!GlobalRateLimiter.instance) {
      GlobalRateLimiter.instance = new GlobalRateLimiter(config);
    }
    return GlobalRateLimiter.instance;
  }

  static resetInstance(): void {
    if (GlobalRateLimiter.instance) {
      GlobalRateLimiter.instance.destroy();
      GlobalRateLimiter.instance = new GlobalRateLimiter();
    }
  }

  async submit<T>(
    fn: () => Promise<T>,
    options: { priority?: RequestPriority; timeoutMs?: number } = {}
  ): Promise<T> {
    const { priority = RequestPriority.NORMAL, timeoutMs = this.config.timeoutMs } = options;

    if (this.queue.length >= this.config.maxQueueSize) {
      const error = new Error(`Queue full (max: ${this.config.maxQueueSize})`);
      (error as any).code = 'QUEUE_FULL';
      throw error;
    }

    return new Promise((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: uuidv4(),
        fn,
        resolve,
        reject,
        priority,
        submittedAt: Date.now()
      };

      if (priority === RequestPriority.CRITICAL && !this.isProcessing) {
        this.queue.unshift(request);
      } else {
        this.queue.push(request);
      }

      this.emit('queued', { id: request.id, position: this.queue.length });
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isPaused || this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestAt;
    const delayNeeded = Math.max(0, this.config.minIntervalMs - timeSinceLastRequest);

    if (delayNeeded > 0) {
      await new Promise(resolve => setTimeout(resolve, delayNeeded));
    }

    const request = this.queue.shift();
    if (!request) {
      this.isProcessing = false;
      return;
    }

    request.startedAt = Date.now();
    this.processingCount++;
    this.lastRequestAt = Date.now();

    this.emit('processing', {
      id: request.id,
      waitTimeMs: request.startedAt - request.submittedAt,
      queueLength: this.queue.length
    });

    const timeout = setTimeout(() => {
      const error = new Error(`Request timeout after ${timeoutMs}ms`);
      (error as any).code = 'TIMEOUT';
      request.reject(error);
      this.totalFailed++;
      this.processingCount--;
      this.emit('timeout', { id: request.id });
      this.processQueue();
    }, timeoutMs);

    try {
      const result = await request.fn();
      clearTimeout(timeout);
      
      request.completedAt = Date.now();
      const waitTime = request.startedAt - request.submittedAt;
      const processingTime = request.completedAt - request.startedAt;
      
      this.totalWaitTime += waitTime;
      this.totalProcessingTime += processingTime;
      this.totalProcessed++;

      request.resolve(result);
      
      this.emit('completed', {
        id: request.id,
        waitTimeMs: waitTime,
        processingTimeMs: processingTime
      });

      this.processingCount--;
      this.processQueue();
    } catch (error) {
      clearTimeout(timeout);
      this.totalFailed++;
      this.processingCount--;
      
      request.reject(error);
      
      this.emit('failed', { id: request.id, error });
      this.processQueue();
    }
  }

  getStats(): QueueStats {
    const processed = this.totalProcessed || 1;
    return {
      queueLength: this.queue.length,
      processingCount: this.processingCount,
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      avgWaitTimeMs: Math.round(this.totalWaitTime / processed),
      avgProcessingTimeMs: Math.round(this.totalProcessingTime / processed),
      lastRequestAt: this.lastRequestAt || undefined,
      nextRequestAt: this.queue.length > 0 
        ? this.lastRequestAt + this.config.minIntervalMs 
        : undefined
    };
  }

  clear(cancelInFlight = false): void {
    const cancelledCount = this.queue.length;
    this.queue.forEach(request => {
      const error = new Error('Queue cleared');
      (error as any).code = 'CANCELLED';
      request.reject(error);
    });
    this.queue = [];
    
    if (cancelInFlight) {
      this.processingCount = 0;
    }
    
    this.emit('cleared', { cancelledCount });
  }

  pause(): void {
    this.isPaused = true;
    this.emit('paused', { queueLength: this.queue.length });
  }

  resume(): void {
    this.isPaused = false;
    this.emit('resumed', { queueLength: this.queue.length });
    this.processQueue();
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  isHealthy(): boolean {
    return this.queue.length < this.config.maxQueueSize * 0.9;
  }

  destroy(): void {
    this.clear(true);
    this.removeAllListeners();
  }
}

export const globalRateLimiter = GlobalRateLimiter.getInstance();
```

---

## Integration Points

### 1. Translation API (`src/app/api/translate/route.ts`)

```typescript
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter/global-rate-limiter';

// Wrap the actual API call
const result = await globalRateLimiter.submit(
  async () => {
    const response = await fetch(ZAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ZAI_API_KEY}` },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
  },
  { priority: RequestPriority.NORMAL }
);
```

### 2. Chat API (`src/app/api/chat/route.ts`)

```typescript
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter/global-rate-limiter';

// For streaming responses, queue the stream initiation
const stream = await globalRateLimiter.submit(
  async () => {
    const response = await fetch(ZAI_CHAT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ZAI_API_KEY}` },
      body: JSON.stringify(chatPayload)
    });
    
    if (!response.ok) {
      throw new Error(`Chat API error: ${response.status}`);
    }
    
    return response;
  },
  { priority: RequestPriority.HIGH }
);

// Return the stream to the client
return new Response(stream.body, { headers: { 'Content-Type': 'text/event-stream' } });
```

### 3. Embedding Service (`packages/backend/src/context/utils/embedding-service.ts`)

```typescript
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter/global-rate-limiter';

async function generateEmbedding(text: string): Promise<number[]> {
  return globalRateLimiter.submit(
    async () => {
      const response = await fetch(ZAI_EMBEDDING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${ZAI_API_KEY}` },
        body: JSON.stringify({ text })
      });
      
      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status}`);
      }
      
      const data = await response.json();
      return data.embedding;
    },
    { priority: RequestPriority.LOW }
  );
}
```

---

## Event Monitoring

### Event Types

```typescript
globalRateLimiter.on('queued', (event) => {
  console.log(`Request ${event.id} queued at position ${event.position}`);
});

globalRateLimiter.on('processing', (event) => {
  console.log(`Request ${event.id} processing (waited ${event.waitTimeMs}ms, ${event.queueLength} remaining)`);
});

globalRateLimiter.on('completed', (event) => {
  console.log(`Request ${event.id} completed (wait: ${event.waitTimeMs}ms, process: ${event.processingTimeMs}ms)`);
});

globalRateLimiter.on('failed', (event) => {
  console.error(`Request ${event.id} failed:`, event.error);
});

globalRateLimiter.on('timeout', (event) => {
  console.error(`Request ${event.id} timed out`);
});
```

### Health Check Endpoint

```typescript
// src/app/api/rate-limiter-health/route.ts
import { globalRateLimiter } from '@/lib/rate-limiter/global-rate-limiter';

export async function GET() {
  const stats = globalRateLimiter.getStats();
  const isHealthy = globalRateLimiter.isHealthy();
  
  return Response.json({
    healthy: isHealthy,
    stats,
    status: isHealthy ? 'ok' : 'degraded'
  });
}
```

---

## Configuration

### Environment Variables

```bash
# Global Rate Limiter
GLOBAL_RATE_LIMIT_INTERVAL_MS=2000
GLOBAL_RATE_LIMIT_MAX_QUEUE=1000
GLOBAL_RATE_LIMIT_TIMEOUT_MS=60000
GLOBAL_RATE_LIMIT_ENABLE_PRIORITY=false
```

### Initialization (`src/lib/rate-limiter/init.ts`)

```typescript
import { GlobalRateLimiter } from './global-rate-limiter';

export function initializeGlobalRateLimiter() {
  const config = {
    minIntervalMs: parseInt(process.env.GLOBAL_RATE_LIMIT_INTERVAL_MS || '2000'),
    maxQueueSize: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_QUEUE || '1000'),
    timeoutMs: parseInt(process.env.GLOBAL_RATE_LIMIT_TIMEOUT_MS || '60000'),
    enablePriority: process.env.GLOBAL_RATE_LIMIT_ENABLE_PRIORITY === 'true'
  };

  const limiter = GlobalRateLimiter.getInstance(config);

  // Graceful shutdown
  const shutdown = () => {
    console.log('Draining rate limiter queue...');
    limiter.pause();
    setTimeout(() => {
      limiter.destroy();
      process.exit(0);
    }, 5000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  return limiter;
}
```

---

## Queue Visualization

### Dashboard Component (Optional)

```typescript
// src/components/rate-limiter-dashboard.tsx
'use client';

import { useEffect, useState } from 'react';

export function RateLimiterDashboard() {
  const [stats, setStats] = useState<QueueStats | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch('/api/rate-limiter-health');
      const data = await res.json();
      setStats(data.stats);
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h2 className="text-lg font-bold">Rate Limiter Status</h2>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <StatCard label="Queue Length" value={stats.queueLength} />
        <StatCard label="Processing" value={stats.processingCount} />
        <StatCard label="Avg Wait Time" value={`${stats.avgWaitTimeMs}ms`} />
        <StatCard label="Avg Processing Time" value={`${stats.avgProcessingTimeMs}ms`} />
        <StatCard label="Total Processed" value={stats.totalProcessed} />
        <StatCard label="Total Failed" value={stats.totalFailed} />
      </div>
      {stats.nextRequestAt && (
        <div className="mt-4">
          Next request in: {Math.max(0, stats.nextRequestAt - Date.now())}ms
        </div>
      )}
    </div>
  );
}
```

---

## Testing

### Unit Tests

```typescript
// src/lib/rate-limiter/global-rate-limiter.test.ts
import { GlobalRateLimiter, RequestPriority } from './global-rate-limiter';

describe('GlobalRateLimiter', () => {
  beforeEach(() => {
    GlobalRateLimiter.resetInstance();
  });

  it('should enforce 2-second interval', async () => {
    const limiter = GlobalRateLimiter.getInstance({ minIntervalMs: 2000 });
    const times: number[] = [];

    const p1 = limiter.submit(async () => { times.push(Date.now()); return 'a'; });
    const p2 = limiter.submit(async () => { times.push(Date.now()); return 'b'; });

    await Promise.all([p1, p2]);

    expect(times[1] - times[0]).toBeGreaterThanOrEqual(1950); // Allow 50ms tolerance
  });

  it('should reject when queue is full', async () => {
    const limiter = GlobalRateLimiter.getInstance({ maxQueueSize: 2 });

    limiter.submit(async () => 'a');
    limiter.submit(async () => 'b');

    await expect(limiter.submit(async () => 'c')).rejects.toThrow('Queue full');
  });

  it('should prioritize CRITICAL requests', async () => {
    const limiter = GlobalRateLimiter.getInstance();
    const order: string[] = [];

    limiter.submit(async () => { order.push('normal1'); }, { priority: RequestPriority.NORMAL });
    limiter.submit(async () => { order.push('critical'); }, { priority: RequestPriority.CRITICAL });
    limiter.submit(async () => { order.push('normal2'); }, { priority: RequestPriority.NORMAL });

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(order[0]).toBe('critical');
  });
});
```

---

## Migration Plan

### Phase 1: Core Implementation (Day 1)
- [ ] Create `src/lib/rate-limiter/global-rate-limiter.ts`
- [ ] Add unit tests
- [ ] Add initialization module

### Phase 2: Integration (Day 2-3)
- [ ] Integrate with translation API
- [ ] Integrate with chat API
- [ ] Integrate with embedding services

### Phase 3: Monitoring (Day 4)
- [ ] Add health check endpoint
- [ ] Add event logging
- [ ] Create dashboard component (optional)

### Phase 4: Rollout (Day 5)
- [ ] Deploy to staging
- [ ] Monitor queue metrics
- [ ] Adjust configuration if needed
- [ ] Deploy to production

---

## Benefits

| Benefit | Impact |
|---------|--------|
| **Prevents rate limit violations** | Eliminates 429 errors from AI providers |
| **Predictable API costs** | Smooths out request spikes |
| **Fair queuing** | All requests processed in order |
| **Observable** | Full visibility into queue state |
| **Graceful degradation** | Queue limits prevent system overload |
| **Priority support** | Critical requests can bypass queue |

---

## Trade-offs

| Trade-off | Mitigation |
|-----------|------------|
| Added latency for queued requests | Set user expectations, show queue position |
| Single point of failure | Singleton is in-process, no external dependency |
| Memory usage for large queues | Configurable max queue size |
| Cold start delays | Pre-warm queue during deployment |
