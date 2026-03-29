# Troubleshooting Guide

## Common Issues & Solutions During Integration

---

## 1. Installation & Setup Issues

### Issue: `bun install` fails with peer dependency errors

**Symptoms:**
```
error: peer dep not found
```

**Solution:**
```bash
# Clear lock file and reinstall
rm bun.lock
bun install

# If still failing, try with force
bun install --force
```

---

### Issue: Prisma Client not found

**Symptoms:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
cd packages/backend
bunx prisma generate

# If still failing, reinstall prisma
bun remove @prisma/client prisma
bun add @prisma/client prisma
bunx prisma generate
```

---

### Issue: TypeScript cannot find module

**Symptoms:**
```
Cannot find module '../services/xxx' or its corresponding type declarations
```

**Solution:**
```bash
# Check file extension in import
# Wrong:
import { Something } from '../services/something'
# Correct (if using ESM):
import { Something } from '../services/something.js'

# Or regenerate tsconfig
bun run typecheck
```

---

## 2. Database Issues

### Issue: Migration fails with "column already exists"

**Symptoms:**
```
Database error: column "virtual_user_id" of relation "conversations" already exists
```

**Solution:**
```sql
-- Check if column exists before adding
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'conversations' AND column_name = 'virtual_user_id';

-- If exists, modify migration to skip:
-- Comment out or wrap in IF NOT EXISTS
```

**Better approach:**
```bash
# Mark migration as applied without running
bunx prisma migrate resolve --applied "20240101000000_add_virtual_users"
```

---

### Issue: pgvector extension not found

**Symptoms:**
```
error: type "vector" does not exist
```

**Solution:**
```sql
-- Connect to database and run:
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify:
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

### Issue: Foreign key constraint fails

**Symptoms:**
```
Foreign key constraint violated
```

**Solution:**
```sql
-- Check existing data for orphaned records
SELECT * FROM conversations 
WHERE virtual_user_id IS NOT NULL 
AND virtual_user_id NOT IN (SELECT id FROM virtual_users);

-- Delete orphans before adding constraint
DELETE FROM conversations 
WHERE virtual_user_id IS NOT NULL 
AND virtual_user_id NOT IN (SELECT id FROM virtual_users);
```

---

## 3. Runtime Issues

### Issue: Server crashes on startup

**Symptoms:**
```
TypeError: Cannot read properties of undefined (reading 'prisma')
```

**Solution:**
```typescript
// Check service initialization order
// In server.js, ensure Prisma is initialized first:

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Then initialize services that depend on it
const memoryService = new MemoryService(prisma);
const contextEngine = new ContextEngine(prisma);

// Verify prisma is passed correctly
```

---

### Issue: Circular dependency detected

**Symptoms:**
```
Error: Circular dependency detected
```

**Solution:**
```typescript
// Use lazy loading or dependency injection

// Instead of:
import { ServiceA } from './service-a';
import { ServiceB } from './service-b';

const a = new ServiceA();
const b = new ServiceB(a);

// Use:
export class ServiceA {
  private b?: ServiceB;
  
  setServiceB(b: ServiceB) {
    this.b = b;
  }
}

// Or use DI container
container.register('serviceA', () => new ServiceA(container));
```

---

### Issue: Redis connection refused

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution:**
```bash
# Start Redis
redis-server

# Or use Docker
docker run -d -p 6379:6379 redis

# Or make Redis optional in code
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL)
  : null;

if (!redis) {
  console.warn('Redis not configured, using in-memory cache');
}
```

---

## 4. AI Provider Issues

### Issue: OpenAI API rate limited

**Symptoms:**
```
Error: Rate limit exceeded
```

**Solution:**
```typescript
// Add retry logic with exponential backoff
async function callWithRetry(fn, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (error.status === 429 && i < retries - 1) {
        const delay = Math.pow(2, i) * 1000;
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw error;
    }
  }
}
```

---

### Issue: AI streaming stops mid-response

**Symptoms:**
- Response cuts off
- WebSocket disconnects

**Solution:**
```typescript
// Add heartbeat to keep connection alive
const heartbeatInterval = setInterval(() => {
  socket.emit('ping');
}, 30000);

socket.on('pong', () => {
  // Connection still alive
});

socket.on('disconnect', () => {
  clearInterval(heartbeatInterval);
  // Attempt reconnection
  socket.connect();
});
```

---

## 5. Memory System Issues

### Issue: Memory extraction returns empty

**Symptoms:**
- No memories extracted from conversations

**Solution:**
```typescript
// Check extraction conditions
// 1. Verify conversation has enough content
if (conversation.messageCount < 3) {
  console.log('Not enough messages for extraction');
  return;
}

// 2. Check AI provider is working
const testResponse = await aiProvider.generate('test');
if (!testResponse) {
  throw new Error('AI provider not responding');
}

// 3. Verify extraction prompts are loaded
const prompts = loadExtractionPrompts();
if (!prompts || prompts.length === 0) {
  throw new Error('Extraction prompts not loaded');
}
```

---

### Issue: Memory search returns irrelevant results

**Symptoms:**
- Search results don't match query

**Solution:**
```sql
-- Verify embeddings are generated
SELECT id, key, embedding IS NOT NULL as has_embedding 
FROM memory_profiles 
WHERE virtual_user_id = 'test-user-id';

-- If embeddings are null, regenerate
-- In application:
UPDATE memory_profiles SET embedding = NULL; -- Force regeneration
```

---

## 6. Context Engine Issues

### Issue: Context budget exceeded

**Symptoms:**
```
Warning: Context budget exceeded, truncating
```

**Solution:**
```typescript
// Increase budget or improve prioritization
const BUDGET_LIMIT = 8000; // Increase from 4000

// Or improve prioritization
function prioritizeContextItems(items: ContextItem[]): ContextItem[] {
  return items.sort((a, b) => {
    // Prioritize by relevance and recency
    const scoreA = a.relevanceScore * (1 / (Date.now() - a.timestamp));
    const scoreB = b.relevanceScore * (1 / (Date.now() - b.timestamp));
    return scoreB - scoreA;
  });
}
```

---

### Issue: Context assembly timeout

**Symptoms:**
```
Error: Context assembly timed out
```

**Solution:**
```typescript
// Add timeout and fallback
const CONTEXT_ASSEMBLY_TIMEOUT = 5000; // 5 seconds

async assembleContext(params: ContextParams): Promise<ContextBundle> {
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Context assembly timeout')), CONTEXT_ASSEMBLY_TIMEOUT)
  );

  try {
    return await Promise.race([
      this.doAssembly(params),
      timeoutPromise
    ]);
  } catch (error) {
    // Return minimal context on timeout
    return this.getFallbackContext(params);
  }
}
```

---

## 7. Frontend Issues

### Issue: Chat widget not loading

**Symptoms:**
- Widget button doesn't appear
- No errors in console

**Solution:**
```typescript
// Check provider is wrapping the component
// In app/layout.tsx or page wrapper:
import { ChatProvider } from '@/providers/chat-provider';

export default function RootLayout({ children }) {
  return (
    <ChatProvider>
      {children}
      <ChatWidget />
    </ChatProvider>
  );
}

// Check environment variables
console.log('Backend URL:', process.env.NEXT_PUBLIC_BACKEND_URL);
```

---

### Issue: WebSocket connection fails

**Symptoms:**
```
WebSocket connection to 'ws://localhost:3001/' failed
```

**Solution:**
```typescript
// Check CORS settings on backend
// In server.js:
import cors from 'cors';

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true,
}));

// Check Socket.IO configuration
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});
```

---

### Issue: Build fails with "out of memory"

**Symptoms:**
```
FATAL ERROR: Ineffective mark-compacts near allocation limit
```

**Solution:**
```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
bun run build

# Or split build
bun run build:backend
bun run build:frontend
```

---

## 8. Testing Issues

### Issue: Tests fail with "database locked"

**Symptoms:**
```
Error: database is locked
```

**Solution:**
```typescript
// Use separate test database
// In vitest.config.ts:
export default defineConfig({
  test: {
    setupFiles: ['./tests/setup.ts'],
    env: {
      DATABASE_URL: 'file:./test.db', // SQLite for tests
    },
  },
});

// Or use transactions
beforeEach(async () => {
  await prisma.$executeRaw`BEGIN`;
});

afterEach(async () => {
  await prisma.$executeRaw`ROLLBACK`;
});
```

---

### Issue: Flaky tests

**Symptoms:**
- Tests pass sometimes, fail other times
- Race conditions

**Solution:**
```typescript
// Use proper async/await
it('should process message', async () => {
  const result = await processMessage('test');
  expect(result).toBeDefined();
});

// Wait for conditions
await waitFor(() => {
  expect(receivedMessages.length).toBe(1);
});

// Use fake timers for time-dependent tests
vi.useFakeTimers();
vi.advanceTimersByTime(1000);
```

---

## 9. Performance Issues

### Issue: API responses are slow

**Symptoms:**
- Endpoints take > 2 seconds

**Solution:**
```typescript
// Add caching
import { LRUCache } from 'lru-cache';

const cache = new LRUCache<string, any>({
  max: 500,
  ttl: 1000 * 60 * 5, // 5 minutes
});

app.get('/api/context/:id', async (req, res) => {
  const cacheKey = `context:${req.params.id}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.json(cached);
  }
  
  const context = await getContext(req.params.id);
  cache.set(cacheKey, context);
  res.json(context);
});
```

---

### Issue: Memory leak

**Symptoms:**
- Memory usage grows over time
- Server becomes slow

**Solution:**
```typescript
// Check for uncleaned intervals/timeouts
// Use WeakMap for caching
const cache = new WeakMap<object, CacheEntry>();

// Clean up event listeners
const controller = new AbortController();
eventEmitter.on('event', handler, { signal: controller.signal });

// When done:
controller.abort();

// Profile memory
// Run with: node --inspect server.js
// Then use Chrome DevTools to profile
```

---

## Quick Diagnostic Commands

```bash
# Check all running processes
ps aux | grep -E "(bun|node|postgres|redis)"

# Check ports
lsof -i :3000
lsof -i :3001
lsof -i :5432
lsof -i :6379

# Check logs
tail -f logs/combined.log
tail -f logs/error.log

# Database status
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Redis status
redis-cli info

# System resources
htop
```

---

## When All Else Fails

1. **Full Reset:**
```bash
git checkout -- .
rm -rf node_modules
rm bun.lock
bun install
bunx prisma migrate reset
bunx prisma generate
bun run dev
```

2. **Compare with Source:**
```bash
diff -r "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src" \
        "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src"
```

3. **Check Issue Tracker:**
   - Review `11_SUMMARY_AND_RISK_ANALYSIS.md`
   - Check test output in `test-output/`

4. **Isolate the Problem:**
   - Comment out recently added code
   - Add feature flags to disable new systems
   - Test each system in isolation
