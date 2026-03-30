# AUDIT 003 — Architecture Gaps & Reliability Issues

> **Auditor:** Source Code Deep Dive  
> **Date:** 2026-03-30  
> **Scope:** End-to-end data flow, error handling, system consistency  
> **Severity Scale:** 🔴 Critical · 🟠 High · 🟡 Medium · 🔵 Low

---

## 🔴 A-001: Two Completely Independent Context Engines Operating in Parallel

**Files:**
- [`context-assembler.ts`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-assembler.ts) — `DynamicContextAssembler`
- [`context-pipeline.ts`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-pipeline.ts) — `ParallelContextPipeline`
- [`unified-context-service.ts`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/services/unified-context-service.ts) — Orchestrator

**Problem:** There are **three** context assembly implementations:
1. `DynamicContextAssembler` — the "new" engine used via `UnifiedContextService`
2. `ParallelContextPipeline` — a parallel/streaming alternative (never called from production paths)
3. Legacy `context-generator.js` — the old engine (kept for parity logging)

These systems:
- Have **different query patterns** (one uses `virtualUserId`, the other uses `userId`)
- Have **different similarity thresholds** (0.3 vs 0.35 vs 0.4 depending on path)
- Have **different cache mechanisms** (one uses `ContextCache`, the other uses `HybridRetrievalService.jitCache`)
- Produce **different system prompts** for the same input

**Impact:** Impossible to predict which context a user receives. Debugging context quality requires understanding three parallel systems. Dead code in `ParallelContextPipeline` adds 743 lines of maintenance burden.

**Fix:** 
1. Delete `ParallelContextPipeline` if not in use (or promote it as the sole engine)
2. Remove legacy generator once parity is confirmed
3. Standardize on `virtualUserId` vs `userId` — pick one

---

## 🔴 A-002: `userId` vs `virtualUserId` Identity Split Across Entire Codebase

**Files:** Schema, services, routes (system-wide)

**Problem:** The system has a fundamental identity confusion:

| Component | Uses `userId` | Uses `virtualUserId` |
|-----------|:---:|:---:|
| `Memory` model | ✅ | ✅ |
| `TopicProfile` model | ✅ | ✅ |
| `EntityProfile` model | ✅ | ✅ |
| `ContextBundle` model | ✅ | ✅ |
| `DynamicContextAssembler` | — | ✅ |
| `BundleCompiler` | ✅ | — |
| `LibrarianWorker` | ✅ | — |
| `ParallelContextPipeline` | ✅ | — |
| `context-engine.ts` route | — | ✅ |

The `BundleCompiler` stores bundles using `userId`, but the `DynamicContextAssembler` queries them using `virtualUserId`. **These are different columns.** If a user is identified as a `virtualUser` in the frontend but the Librarian stores data under `userId`, the assembler will never find it.

**Impact:** Data written by the Librarian may be invisible to the Context Assembler. This is a **data integrity gap** that could explain "ghost knowledge" — the system learns but doesn't recall.

**Fix:** 
1. Add a migration to unify `userId` → `virtualUserId` across all services
2. Drop `userId` columns from context-related models (keep only `virtualUserId`)
3. Or create a lookup service that maps between them consistently

---

## 🟠 A-003: Event Bus Handlers Execute Sequentially (Not Truly Async)

**File:** [`context-event-bus.ts:L224-236`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-event-bus.ts#L224-L236)

```ts
for (const registration of uniqueHandlers) {
  try {
    await registration.handler(event); // Sequential await!
  } catch (error: any) { ... }
}
```

**Problem:** Event handlers run sequentially with `await`. If one handler takes 2 seconds (e.g., an invalidation service call), all subsequent handlers are blocked. For a `memory:created` event, the chain is:
1. Invalidate in-memory cache (fast, ~1ms)
2. Call `invalidationService.invalidate()` (DB writes, ~50-200ms)
3. Invalidate graph cache (fast, ~1ms)

If `invalidationService` is slow, cache invalidation is delayed, causing stale context delivery.

**Impact:** A slow handler blocks all downstream handlers, creating unpredictable latency spikes.

**Fix:** For non-dependent handlers, use `Promise.allSettled()` instead of sequential `await`.

---

## 🟠 A-004: No Timeout on Backend Context Fetch from Frontend Proxy

**File:** [`route.ts:L59-70`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/frontend/src/app/api/chat/route.ts#L59-L70)

```ts
const contextResponse = await fetch(`${BACKEND_URL}/api/v2/context-engine/assemble`, {
  method: "POST",
  headers: { ... },
  body: JSON.stringify({ ... }),
  // NO TIMEOUT, NO AbortController
});
```

**Problem:** If the backend is slow (due to P-001's N+1 queries or P-004's LLM calls during compilation), the frontend proxy holds the connection indefinitely. The user sees a spinning cursor with no feedback.

**Impact:** A single slow context assembly can cascade into a user-perceived "crash." Vercel's serverless functions have a 10-second timeout by default, after which the entire request fails.

**Fix:**
```ts
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 3000);
const contextResponse = await fetch(url, { signal: controller.signal, ... });
clearTimeout(timeout);
```

---

## 🟠 A-005: Rust Core Mock is Permanently Active

**File:** [`acu-processor.js:L23-29`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/services/acu-processor.js#L23-L29)

```js
const rustCore = null;
try {
  // This will work once Rust core is compiled with UniFFI
  // rustCore = await import('../../vivim-core/index.js');
} catch (error) {
  logger.warn('Rust core not available, using mock implementation');
}
```

**Problem:** The Rust core import is **commented out** and `rustCore` is hardcoded to `null`. The system ALWAYS uses `mockProcessCapture()`. The mock:
1. Creates simplistic ACUs by splitting on message boundaries
2. Doesn't perform real content classification
3. Doesn't detect relationships between knowledge atoms
4. Assigns random-ish quality scores

**Impact:** The entire ACU system — the fundamental knowledge unit — is built on mock data. The Librarian's topic/entity extraction, the knowledge graph, and the context assembly are all operating on low-quality input.

**Fix:** This is the single biggest gap. Until a real parser (Rust or otherwise) is integrated, the system is a demo with a full production architecture wrapped around it.

---

## 🟡 A-006: `emitBatch` is Not Actually Batch — It's Sequential

**File:** [`context-event-bus.ts:L296-304`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-event-bus.ts#L296-L304)

```ts
async emitBatch(userId, events, source): Promise<void> {
  for (const evt of events) {
    await this.emit(evt.type, userId, evt.payload ?? {}, source); // Sequential!
  }
}
```

**Problem:** Despite the name, `emitBatch` calls `emit` sequentially for each event. Combined with A-003 (sequential handlers), a batch of 10 events each with 3 handlers = 30 sequential async operations.

**Fix:** Either use `Promise.allSettled` for independent events, or coalesce events into a single batch payload (similar to how `emitDebounced` works).

---

## 🟡 A-007: Inconsistent Similarity Thresholds Across Retrieval Paths

| Component | Topic Threshold | Entity Threshold | ACU Threshold | Memory Threshold |
|-----------|:-:|:-:|:-:|:-:|
| `context-assembler.ts` | None (takes top 3) | None (takes top 3) | N/A | N/A |
| `context-pipeline.ts` | 0.35 | 0.40 | 0.30 | 0.35 |
| `hybrid-retrieval.ts` | N/A | N/A | 0.30 | 0.30 |
| `jitRetrieve` (pipeline) | N/A | N/A | 0.30 | 0.35 |

**Problem:** Different retrieval paths use different thresholds, meaning the same message processed through different code paths will yield different topic/entity matches. This makes context behavior unpredictable and hard to test.

**Fix:** Define thresholds in a central configuration (`context-settings.ts` or a config object) and reference them consistently.

---

## 🟡 A-008: Unbounded In-Memory Event History

**File:** [`context-event-bus.ts:L110-111`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-event-bus.ts#L110-L111)

```ts
private eventHistory: ContextEvent[] = [];
private maxHistorySize = 500;
```

**Problem:** While capped at 500ᵗʰ event records, each `ContextEvent` includes a `payload: Record<string, any>` which can be arbitrarily large. A batch event (from `emitDebounced`) includes `events: events.map(e => e.payload)` — potentially 20+ payloads nested inside one history entry.

**Impact:** Memory leak potential. If debounced events accumulate large payloads (ACU content, memory text), the 500-entry history could grow to several MB.

**Fix:** Limit payload size in history entries (store only keys/ids, not full content). Consider moving history to a circular buffer with byte-size cap rather than entry-count cap.

---

## 🔵 A-009: `var` Used for Singleton in TypeScript Module

**File:** [`context-event-bus.ts:L105`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/src/context/context-event-bus.ts#L105)

```ts
var _busInstance: ContextEventBus | null = null;
```

**Problem:** `var` is used instead of `let` in a TypeScript file. While functionally equivalent at module scope, `var` is hoisted and can cause subtle issues if the module is evaluated multiple times (e.g., in test environments with module mocking).

**Fix:** Replace `var` with `let`.

---

## 🔵 A-010: Shared Auth Module Has Dead Code

**File:** [`shared/src/auth/index.ts`](file:///c:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/shared/src/auth/index.ts)

**Problem:** The `UnifiedAuthService` class implements token exchange, session creation, and validation — but nothing in the codebase imports it. The system uses fingerprint-based auth exclusively.

**Impact:** 120 lines of dead code suggesting an abandoned auth migration.

**Fix:** Either complete the auth migration (wire `UnifiedAuthService` into the middleware stack) or remove it to reduce confusion.
