# CINEMATIC — Scroll-Driven Experience Platform

## Executive Summary

**Cinematic** is a generalized, extensible platform for building scroll-driven cinematic web experiences. Originally designed for venture capital pitch decks, it transforms any narrative into an immersive, data-driven journey where scroll position controls time, space, and meaning.

The platform treats the browser viewport as a theater, scroll progress as the master clock, and each narrative segment as a choreographed chapter that reveals itself based on user intent.

---

## Philosophy

### Three Pillars of Cinematic

1. **Sovereign Content** — Content is decoupled from presentation. Chapters, data, and narrative flow are defined in configuration, not hardcoded in components.

2. **Composable Architecture** — Every visual element, animation sequence, and data visualization is a reusable module that can be rearranged, replaced, or extended.

3. **Future-Proof Design** — The platform makes no assumptions about content type. It works for pitch decks, annual reports, product launches, interactive stories, and portfolio sites.

---

## Architecture Overview

### The Cinematic Stack

```
┌─────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────────┤
│  SvelteKit 5 (Runes)  │  Theatre.js  │  GSAP  │  Three.js/WebGPU  │
├─────────────────────────────────────────────────────────────────────┤
│                         AUDIO LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│                         Tone.js                                     │
├─────────────────────────────────────────────────────────────────────┤
│                         STATE LAYER                                 │
├─────────────────────────────────────────────────────────────────────┤
│  Lenis Scroll Engine  │  Rune-based State  │  Personalization      │
├─────────────────────────────────────────────────────────────────────┤
│                         API LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  Hono on Cloudflare Workers  │  Turso (libSQL)  │  Analytics        │
├─────────────────────────────────────────────────────────────────────┤
│                         STYLING LAYER                               │
├─────────────────────────────────────────────────────────────────────┤
│  Tailwind v4  │  CSS Custom Properties  │  Design Tokens           │
└─────────────────────────────────────────────────────────────────────┘
```

### Core Concepts

#### 1. The Chapter System

Chapters are the atomic units of narrative. Each chapter:
- Is a Svelte component mounted in sequence
- Receives scroll progress as a prop (0→1 within the chapter)
- Manages its own entry/exit animations
- Fires analytics events on activation
- Implements cleanup (dispose) on unmount

```typescript
interface ChapterProps<T = unknown> {
  id: string;                    // Unique chapter identifier
  progress: number;              // Global scroll progress (0→1)
  chapterProgress: number;       // Progress within this chapter (0→1)
  active: boolean;               // True when in viewport
  index: number;                 // Chapter index in sequence
  data: T;                       // Chapter-specific data from config
  context: ExperienceContext;    // Personalization context
}
```

#### 2. The Scroll Engine

Scroll position is the single source of truth for all temporal and spatial decisions:

```
Scroll: 0.0 ────────────────────────────────────────────── 1.0
        │                                                  │
     Chapter 0                                      Chapter N
     (0/N → 1/N)                                     ((N-1)/N → 1)
```

The scroll engine provides:
- Normalized progress (0→1)
- Current chapter index
- Per-chapter progress
- Smooth scrolling with Lenis
- GSAP ScrollTrigger integration

#### 3. The Registry System

The chapter registry is a configuration-driven system that defines:

```typescript
interface ChapterConfig<T = unknown> {
  id: string;                    // Unique identifier
  slug: string;                  // URL-safe slug
  title: string;                 // Display title
  component: LazyComponent;      // Dynamic import
  metadata: ChapterMetadata;     // Technical metadata
  data?: T;                      // Chapter-specific data
}

interface ChapterMetadata {
  emotionalTarget: string;       // Narrative emotion
  duration: number;              // Estimated read time (ms)
  hasAudio: boolean;             // Requires audio
  has3D: boolean;                // Requires WebGL/WebGPU
  interactive: boolean;          // User interaction required
  minScroll: number;             // Minimum scroll position
  maxScroll: number;             // Maximum scroll position
}
```

#### 4. Personalization Engine

The platform supports per-viewer customization through the context system:

```typescript
interface ExperienceContext {
  viewer: ViewerProfile;          // Who is viewing
  session: SessionData;          // Current session info
  config: ExperienceConfig;      // Experience-level settings
}

interface ViewerProfile {
  id: string;
  slug: string;                  // e.g., "a16z", "sequoia"
  name: string;
  metadata: Record<string, unknown>;
  attributes: ViewerAttributes;
}
```

---

## Data Flow Architecture

### Initialization Flow

```
1. Request → SvelteKit SSR
                │
                ▼
2. Resolve Viewer (slug → profile from Turso)
                │
                ▼
3. Load Experience Config
                │
                ▼
4. Initialize Scroll Engine + Audio Engine
                │
                ▼
5. Render Orchestrator (mounts chapters)
                │
                ▼
6. Client Hydration → Interactive Experience
```

### Event Flow

```
User Scroll
    │
    ▼
Lenis (normalizes) → ScrollTrigger (fires)
    │                        │
    ▼                        ▼
Update Rune State        Fire Analytics
    │                        │
    ▼                        ▼
Chapter Re-render       Database Write
(reactivity)            (debounced)
```

---

## Extension Points

The platform provides multiple extension points:

### 1. Custom Chapters

```typescript
// Register a custom chapter
import { registerChapter } from '$config/registry';

registerChapter({
  id: 'my-chapter',
  slug: 'my-chapter',
  title: 'My Custom Chapter',
  component: () => import('./chapters/MyChapter.svelte'),
  metadata: {
    emotionalTarget: 'wonder',
    duration: 5000,
    hasAudio: true,
    has3D: false,
    interactive: true,
    minScroll: 0.2,
    maxScroll: 0.4
  },
  data: {
    // Custom data for this chapter
    headline: 'Welcome to the future',
    stats: [...]
  }
});
```

### 2. Custom Visualizations

```typescript
// Create a custom chart component
import { createVisualization } from '$engine/visualization';

const myChart = createVisualization({
  type: 'scatter',
  data: [...],
  animation: 'draw',
  interaction: 'zoom'
});
```

### 3. Custom Audio Moods

```typescript
// Define a new audio mood
import { registerMood } from '$engine/audio';

registerMood({
  id: 'tension',
  note: 'D#3',
  type: 'sine',
  volume: -26,
  reverb: 12,
  filter: { frequency: 400, type: 'lowpass' }
});
```

### 4. Custom Analytics Events

```typescript
// Track custom events
import { trackEvent } from '$engine/analytics';

trackEvent({
  type: 'custom_interaction',
  chapter: currentChapter,
  data: {
    interactionType: 'hover',
    element: 'stat-card',
    value: 'tam-4.5B'
  }
});
```

---

## Quality Gates

All implementations must pass:

- [ ] Works without audio (muted, or blocked by browser)
- [ ] Works on mobile (375px viewport) — responsive, not broken
- [ ] Chapter dispose() frees all Three.js geometries, materials, textures
- [ ] All numbers use `tabular-nums` and animate from 0 (except backwards counters)
- [ ] No TypeScript `any` types
- [ ] Lighthouse mobile performance > 85
- [ ] Analytics event fires on chapter enter
- [ ] No NaN, Infinity, or negative runway in financial calculations

---

## Comparison: Pitch Deck vs. General Platform

| Aspect | VIVIM Pitch Deck | Cinematic Platform |
|--------|------------------|-------------------|
| Content | Hardcoded 9 chapters | Configuration-driven N chapters |
| Data | Static mock data | Dynamic from CMS/API |
| Personalization | VC profiles only | Any viewer type |
| Analytics | VC-specific | Event-type agnostic |
| Visual System | VIVIM-specific | Themeable |
| Use Cases | Pitch decks only | Any narrative experience |

---

## Next Steps

1. Review the [Technical Stack Specification](TECH_STACK.md)
2. Explore the [Project Scaffold](PROJECT_SCAFFOLD.md)
3. Reference the [Component Library](COMPONENT_LIBRARY.md)
4. Configure your [Design System](DESIGN_SYSTEM.md)
5. Set up your [Data Schema](DATA_SCHEMA.md)

---

*Last updated: March 2026 • Cinematic Platform Architecture*