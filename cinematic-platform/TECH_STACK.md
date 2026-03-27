# Technical Stack Specification

## Overview

The Cinematic Platform uses a modern, edge-native stack optimized for performance, interactivity, and developer experience. This document details each technology layer and its role in the platform.

---

## Core Technologies

### 1. SvelteKit 5 + Runes

**Version**: Svelte 5.x with SvelteKit 2.x

**Why**: Svelte 5's compilation model produces minimal, highly optimized JavaScript. The Runes system (`$state`, `$derived`, `$effect`) provides fine-grained reactivity without the VDOM overhead.

**Usage in Platform**:
- All chapter components use Runes exclusively
- State management via `.svelte.ts` modules
- No legacy stores (`writable()`, `$:`)

```typescript
// State (mutable)
let progress = $state(0);
let chapter = $state(0);

// Derived (computed)
let isActive = $derived(chapter === currentChapter);

// Effects (side effects)
$effect(() => {
  if (isActive) trackChapterEnter(chapter);
});

// Props (never use export let)
let { progress, chapter, data }: ChapterProps = $props();
```

**Configuration**:
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-cloudflare';

export default {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      routes: {
        _include: ['/*'],
        _exclude: ['/sitemap.xml', '/robots.txt']
      }
    }),
    alias: {
      $chapters: 'src/lib/chapters',
      $components: 'src/lib/components',
      $engine: 'src/lib/engine',
      $config: 'src/lib/config',
      $assets: 'src/lib/assets'
    }
  }
};
```

---

### 2. Theatre.js

**Version**: @theatre/core 0.7.x

**Why**: Theatre.js provides cinematic keyframe control for animations. Unlike CSS transitions or GSAP, Theatre.js allows declarative sequencing with a timeline editor (Studio) during development.

**When to Use**:
- Scripted sequences that play once on enter
- Choreographed multi-element animations
- Exportable animation state (to JSON)

```typescript
// lib/engine/theatre.ts
import { getProject, types as t } from '@theatre/core';

export const project = getProject('Cinematic Experience', {
  state: import.meta.env.DEV ? undefined : await import('./theatre-state.json')
});

export const sheets = {
  hero: project.sheet('Hero'),
  chapter: project.sheet('Chapter')
};

// In a chapter component:
const obj = sheets.hero.object('headline', {
  opacity: t.number(0, { range: [0, 1] }),
  translateY: t.number(40, { range: [-100, 100] })
});

obj.onValuesChange(({ opacity, translateY }) => {
  el.style.opacity = String(opacity);
  el.style.transform = `translateY(${translateY}px)`;
});
```

**Studio Mode**: In development, Theatre.js Studio is a floating UI for visual keyframe editing. Export state to `theatre-state.json` before deploying.

---

### 3. GSAP + ScrollTrigger

**Version**: GSAP 3.12.x

**Why**: GSAP provides the most robust scroll-driven animation system. ScrollTrigger ties animation playback to scroll position with pixel-perfect precision.

**When to Use**:
- Continuous functions of scroll position
- Parallax, pinning, scrubbing
- Counter animations
- Chart drawing on scroll

```typescript
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Pin and animate
gsap.to(element, {
  scaleX: 1,
  duration: 1,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: sectionEl,
    start: 'top 70%',
    end: 'top 30%',
    scrub: true
  }
});
```

**Integration**: GSAP ticker is tied to Lenis for synchronized scrolling:
```typescript
gsap.ticker.add((t) => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);
```

---

### 4. Lenis

**Version**: 1.1.x

**Why**: Lenis provides smooth, inertial scrolling that feels cinematic. It normalizes scroll behavior across browsers and devices.

**Configuration**:
```typescript
const lenis = new Lenis({
  lerp: 0.075,        // Smoothness (lower = smoother)
  smoothWheel: true,  // Mouse wheel smoothing
  wheelMultiplier: 1,
  touchMultiplier: 2,
  duration: 1.2,       // Animation duration
  smoothing: 0.1
});
```

**Tied to GSAP**:
```typescript
gsap.ticker.add((t) => lenis.raf(t * 1000));
```

---

### 5. Three.js + WebGPU

**Version**: three 0.170.x

**Why**: Three.js enables 3D visuals, particle systems, and WebGL/WebGPU rendering. The platform attempts WebGPU first, falls back to WebGL2.

**Renderer Initialization**:
```typescript
// lib/three/renderer.ts
import * as THREE from 'three';

export async function createRenderer(canvas: HTMLCanvasElement) {
  let renderer: THREE.WebGLRenderer;

  if (navigator.gpu) {
    // WebGPU available - use modern renderer
    const { WebGPURenderer } = await import('three/webgpu');
    renderer = new WebGPURenderer({ canvas, antialias: true });
    await (renderer as any).init();
  } else {
    // Fallback to WebGL2
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);
  
  return renderer;
}
```

**Performance Contracts**:
- All scenes must implement `dispose()` on chapter leave
- Particle cap: 50k mobile, 200k desktop
- Detect low-end via `navigator.hardwareConcurrency < 4`

---

### 6. Observable Plot + D3

**Version**: @observablehq/plot 0.6.x, d3 7.9.x

**Why**: Observable Plot provides expressive, grammar-of-graphics charts. D3 provides low-level control for custom visualizations.

**Usage**:
```typescript
import * as Plot from '@observablehq/plot';
import * as d3 from 'd3';

const chart = Plot.plot({
  marks: [
    Plot.lineY(data, { x: 'month', y: 'value', stroke: '#3ecfb2' })
  ],
  x: { label: 'Time' },
  y: { label: 'Value' }
});
```

**Integration**: Re-render on input change with D3 interpolators for smooth transitions.

---

### 7. Tone.js

**Version**: 14.8.x

**Why**: Tone.js provides a generative audio engine that creates ambient soundscapes tied to narrative progression.

**Core Principles**:
- Volume ceiling: -18dB (never compete with voice)
- Gate on first user interaction (`Tone.start()`)
- Always include mute toggle
- Chapter-specific moods

```typescript
// lib/engine/audio.ts
import * as Tone from 'tone';

const chapterMoods = [
  { note: 'C3', type: 'sine', vol: -28, reverb: 12 },  // Gate
  { note: 'D3', type: 'sine', vol: -26, reverb: 10 },  // Problem
  { note: 'F3', type: 'triangle', vol: -24, reverb: 9 },  // Vision
  // ... etc
];

export async function initAudio() {
  await Tone.start();
  const synth = new Tone.Synth({ 
    oscillator: { type: 'sine' },
    envelope: { attack: 2, release: 4 }
  }).connect(new Tone.Reverb(8).toDestination());
  
  return synth;
}

export function setMood(chapter: number) {
  const mood = chapterMoods[chapter];
  synth.oscillator.type = mood.type;
  synth.volume.rampTo(mood.vol, 2);
  synth.triggerAttack(mood.note);
}
```

---

### 8. Hono on Cloudflare Workers

**Version**: hono 4.x

**Why**: Hono is a lightweight (14kb) web framework with 0ms cold start on Cloudflare Workers. It provides the API layer.

**Routes**:
```
GET  /api/experience/:id     → Experience config
GET  /api/viewer/:slug       → Viewer profile
POST /api/analytics          → Event ingestion
GET  /api/metrics            → Live metrics (cached)
POST /api/model/calc         → Server-side calculations
```

```typescript
// workers/api/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

app.use('*', cors());
app.use('*', logger());

app.get('/api/health', (c) => c.json({ status: 'ok' }));

// Mount routes
app.route('/api/analytics', analytics);
app.route('/api/viewer', viewer);
app.route('/api/experience', experience);

export default app;
```

---

### 9. Turso (libSQL)

**Version**: @tursodatabase/serverless 0.2.x

**Why**: Turso provides edge-native SQLite with global replication. Perfect for per-viewer sessions and analytics.

**Schema**:
```sql
-- Viewers (investors, leads, users)
CREATE TABLE viewers (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  name TEXT,
  type TEXT,              -- 'vc', 'lead', 'user'
  metadata TEXT,          -- JSON
  created_at INTEGER DEFAULT (unixepoch())
);

-- Experiences (pitch decks, stories)
CREATE TABLE experiences (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE,
  title TEXT,
  config TEXT,           -- JSON: chapter config, settings
  published BOOLEAN DEFAULT FALSE,
  created_at INTEGER DEFAULT (unixepoch())
);

-- Sessions
CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  experience_id TEXT REFERENCES experiences(id),
  viewer_id TEXT REFERENCES viewers(id),
  created_at INTEGER DEFAULT (unixepoch()),
  user_agent TEXT
);

-- Events
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT REFERENCES sessions(id),
  event_type TEXT,       -- 'scroll_enter', 'dwell', 'interaction', 'cta_click'
  chapter TEXT,
  data TEXT,             -- JSON
  dwell_ms INTEGER,
  ts INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_viewer ON events(viewer_id);
```

---

### 10. Tailwind v4 + CSS Custom Properties

**Version**: Tailwind CSS 4.x with @tailwindcss/vite

**Why**: Tailwind provides utility-first styling with a design-token-driven theme system. CSS custom properties enable runtime theming.

**Configuration**:
```typescript
// tailwind.config.ts
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        void: '#050507',
        surface: '#0b0b10',
        primary: '#f0eff4',
        secondary: '#9896a4',
        muted: '#5a5868',
        accent: {
          teal: '#3ecfb2',
          gold: '#d4a94a',
          coral: '#e86848'
        }
      },
      fontFamily: {
        display: ['Clash Display', 'sans-serif'],
        body: ['Inter Variable', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }
  },
  plugins: []
};
```

**Usage**:
```css
/* app.css */
:root {
  --color-void: #050507;
  --color-surface: #0b0b10;
  --color-accent: #3ecfb2;
  --font-display: 'Clash Display', sans-serif;
  --ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1);
}

body {
  background: var(--color-void);
  font-family: var(--font-body);
}
```

---

## Development Tools

### 1. Vite

```typescript
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import glsl from 'vite-plugin-glsl';
import tailwindcss from '@tailwindcss/vite';

export default {
  plugins: [
    sveltekit(),
    glsl(),
    tailwindcss()
  ],
  resolve: {
    alias: {
      $chapters: 'src/lib/chapters',
      $components: 'src/lib/components',
      $engine: 'src/lib/engine',
      $config: 'src/lib/config'
    }
  }
};
```

### 2. Wrangler

```toml
# wrangler.toml
name = "cinematic-platform"
main = "workers/api/index.ts"
pages_build_output_dir = ".svelte-kit/cloudflare"
compatibility_date = "2026-01-01"

[vars]
TURSO_URL = "libsql://your-db.turso.io"
TURSO_TOKEN = "your-token"

[[d1_databases]]
binding = "DB"
database_name = "cinematic-analytics"
database_id = "xxxx"
```

---

## Technology Decision Matrix

| Use Case | Technology | Alternative |
|----------|-----------|-------------|
| Framework | SvelteKit 5 | None (Svelte 5 required) |
| Animation (scripted) | Theatre.js | GSAP (if no Studio needed) |
| Animation (scroll-driven) | GSAP ScrollTrigger | Native IntersectionObserver |
| 3D/Particles | Three.js + WebGPU | Raw WebGL (too low-level) |
| Charts | Observable Plot | Chart.js (not expressive enough) |
| Audio | Tone.js | Howler.js (not generative) |
| API | Hono | Express (too heavy) |
| Database | Turso | D1 (less mature) |
| Deploy | Cloudflare Pages | Vercel (not edge-native) |
| Styling | Tailwind v4 | Plain CSS (not scalable) |

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.2s |
| Largest Contentful Paint | < 2.5s |
| Lighthouse mobile | > 85 |
| Three.js particle cap (mobile) | 50,000 |
| Three.js particle cap (desktop) | 200,000 |
| Bundle size (initial JS) | < 180kb gzipped |
| API response time | < 100ms |
| Analytics write latency | < 50ms (fire-and-forget) |

---

## Banned Technologies

- **Next.js / React / Vue** — Use SvelteKit 5
- **Framer Motion** — Use Theatre.js + GSAP
- **Chart.js / Recharts** — Use Observable Plot
- **Vercel / Netlify** — Use Cloudflare Pages
- **Firebase / Supabase** — Use Turso
- **OpenAI API for runtime** — Use Transformers.js (client-side)

---

*Next: [Project Scaffold](PROJECT_SCAFFOLD.md)*