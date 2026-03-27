# Project Scaffold

## Quick Start

```bash
# Bootstrap a new Cinematic project
npm create svelte@latest cinematic-platform
# → Skeleton project · TypeScript · ESLint + Prettier

cd cinematic-platform

# Install core runtime dependencies
npm i @theatre/core @theatre/r3f gsap lenis \
      three @threlte/core @threlte/extras \
      @observablehq/plot d3 \
      tone \
      hono \
      @tursodatabase/serverless

# Install dev/build dependencies
npm i -D \
      @sveltejs/adapter-cloudflare \
      vite-plugin-glsl \
      tailwindcss @tailwindcss/vite \
      wrangler \
      @types/d3 \
      @types/three
```

---

## Complete Project Structure

```
cinematic-platform/
│
├── src/
│   │
│   ├── lib/
│   │   │
│   │   ├── config/
│   │   │   ├── registry.ts              # Chapter registration system
│   │   │   ├── experience.ts            # Experience configuration
│   │   │   ├── themes.ts                # Theme definitions
│   │   │   └── types.ts                 # Global TypeScript types
│   │   │
│   │   ├── engine/
│   │   │   ├── scroll.svelte.ts         # Lenis + state management
│   │   │   ├── theatre.ts               # Theatre.js project
│   │   │   ├── audio.ts                 # Tone.js audio engine
│   │   │   ├── analytics.ts             # Event tracking
│   │   │   ├── personalization.ts       # Context provider
│   │   │   └── visualization.ts         # Chart/visualization factory
│   │   │
│   │   ├── three/
│   │   │   ├── renderer.ts              # WebGPU/WebGL setup
│   │   │   ├── particles.ts             # Particle system factory
│   │   │   ├── scenes/
│   │   │   │   ├── BaseScene.svelte      # Base 3D scene
│   │   │   │   ├── HeroScene.svelte      # Hero/intro scene
│   │   │   │   └── VisionScene.svelte    # Vision chapter scene
│   │   │   └── shaders/
│   │   │       ├── particle.vert.glsl
│   │   │       ├── particle.frag.glsl
│   │   │       ├── glow.vert.glsl
│   │   │       └── glow.frag.glsl
│   │   │
│   │   ├── chapters/
│   │   │   ├── 00-Gate.svelte           # Entry chapter
│   │   │   ├── 01-Problem.svelte         # Problem statement
│   │   │   ├── 02-Vision.svelte          # Vision/revelation
│   │   │   ├── 03-Product.svelte         # Product demo
│   │   │   ├── 04-Market.svelte          # Market analysis
│   │   │   ├── 05-Traction.svelte        # Traction/metrics
│   │   │   ├── 06-Model.svelte           # Financial model
│   │   │   ├── 07-Team.svelte           # Team showcase
│   │   │   └── 08-Ask.svelte             # Call to action
│   │   │
│   │   ├── components/
│   │   │   ├── ChapterBase.svelte       # Base chapter component
│   │   │   ├── ProgressDots.svelte       # Chapter navigation
│   │   │   ├── Slider.svelte            # Range slider
│   │   │   ├── MetricCard.svelte         # Animated metric
│   │   │   ├── Counter.svelte            # Number counter
│   │   │   ├── Chart.svelte             # Observable Plot wrapper
│   │   │   ├── ParticleCanvas.svelte    # Three.js canvas
│   │   │   ├── AudioToggle.svelte       # Mute/unmute control
│   │   │   ├── VideoHover.svelte        # Hover-to-play video
│   │   │   ├── Heatmap.svelte           # GitHub-style heatmap
│   │   │   ├── LayerStack.svelte         # L0-L7 visualization
│   │   │   ├── Timeline.svelte          # Horizontal timeline
│   │   │   └── DegradationLine.svelte   # Animated red line
│   │   │
│   │   ├── financial/
│   │   │   ├── model.svelte.ts          # Reactive model engine
│   │   │   ├── assumptions.ts            # Default values/ranges
│   │   │   └── formatters.ts             # Number formatting
│   │   │
│   │   ├── data/
│   │   │   ├── experience.json           # Experience config
│   │   │   └── chapters.json            # Chapter definitions
│   │   │
│   │   └── assets/
│   │       ├── fonts/
│   │       ├── models/
│   │       └── audio/
│   │
│   ├── routes/
│   │   ├── +layout.svelte               # App shell + init
│   │   ├── +layout.server.ts            # SSR context
│   │   ├── +page.svelte                 # Main orchestrator
│   │   │
│   │   ├── [experience]/
│   │   │   ├── +page.server.ts          # Experience SSR
│   │   │   └── +page.svelte             # Experience wrapper
│   │   │
│   │   ├── [experience]/[viewer]/
│   │   │   ├── +page.server.ts          # Viewer-specific load
│   │   │   └── +page.svelte             # Personalized view
│   │   │
│   │   └── api/
│   │       ├── +server.ts               # API catch-all
│   │       ├── analytics/+server.ts     # POST /api/analytics
│   │       ├── metrics/+server.ts       # GET /api/metrics
│   │       └── model/+server.ts         # POST /api/model
│   │
│   ├── app.css                          # Global styles + tokens
│   ├── app.html                         # HTML shell
│   │
│   └── hooks.server.ts                  # Server-side hooks
│
├── workers/
│   └── api/
│       └── index.ts                    # Cloudflare Worker entry
│
├── static/
│   ├── fonts/
│   ├── models/                          # .glb files
│   └── images/
│
├── scripts/
│   ├── generate-chapters.ts            # Chapter generator
│   └── seed-data.ts                    # Database seeder
│
├── tests/
│   ├── chapters/
│   ├── engine/
│   └── integration/
│
├── package.json
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── wrangler.toml
└── README.md
```

---

## Core Implementation Files

### 1. Scroll Engine (`src/lib/engine/scroll.svelte.ts`)

```typescript
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let progress = $state(0);
let chapter = $state(0);
let chapterProgress = $state(0);
let TOTAL_CHAPTERS = 9;

function calculateChapter(p: number): { chapter: number; chapterProgress: number } {
  const normalized = Math.min(Math.max(p, 0), 1);
  const chapterIndex = Math.floor(normalized * TOTAL_CHAPTERS);
  const chapterStart = chapterIndex / TOTAL_CHAPTERS;
  const chapterEnd = (chapterIndex + 1) / TOTAL_CHAPTERS;
  const chapterProg = (normalized - chapterStart) / (chapterEnd - chapterStart);
  return { 
    chapter: Math.min(chapterIndex, TOTAL_CHAPTERS - 1), 
    chapterProgress: Math.min(Math.max(chapterProg, 0), 1) 
  };
}

export function initScroll() {
  if (lenisInstance) {
    return { lenis: lenisInstance, get progress() { return progress }, get chapter() { return chapter }, get chapterProgress() { return chapterProgress } };
  }

  lenisInstance = new Lenis({
    lerp: 0.075,
    smoothWheel: true,
    wheelMultiplier: 1,
    touchMultiplier: 2,
    duration: 1.2,
    smoothing: 0.1
  });

  lenisInstance.on('scroll', ({ progress: p }) => {
    progress = p;
    const { chapter: ch, chapterProgress: cp } = calculateChapter(p);
    chapter = ch;
    chapterProgress = cp;
  });

  gsap.ticker.add((t) => {
    if (lenisInstance) lenisInstance.raf(t * 1000);
  });
  gsap.ticker.lagSmoothing(0);
  ScrollTrigger.refresh();

  return { 
    lenis: lenisInstance, 
    get progress() { return progress }, 
    get chapter() { return chapter }, 
    get chapterProgress() { return chapterProgress }
  };
}

export function scrollToChapter(index: number): void {
  if (!lenisInstance) return;
  const target = index / TOTAL_CHAPTERS;
  lenisInstance.scrollTo(target, { immediate: false, duration: 1.5 });
}

export function getProgress() { return progress; }
export function getChapter() { return chapter; }
export function getChapterProgress() { return chapterProgress; }
export function setChapterCount(count: number) { TOTAL_CHAPTERS = count; }

export { TOTAL_CHAPTERS };
```

### 2. Chapter Registry (`src/lib/config/registry.ts`)

```typescript
import type { LazyComponent } from '../types.js';

export interface ChapterConfig<T = unknown> {
  id: string;
  slug: string;
  title: string;
  component: () => Promise<{ default: LazyComponent }>;
  metadata: ChapterMetadata;
  data?: T;
}

export interface ChapterMetadata {
  emotionalTarget: string;
  duration: number;
  hasAudio: boolean;
  has3D: boolean;
  interactive: boolean;
  chapterNumber: number;
  minScroll?: number;
  maxScroll?: number;
}

export interface ViewerProfile {
  id: string;
  slug: string;
  name: string;
  type: string;
  metadata: Record<string, unknown>;
  attributes: Record<string, string>;
}

export const chapterRegistry: ChapterConfig[] = [];

export function registerChapter(config: ChapterConfig): void {
  if (!chapterRegistry.find(c => c.id === config.id)) {
    chapterRegistry.push(config);
    chapterRegistry.sort((a, b) => a.metadata.chapterNumber - b.metadata.chapterNumber);
  }
}

export function getChapterByIndex(index: number): ChapterConfig | undefined {
  return chapterRegistry[index];
}

export function getChapterById(id: string): ChapterConfig | undefined {
  return chapterRegistry.find(c => c.id === id);
}

export function getChapterCount(): number {
  return chapterRegistry.length;
}
```

### 3. Audio Engine (`src/lib/engine/audio.ts`)

```typescript
import * as Tone from 'tone';

interface AudioMood {
  note: string;
  type: OscillatorType;
  volume: number;
  reverb: number;
  filter?: { frequency: number; type: BiquadFilterType };
}

const defaultMoods: AudioMood[] = [
  { note: 'C3', type: 'sine', volume: -28, reverb: 12 },    // Gate
  { note: 'D3', type: 'sine', volume: -26, reverb: 10 },    // Problem
  { note: 'F3', type: 'triangle', volume: -24, reverb: 9 },  // Vision
  { note: 'G3', type: 'triangle', volume: -24, reverb: 8 },  // Product
  { note: 'A3', type: 'sine', volume: -22, reverb: 8 },     // Market
  { note: 'C4', type: 'sine', volume: -22, reverb: 7 },     // Traction
  { note: 'E4', type: 'triangle', volume: -20, reverb: 6 }, // Model
  { note: 'G4', type: 'triangle', volume: -20, reverb: 5 }, // Team
  { note: 'C5', type: 'sine', volume: -18, reverb: 10 }     // Ask (long tail)
];

let synth: Tone.Synth | null = null;
let reverb: Tone.Reverb | null = null;
let filter: Tone.Filter | null = null;
let isInitialized = false;
let isMuted = false;

export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  
  await Tone.start();
  
  filter = new Tone.Filter(800, 'lowpass').toDestination();
  reverb = new Tone.Reverb({ decay: 8, wet: 0.5 }).connect(filter);
  
  synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 2, release: 4 }
  }).connect(reverb);
  
  isInitialized = true;
}

export function setMood(chapter: number, moods: AudioMood[] = defaultMoods): void {
  if (!synth || isMuted) return;
  
  const mood = moods[Math.min(chapter, moods.length - 1)];
  synth.oscillator.type = mood.type;
  synth.volume.rampTo(mood.volume, 2);
  
  if (mood.filter && filter) {
    filter.frequency.rampTo(mood.filter.frequency, 1);
    filter.type = mood.filter.type;
  }
  
  synth.triggerAttack(mood.note);
}

export function setMuted(muted: boolean): void {
  isMuted = muted;
  if (synth) {
    synth.volume.rampTo(muted ? -60 : -18, 0.3);
  }
}

export function toggleMute(): boolean {
  setMuted(!isMuted);
  return isMuted;
}

export function getIsMuted(): boolean {
  return isMuted;
}

export function dispose(): void {
  synth?.dispose();
  reverb?.dispose();
  filter?.dispose();
  synth = null;
  reverb = null;
  filter = null;
  isInitialized = false;
}
```

### 4. Analytics Engine (`src/lib/engine/analytics.ts`)

```typescript
type EventType = 'scroll_enter' | 'scroll_exit' | 'interaction' | 'cta_click' | 'slider_touch';

interface AnalyticsEvent {
  type: EventType;
  chapter: string | number;
  data?: Record<string, unknown>;
  dwellMs?: number;
}

let sessionId: string | null = null;
let chapterEnterTimes: Record<string | number, number> = {};
let pendingEvents: AnalyticsEvent[] = [];
let flushInterval: ReturnType<typeof setInterval> | null = null;

export function initAnalytics(expId: string, viewerId: string): void {
  sessionId = `${expId}-${viewerId}-${Date.now()}`;
  chapterEnterTimes = {};
  
  // Flush events every 5 seconds
  flushInterval = setInterval(flushEvents, 5000);
}

export function trackChapterEnter(chapter: string | number): void {
  chapterEnterTimes[chapter] = Date.now();
  queueEvent({ type: 'scroll_enter', chapter });
}

export function trackChapterExit(chapter: string | number): void {
  const enterTime = chapterEnterTimes[chapter];
  if (enterTime) {
    const dwellMs = Date.now() - enterTime;
    queueEvent({ type: 'scroll_exit', chapter, dwellMs });
    delete chapterEnterTimes[chapter];
  }
}

export function trackInteraction(type: string, data: Record<string, unknown> = {}): void {
  queueEvent({ type: 'interaction', chapter: 'global', data });
}

export function trackCTAClick(ctaId: string, chapter: string | number): void {
  queueEvent({ type: 'cta_click', chapter, data: { ctaId } });
}

export function trackSliderTouch(sliderId: string, value: number): void {
  queueEvent({ type: 'slider_touch', chapter: 'model', data: { sliderId, value } });
}

function queueEvent(event: AnalyticsEvent): void {
  pendingEvents.push(event);
  
  // Fire immediately for critical events
  if (event.type === 'cta_click') {
    flushEvents();
  }
}

async function flushEvents(): Promise<void> {
  if (pendingEvents.length === 0 || !sessionId) return;
  
  const events = [...pendingEvents];
  pendingEvents = [];
  
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, events })
    });
  } catch (e) {
    // Re-queue failed events
    pendingEvents.push(...events);
  }
}

export function disposeAnalytics(): void {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
  flushEvents();
}
```

### 5. Base Chapter Component (`src/lib/components/ChapterBase.svelte`)

```svelte
<script lang="ts" generics="T">
  import type { ChapterProps } from '$config/types';
  import { trackChapterEnter, trackChapterExit } from '$engine/analytics';
  import { onMount, onDestroy } from 'svelte';

  let { 
    id,
    progress = 0,
    chapterProgress = 0,
    active = false,
    index = 0,
    data,
    context,
    children
  }: ChapterProps<T> & { children?: any } = $props();

  let mounted = $state(false);
  let enterTime = 0;

  onMount(() => {
    mounted = true;
  });

  $effect(() => {
    if (active && !enterTime) {
      enterTime = Date.now();
      trackChapterEnter(index);
    }
  });

  onDestroy(() => {
    if (enterTime) {
      trackChapterExit(index, Date.now() - enterTime);
    }
  });
</script>

<div 
  class="chapter"
  class:active
  data-chapter={id}
  style="--progress: {chapterProgress}"
>
  {#if mounted}
    {@render children?.()}
  {/if}
</div>

<style>
  .chapter {
    position: relative;
    width: 100%;
    min-height: 100vh;
    opacity: 0;
    transition: opacity var(--duration-slow) var(--ease-cinematic);
    pointer-events: none;
  }

  .chapter.active {
    opacity: 1;
    pointer-events: auto;
  }
</style>
```

### 6. Main Page Orchestrator (`src/routes/+page.svelte`)

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import { chapterRegistry, getChapterCount, type ViewerProfile, type ExperienceConfig } from '$config/registry';
  import { initScroll, getChapter, getProgress, getChapterProgress } from '$engine/scroll.svelte';
  import { initAudio, setMood } from '$engine/audio';
  import { initAnalytics } from '$engine/analytics';
  import ChapterBase from '$components/ChapterBase.svelte';

  // Default context
  const viewer: ViewerProfile = {
    id: 'default',
    slug: 'default',
    name: 'Guest',
    type: 'guest',
    metadata: {},
    attributes: {}
  };

  const experience: ExperienceConfig = {
    id: 'default',
    title: 'Cinematic Experience',
    theme: 'dark'
  };

  const activeChapter = $derived(getChapter());
  const scrollProgress = $derived(getProgress());
  const chapterProgress = $derived(getChapterProgress());
  
  let loadedComponents: Record<number, any> = $state({});
  let initialized = $state(false);
  let audioReady = $state(false);
  let lastMoodChapter = $state(-1);

  onMount(async () => {
    // Initialize scroll engine
    initScroll();
    
    // Pre-load all chapter components
    for (let i = 0; i < getChapterCount(); i++) {
      const mod = await chapterRegistry[i].component();
      loadedComponents[i] = mod.default;
    }
    
    // Initialize analytics
    initAnalytics(experience.id, viewer.id);
    
    initialized = true;
  });

  // Handle audio mood changes
  $effect(() => {
    if (audioReady && activeChapter !== lastMoodChapter) {
      setMood(activeChapter);
      lastMoodChapter = activeChapter;
    }
  });

  async function enableAudio() {
    await initAudio();
    audioReady = true;
    setMood(activeChapter);
  }

  function getChapterStyle(index: number): string {
    const total = getChapterCount();
    return `top: ${(index / total) * 100}%; height: ${(1 / total) * 100}%;`;
  }
</script>

<div class="orchestrator">
  <!-- Audio enable button -->
  {#if !audioReady}
    <button class="audio-enable" onclick={enableAudio}>
      Enable Audio Experience
    </button>
  {/if}

  {#if initialized}
    {#each chapterRegistry as chapter, index}
      <div 
        class="chapter-container"
        class:active={activeChapter === index}
        style={getChapterStyle(index)}
      >
        {#if loadedComponents[index]}
          {@const Component = loadedComponents[index]}
          <Component 
            id={chapter.id}
            progress={scrollProgress}
            chapterProgress={chapterProgress}
            active={activeChapter === index}
            index={index}
            data={chapter.data}
            context={{ viewer, experience }}
          />
        {/if}
      </div>
    {/each}
  {/if}
</div>

<style>
  .orchestrator {
    position: relative;
    width: 100%;
  }

  .chapter-container {
    position: absolute;
    left: 0;
    width: 100%;
    opacity: 0;
    transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .chapter-container.active {
    opacity: 1;
    z-index: 1;
  }

  .audio-enable {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    padding: 0.75rem 1.5rem;
    background: var(--color-accent-teal);
    color: var(--color-void);
    border: none;
    border-radius: 8px;
    font-family: var(--font-body);
    font-weight: 500;
    cursor: pointer;
    z-index: 1000;
    transition: transform 0.2s, opacity 0.2s;
  }

  .audio-enable:hover {
    transform: scale(1.05);
  }
</style>
```

---

## Database Schema (`src/lib/db/schema.sql`)

```sql
-- Viewers (anyone viewing an experience)
CREATE TABLE IF NOT EXISTS viewers (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'guest',
  metadata TEXT,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Experiences (the main experience configurations)
CREATE TABLE IF NOT EXISTS experiences (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  config TEXT,
  theme TEXT DEFAULT 'dark',
  published INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Sessions (viewing sessions)
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  experience_id TEXT REFERENCES experiences(id),
  viewer_id TEXT REFERENCES viewers(id),
  created_at INTEGER DEFAULT (unixepoch()),
  user_agent TEXT,
  ip_hash TEXT
);

-- Events (analytics)
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT REFERENCES sessions(id),
  experience_id TEXT REFERENCES experiences(id),
  viewer_id TEXT REFERENCES viewers(id),
  event_type TEXT NOT NULL,
  chapter TEXT,
  data TEXT,
  dwell_ms INTEGER,
  ts INTEGER DEFAULT (unixepoch())
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_viewer ON events(viewer_id);
CREATE INDEX IF NOT EXISTS idx_events_experience ON events(experience_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
```

---

## Wrangler Configuration

```toml
name = "cinematic-platform"
main = "workers/api/index.ts"
pages_build_output_dir = ".svelte-kit/cloudflare"
compatibility_date = "2026-01-01"

[vars]
APP_NAME = "Cinematic Platform"
DEFAULT_THEME = "dark"

[[d1_databases]]
binding = "DB"
database_name = "cinematic-analytics"
database_id = "your-database-id"
```

---

*Next: [Component Library](COMPONENT_LIBRARY.md)*