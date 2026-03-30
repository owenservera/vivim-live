# AUDIT 004 — Data Integrity & Race Conditions

> **Auditor:** Source Code Deep Dive  
> **Date:** 2026-03-30  
> **Scope:** Prisma operations, concurrent access patterns, cache consistency  
> **Severity Scale:** 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low

---

## 🔴 D-001: Race Condition in Bundle Upsert Under Concurrent Requests

**File:** [`bundle-compiler.ts:L424-529`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/bundle-compiler.ts#L424-L529)

```ts
try {
  const result = await this.prisma.contextBundle.upsert({ ... });
} catch (error: any) {
  if (error.code === 'P2002') { // Unique constraint violation
    // DELETE ALL matching bundles, then UPSERT again
    await this.prisma.contextBundle.deleteMany({ ... });
    const result = await this.prisma.contextBundle.upsert({ ... });
  }
}
```

**Problem:** The error recovery path on `P2002` (unique constraint violation) performs a **delete + create** sequence. If two concurrent requests hit this path simultaneously:

1. Request A: `deleteMany` succeeds, removes the bundle
2. Request B: `deleteMany` succeeds (deletes nothing — already gone)
3. Request A: `upsert` creates a new bundle
4. Request B: `upsert` also creates a new bundle → **P2002 again** (infinite retry potential)

Additionally, between the `deleteMany` and the `upsert`, any concurrent `getBundle` call will find **no bundle**, causing a cache miss and potentially re-triggering compilation.

**Impact:** Under concurrent chat sessions (multiple tabs, rapid-fire messages), this can cause:
- Duplicate bundles
- Infinite retry loops
- Temporary data loss (bundle deleted but not yet recreated)

**Fix:** Use a Prisma `$transaction` with serializable isolation:
```ts
await prisma.$transaction(async (tx) => {
  await tx.contextBundle.deleteMany({ where: { ... } });
  return tx.contextBundle.create({ data: { ... } });
}, { isolationLevel: 'Serializable' });
```

---

## 🔴 D-002: Cache-Database Inconsistency Window

**Files:**
- [`context-event-bus.ts`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-event-bus.ts) (invalidation handlers)
- [`context-cache.ts`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-cache.ts)
- [`context-assembler.ts:L216`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-assembler.ts#L216)

**Problem:** The `DynamicContextAssembler` caches assembled context for 5 minutes:

```ts
this.cache.set('bundle', cacheKey, result, 5 * 60 * 1000);
```

But when the event bus fires `memory:created` or `acu:processed`, it only invalidates **individual bundle types**, not the assembled context cache. The cache key includes only the first 50 chars of the message:

```ts
const cacheKey = `ctx:${params.virtualUserId}:${params.conversationId}:${params.userMessage.substring(0, 50)}`;
```

If a user sends the same message twice within 5 minutes, they'll get the old context — even if the Librarian has updated their knowledge graph in between.

**Impact:** Users can't see recently-learned knowledge for up to 5 minutes after the Librarian processes it.

**Fix:**
1. When the event bus fires invalidation events, also invalidate the assembled context cache (pattern: `ctx:${userId}:*`)
2. Include a context version counter in the cache key

---

## 🟠 D-003: Librarian Cooldown is Instance-Level, Not User-Level

**File:** [`librarian-worker.ts:L54,86`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/librarian-worker.ts#L54)

```ts
private lastRunTime: Date | null = null;

if (this.lastRunTime && this.isInCooldown()) {
  return this.getEmptyResult();
}
```

**Problem:** The cooldown timer is stored as a single `Date` on the singleton instance. This means:
- If User A triggers the Librarian, User B's conversations won't be processed until the cooldown expires
- In a multi-process deployment, each process has its own cooldown — some processes may process the same user while others skip

**Impact:** Uneven knowledge processing across users; some users' data may never be processed if the system is busy with others.

**Fix:** Store cooldown per-user in a `Map<userId, Date>` or in the database (e.g., a `lastLibrarianRunAt` field on `VirtualUser`).

---

## 🟠 D-004: Memory Content Appended Without Size Limits

**File:** [`librarian-worker.ts:L549-567`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/librarian-worker.ts#L549-L567)

```ts
const newContent = `${existingContent}\n\n## Librarian Insights (${new Date().toISOString()})\n\n${insights.join('\n\n')}`;

await prisma.memory.update({
  where: { id: identityMemory.id },
  data: { content: newContent, ... },
});
```

**Problem:** The Librarian appends insights to the `identity_core` memory without any size limit. After 100 Librarian cycles, this single memory record could contain 50,000+ characters of accumulated insights, many of which are redundant.

**Impact:**
- The `compileIdentityCore` method fetches this and puts it into the system prompt → token budget blown
- Database bloat from a single ever-growing text field
- Redundant insights dilute signal quality

**Fix:**
1. Set a maximum character limit for identity core content
2. Use the LLM to periodically distill/merge accumulated insights
3. Store insights as separate memory records instead of appending to one

---

## 🟡 D-005: `identityInsights` Type Mismatch in Librarian

**File:** [`librarian-worker.ts:L353-355`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/librarian-worker.ts#L353-L355)

```ts
const identityInsights = analyses
  .flatMap((a) => a.identityInsights)
  .filter((i) => i.length > 0);  // `i.length` on what type?
```

**Problem:** The LLM response defines `identityInsights` as an array of objects:
```json
{ "type": "personal_fact", "content": "...", "confidence": 0.9 }
```

But the `ACUAnalysis` interface types it as `string[]`:
```ts
identityInsights: string[];
```

The filter `i.length > 0` works on strings (non-empty check) but would fail on objects (objects don't have `.length`). This suggests the LLM response structure doesn't match the TypeScript interface.

**Impact:** Identity insights may be silently dropped or cause runtime errors. The `.length` check on an object returns `undefined`, which is falsy — so all object-type insights are filtered out.

**Fix:** Align the `ACUAnalysis.identityInsights` type with the LLM prompt's expected response format. If objects, use `.filter(i => i?.content?.length > 0)`.

---

## 🟡 D-006: No Deduplication in Topic/Entity Processing

**File:** [`librarian-worker.ts:L324-350`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/librarian-worker.ts#L324-L350)

**Problem:** When the Librarian creates a `TopicProfile`, it normalizes the slug (`toLowerCase().replace(/\s+/g, '-')`). But the LLM might return topics like:
- `"rust-lang"`, `"Rust Lang"`, `"Rust"` → all become different profiles
- `"react-hooks"`, `"React Hooks"`, `"react hooks"` → slug collision depends on exact format

There's no fuzzy matching or embedding-based deduplication. The `findOrCreateTopicProfile` does an exact slug match only.

**Impact:** Topic profile proliferation — a user could end up with 5 profiles for the same topic, each with partial data.

**Fix:** Before creating a new topic, do an embedding similarity check against existing topics. If similarity > 0.85, merge into the existing profile instead of creating a new one.

---

## 🟡 D-007: Database Pool Has No Configuration

**File:** [`database.js:L26`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/lib/database.js#L26)

```js
const pool = new pg.Pool({ connectionString });
```

**Problem:** The PostgreSQL connection pool is created with only the connection string — no pool size, idle timeout, connection timeout, or statement timeout configuration.

Default `pg.Pool` settings:
- `max`: 10 connections (may be too few for concurrent context assembly)
- `idleTimeoutMillis`: 10,000ms (connections recycled aggressively)
- `connectionTimeoutMillis`: 0 (wait forever for a connection)

**Impact:** Under load, all 10 connections could be consumed by long-running vector similarity queries, causing new requests to queue indefinitely.

**Fix:**
```js
const pool = new pg.Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
  statement_timeout: 10000,
});
```

---

## 🔵 D-008: `console.warn` / `console.error` Used Instead of Structured Logger

**Files:**
- [`bundle-compiler.ts:L396`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/bundle-compiler.ts#L396): `console.error('Failed to generate conversation arc:', error);`
- [`bundle-compiler.ts:L470`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/bundle-compiler.ts#L470): `console.warn('Constraint violation for bundle...');`
- [`shared/src/auth/index.ts:L69,94,117`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/shared/src/auth/index.ts): Multiple `console.error` calls

**Problem:** The codebase has a structured Pino logger but several files bypass it with `console.*`. These messages:
- Won't appear in structured log aggregation
- Don't include request context (userId, conversationId)
- Can't be filtered by log level

**Fix:** Replace all `console.warn` / `console.error` with `logger.warn` / `logger.error` and include relevant context objects.
