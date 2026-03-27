# Architecture Migration

## Current Architecture (Next.js 15)

```
src/
├── app/
│   ├── page.tsx              # Main landing page (single scroll)
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Tailwind + glassmorphism
│   └── demos/
│       ├── live-memory/       # Demo pages (separate routes)
│       ├── context-engine/
│       └── ...
├── components/
│   ├── neural-bg.tsx         # Canvas particle background
│   ├── hero-visual.tsx      # SVG brain
│   ├── animated-counter.tsx  # Number animation
│   ├── navbar.tsx           # Navigation
│   └── ui/                  # shadcn/ui components
├── hooks/
│   ├── use-mobile.ts
│   └── use-toast.ts
└── utils/
    ├── animations.ts
    └── performance.ts
```

## Target Architecture (Cinematic Experience)

```
src/
├── app/
│   ├── page.tsx              # Main orchestrator
│   ├── layout.tsx            # App shell + audio context
│   ├── globals.css           # Cinematic design tokens
│   └── [experience]/
│       └── [viewer]/
│           └── page.tsx     # Dynamic experience route
├── components/
│   ├── cinematic/
│   │   ├── ChapterOrchestrator.tsx
│   │   ├── ChapterBase.tsx
│   │   ├── ProgressDots.tsx
│   │   ├── AudioToggle.tsx
│   │   └── ParticleCanvas.tsx
│   ├── ui/                   # shadcn/ui (preserved)
│   └── demos/               # Demo components (enhanced)
├── hooks/
│   ├── useScroll.ts          # NEW: Scroll engine
│   ├── useChapter.ts         # NEW: Chapter lifecycle
│   ├── useAudio.ts           # NEW: Audio engine
│   └── useAnalytics.ts      # NEW: Event tracking
├── lib/
│   ├── engine/
│   │   ├── scroll.ts         # Lenis integration
│   │   ├── audio.ts          # Tone.js wrapper
│   │   ├── animation.ts      # Framer Motion patterns
│   │   └── analytics.ts     # Event system
│   ├── config/
│   │   ├── registry.ts      # Chapter registration
│   │   ├── themes.ts        # Theme definitions
│   │   └── types.ts         # TypeScript types
│   └── data/
│       └── experiences/      # Experience configs
└── workers/
    └── api/                  # API routes (Hono-style)
        ├── experience.ts
        ├── viewer.ts
        └── analytics.ts
```

---

## Core Systems Architecture

### 1. Scroll Engine

**Current**: Native scroll with Framer Motion `whileInView`

**Target**: Lenis smooth scroll with normalized progress

```typescript
// lib/engine/scroll.ts
import Lenis from 'lenis';
import { useState, useEffect } from 'react';

interface ScrollState {
  progress: number;        // 0-1 global scroll
  chapter: number;        // Current chapter index
  chapterProgress: number; // 0-1 within chapter
}

export function useScrollEngine(totalChapters: number) {
  const [state, setState] = useState<ScrollState>({
    progress: 0,
    chapter: 0,
    chapterProgress: 0
  });

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.075,
      smoothWheel: true,
      duration: 1.2
    });

    const onScroll = ({ progress }: { progress: number }) => {
      const chapter = Math.floor(progress * totalChapters);
      const chapterStart = chapter / totalChapters;
      const chapterEnd = (chapter + 1) / totalChapters;
      const chapterProgress = (progress - chapterStart) / (chapterEnd - chapterStart);
      
      setState({ progress, chapter, chapterProgress: Math.min(Math.max(chapterProgress, 0), 1) });
    };

    lenis.on('scroll', onScroll);
    
    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, [totalChapters]);

  return state;
}
```

### 2. Chapter System

**Current**: Sections in single page

**Target**: Orchestrated chapter components

```typescript
// components/cinematic/ChapterBase.tsx
interface ChapterProps {
  id: string;
  index: number;
  progress: number;
  chapterProgress: number;
  active: boolean;
  data: ChapterData;
  children?: React.ReactNode;
}

export function ChapterBase({ 
  id, 
  index, 
  progress, 
  chapterProgress, 
  active, 
  data,
  children 
}: ChapterProps) {
  // Lifecycle: track enter/exit for analytics
  useChapterLifecycle(id, index, active);
  
  // Animation: orchestrate based on progress
  useChapterAnimation(index, chapterProgress, active);
  
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen"
      style={{ 
        position: 'absolute',
        top: `${(index / 9) * 100}%`,
        height: `${(1 / 9) * 100}%`,
        pointerEvents: active ? 'auto' : 'none'
      }}
    >
      {children}
    </motion.section>
  );
}
```

### 3. Audio Engine

**Current**: None

**Target**: Tone.js ambient soundscapes

```typescript
// lib/engine/audio.ts
import * as Tone from 'tone';

interface AudioMood {
  note: string;
  type: OscillatorType;
  volume: number;
  reverb: number;
}

const MOODS: AudioMood[] = [
  { note: 'C3', type: 'sine', volume: -28, reverb: 12 },   // Gate
  { note: 'D3', type: 'sine', volume: -26, reverb: 10 },   // Problem
  { note: 'F3', type: 'triangle', volume: -24, reverb: 9 }, // Vision
  // ... etc
];

let synth: Tone.Synth | null = null;
let reverb: Tone.Reverb | null = null;
let isInitialized = false;

export async function initAudio() {
  if (isInitialized) return;
  await Tone.start();
  reverb = new Tone.Reverb({ decay: 8, wet: 0.5 }).toDestination();
  synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 2, release: 4 }
  }).connect(reverb);
  isInitialized = true;
}

export function setMood(chapter: number) {
  if (!synth) return;
  const mood = MOODS[Math.min(chapter, MOODS.length - 1)];
  synth.oscillator.type = mood.type;
  synth.volume.rampTo(mood.volume, 2);
  synth.triggerAttack(mood.note);
}
```

---

## API Layer Design

### Current: Minimal API

```typescript
// src/app/api/route.ts
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
```

### Target: Hono-style Routes

```typescript
// src/app/api/experience/[slug]/route.ts
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const experience = await getExperienceBySlug(slug);
  if (!experience) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND' } },
      { status: 404 }
    );
  }
  return NextResponse.json({ success: true, data: experience });
}
```

---

## State Management

**Current**: React useState + useEffect

**Target**: React Context + Zustand for global state

```typescript
// lib/stores/experience.ts
import { create } from 'zustand';

interface ExperienceState {
  chapter: number;
  progress: number;
  chapterProgress: number;
  audioEnabled: boolean;
  viewer: ViewerProfile | null;
  
  setChapter: (chapter: number) => void;
  setProgress: (progress: number) => void;
  enableAudio: () => void;
  disableAudio: () => void;
}

export const useExperienceStore = create<ExperienceState>((set) => ({
  chapter: 0,
  progress: 0,
  chapterProgress: 0,
  audioEnabled: false,
  viewer: null,
  
  setChapter: (chapter) => set({ chapter }),
  setProgress: (progress) => set({ progress }),
  enableAudio: () => set({ audioEnabled: true }),
  disableAudio: () => set({ audioEnabled: false })
}));
```

---

## Migration Checklist

- [ ] Install Lenis for smooth scrolling
- [ ] Create scroll engine hook
- [ ] Build ChapterOrchestrator component
- [ ] Implement chapter registration system
- [ ] Add audio engine with Tone.js
- [ ] Set up Zustand store
- [ ] Create API routes structure

---

*Next: [Component Mapping](COMPONENT_MAPPING.md)*
