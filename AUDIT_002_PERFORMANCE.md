# AUDIT 002 — Performance Bottlenecks

> **Auditor:** Source Code Deep Dive  
> **Date:** 2026-03-30  
> **Scope:** Context Engine, Librarian Worker, Database Layer  
> **Severity Scale:** 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low

---

## 🔴 P-001: N+1 Query Storm in `markBundlesDirty`

**File:** [`librarian-worker.ts:L575-630`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/librarian-worker.ts#L575-L630)

```ts
for (const analysis of analyses) {
  for (const topic of analysis.suggestedTopics) {
    const topicProfile = await prisma.topicProfile.findFirst({ ... }); // Query per topic per ACU
    ...
  }
  for (const entity of analysis.suggestedEntities) {
    const entityProfile = await prisma.entityProfile.findFirst({ ... }); // Query per entity per ACU
    ...
  }
}
for (const topicId of topicIds) {
  await prisma.contextBundle.updateMany({ ... }); // Update per topic
}
for (const entityId of entityIds) {
  await prisma.contextBundle.updateMany({ ... }); // Update per entity
}
```

**Problem:** For a batch of 20 ACUs with 3 topics and 2 entities each, this executes:  
`20 × (3 + 2) = 100` individual SELECT queries + up to `60 + 40 = 100` UPDATE queries.  
**Total: ~200 sequential queries** per Librarian run.

**Impact:** Each Librarian cycle takes 10-30 seconds with typical batches, blocking the event loop and competing with chat assembly queries.

**Fix:**
```ts
// Batch lookup instead of per-item:
const allTopicSlugs = [...new Set(analyses.flatMap(a => a.suggestedTopics))];
const topics = await prisma.topicProfile.findMany({
  where: { userId, slug: { in: allTopicSlugs.map(s => s.toLowerCase().replace(/\s+/g, '-')) } }
});
```
Then use a single `updateMany` with `{ id: { in: [...topicIds] } }`.

---

## 🔴 P-002: Full Entity Table Scan on Every Chat Message

**File:** [`context-assembler.ts:L269-278`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-assembler.ts#L269-L278)

```ts
const allEntities = await this.prisma.entityProfile.findMany({
  where: { virtualUserId },
  select: { id: true, name: true, aliases: true, type: true },
});

const mentionedEntities = allEntities.filter((e) => {
  const names = [e.name.toLowerCase(), ...e.aliases.map((a) => a.toLowerCase())];
  const msgLower = message.toLowerCase();
  return names.some((n) => msgLower.includes(n));
});
```

**Problem:** Every single chat message triggers a `findMany` on ALL entity profiles for that user, then does an O(entities × aliases) string search in JavaScript. For a user with 500 entities (10 facts each), this fetches all 500 rows then runs ~5,000 string comparisons.

**Impact:** Linear scaling problem — response latency grows with user data. At 1,000+ entities, this adds 200-500ms to every message.

**Fix:**
- Use PostgreSQL `ILIKE ANY()` or `tsvector` for server-side name matching
- Pre-compute a flat name→entity lookup table cached in-memory
- Only refresh the lookup on `entity:created` / `entity:updated` events

---

## 🟠 P-003: Duplicate Embedding Generation on Same Message

**Files:**
- [`context-assembler.ts:L157`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-assembler.ts#L157) — `DynamicContextAssembler.assemble()` calls `embed()`
- [`context-pipeline.ts:L120`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-pipeline.ts#L120) — `ParallelContextPipeline` calls `embed()` independently

**Problem:** If both systems are active (parity mode), the same user message gets embedded twice — each call costs ~50-100ms and an API round-trip to Z.AI's embedding service.

The pipeline has its own embedding cache (`context-cache.ts` embedding namespace), but the `DynamicContextAssembler` uses a different `HybridRetrievalService.jitCache`. These caches don't share state.

**Impact:** Double API cost and double latency for embedding during parity evaluation.

**Fix:** Centralize embedding through a single service with the `ContextCache.embedding` namespace. Pass the pre-computed embedding into both paths.

---

## 🟠 P-004: Conversation Bundle Compilation Calls LLM on Every Dirty Recompile

**File:** [`bundle-compiler.ts:L375-393`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/bundle-compiler.ts#L375-L393)

```ts
const response = await this.llmService.chat({
  model: 'gpt-4o-mini',
  messages: [
    { role: 'system', content: `Analyze this conversation and extract its arc...` },
    { role: 'user', content: messagesText }, // ALL messages as a blob
  ],
});
```

**Problem:** Every time a conversation bundle is marked dirty (which happens on EVERY new message via the event bus), the system calls an external LLM to re-summarize the entire conversation. For an active chat session with 50+ messages, this means:
1. An LLM API call every time the user sends a message
2. Sending the full conversation text each time (~4k-15k tokens)
3. Paying for both input and output tokens

**Impact:** $0.01-0.05 per message in LLM costs for arc generation, plus 500-2000ms latency.

**Fix:**
- Only recompile conversation bundles when conversation goes IDLE (not on every message)
- Use incremental summarization (append new messages to existing arc)
- Add a minimum message delta before triggering recompile (e.g., every 5th message)

---

## 🟠 P-005: Unbounded Conversation Message Fetch in Pipeline

**File:** [`context-pipeline.ts:L428-438`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-pipeline.ts#L428-L438)

```ts
private async fetchConversation(conversationId: string): Promise<any> {
  return this.prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        orderBy: { messageIndex: 'asc' },
        take: 50,
      },
    },
  });
}
```

**Problem:** While `take: 50` limits messages, the `bundle-compiler.ts` conversation compilation has no such limit:

```ts
// bundle-compiler.ts:L321
messages: { orderBy: { messageIndex: 'asc' } },  // NO LIMIT
```

For long conversations (200+ messages), this fetches ALL messages including their full `parts` JSON blobs (which include code blocks, images, etc).

**Impact:** 10-100MB of message data fetched for long conversations, causing memory spikes and GC pressure.

**Fix:** Always apply `take` limits. For arc generation, take only the last 20 messages + the first 5 (beginning + end pattern).

---

## 🟡 P-006: Cache Key Collision Risk for Embeddings

**File:** [`context-cache.ts:L295-298`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-cache.ts#L295-L298)

```ts
static embeddingKey(text: string): string {
  return `emb:${text.substring(0, 100).replace(/\s+/g, '_')}`;
}
```

**Problem:** Two different messages that share the same first 100 characters will collide and return the wrong embedding. This is particularly dangerous for similar prompts like:
- "How do I implement a user authentication system in Node.js with JWT?"
- "How do I implement a user authentication system in Node.js with OAuth?"

Both would map to the same cache key if the divergence occurs after character 100.

**Fix:** Use a proper hash function (SHA-256) for the cache key, or include the full message length in the key.

---

## 🟡 P-007: 92KB Prisma Schema with 50+ Indexes

**File:** [`schema.prisma`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/prisma/schema.prisma)

**Problem:** The schema defines over **100 indexes** across all models. The `Memory` model alone has **38 indexes** (lines 863-900+). Many are near-duplicates:
```
@@index([userId, memoryType])
@@index([virtualUserId, memoryType])
@@index([userId, memoryType, importance(sort: Desc)])
@@index([virtualUserId, memoryType, importance(sort: Desc)])
```

**Impact:**
- Every INSERT/UPDATE on `memories` must update 38 indexes → write amplification
- Index storage likely exceeds table data size
- Migration times increase significantly

**Fix:** Audit actual query patterns. The `userId` and `virtualUserId` duplication suggests a migration path that's complete — consolidate to one identity column. Use partial indexes where applicable.

---

## 🔵 P-008: `BudgetAlgorithm` Instantiated Per Request

**File:** [`context-assembler.ts:L594`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-assembler.ts#L594)

```ts
const algorithm = new BudgetAlgorithm();
```

**Problem:** A new `BudgetAlgorithm` instance is created for every context assembly request. While likely lightweight, this creates unnecessary GC pressure at scale.

**Fix:** Make `BudgetAlgorithm` stateless and instantiate once as a class member.
