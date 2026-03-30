# REDESIGN 005 — Consolidate Three Context Engines into One

> **Status:** Proposed  
> **Priority:** 🟠 High — three engines creates unpredictable behavior  
> **Effort:** 2-3 days  
> **Stack:** Bun + TypeScript (no new dependencies)

---

## Problem Statement

The codebase has **three independent context assembly implementations**:

| Engine | File | Status | Used By |
|--------|------|--------|---------|
| `DynamicContextAssembler` | `context-assembler.ts` (802 lines) | Active | `unified-context-service.ts` → chat route |
| `ParallelContextPipeline` | `context-pipeline.ts` (743 lines) | Dead code | Nothing in production |
| Legacy `context-generator.js` | `context-generator.js` | Kept for "parity" | Parity logging only |

These engines:
- Query different identity columns (`virtualUserId` vs `userId`)
- Use different similarity thresholds
- Have different cache mechanisms
- Produce different prompt structures for the same input

**Net result: 1,545 lines of dead/duplicate code (pipeline + legacy) that confuses developers and creates maintenance burden.**

---

## Decision: Keep `DynamicContextAssembler`, Delete the Rest

### Why This One

| Criteria | DynamicContextAssembler | ParallelContextPipeline | Legacy |
|----------|:-:|:-:|:-:|
| Actually wired to production | ✅ | ❌ | ❌ |
| Uses `virtualUserId` (correct identity) | ✅ | ❌ (uses `userId`) | ❌ |
| Has budget algorithm | ✅ | ✅ | ❌ |
| Has JIT retrieval | ✅ | ✅ | ❌ |
| Has recipe support | ✅ | ❌ | ❌ |
| Event bus integration | ✅ | ❌ | ❌ |

The `DynamicContextAssembler` is the most complete and the only one actually serving traffic. The pipeline has good ideas (streaming delivery, telemetry) that can be **merged in** as features rather than maintained as a parallel system.

---

## Migration Plan

### Step 1: Cherry-pick Good Ideas from Pipeline

The pipeline has two features worth porting:

#### A. Telemetry Stages

```typescript
// From context-pipeline.ts — port telemetry into DynamicContextAssembler
interface AssemblyTelemetry {
  stages: Array<{
    name: string;
    startMs: number;
    endMs: number;
    itemCount: number;
  }>;
  totalMs: number;
}

// Add to DynamicContextAssembler.assemble():
private async assembleWithTelemetry(params: AssemblyParams): Promise<AssemblyResult> {
  const telemetry: AssemblyTelemetry = { stages: [], totalMs: 0 };
  const start = Date.now();

  // Stage 1: Detect Context
  const s1 = Date.now();
  const context = await this.detectContext(params);
  telemetry.stages.push({ name: 'detect_context', startMs: s1, endMs: Date.now(), itemCount: context.topics.length });

  // Stage 2: Fetch Bundles
  const s2 = Date.now();
  const bundles = await this.fetchBundles(params, context);
  telemetry.stages.push({ name: 'fetch_bundles', startMs: s2, endMs: Date.now(), itemCount: bundles.length });

  // ...etc

  telemetry.totalMs = Date.now() - start;
  return { ...result, telemetry };
}
```

#### B. Parallel Bundle Fetching

The pipeline fetches identity + prefs + topic + entity in parallel. Port this into the assembler:

```typescript
// Current assembler: Sequential
const identityBundle = await this.fetchBundle('identity_core', ...);
const prefsBundle = await this.fetchBundle('global_prefs', ...);
const topicBundles = await Promise.all(topics.map(...));

// Ported from pipeline: All in parallel
const [identityBundle, prefsBundle, ...topicBundles] = await Promise.all([
  this.fetchBundle('identity_core', ...),
  this.fetchBundle('global_prefs', ...),
  ...topics.map(t => this.fetchBundle('topic', ...)),
]);
```

### Step 2: Remove Pipeline

1. **Delete** `packages/backend/src/context/context-pipeline.ts` (743 lines)
2. **Remove its export** from `packages/backend/src/context/index.ts`
3. **Remove any parity-mode imports** from `unified-context-service.ts`

### Step 3: Remove Legacy Generator

1. **Delete** `packages/backend/src/context/context-generator.js` (if exists)
2. **Remove parity logging** from `unified-context-service.ts`:

```typescript
// BEFORE (unified-context-service.ts)
// Run legacy generator for parity comparison
const legacyResult = await legacyGenerator.generate(params);
logger.info({ parity: compareResults(newResult, legacyResult) }, 'Parity check');

// AFTER
// Just return the result
return newResult;
```

### Step 4: Simplify `UnifiedContextService`

After removing the other engines, `UnifiedContextService` becomes a thin wrapper. Either:
- **Option A**: Keep it as the public API facade (clean interface boundary)
- **Option B**: Merge it into `DynamicContextAssembler` and rename to `ContextAssembler`

**Recommendation: Option A** — the facade pattern is useful for adding middleware, logging, and rate limiting around the assembler.

---

## Impact on Tests

Any tests referencing `ParallelContextPipeline` or `context-generator` need updating. Search for:
```bash
rg -l "ParallelContextPipeline|context-pipeline|context-generator" packages/backend/src/
```

---

## After This Redesign

The context system goes from this:

```
┌──────────────────────────────────────────────┐
│ UnifiedContextService                         │
│  ├── DynamicContextAssembler (active)         │
│  ├── ParallelContextPipeline (dead)           │
│  └── Legacy Context Generator (parity only)   │
└──────────────────────────────────────────────┘
```

To this:

```
┌──────────────────────────────────────────────┐
│ UnifiedContextService (facade)               │
│  └── DynamicContextAssembler                  │
│       ├── with parallel bundle fetch          │
│       ├── with telemetry stages               │
│       └── with budget algorithm               │
└──────────────────────────────────────────────┘
```

**Net code reduction: ~1,500 lines deleted, ~50 lines added.**
