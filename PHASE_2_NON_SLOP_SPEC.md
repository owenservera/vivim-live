# Phase 2: Cognitive Observability — Non-Slop Specification

## 1. Objective: Visualizing Machine Intuition
Phase 2 moves VIVIM beyond looking like a "Chatbot" and transforms it into a **Sovereign Intelligence Terminal**. We will replace remaining "Slop Tropes" (pulsing brains, generic chat bubbles) with live data-driven components that expose the L0-L7 context assembly process.

---

## 2. De-Slopping the Hero: The ACU Grid
**Problem:** `HeroVisual.tsx` uses a generic "Pulsing Brain" SVG—a classic AI slop trope.
**Solution:** Replace it with the `ACUGrid` visualization, a real-time representation of the user's Atomic Chat Units.

### 2.1. `ACUGrid.tsx` Component Logic
*   **Visual:** A coordinate-based grid of sharp, monochromatic dots (Steel/Teal).
*   **Intelligence:** Dots "light up" or "cluster" based on real backend Topic/Entity co-occurrence.
*   **Standard:** No glow effects unless a dot is actively being "queried" by the context engine.

---

## 3. Interaction De-Slopping: The "Trace" Layer
**Objective:** Eliminate the "Black Box" feeling of AI responses by implementing **Blueprint 2.1 (Context Traceability)** in the UI.

### 3.1. `MessageTrace.tsx` Component
Every AI response will now include a "Trace" button that reveals the **Contextual Origin**:
```tsx
// src/components/chat/MessageTrace.tsx
export function MessageTrace({ traces }: { traces: ContextTrace[] }) {
  return (
    <div className="font-mono text-[10px] bg-vivim-surface border border-vivim-border p-4 rounded-lg">
      <h4 className="text-emerald-400 mb-2 uppercase">Assembly Trace</h4>
      {traces.map(t => (
        <div key={t.layer} className="flex justify-between border-b border-white/5 py-1">
          <span className="text-slate-500">{t.layer}</span>
          <span className="text-slate-300">{t.tokensAllocated} tokens</span>
          {t.evictedItems.length > 0 && (
            <span className="text-red-400/50">[-{t.evictedItems.length} items]</span>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

## 4. Librarian Observability: The "Cold Loop" Dashboard
**Objective:** Implement **Blueprint 2.2**, allowing users to see the Librarian's "Thinking" process during memory consolidation.

### 4.1. `LibrarianTerminal.tsx`
A side-panel or dedicated view that streams live logs from the `LibrarianWorker`:
*   *"Detected new topic cluster: 'React 19 Hooks'..."*
*   *"Merging 3 memories into 'Project VIVIM Architecture'..."*
*   *"Identity Confidence Score +5: Consistent coding patterns detected."*

---

## 5. Aesthetic Hardening: "Sovereign Mono"
**Goal:** Transition data-heavy views to a high-density, professional aesthetic.

*   **Rule:** Any value returned from the `BudgetAlgorithm` or `ThermodynamicsEngine` must be rendered in `JetBrains Mono`.
*   **Rule:** Replace "Glowy Buttons" with "Tactile Buttons"—sharper corners (rounded-sm), clear borders, and high-contrast active states.

---

## 6. Phase 2 Implementation Checklist

- [ ] **Step 1:** Delete `HeroVisual.tsx` and implement `ACUGrid.tsx`.
- [ ] **Step 2:** Update `ChatProvider` to handle the `X-Context-Trace` header and store it in the message history.
- [ ] **Step 3:** Implement the `MessageTrace` toggle in `packages/frontend/src/components/assistant-ui/message.tsx`.
- [ ] **Step 4:** Build the `LibrarianTerminal` component and wire it to the `/api/v2/memories/consolidations` endpoint.
- [ ] **Step 5:** Final CSS Audit: Remove any remaining `blur-3xl` and `violet-500` gradients from data-viz components.

---

## 7. Success Metric: "High Signal Density"
By the end of Phase 2, a technical user should be able to look at the VIVIM interface and explain exactly **why** the AI knows a specific fact, effectively ending the "AI Black Box" era.
