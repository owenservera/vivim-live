# VIVIM Implementation Roadmap - Technical Execution Plan

> Generated from STRATEGIC_ROADMAP.md and INTELLIGENCE_BLUEPRINT.md
> Date: 2026-03-29

---

## Executive Summary

This document details the implementation plan for 5 major roadmap items across the VIVIM codebase. Each item is broken into atomic tasks with clear file targets.

---

## P0: Critical Infrastructure

### P0-1: Dynamic Environment-Based CORS Configuration

**Objective:** Remove hardcoded IPs (192.168.0.173) from server.js and implement dynamic allow-list based on environment.

**Files to Modify:**
- `packages/backend/src/config/index.js` - Add `getDynamicOrigins()` helper
- `packages/backend/src/server.js` - Replace hardcoded origins with dynamic function

**Implementation Steps:**
1. Add `getDynamicOrigins()` function to config/index.js
2. Use regex patterns for development: `/http:\/\/localhost:\d+/`, `/http:\/\/127\.0\.0\.1:\d+/`, `/http:\/\/192\.168\.\d+\.\d+:\d+/`, `/http:\/\/10\.\d+\.\d+\.\d+:\d+/`, `/http:\/\/172\.\d+\.\d+\.\d+:\d+/`
3. Replace hardcoded array in corsOptions with `getDynamicOrigins()`
4. Remove duplicate CORS middleware (lines 226-298 in server.js)

**Acceptance Criteria:**
- No hardcoded IPs in server.js
- Development: Allows localhost, 127.0.0.1, and private network ranges
- Production: Only uses explicit CORS_ORIGINS env var

---

### P0-2: Legacy Context Generator Sunset

**Objective:** Complete the sunset of legacy context generator with parity verification, then remove old code.

**Files to Modify:**
- `packages/backend/src/services/unified-context-service.ts` - Add parity logging
- `packages/backend/src/services/context-generator.js` - Mark for deletion
- `packages/backend/src/context/unified-context-service.js` - Mark for deletion

**Implementation Steps:**

**Phase A: Parity Verification (Add Logging)**
1. In `generateContextForChat`, add parity report logging every 10th request
2. Log comparison: new engine vs old engine token counts, latency
3. Add flag `PARITY_VERIFICATION_COMPLETE` via env var to track progress

**Phase B: Shadow Run**
1. Set env `CONTEXT_ENGINE=new-only` to disable fallback
2. Monitor for 48 hours or 1000 requests
3. If errors < 0.1%, proceed to deletion

**Phase C: Clean Deletion**
1. Remove `import * as oldContextGenerator`
2. Remove fallback code block (lines 200-216)
3. Remove `fallbackOnError` config option
4. Delete `context-generator.js` and `unified-context-service.js`

**Acceptance Criteria:**
- Single code path for context generation
- Parity report shows < 1% divergence
- Legacy files removed from codebase

---

## P1: High Priority

### P1-1: Context Assembly Traceability

**Objective:** Add eviction logging to every assembly call so developers can debug "missing memory" issues.

**Files to Modify:**
- `packages/backend/src/context/types.ts` - Add ContextTrace interface
- `packages/backend/src/context/context-assembler.ts` - Add trace logic

**Implementation Steps:**

1. Add to types.ts:
```typescript
export interface ContextTrace {
  layer: string;
  includedItems: string[];  // IDs of ACUs/Memories
  evictedItems: Array<{
    id: string;
    reason: 'budget' | 'entropy' | 'relevance' | 'threshold';
  }>;
  tokensRequested: number;
  tokensAllocated: number;
}
```

2. Update AssembledContext.metadata:
```typescript
metadata: {
  // ... existing fields
  traces: ContextTrace[];
}
```

3. In context-assembler.ts, track eviction reasons:
   - Budget: Not enough tokens allocated to layer
   - Entropy: Decayed below 0.3 threshold (from context-thermodynamics)
   - Relevance: Similarity score below 0.5
   - Threshold: Hard threshold (e.g., max items per layer)

4. Store trace in cache alongside assembled context

**Acceptance Criteria:**
- Every assemble() call returns traces array
- Each trace shows included/evicted items with reasons
- Trace is retrievable from cache for debugging

---

### P1-2: Wire UI Budget Controls to Backend Recipes

**Objective:** Connect EnhancedBudgetControls.tsx to context-recipes API so users can toggle between Standard/Research/Creative contexts.

**Files to Modify:**
- `packages/frontend/src/components/EnhancedBudgetControls.tsx` - Add API integration
- `packages/backend/src/routes/context-recipes.js` - Add settings endpoint (if needed)

**Implementation Steps:**

1. Add recipe presets to database (via migration or seed):
   - `standard_default` - Standard weights
   - `research_deep` - L2 Topic = 1.5x, L6 History = 0.5x
   - `creative_flexible` - All layers balanced

2. Update EnhancedBudgetControls.tsx:
   - Add state for current recipe
   - Fetch recipes on mount: `GET /api/v2/context-recipes`
   - Add recipe selector dropdown
   - On recipe change: `PUT /api/v2/context-engine/settings/:userId` with recipeId
   - Sync local state with API response

3. Optionally add PUT endpoint for settings:
   - `PUT /api/v2/context-engine/settings/:virtualUserId`
   - Body: `{ recipeId: string }`

**Acceptance Criteria:**
- UI shows recipe selector with Standard/Research/Creative options
- Selecting a recipe updates backend settings
- Context assembly uses selected recipe weights

---

## P2: Medium Priority

### P2-1: Librarian Observability API

**Objective:** Expose Librarian worker operations to users via API so they can see memory consolidation happening.

**Files to Modify:**
- `packages/backend/prisma/schema.prisma` - Add LibrarianLog model
- `packages/backend/src/routes/memory.js` - Add consolidations endpoint
- `packages/backend/src/context/librarian-worker.ts` - Add logging to DB

**Implementation Steps:**

1. Add Prisma model:
```prisma
model LibrarianLog {
  id          String   @id @default(uuid())
  userId      String
  timestamp   DateTime @default(now())
  operation   String   // "topic_created", "entity_updated", "memory_merged"
  details     Json     // { topicSlug, entityName, memoryIds, etc. }
  status      String   // "success", "partial", "failed"
  errorMessage String?
  
  @@index([userId, timestamp])
}
```

2. Update LibrarianWorker:
   - After each graph synthesis operation, create LibrarianLog entry
   - Log: topicsCreated, topicsUpdated, entitiesCreated, entitiesUpdated
   - Include confidence scores and merge details

3. Add API endpoint:
   - `GET /api/v2/memories/consolidations?userId=...&limit=50`
   - Returns array of LibrarianLog entries
   - Include pagination

**Acceptance Criteria:**
- Users can see consolidation history
- Each operation (topic create, entity update) creates a log entry
- API returns last 50 operations with pagination

---

## Execution Order

```
Phase 1: Infrastructure (P0)
├── P0-1: CORS Refactor
└── P0-2: Legacy Sunset (Parity Logging first, then removal)

Phase 2: Context (P1)
├── P1-1: Traceability
└── P1-2: Budget Controls Wiring

Phase 3: Observability (P2)
└── P2-1: Librarian API
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| CORS breaking dev | Keep fallback: allow all origins in dev mode |
| Legacy removal causing bugs | Keep fallback until 48hr shadow run passes |
| Traceability slowing assembly | Only compute traces, don't block |
| API breaking existing flows | Add feature flags for all changes |

---

## Success Metrics

- **P0-1**: No hardcoded IPs in server.js
- **P0-2**: Single code path, < 1% parity divergence
- **P1-1**: 100% of assemble() calls include traces
- **P1-2**: Recipe selection persists across sessions
- **P2-1**: Consolidation logs queryable via API

---

*This document is a living artifact. Update as implementation progresses.*
