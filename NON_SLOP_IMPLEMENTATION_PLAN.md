# VIVIM NON_SLOP Implementation Plan

> **Generated**: 2026-03-30  
> **Purpose**: Comprehensive implementation guide for de-slopping the VIVIM frontend

---

## 1. Executive Summary

This document details the implementation of the NON_SLOP specifications across 5 phases. The goal is transforming VIVIM from generic "AI app" aesthetics to a **Sovereign Intelligence Terminal** with high-signal, modular architecture.

### Key Changes
- **Aesthetic**: Remove "AI Glow" (Violet/Cyan) → Add "Knowledge Vault" (Emerald/Steel/Mono)
- **Structural**: Extract monolith `page.tsx` → Modular components
- **Functional**: Add identity observability, context tracing, librarian terminal
- **Preview System**: Dual-mode viewing (current vs new)

---

## 2. Preview System Architecture

### Option Selected: Route-Based Preview (Option C)

```
/                     → Current SLOP version (unchanged)
/preview/sovereign    → New NON_SLOP version
```

**Benefits:**
- Zero risk to existing production
- Easy A/B comparison in separate tabs
- Can be deployed as feature branch preview
- Clean separation of concerns

### Implementation

**New File:** `packages/frontend/src/app/preview/sovereign/page.tsx`
- Imports all new components
- Uses new theme/colors
- Full parity with current page functionality

---

## 3. Phase 1: Structural De-Slopping

### 1.1 Data Extraction

**New File:** `packages/frontend/src/lib/constants/landing-data.ts`

```typescript
// Extract all hardcoded arrays from page.tsx

export interface Problem {
  rank: number;
  title: string;
  hook: string;
  category: "memory" | "portability" | "trust" | "developer";
  scores: { P: number; T: number; E: number; M: number };
  vivimAnswer: string;
  vivimScore: number;
  vivimGap: string;
}

export const LAYER_DATA = [
  { name: "L0", label: "Identity Core", desc: "Who you are — permanent context", tokens: "~300", color: "from-violet-600 to-purple-700" },
  // ... L1-L7
];

export const MEMORY_TYPES = [
  { name: "Episodic", icon: Timer, color: "from-violet-500 to-purple-600", example: "..." },
  // ... 9 types
];

export const PRINCIPLES = [
  { icon: Shield, title: "Sovereign", desc: "...", color: "..." },
  // ... 6 principles
];

export const PROVIDERS = [
  { name: "OpenAI" },
  { name: "Google Gemini" },
  // ... 7 providers
];

export const DEMOS = [
  { slug: "live-memory", title: "...", desc: "...", icon: Brain, color: "..." },
  // ... 10 demos
];

export const PROBLEMS: Problem[] = [
  // ... 12 problems with full data
];
```

### 1.2 Component Extraction

**New Directory:** `packages/frontend/src/components/landing/`

#### HeroSection.tsx
- **Purpose**: Hero section with title, subtitle, CTA buttons
- **Source**: page.tsx lines 351-457
- **New Visual**: Uses ACUGrid instead of HeroVisual (Phase 2)

#### ProblemScorecard.tsx
- **Purpose**: Problem display with filtering and modal
- **Source**: page.tsx lines 488-697
- **Features**: 
  - Category filter pills
  - Expandable problem grid
  - Scorecard modal

#### SolutionOverview.tsx
- **Purpose**: Solution features + demo cards
- **Source**: page.tsx lines 702-805

#### RightsLayerGrid.tsx
- **Purpose**: Data rights tiers visualization
- **Source**: page.tsx lines 869-962

### 1.3 CSS Theme Update

**File:** `packages/frontend/src/app/globals.css`

**Add: Sovereign Palette**
```css
:root {
  /* NEW: Knowledge Vault Palette */
  --vivim-accent: #10b981;      /* Emerald 500 */
  --vivim-surface: #0f172a;      /* Slate 900 */
  --vivim-border: #334155;       /* Slate 700 */
  --vivim-data: #64748b;         /* Slate 500 */
  
  /* Keep for compatibility */
  --vivim-accent-old: #8B5CF6;  /* Violet 500 (legacy) */
}
```

### 1.4 Identity Components

**New File:** `packages/frontend/src/components/chat/identity-ripening-meter.tsx`

```typescript
interface IdentityRipeningMeterProps {
  score: number;  // 0-100
}

export function IdentityRipeningMeter({ score }: IdentityRipeningMeterProps) {
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

---

## 4. Phase 2: Cognitive Observability

### 2.1 ACU Grid (Replaces HeroVisual)

**New File:** `packages/frontend/src/components/acu-grid.tsx`

**Visual Specification:**
- Coordinate-based grid of sharp, monochromatic dots (Steel/Teal)
- Dots "light up" or "cluster" based on backend Topic/Entity data
- **No glow effects** unless dot is actively being queried
- Pure data visualization, not "brain" metaphor

**Props:**
```typescript
interface ACUGridProps {
  topicClusters?: Array<{ x: number; y: number; intensity: number }>;
  activeQuery?: string;
  className?: string;
}
```

### 2.2 Message Trace

**New File:** `packages/frontend/src/components/chat/message-trace.tsx`

```typescript
interface ContextTrace {
  layer: string;           // "L0", "L1", etc.
  includedItems: string[];
  evictedItems: string[];
  tokensRequested: number;
  tokensAllocated: number;
  evictionReason?: "budget" | "entropy" | "relevance" | "threshold";
}

interface MessageTraceProps {
  traces: ContextTrace[];
  isOpen: boolean;
  onToggle: () => void;
}
```

**UI:**
- "Trace" button on each AI message
- Expandable panel showing:
  - Layer breakdown
  - Token allocation per layer
  - Evicted items (if any)
  - Source attribution

### 2.3 Librarian Terminal

**New File:** `packages/frontend/src/components/librarian-terminal.tsx`

**Features:**
- Side panel or drawer component
- Streams live from `/api/v2/memories/consolidations`
- Shows operations:
  - *"Detected new topic cluster: 'React 19 Hooks'..."*
  - *"Merging 3 memories into 'Project VIVIM Architecture'..."*
  - *"Identity Confidence Score +5: Consistent coding patterns detected."*

**Props:**
```typescript
interface LibrarianTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  logs?: LibrarianLog[];
}
```

---

## 5. Phase 3: Identity & Portability

### 3.1 IdentityCard Promotion UI

**Update:** `packages/frontend/src/components/identity-card.tsx`

**Trigger:** When `ICS > 85%`

**UI:**
```
┌─────────────────────────────────────┐
│  🛡️ Identity Verification          │
│                                     │
│  I am 88% certain you are          │
│  [Senior Full-Stack Developer]      │
│                                     │
│  Would you like to lock this        │
│  identity into your sovereign vault?│
│                                     │
│  [Lock Identity]  [Not Me]          │
└─────────────────────────────────────┘
```

### 3.2 Sovereign Export Dashboard

**New File:** `packages/frontend/src/components/sovereign-export.tsx`

**Features:**
- Export formats: JSON, SQLite
- Merkle tree visualization
- Export history

---

## 6. Phase 4: Anticipatory Intelligence

### 4.1 Warming Status

**New File:** `packages/frontend/src/components/chat/warming-status.tsx`

**UI:**
```
┌──────────────────────────────────────┐
│ 🔥 Hot: Identity Core, Global Prefs  │
│ ♨️ Warming: 'Software Architecture'   │
└──────────────────────────────────────┘
```

### 4.2 Situation Archetype Selector

**New File:** `packages/frontend/src/components/chat/situation-selector.tsx`

**Modes:**
- 🔬 Research (High L2/L3 weight)
- 💡 Creative (High L1/L5 weight)
- 🐛 Debug (High L4/L6 weight)

---

## 7. Phase 5: Production Hardening

### 5.1 Emergency Mode UI

**New File:** `packages/frontend/src/components/emergency-mode.tsx`

**Trigger:** When Z.AI is offline

**UI:**
```
┌─────────────────────────────────────────────┐
│  ⚠️ Primary Intelligence Offline            │
│                                             │
│  Running on minimal local context.          │
│  Some features may be limited.              │
│                                             │
│  [Retry Connection]  [View Local Cache]    │
└─────────────────────────────────────────────┘
```

---

## 8. File Manifest

### New Files to Create

| File Path | Purpose | Phase |
|-----------|---------|-------|
| `src/lib/constants/landing-data.ts` | All extracted data constants | 1 |
| `src/components/landing/hero-section.tsx` | Hero with ACU Grid | 1 |
| `src/components/landing/problem-scorecard.tsx` | Problem display | 1 |
| `src/components/landing/solution-overview.tsx` | Solution + demos | 1 |
| `src/components/landing/rights-layer-grid.tsx` | Rights tiers | 1 |
| `src/components/chat/identity-ripening-meter.tsx` | Identity state | 1 |
| `src/components/acu-grid.tsx` | ACU visualization | 2 |
| `src/components/chat/message-trace.tsx` | Context tracing | 2 |
| `src/components/librarian-terminal.tsx` | Memory ops terminal | 2 |
| `src/components/sovereign-export.tsx` | Export dashboard | 3 |
| `src/components/chat/warming-status.tsx` | Context warming | 4 |
| `src/components/chat/situation-selector.tsx` | Mode override | 4 |
| `src/components/emergency-mode.tsx` | Offline fallback | 5 |
| `src/app/preview/sovereign/page.tsx` | New landing page | ALL |

### Files to Modify

| File | Changes |
|------|---------|
| `src/app/globals.css` | Add Sovereign palette variables |
| `src/components/IdentityCard.tsx` | Add promotion UI |
| `src/components/hero-visual.tsx` | Keep for SLOP version |
| `src/components/context-budget-viz.tsx` | Wire to chat header |

### Files to Keep Unchanged (SLOP Version)

| File | Purpose |
|------|---------|
| `src/app/page.tsx` | Current production page |
| `src/components/hero-visual.tsx` | Current hero visual |

---

## 9. Preview System Routes

```
┌─────────────────────────────────────────────────────────────┐
│                    VIVIM Frontend Routes                     │
├─────────────────────────────────────────────────────────────┤
│  /                        → SLOP version (production)       │
│  /preview/sovereign       → NON_SLOP version (new)         │
│  /chat                    → Chat interface                  │
│  /demos/*                 → Demo pages                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 10. Implementation Order

### Week 1: Foundation
1. [ ] Create `landing-data.ts` with all constants
2. [ ] Create `globals.css` Sovereign palette additions
3. [ ] Create landing components (HeroSection, ProblemScorecard, etc.)
4. [ ] Create `/preview/sovereign/page.tsx`

### Week 2: Observability
5. [ ] Create `ACUGrid.tsx` component
6. [ ] Create `MessageTrace.tsx` component
7. [ ] Create `LibrarianTerminal.tsx` component

### Week 3: Identity
8. [ ] Enhance `IdentityCard.tsx` with promotion UI
9. [ ] Create `SovereignExport.tsx` dashboard

### Week 4: Anticipation
10. [ ] Create `WarmingStatus.tsx` component
11. [ ] Create `SituationSelector.tsx` component

### Week 5: Hardening
12. [ ] Create `EmergencyMode.tsx` component
13. [ ] Final CSS audit (remove remaining slop)
14. [ ] Testing and polish

---

## 11. Success Metrics

- [ ] `/preview/sovereign` renders identically to `/` (functionally)
- [ ] Page.tsx reduced from 1,479 lines to <100 (orchestrator only)
- [ ] No hardcoded arrays >5 items in component files
- [ ] All data values render in monospace font
- [ ] IdentityRipeningMeter shows real confidence scores
- [ ] MessageTrace displays actual context assembly data
- [ ] CSS contains ZERO `from-violet-500 to-cyan-500` gradients (replaced with Sovereign palette)

---

## 12. Rollback Plan

If NON_SLOP version is rejected:
1. `/preview/sovereign` can be deleted
2. `globals.css` additions can be reverted
3. Original `/` remains fully functional

**No breaking changes to production.**

---

*This plan is ready for implementation. To proceed, confirm with:* 

```bash
# Start implementation
/opencode start-work
```

