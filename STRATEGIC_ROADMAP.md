# VIVIM Strategic Technical Roadmap: Intelligence & Resilience

## 1. Executive Summary
VIVIM has successfully moved from a conceptual framework to a high-functioning prototype featuring a sophisticated **L0-L7 Context Layering System**. To transition from "Advanced Prototype" to "Production Grade," we must address the "Dual-Engine" migration debt, simplify the cognitive load of the "Thermodynamics" modules, and harden the infrastructure configuration.

---

## 2. Conceptual Intent & Core Philosophy
The "North Star" of VIVIM remains **Sovereign, Portable AI Memory**.
- **L0-L7 Hierarchy:** The multi-layered approach to context is non-negotiable. It differentiates VIVIM from standard RAG by treating memory as a dynamic, weighted resource rather than a simple database lookup.
- **Virtual User Identity:** User identification via device fingerprinting is the bedrock of our "No-Login" sovereignty.

---

## 3. Gap Analysis: Functional & Technical

### 3.1. The "Librarian" Gap
The `LibrarianWorker` is architecturally sound but currently operates in an "Auto-Pilot" mode with limited observability.
*   **Gap:** Lack of a user-facing "Memory Consolidation" view. The user cannot see *how* their memories are being merged or summarized by the Librarian.
*   **Mitigation:** Implement a "Librarian Logs" API and a corresponding frontend "Intelligence Dashboard" to visualize memory evolution.

### 3.2. Context Recipe Utilization
*   **Gap:** While the `ContextRecipe` model exists in Prisma, the UI currently uses "Stub Context" badges.
*   **Mitigation:** Wire the `EnhancedBudgetControls.tsx` component to the `context-recipes` API to allow users to toggle between "Standard," "Research," and "Creative" context weights.

---

## 4. Complexity Risk Management

### 4.1. Simplifying "Context Thermodynamics"
The `context-thermodynamics.ts` module uses entropy-based decay for context relevance. While brilliant, it is difficult to debug when a specific memory is "missing" from a prompt.
*   **Risk:** High maintenance cost for future developers.
*   **Strategy:** Implement "Context Traceability." Every `assemble` call should return a `trace.json` (stored in cache) explaining *why* a specific ACU or Memory was evicted (e.g., "Insufficient budget in L5," "Decayed below 0.3 threshold").

### 4.2. Adaptive Prediction Stabilization
*   **Risk:** The `AdaptivePrediction` engine might trigger excessive `warmup` calls, leading to database contention.
*   **Strategy:** Implement a "Throttle Layer" in the `ContextEventBus` to prevent predictive warmup bursts during high-frequency user navigation.

---

## 5. Migration Debt & Technical Debt

### 5.1. The Dual-Engine Sunset Plan
The `UnifiedContextService` currently bridges the "Legacy" generator and the "New" Dynamic Assembler.
*   **Debt:** Maintaining two parallel logic paths increases the surface area for bugs.
*   **Action:** 
    1.  Conduct a 1-week "Shadow Run" where both engines log results but only the "New" engine is used.
    2.  Decommission `context-generator.js` and `user-context-system.js` once parity is verified.

### 5.2. Hardcoded IP & CORS Configuration
The `server.js` file contains hardcoded development IPs (e.g., `192.168.0.173`).
*   **Debt:** Fragile configuration that breaks when developer network environments change.
*   **Action:** Refactor `corsOptions` in `server.js` to use a dynamic allow-list:
    ```javascript
    // Proposed Improvement
    const allowedOrigins = [
      ...config.corsOrigins,
      ...(config.isDevelopment ? [/http:\/\/localhost:\d+/, /http:\/\/127\.0\.0\.1:\d+/, /http:\/\/192\.168\.\d+\.\d+:\d+/] : [])
    ];
    ```

---

## 6. Infrastructure & Security Hardening

### 6.1. Z.AI Resilience
The system is heavily dependent on the Z.AI GLM-4.7 API.
*   **Strategy:** Implement an "Emergency Context Generator" that produces a minimal L0+L4+L6 prompt if the Dynamic Assembler's embedding/LLM calls fail, ensuring the chatbot never "goes silent."

### 6.2. Fingerprint Entropy
*   **Risk:** `getFingerprint()` in `chat-provider.tsx` is client-side only and susceptible to collisions or spoofing.
*   **Hardening:** Move fingerprint verification to the backend. The backend should compare the incoming `x-user-fingerprint` against stored `deviceCharacteristics` in the `VirtualUser` model to detect identity drift.

---

## 7. Execution Priorities (Next 14 Days)

| Priority | Task | Target Module |
| :--- | :--- | :--- |
| **P0** | Refactor CORS to use Environment-based Globbing | `packages/backend/src/server.js` |
| **P0** | Complete Sunset of Legacy Context Generator | `packages/backend/src/services/unified-context-service.ts` |
| **P1** | Implement Context Assembly Traceability | `packages/backend/src/context/context-assembler.ts` |
| **P1** | Connect UI Budget Controls to Backend Recipes | `packages/frontend/src/components/EnhancedBudgetControls.tsx` |
| **P2** | Initialize Librarian Observability API | `packages/backend/src/context/librarian-worker.ts` |
