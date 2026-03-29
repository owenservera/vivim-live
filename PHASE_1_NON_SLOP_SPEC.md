# Phase 1: The Sovereign Foundation — Non-Slop Specification

## 1. Objective: Structural & Aesthetic De-Slopping
This specification replaces generic "AI-generated bulk" with high-signal, modular architecture. It moves the UI from a "Glow-first" aesthetic to a "Sovereign-first" utility.

---

## 2. Structural De-Slopping: The Landing Page Refactor
**Problem:** `page.tsx` is a 1,480-line monolith containing hardcoded data and logic.
**Solution:** Extract data to `src/lib/constants/` and logic to `src/components/landing/`.

### 2.1. New Directory Structure
```text
packages/frontend/src/
├── lib/constants/
│   └── landing-data.ts       <-- Move PROBLEMS, DEMOS, LAYER_DATA here
├── components/landing/
│   ├── HeroSection.tsx       <-- From page.tsx lines 200-450
│   ├── ProblemScorecard.tsx  <-- From page.tsx lines 500-800
│   ├── SolutionOverview.tsx  <-- From page.tsx lines 850-1100
│   └── RightsLayerGrid.tsx   <-- From page.tsx lines 1150-1300
└── app/page.tsx              <-- Refactored into a < 100-line orchestrator
```

---

## 3. Aesthetic Pivot: The "Knowledge Vault" Palette
**Goal:** Reduce "AI Glow" (Violet/Cyan) by 50% and introduce "Sovereign Grit" (Steel/Emerald/Monospace).

### 3.1. CSS Variable Update (`globals.css`)
```css
:root {
  /* Replace generic AI Violet with Sovereign Emerald/Steel */
  --vivim-accent: #10b981; /* Emerald 500 */
  --vivim-surface: #0f172a; /* Slate 900 */
  --vivim-border: #334155;  /* Slate 700 */
  --vivim-data: #64748b;    /* Slate 500 for secondary data */
  
  /* The "Knowledge Vault" Monospace font for data-heavy elements */
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;
}
```

---

## 4. Feature Hardening: From "Stubs" to "Sovereign Logic"

### 4.1. The `IdentityRipeningMeter` Component
Replace the hardcoded "Stub Context" badge with a dynamic meter based on `VirtualUser.confidenceScore`.

```tsx
// src/components/chat/identity-ripening-meter.tsx
export function IdentityRipeningMeter({ score }: { score: number }) {
  const state = 
    score < 30 ? "STRANGER" : 
    score < 60 ? "ACQUAINTANCE" : 
    score < 85 ? "FAMILIAR" : "KNOWN";

  return (
    <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-vivim-border bg-vivim-surface/50">
      <div className="w-2 h-2 rounded-full animate-pulse bg-emerald-400" />
      <span className="text-[10px] font-mono tracking-tighter text-slate-400 uppercase">
        {state} IDENTIFICATION: {score}%
      </span>
    </div>
  );
}
```

### 4.2. Context Budget Visualization (Live Integration)
Move `context-budget-viz.tsx` from the landing page into the **Chat Header**. It should parse the `X-Context-Engine` header from the response to show real-time L0-L7 usage.

---

## 5. Non-Slop Coding Standards (The "Sovereign" Guardrail)

To prevent the re-introduction of "AI Slop," all future code must adhere to:

1.  **Strict Data Separation:** No arrays larger than 5 items are allowed inside a component file. They must live in `src/lib/constants/`.
2.  **No "Just-in-Case" Styling:** Remove all Tailwind classes that are not actively contributing to the layout (e.g., redundant `bg-opacity-100`, `flex-row` when it's the default).
3.  **Atomic Visuals:** Use `lucide-react` icons combined with raw SVG paths for unique VIVIM identity markers; avoid generic third-party "Neural Brain" assets.
4.  **Traceability First:** Every UI component that displays AI-derived data must include a "Source" or "Trace" tooltip explaining *where* that data came from (e.g., "Retrieved from Memory L3").

---

## 6. Phase 1 Implementation Checklist

- [ ] **Step 1:** Extract `PROBLEMS` array to `src/lib/constants/landing-data.ts`.
- [ ] **Step 2:** Refactor `packages/frontend/src/app/page.tsx` into modular components.
- [ ] **Step 3:** Update `globals.css` with the "Knowledge Vault" palette.
- [ ] **Step 4:** Implement `IdentityRipeningMeter` in the Chat UI.
- [ ] **Step 5:** Wire real backend `Budget` stats to the context visualization.
