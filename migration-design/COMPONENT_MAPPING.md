# Component Mapping

## Cinematic Platform → Next.js Equivalents

This document maps Svelte components from the Cinematic Platform specifications to their Next.js/React equivalents.

---

## Core Cinematic Components

| Cinematic (Svelte) | Target (React/Next.js) | Status |
|---------------------|------------------------|---------|
| ChapterBase | ChapterOrchestrator | **TO CREATE** |
| ChapterBase.svelte | ChapterSection.tsx | **TO CREATE** |
| ProgressDots.svelte | ChapterNavigation.tsx | **TO CREATE** |
| AudioToggle.svelte | AudioToggle.tsx | **TO CREATE** |
| ParticleCanvas.svelte | ParticleBackground.tsx | **TO ENHANCE** |
| Counter.svelte | AnimatedCounter.tsx | ✅ EXISTS |
| Slider.svelte | RangeSlider.tsx | ✅ EXISTS (shadcn) |
| MetricCard.svelte | MetricCard.tsx | **TO CREATE** |
| Chart.svelte | DataChart.tsx | **TO CREATE** |
| VideoHover.svelte | VideoHoverCard.tsx | **TO CREATE** |
| LayerStack.svelte | ContextLayerStack.tsx | **TO CREATE** |
| DegradationLine.svelte | TrendLine.tsx | **TO CREATE** |

---

## Chapter Components Mapping

The Cinematic Platform defines 9 chapters. Map to VIVIM landing page sections:

| Chapter | Cinematic Purpose | VIVIM Section | Priority |
|---------|-------------------|---------------|----------|
| 00-Gate | Entry, hook | Hero/Overview | P0 |
| 01-Problem | Problem statement | "The Problem" | P0 |
| 02-Vision | Solution reveal | "The Solution" | P0 |
| 03-Product | Product demo | Interactive Demos | P1 |
| 04-Market | Market analysis | (Document elsewhere) | P2 |
| 05-Traction | Metrics | Provider logos, stats | P1 |
| 06-Model | Financial model | (Future: pricing) | P2 |
| 07-Team | Team showcase | Footer/About | P2 |
| 08-Ask | Call to action | CTA buttons | P0 |

---

## Component Implementation Details

### 1. ChapterOrchestrator

```typescript
// components/cinematic/ChapterOrchestrator.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useScrollEngine } from '@/hooks/useScroll';
import { ChapterSection } from './ChapterSection';
import { AudioToggle } from './AudioToggle';
import { ChapterNavigation } from './ChapterNavigation';

interface Chapter {
  id: string;
  title: string;
  component: React.ComponentType<ChapterData>;
  data: ChapterData;
}

interface ChapterOrchestratorProps {
  chapters: Chapter[];
}

export function ChapterOrchestrator({ chapters }: ChapterOrchestratorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { progress, chapter, chapterProgress } = useScrollEngine(chapters.length);
  const [audioEnabled, setAudioEnabled] = useState(false);

  return (
    <div ref={containerRef} className="relative">
      {chapters.map((ch, index) => (
        <ChapterSection
          key={ch.id}
          chapter={ch}
          index={index}
          active={chapter === index}
          progress={progress}
          chapterProgress={chapterProgress}
        />
      ))}
      
      <ChapterNavigation total={chapters.length} current={chapter} />
      <AudioToggle enabled={audioEnabled} onToggle={() => setAudioEnabled(!audioEnabled)} />
    </div>
  );
}
```

### 2. ChapterSection (replaces ChapterBase)

```typescript
// components/cinematic/ChapterSection.tsx
'use client';

import { motion } from 'framer-motion';
import { useChapterLifecycle } from '@/hooks/useChapter';
import type { Chapter } from '@/lib/config/types';

interface ChapterSectionProps {
  chapter: Chapter;
  index: number;
  active: boolean;
  progress: number;
  chapterProgress: number;
}

export function ChapterSection({ 
  chapter, 
  index, 
  active, 
  progress, 
  chapterProgress 
}: ChapterSectionProps) {
  // Track chapter enter/exit for analytics
  useChapterLifecycle(chapter.id, index, active);
  
  const ChapterComponent = chapter.component;
  
  return (
    <motion.section
      id={chapter.id}
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: active ? 1 : 0,
        y: active ? 0 : 20
      }}
      transition={{ 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] // Cinematic ease
      }}
      className="min-h-screen w-full"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: active ? 'auto' : 'none'
      }}
    >
      <ChapterComponent 
        data={chapter.data}
        progress={progress}
        chapterProgress={chapterProgress}
        active={active}
        index={index}
      />
    </motion.section>
  );
}
```

### 3. ChapterNavigation (replaces ProgressDots)

```typescript
// components/cinematic/ChapterNavigation.tsx
'use client';

import { motion } from 'framer-motion';
import { useScrollToChapter } from '@/hooks/useScroll';

interface ChapterNavigationProps {
  total: number;
  current: number;
  labels?: string[];
}

export function ChapterNavigation({ total, current, labels = [] }: ChapterNavigationProps) {
  const scrollToChapter = useScrollToChapter();
  
  return (
    <nav className="fixed right-6 top-1/2 -translate-y-1/2 z-50">
      <ul className="flex flex-col gap-3">
        {Array.from({ length: total }).map((_, i) => (
          <li key={i}>
            <button
              onClick={() => scrollToChapter(i)}
              className="relative group"
              aria-label={`Go to chapter ${i + 1}: ${labels[i] || ''}`}
            >
              {/* Outer ring */}
              <span 
                className={`block w-3 h-3 rounded-full border-2 transition-all duration-300 ${
                  i === current 
                    ? 'border-accent-teal bg-accent-teal scale-125' 
                    : i < current 
                      ? 'border-slate-500 bg-slate-500' 
                      : 'border-slate-600 bg-transparent'
                }`}
              />
              
              {/* Tooltip */}
              {labels[i] && (
                <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-2 py-1 bg-slate-900 text-xs text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {labels[i]}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### 4. ParticleBackground (enhancement of neural-bg)

```typescript
// components/cinematic/ParticleBackground.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { useScrollProgress } from '@/hooks/useScroll';

interface ParticleBackgroundProps {
  count?: number;
  color?: string;
  connectionDistance?: number;
  scrollInfluence?: number;
}

export function ParticleBackground({ 
  count = 150,
  color = '#3ecfb2',
  connectionDistance = 100,
  scrollInfluence = 0.5
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollProgress = useScrollProgress();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Three.js or Canvas particle implementation
    // Connected to scrollProgress for reactive behavior
  }, [scrollProgress, dimensions]);

  return (
    <canvas 
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
```

---

## Demo Component Enhancements

Existing demo components need enhancement for cinematic feel:

| Component | Current | Enhanced |
|-----------|---------|----------|
| LiveMemoryDemo | Basic state | + Scroll-triggered animations |
| ContextEngineDemo | Static layers | + Animated layer assembly |
| ZeroKnowledgeDemo | Encryption viz | + Particle connections |
| SovereignHistoryDemo | Timeline | + Scroll-driven reveal |
| DecentralizedNetworkDemo | Network graph | + Interactive particles |
| SecureCollaborationDemo | Permission UI | + Animated sharing |
| DynamicIntelligenceDemo | Adaptive UI | + Real-time updates |

---

## shadcn/ui Components to Retain

These existing components remain unchanged:

- Button, Badge, Card
- Dialog, Sheet, Popover
- Input, Textarea, Slider
- Tabs, Accordion, Collapsible
- Toast, Toaster
- Dropdown Menu, Context Menu
- Navigation Menu

---

## New Components Required

1. **ChapterOrchestrator** - Main scroll container
2. **ChapterSection** - Individual chapter wrapper
3. **ChapterNavigation** - Progress dots/line
4. **AudioToggle** - Mute/unmute control
5. **ParticleBackground** - Three.js/Canvas particles
6. **AnimatedCounter** - Number animation (enhance existing)
7. **MetricCard** - Stats with animations
8. **DataChart** - Observable Plot wrapper
9. **VideoHoverCard** - Hover-to-play video
10. **ContextLayerStack** - L0-L7 visualization
11. **TrendLine** - Degradation/progress line

---

*Next: [Animation Migration](ANIMATION_MIGRATION.md)*
