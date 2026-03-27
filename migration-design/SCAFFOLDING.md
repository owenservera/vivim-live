# Scaffolding Guide

## Project Structure After Migration

This document shows the complete file structure after migration is complete.

```
vivim-source-code/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Main orchestrator (replaces current)
│   │   ├── layout.tsx                  # App shell + audio context
│   │   ├── globals.css                 # Cinematic design tokens
│   │   │
│   │   ├── api/
│   │   │   ├── experience/
│   │   │   │   └── [slug]/
│   │   │   │       └── route.ts       # GET experience by slug
│   │   │   ├── viewer/
│   │   │   │   └── [slug]/
│   │   │   │       └── route.ts       # GET viewer profile
│   │   │   ├── analytics/
│   │   │   │   └── route.ts           # POST analytics events
│   │   │   └── metrics/
│   │   │       └── route.ts           # GET live metrics
│   │   │
│   │   └── [experience]/
│   │       └── [viewer]/
│   │           └── page.tsx           # Dynamic personalized route
│   │
│   ├── components/
│   │   ├── cinematic/
│   │   │   ├── ChapterOrchestrator.tsx # Main scroll orchestrator
│   │   │   ├── ChapterSection.tsx      # Individual chapter wrapper
│   │   │   ├── ChapterNavigation.tsx   # Progress dots/line
│   │   │   ├── AudioToggle.tsx        # Mute/unmute control
│   │   │   ├── ParticleBackground.tsx # Enhanced particles
│   │   │   ├── AnimatedCounter.tsx    # Number animation (enhance existing)
│   │   │   ├── MetricCard.tsx         # Stats card
│   │   │   ├── DataChart.tsx          # Observable Plot wrapper
│   │   │   ├── VideoHoverCard.tsx     # Hover-to-play video
│   │   │   ├── ContextLayerStack.tsx  # L0-L7 visualization
│   │   │   └── TrendLine.tsx          # Degradation line
│   │   │
│   │   ├── ui/                        # shadcn/ui (preserved)
│   │   │   ├── button.tsx
│   │   │   ├── badge.tsx
│   │   │   └── ...
│   │   │
│   │   ├── neural-bg.tsx              # Existing (to enhance)
│   │   ├── hero-visual.tsx            # Existing (preserve)
│   │   ├── animated-counter.tsx        # Existing (enhance)
│   │   ├── navbar.tsx                 # Existing (preserve)
│   │   └── reading-progress.tsx       # Existing (may remove)
│   │
│   ├── hooks/
│   │   ├── useScroll.ts               # Lenis + progress tracking
│   │   ├── useChapter.ts              # Chapter lifecycle
│   │   ├── useAudio.ts                # Tone.js wrapper
│   │   ├── useAnalytics.ts            # Event tracking
│   │   ├── useMobile.ts               # Existing (preserve)
│   │   └── useToast.ts                # Existing (preserve)
│   │
│   ├── lib/
│   │   ├── engine/
│   │   │   ├── scroll.ts              # Lenis configuration
│   │   │   ├── audio.ts              # Tone.js audio engine
│   │   │   ├── animation.ts           # Framer Motion patterns
│   │   │   └── analytics.ts           # Event system
│   │   │
│   │   ├── config/
│   │   │   ├── registry.ts            # Chapter registration
│   │   │   ├── themes.ts             # Theme definitions
│   │   │   └── types.ts              # TypeScript types
│   │   │
│   │   ├── data/
│   │   │   ├── experiences/
│   │   │   │   ├── vivim-live.ts     # Main experience config
│   │   │   │   └── index.ts          # Experience loader
│   │   │   └── viewers/
│   │   │       ├── index.ts           # Viewer loader
│   │   │       └── profiles/          # Viewer profiles
│   │   │
│   │   └── stores/
│   │       └── experience.ts          # Zustand store
│   │
│   ├── demo-engine/                   # Existing (preserve)
│   │   ├── contextBudgetCalculator.ts
│   │   └── mockExtractionEngine.ts
│   │
│   └── utils/                        # Existing (preserve)
│       ├── animations.ts
│       └── performance.ts
│
├── public/
│   ├── fonts/
│   ├── models/                       # .glb files for 3D
│   ├── audio/                        # Ambient sounds
│   └── images/
│
├── migration-design/                  # This folder
│   └── ...
│
├── package.json                      # Updated with new deps
├── next.config.ts
├── tailwind.config.ts               # May need updates
├── tsconfig.json
└── bun.lockb                        # Bun lockfile
```

---

## File Creation Order

### Phase 1: Foundation (Create in Order)

1. **Types** → `src/lib/config/types.ts`
2. **Store** → `src/lib/stores/experience.ts`
3. **Scroll Hook** → `src/hooks/useScroll.ts`
4. **Chapter Hook** → `src/hooks/useChapter.ts`
5. **ChapterOrchestrator** → `src/components/cinematic/ChapterOrchestrator.tsx`
6. **ChapterSection** → `src/components/cinematic/ChapterSection.tsx`
7. **ChapterNavigation** → `src/components/cinematic/ChapterNavigation.tsx`
8. **Update page.tsx** → Replace with orchestrator

### Phase 2: Visual System

1. **ParticleBackground** → `src/components/cinematic/ParticleBackground.tsx`
2. **AudioToggle** → `src/components/cinematic/AudioToggle.tsx`
3. **Audio Hook** → `src/hooks/useAudio.ts`
4. **Audio Engine** → `src/lib/engine/audio.ts`
5. **Enhanced Counter** → `src/components/cinematic/AnimatedCounter.tsx`
6. **MetricCard** → `src/components/cinematic/MetricCard.tsx`

### Phase 3: Data & API

1. **Experience Config** → `src/lib/data/experiences/vivim-live.ts`
2. **Experience Route** → `src/app/api/experience/[slug]/route.ts`
3. **Analytics Hook** → `src/hooks/useAnalytics.ts`
4. **Analytics Route** → `src/app/api/analytics/route.ts`
5. **Viewer Config** → `src/lib/data/viewers/index.ts`

### Phase 4: Polish

1. **DataChart** → `src/components/cinematic/DataChart.tsx`
2. **VideoHoverCard** → `src/components/cinematic/VideoHoverCard.tsx`
3. **ContextLayerStack** → `src/components/cinematic/ContextLayerStack.tsx`
4. **Update globals.css** → Add design tokens

---

## Component Code Templates

### Basic Chapter Template

```typescript
// src/components/cinematic/chapters/OverviewChapter.tsx
'use client';

import { motion } from 'framer-motion';
import { useChapterAnimation } from '@/hooks/useChapter';

interface OverviewChapterProps {
  data: OverviewData;
  progress: number;
  chapterProgress: number;
  active: boolean;
}

export function OverviewChapter({ 
  data, 
  chapterProgress, 
  active 
}: OverviewChapterProps) {
  // Use built-in animation patterns
  const { opacity, y } = useChapterAnimation(chapterProgress, active);
  
  return (
    <motion.div 
      style={{ opacity, y }}
      className="min-h-screen flex items-center justify-center"
    >
      <div className="max-w-7xl mx-auto px-4">
        {/* Chapter content */}
      </div>
    </motion.div>
  );
}
```

### Scroll Hook Usage

```typescript
// In any component
'use client';

import { useScroll } from '@/hooks/useScroll';

function MyComponent() {
  const { progress, chapter, chapterProgress } = useScroll();
  
  return (
    <div>
      Global: {progress.toFixed(2)}
      Chapter: {chapter}
      In Chapter: {chapterProgress.toFixed(2)}
    </div>
  );
}
```

### Zustand Store Usage

```typescript
// In any component
import { useExperienceStore } from '@/lib/stores/experience';

function MyComponent() {
  const { chapter, audioEnabled, setChapter } = useExperienceStore();
  
  // ...
}
```

---

## Quick Start Commands

```bash
# 1. Install new dependencies
bun add lenis zustand

# 2. Create types
# (see src/lib/config/types.ts in source reference)

# 3. Create scroll hook
# (see src/hooks/useScroll.ts in source reference)

# 4. Create orchestrator
# (see src/components/cinematic/ChapterOrchestrator.tsx)

# 5. Update page.tsx to use orchestrator

# 6. Test
bun run dev
```

---

## Source Reference

See [ORIGINAL_SOURCES.md](ORIGINAL_SOURCES.md) for the complete list of reference files to read while building.
