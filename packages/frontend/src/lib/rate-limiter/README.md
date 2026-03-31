# Global Rate Limiter - Implementation Summary

## Files Created

```
src/lib/rate-limiter/
├── global-rate-limiter.ts    # Core implementation
├── global-rate-limiter.test.ts  # Unit tests
├── index.ts                  # Public exports
├── init.ts                   # Initialization & shutdown handlers
└── USAGE_EXAMPLES.md         # Integration guide

src/app/api/rate-limiter-health/
└── route.ts                  # Health check endpoint

GLOBAL_RATE_LIMITER_DESIGN.md # Full design document
```

---

## Key Features

| Feature | Implementation |
|---------|----------------|
| **Global 2-second interval** | Enforced across ALL AI API requests |
| **FIFO queue** | First-come-first-served processing |
| **Priority support** | CRITICAL, HIGH, NORMAL, LOW levels |
| **Configurable timeout** | Default 60s per request |
| **Max queue size** | Default 1000 requests |
| **Event emission** | queued, processing, completed, failed, timeout |
| **Graceful shutdown** | Drains queue on SIGTERM/SIGINT |
| **Health monitoring** | `/api/rate-limiter-health` endpoint |
| **Singleton pattern** | Single instance across application |

---

## Configuration

### Environment Variables

```bash
# Add to .env.local
GLOBAL_RATE_LIMIT_INTERVAL_MS=2000
GLOBAL_RATE_LIMIT_MAX_QUEUE=1000
GLOBAL_RATE_LIMIT_TIMEOUT_MS=60000
GLOBAL_RATE_LIMIT_ENABLE_PRIORITY=false
```

### Default Values

| Setting | Default | Description |
|---------|---------|-------------|
| `minIntervalMs` | 2000 | Time between requests |
| `maxQueueSize` | 1000 | Max queued requests |
| `timeoutMs` | 60000 | Request timeout |
| `enablePriority` | false | Enable priority queues |

---

## API Reference

### `submit<T>(fn, options)`

Queue and execute an async function through the rate limiter.

```typescript
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter';

const result = await globalRateLimiter.submit(
  async () => {
    // Your AI API call here
    const res = await fetch('https://api.z.ai/...', options);
    return res.json();
  },
  { 
    priority: RequestPriority.NORMAL,
    timeoutMs: 30000  // Optional override
  }
);
```

### `getStats()`

Get current queue statistics.

```typescript
const stats = globalRateLimiter.getStats();
// {
//   queueLength: 5,
//   processingCount: 1,
//   totalProcessed: 142,
//   totalFailed: 3,
//   avgWaitTimeMs: 2340,
//   avgProcessingTimeMs: 1250,
//   lastRequestAt: 1711900000000,
//   nextRequestAt: 1711900002000
// }
```

### `getQueueLength()`

Get current number of queued requests.

### `isHealthy()`

Check if queue is below 90% capacity.

### `pause()` / `resume()`

Temporarily halt processing.

### `clear(cancelInFlight)`

Cancel all pending requests.

---

## Integration Checklist

- [ ] **Initialize at startup** - Add to `src/app/layout.tsx` or server entry point
- [ ] **Wrap translation API** - Replace existing rate limiting
- [ ] **Wrap chat API** - Add rate limiting (currently missing)
- [ ] **Wrap embedding service** - Add to backend embedding calls
- [ ] **Add health monitoring** - Poll `/api/rate-limiter-health`
- [ ] **Update error handling** - Handle QUEUE_FULL, TIMEOUT errors
- [ ] **Set up alerts** - Monitor queue depth > 80%
- [ ] **Run tests** - `bun test src/lib/rate-limiter`

---

## Usage Example

```typescript
// src/app/api/chat/route.ts
import { globalRateLimiter, RequestPriority } from '@/lib/rate-limiter';

export async function POST(req: Request) {
  const body = await req.json();

  try {
    const apiResponse = await globalRateLimiter.submit(
      async () => {
        const res = await fetch(process.env.ZAI_CHAT_URL!, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ZAI_API_KEY}`
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          throw new Error(`Chat API error: ${res.status}`);
        }

        return res;
      },
      { priority: RequestPriority.HIGH }
    );

    return new Response(apiResponse.body, {
      headers: { 'Content-Type': 'text/event-stream' }
    });
  } catch (error: any) {
    if (error.code === 'QUEUE_FULL') {
      return Response.json(
        { error: 'Service busy, please try again' }, 
        { status: 503 }
      );
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
```

---

## Monitoring Dashboard

```typescript
// src/components/rate-limiter-dashboard.tsx
'use client';

export function RateLimiterDashboard() {
  const [stats, setStats] = useState(null);

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
      <h2>Rate Limiter Status</h2>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Queue" value={stats.queueLength} />
        <StatCard label="Processing" value={stats.processingCount} />
        <StatCard label="Avg Wait" value={`${stats.avgWaitTimeMs}ms`} />
        <StatCard label="Processed" value={stats.totalProcessed} />
        <StatCard label="Failed" value={stats.totalFailed} />
        <StatCard label="Next In" value={`${stats.nextRequestIn || 0}ms`} />
      </div>
    </div>
  );
}
```

---

## Testing

```bash
# Run unit tests
bun test src/lib/rate-limiter/global-rate-limiter.test.ts

# Test output example
bun test v1.3.9

src/lib/rate-limiter/global-rate-limiter.test.ts:
(pass) GlobalRateLimiter > singleton > should return the same instance [1.23ms]
(pass) GlobalRateLimiter > rate limiting > should enforce minimum interval [156.45ms]
(pass) GlobalRateLimiter > queue management > should reject when queue is full [12.34ms]
(pass) GlobalRateLimiter > priority > should prioritize CRITICAL requests [203.56ms]
...
```

---

## Troubleshooting

### Queue Not Processing

```typescript
// Check if paused
const stats = globalRateLimiter.getStats();
if (/* paused indicator */) {
  globalRateLimiter.resume();
}
```

### High Wait Times

1. Check queue depth: `globalRateLimiter.getQueueLength()`
2. Consider increasing interval if consistently backed up
3. Add dedicated limiter for high-volume endpoints

### Memory Issues

1. Reduce `maxQueueSize` in config
2. Implement request TTL
3. Monitor `getStats().queueLength` over time

---

## Next Steps

1. **Deploy to staging** - Test with realistic load
2. **Monitor metrics** - Track wait times, queue depth
3. **Adjust config** - Tune interval based on API rate limits
4. **Roll out gradually** - Start with one endpoint
5. **Add telemetry** - Integrate with observability platform
