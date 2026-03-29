# VIVIM Intelligence Blueprint: Architecture & Resilience (v1.0)

## 1. System Architecture Refinement
The goal is to consolidate the "Dual-Engine" approach into a single, high-performance **Dynamic Context Pipeline** while maintaining the L0-L7 conceptual integrity.

### 1.1. The "Sunset" Protocol: Legacy Decommissioning
**Objective:** Eliminate `context-generator.js` and `user-context-system.js` to reduce maintenance surface by 40%.

*   **Step 1: Verification Hook**
    Modify `UnifiedContextService.generateContextForChat` to log a "Parity Report" for every 10th request, comparing the legacy output with the new `DynamicContextAssembler` output.
*   **Step 2: Logic Porting**
    Ensure any specific "Legacy Edge Cases" (e.g., specific formatting for older OpenAI models) are ported into the `BundleCompiler`.
*   **Step 3: Clean Deletion**
    Remove the `oldContextGenerator` import and the fallback logic entirely.

---

## 2. Observable Intelligence: The "Traceability" Layer
VIVIM's complexity (Thermodynamics, Entropy, Layer Budgets) must be observable to be maintainable.

### 2.1. Context Assembly Traceability
**Implementation:** Update `AssembledContext` metadata to include an `evictionLog`.

```typescript
// packages/backend/src/context/types.ts
export interface ContextTrace {
  layer: string;
  includedItems: string[]; // IDs of ACUs/Memories
  evictedItems: Array<{ id: string, reason: 'budget' | 'entropy' | 'relevance' }>;
  tokensRequested: number;
  tokensAllocated: number;
}

// Update AssembledContext interface
metadata: {
  assemblyTimeMs: number;
  traces: ContextTrace[]; // New field
  // ... existing fields
}
```

### 2.2. Librarian Worker Observability
**Objective:** Allow users to see the "Thinking" behind memory consolidation.
*   **Prisma Update:** Add a `LibrarianLog` model to track memory merges, summarizations, and deletions.
*   **API Endpoint:** `GET /api/v2/memories/consolidations` to surface these logs to the frontend.

---

## 3. Dynamic Infrastructure & Config Hardening

### 3.1. Environment-Aware CORS
**Objective:** Remove hardcoded IPs (e.g., `192.168.0.173`) from `server.js`.

**Refactor Strategy:**
```javascript
// packages/backend/src/config/index.js
// Add a helper to generate allowed origins
export const getDynamicOrigins = () => {
  const base = process.env.CORS_ORIGINS?.split(',') || [];
  if (process.env.NODE_ENV === 'development') {
    return [
      ...base,
      /^http:\/\/localhost:\d+$/,
      /^http:\/\/127\.0\.0\.1:\d+$/,
      /^http:\/\/192\.168\.\d+\.\d+:\d+$/,
      /^http:\/\/10\.\d+\.\d+\.\d+:\d+$/
    ];
  }
  return base;
};

// packages/backend/src/server.js
const corsOptions = {
  origin: getDynamicOrigins(),
  credentials: true,
  // ...
};
```

### 3.2. Zero-Login: Inferred Identity Lifecycle
**Objective:** Replace "Login" with a probabilistic "Identity Ripening" model.

*   **Confidence Scoring:** The `VirtualUser` model tracks a `confidenceScore` (0-100). 
    *   **Fingerprint (30%):** Stable device markers.
    *   **Behavioral (30%):** Typing patterns, navigation rhythm, active hours.
    *   **Memory/Context (40%):** Possession of specific "Identity Secrets" or shared facts only the user would know.

*   **Promotion Logic:**
    1.  **Discovery:** AI detects a "High-Value Identity Signal" (e.g., "I'm the lead dev on Project X").
    2.  **Verification:** The `LibrarianWorker` generates a verification prompt: *"Based on our history, you seem to be the Lead Dev of Project X. Would you like me to lock this into your Sovereign Identity?"*
    3.  **Solidification:** Upon confirmation, the `VirtualUser` is upgraded. Its `displayName` is inferred, and its `Identity` becomes a cryptographic hash of these confirmed facts.

---

## 4. User-Centric Context Control (Frontend ↔ Backend Wiring)

### 4.1. Recipe Execution Engine
Currently, `EnhancedBudgetControls.tsx` is a UI shell. It must be wired to the `ContextRecipe` API.

**Data Flow:**
1.  **UI:** User selects "Deep Research" mode.
2.  **API:** Frontend sends `PUT /api/v2/context-engine/settings/:virtualUserId` with `recipeId: "research_default"`.
3.  **Backend:** `DynamicContextAssembler` fetches the recipe and applies `layerWeights` (e.g., L2 Topic Context = 1.5x weight, L6 History = 0.5x weight).

### 4.2. JIT Visualization
Modify the chat interface to show a "Thinking" state that reveals which layers are being retrieved in real-time.
*   **Component:** `context-budget-viz.tsx` should update dynamically based on the `X-Context-Engine` header and the `stats` returned in the chat response.

---

## 5. Resilience & Fallback Strategy

### 5.1. The "Emergency" Prompt Builder
If the `DynamicContextAssembler` fails due to Z.AI API issues or Database timeouts, the system must degrade gracefully.

**Fallback Logic:**
```typescript
async function emergencyFallback(userId: string, message: string): Promise<string> {
  // 1. Fetch L0 (Identity) from local JSON cache if possible
  // 2. Fetch last 5 messages from DB (simple query, no embeddings)
  // 3. Construct a raw text prompt without semantic enrichment
  return `[SYSTEM: EMERGENCY MODE]\nUser Identity: ${identity}\nRecent History: ${history}\nUser: ${message}`;
}
```

---

## 6. Implementation Roadmap (Phased)

### Phase A: Infrastructure (Days 1-3)
- [ ] Implement Dynamic CORS regex.
- [ ] Move hardcoded Z.AI constants to `.env`.
- [ ] Refactor `VirtualUser` to include identity verification signals.

### Phase B: Context Consolidation (Days 4-7)
- [ ] Delete legacy context generator files.
- [ ] Implement `ContextTrace` logic in the Assembler.
- [ ] Wire `ContextRecipe` weights into the `BudgetAlgorithm`.

### Phase C: UI/UX Intelligence (Days 8-14)
- [ ] Connect `EnhancedBudgetControls.tsx` to the backend.
- [ ] Build the "Intelligence Dashboard" for Librarian logs.
- [ ] Implement the "Emergency Mode" fallback prompt.

---

## 7. Success Metrics
- **Performance:** Context assembly time < 200ms (excluding embeddings).
- **Correctness:** 100% parity between Dynamic Assembler and Legacy fallback before deletion.
- **Observability:** 100% of chat requests include a `trace` object for debugging.
- **Portability:** User can export their `VirtualUser` profile and `Memories` as a single, standard JSON file.
