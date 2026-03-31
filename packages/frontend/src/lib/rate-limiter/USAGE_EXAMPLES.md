# Global Rate Limiter - Usage Examples

## Quick Start

### 1. Initialize at Application Startup

```typescript
// src/app/layout.tsx or src/server.ts
import { initializeGlobalRateLimiter } from '@/lib/rate-limiter/init';

// Call once at startup
initializeGlobalRateLimiter({
  minIntervalMs: 2000,  // 1 request per 2 seconds
  maxQueueSize: 1000,
  timeoutMs: 60000
});
```

### 2. Use in API Routes

```typescript
// src/app/api/chat/route.ts
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  const body = await req.json();

  try {
    // Wrap your API call with the rate limiter
    const response = await globalRateLimiter.submit(
      async () => {
        const res = await fetch('https://api.z.ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }

        return res;
      },
      { priority: RequestPriority.HIGH }
    );

    return new Response(response.body, {
      headers: { 'Content-Type': 'text/event-stream' }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### 3. Use in Translation API

```typescript
// src/app/api/translate/route.ts
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  const { text, sourceLang, targetLang } = await req.json();

  try {
    const result = await globalRateLimiter.submit(
      async () => {
        const res = await fetch(translateEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'glm-4.7-flash',
            messages: [
              {
                role: 'system',
                content: `Translate from ${sourceLang} to ${targetLang}. Return only the translation.`
              },
              { role: 'user', content: text }
            ]
          })
        });

        if (!res.ok) throw new Error(`Translation API error: ${res.status}`);

        const data = await res.json();
        return data.choices[0].message.content;
      },
      { priority: RequestPriority.NORMAL }
    );

    return Response.json({ translation: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

### 4. Use in Backend Services

```typescript
// packages/backend/src/context/utils/embedding-service.ts
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter';

export async function generateEmbedding(text: string): Promise<number[]> {
  return globalRateLimiter.submit(
    async () => {
      const response = await fetch(embeddingEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
        },
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

export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  // Each embedding goes through the rate limiter
  return Promise.all(texts.map(text => generateEmbedding(text)));
}
```

---

## Priority Levels

| Priority | Use Case | Example |
|----------|----------|---------|
| `CRITICAL` | User-facing real-time interactions | Live chat responses |
| `HIGH` | Interactive features | Search, quick translations |
| `NORMAL` | Background tasks | Batch translations, document processing |
| `LOW` | Non-urgent operations | Embedding generation, caching |

```typescript
// Critical: User waiting for response
await globalRateLimiter.submit(
  () => callChatAPI(),
  { priority: RequestPriority.CRITICAL }
);

// High: User initiated but can wait briefly
await globalRateLimiter.submit(
  () => callTranslateAPI(),
  { priority: RequestPriority.HIGH }
);

// Normal: Background processing
await globalRateLimiter.submit(
  () => processDocument(),
  { priority: RequestPriority.NORMAL }
);

// Low: Can wait indefinitely
await globalRateLimiter.submit(
  () => generateEmbeddings(),
  { priority: RequestPriority.LOW }
);
```

---

## Monitoring Queue Status

### Polling Health Endpoint

```typescript
// Client-side polling
async function checkRateLimiterStatus() {
  const res = await fetch('/api/rate-limiter-health');
  const data = await res.json();

  console.log('Queue Status:', {
    healthy: data.healthy,
    status: data.status,
    queueLength: data.stats.queueLength,
    processing: data.stats.processingCount,
    nextRequestIn: data.stats.nextRequestIn,
    avgWaitTime: data.stats.avgWaitTimeMs
  });

  return data;
}

// Poll every 5 seconds
setInterval(checkRateLimiterStatus, 5000);
```

### Event Listeners (Server-side)

```typescript
import { globalRateLimiter } from '@/lib/rate-limiter';

// Log all events
globalRateLimiter.on('queued', ({ id, position }) => {
  console.log(`[Queue] Request ${id.slice(0, 8)} at position ${position}`);
});

globalRateLimiter.on('processing', ({ id, waitTimeMs, queueLength }) => {
  console.log(`[Process] Request ${id.slice(0, 8)} waited ${waitTimeMs}ms, ${queueLength} remaining`);
});

globalRateLimiter.on('completed', ({ id, waitTimeMs, processingTimeMs }) => {
  console.log(`[Complete] Request ${id.slice(0, 8)} total time: ${waitTimeMs + processingTimeMs}ms`);
});

globalRateLimiter.on('failed', ({ id, error }) => {
  console.error(`[Failed] Request ${id.slice(0, 8)}: ${error.message}`);
});

// Alert on high queue depth
globalRateLimiter.on('queued', ({ position }) => {
  if (position > 50) {
    // Send alert to monitoring system
    sendAlert(`High queue depth: ${position}`);
  }
});
```

---

## Error Handling

```typescript
import { globalRateLimiter } from '@/lib/rate-limiter';

async function safeAPICall() {
  try {
    return await globalRateLimiter.submit(
      async () => {
        const res = await fetch(apiEndpoint, options);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
      },
      { 
        priority: RequestPriority.NORMAL,
        timeoutMs: 30000  // Custom timeout
      }
    );
  } catch (error: any) {
    if (error.code === 'QUEUE_FULL') {
      // Queue is full - reject user request gracefully
      return { error: 'Service busy, please try again later' };
    }
    
    if (error.code === 'TIMEOUT') {
      // Request timed out
      return { error: 'Request timed out' };
    }

    if (error.code === 'CANCELLED') {
      // Queue was cleared (shutdown)
      return { error: 'Request cancelled' };
    }

    // API error or other failure
    return { error: error.message };
  }
}
```

---

## Advanced: Custom Configuration per Route

```typescript
// src/lib/rate-limiter/config.ts
import { GlobalRateLimiter } from './global-rate-limiter';

// Create dedicated limiter for chat (higher priority traffic)
export const chatRateLimiter = GlobalRateLimiter.getInstance({
  minIntervalMs: 2000,
  maxQueueSize: 500,
  timeoutMs: 90000
});

// Create dedicated limiter for embeddings (lower priority, batch-friendly)
export const embeddingRateLimiter = GlobalRateLimiter.getInstance({
  minIntervalMs: 2000,
  maxQueueSize: 2000,
  timeoutMs: 120000
});

// Use singleton for general traffic
export const defaultRateLimiter = GlobalRateLimiter.getInstance();
```

---

## Migration from Existing Rate Limiting

### Before (Translation API)

```typescript
// Old implementation
import { checkDistributedRateLimit } from '@/lib/translation/rate-limit';
import { retryWithBackoff } from '@/lib/translation/retry';

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  
  // Check rate limit
  const { allowed } = await checkDistributedRateLimit(ip);
  if (!allowed) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Retry logic
  const result = await retryWithBackoff(() => callTranslationAPI());
  
  return Response.json({ translation: result });
}
```

### After (Unified Rate Limiting)

```typescript
// New implementation
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  try {
    // Rate limiting + retry handled by queue
    const result = await globalRateLimiter.submit(
      async () => callTranslationAPI(),
      { priority: RequestPriority.NORMAL }
    );
    
    return Response.json({ translation: result });
  } catch (error: any) {
    if (error.code === 'QUEUE_FULL') {
      return Response.json({ error: 'Service busy' }, { status: 503 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Best Practices

1. **Always wrap external API calls** - Never call AI APIs directly
2. **Use appropriate priorities** - Don't mark everything as CRITICAL
3. **Monitor queue depth** - Alert when queue exceeds 80% capacity
4. **Handle timeout errors** - Set reasonable timeouts per use case
5. **Graceful degradation** - Show queue position to users for long waits
6. **Test with load** - Verify behavior under high concurrency

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Requests never complete | Queue paused | Check `limiter.isPaused`, call `resume()` |
| Queue always full | Too many low-priority requests | Increase `maxQueueSize` or add TTL |
| High wait times | Interval too long for traffic | Consider multiple limiters by endpoint |
| Timeouts | API slow or timeout too short | Increase `timeoutMs` or optimize API calls |
| Memory growth | Queue not draining | Check if requests are throwing errors |
