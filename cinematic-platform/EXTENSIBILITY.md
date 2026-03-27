# Extensibility Guide

## Overview

The Cinematic Platform is designed to be extended in multiple dimensions:
- **Content**: Add new chapters, modify structure
- **Visual**: Theme, customize components
- **Behavior**: Add interactions, analytics
- **Integration**: Connect external services

This guide covers each extension point and provides examples.

---

## 1. Adding New Chapters

### Method A: Register in Config

```typescript
// src/lib/config/registry.ts
import { registerChapter } from './registry';
import type { ChapterConfig } from './types';

const myChapter: ChapterConfig = {
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
    chapterNumber: 5, // Insert at position 5
    minScroll: 0.5,
    maxScroll: 0.65
  },
  data: {
    headline: 'Welcome to My Chapter',
    sections: [...]
  }
};

registerChapter(myChapter);
```

### Method B: Create from Database

```typescript
// src/lib/config/loader.ts
export async function loadChaptersFromDB(experienceId: string) {
  const chapters = await db.query(
    'SELECT * FROM chapters WHERE experience_id = ? ORDER BY order_index',
    [experienceId]
  );
  
  const registry = [];
  
  for (const chapter of chapters) {
    const config: ChapterConfig = {
      id: chapter.id,
      slug: chapter.slug,
      title: chapter.title,
      component: () => import(`./chapters/${chapter.component}`),
      metadata: JSON.parse(chapter.metadata),
      data: JSON.parse(chapter.data)
    };
    registry.push(config);
  }
  
  return registry;
}
```

### Chapter Template

```svelte
<!-- src/lib/chapters/MyChapter.svelte -->
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { ChapterProps } from '$config/types';
  import { gsap } from 'gsap';

  let { 
    id,
    progress = 0,
    chapterProgress = 0,
    active = false,
    index = 0,
    data,
    context
  }: ChapterProps<MyChapterData> = $props();

  let container: HTMLElement;
  let animationTimeline: gsap.core.Timeline | null = null;

  // Animation setup
  onMount(() => {
    if (active) {
      animationTimeline = gsap.timeline();
      // Set up animations...
    }
  });

  // Cleanup
  onDestroy(() => {
    animationTimeline?.kill();
  });

  // Reactive animation trigger
  $effect(() => {
    if (active && animationTimeline) {
      animationTimeline.restart();
    }
  });
</script>

<div bind:this={container} class="chapter-my-chapter" class:active>
  <h1 class="headline">{data.headline}</h1>
  <!-- Content here -->
</div>

<style>
  .chapter-my-chapter {
    /* Base styles */
  }
  
  .chapter-my-chapter.active {
    /* Active state */
  }
</style>
```

---

## 2. Custom Visualizations

### Adding a Chart Type

```typescript
// lib/engine/visualization.ts
import * as Plot from '@observablehq/plot';
import * as d3 from 'd3';

export function createScatterPlot(data: ScatterData[], options: ScatterOptions) {
  return Plot.plot({
    style: {
      background: 'transparent',
      color: options.color || '#9896a4'
    },
    marks: [
      Plot.dot(data, {
        x: 'x',
        y: 'y',
        fill: options.color || '#3ecfb2',
        r: options.radius || 4,
        fillOpacity: 0.8
      }),
      Plot.linearRegressionY(data, {
        x: 'x',
        y: 'y',
        stroke: options.regressionColor || '#7c6ef7'
      })
    ],
    x: { label: options.xLabel },
    y: { label: options.yLabel }
  });
}

export function createTimeline(data: TimelineEvent[], options: TimelineOptions) {
  // Custom D3 timeline visualization
}
```

### Using in a Chapter

```svelte
<script lang="ts">
  import { createScatterPlot } from '$engine/visualization';
  
  const plotData = $derived(data.points.map(p => ({
    x: p.time,
    y: p.value
  })));
</script>

<div class="chart-container">
  {#if chartMounted}
    {@html createScatterPlot(plotData, { color: '#3ecfb2' }).outerHTML}
  {/if}
</div>
```

---

## 3. Custom Audio Moods

```typescript
// lib/engine/audio-extensions.ts
import { registerMood } from '$engine/audio';

// Register custom moods for your experience
registerMood({
  id: 'mystery',
  note: 'D#3',
  type: 'sine',
  volume: -26,
  reverb: 14,
  filter: { frequency: 200, type: 'lowpass' }
});

registerMood({
  id: 'excitement',
  note: 'A4',
  type: 'triangle',
  volume: -18,
  reverb: 6,
  filter: { frequency: 2000, type: 'highpass' }
});

// Then use in chapters
import { setMood } from '$engine/audio';

$effect(() => {
  if (chapter === 3) setMoodById('excitement');
});
```

---

## 4. Custom Analytics Events

```typescript
// lib/analytics/custom-events.ts
import { trackEvent } from '$engine/analytics';

export function trackProductDemo(productId: string, action: 'start' | 'interact' | 'complete') {
  trackEvent({
    type: 'product_demo',
    chapter: 'product',
    data: { productId, action }
  });
}

export function trackFormSubmission(formId: string, fields: Record<string, string>) {
  trackEvent({
    type: 'form_submit',
    chapter: 'contact',
    data: { formId, fieldCount: Object.keys(fields).length }
  });
}
```

---

## 5. Custom Themes

### Creating a Theme

```typescript
// lib/config/themes.ts
export const themes = {
  dark: {
    colors: {
      void: '#050507',
      surface: '#0b0b10',
      textPrimary: '#f0eff4',
      accentTeal: '#3ecfb2'
    },
    fonts: {
      display: 'Clash Display',
      body: 'Inter Variable',
      mono: 'JetBrains Mono'
    }
  },
  // Add light theme (or custom branded themes)
  customBrand: {
    colors: {
      void: '#0a0a0f',
      surface: '#12121a',
      textPrimary: '#ffffff',
      accentTeal: '#00d4aa'
    },
    fonts: {
      display: 'Custom Display',
      body: 'Custom Body',
      mono: 'Custom Mono'
    }
  }
};
```

### Applying Theme at Runtime

```svelte
<script lang="ts">
  import { themes } from '$config/themes';
  
  let currentTheme = $state('dark');
  
  function setTheme(theme: string) {
    currentTheme = theme;
    const t = themes[theme];
    
    // Apply CSS custom properties
    document.documentElement.style.setProperty('--color-void', t.colors.void);
    document.documentElement.style.setProperty('--color-surface', t.colors.surface);
    // ... etc
  }
</script>
```

---

## 6. Integration Extensions

### Adding a CMS

```typescript
// lib/integrations/cms.ts
import { createClient } from '@sanity/client';

const sanity = createClient({
  projectId: 'your-project-id',
  dataset: 'production',
  useCdn: true,
  apiVersion: '2024-01-01'
});

export async function fetchChapterContent(chapterId: string) {
  const query = `*[_type == "chapter" && slug.current == $slug][0]{
    title,
    content,
    metadata,
    visualSettings
  }`;
  
  return await sanity.fetch(query, { slug: chapterId });
}
```

### Adding Analytics Provider

```typescript
// lib/analytics/providers.ts
export interface AnalyticsProvider {
  track(event: string, data: Record<string, unknown>): void;
  identify(userId: string, traits: Record<string, unknown>): void;
  page(name: string): void;
}

// Mixpanel provider
export const mixpanelProvider: AnalyticsProvider = {
  track(event, data) {
    (window as any).mixpanel?.track(event, data);
  },
  identify(userId, traits) {
    (window as any).mixpanel?.identify(userId);
    (window as any).mixpanel?.people.set(traits);
  },
  page(name) {
    (window as any).mixpanel?.track_pageview(name);
  }
};

// Segment provider
export const segmentProvider: AnalyticsProvider = {
  track(event, data) {
    (window as any).analytics?.track(event, data);
  },
  identify(userId, traits) {
    (window as any).analytics?.identify(userId, traits);
  },
  page(name) {
    (window as any).analytics?.page(name);
  }
};
```

### Using Providers

```typescript
// lib/analytics/index.ts
import { mixpanelProvider, type AnalyticsProvider } from './providers';

const providers: Record<string, AnalyticsProvider> = {
  mixpanel: mixpanelProvider,
  // segment: segmentProvider
};

export function initAnalytics(provider: string = 'mixpanel') {
  const p = providers[provider];
  if (p) {
    // Initialize...
  }
}
```

---

## 7. Plugin System

### Creating Plugins

```typescript
// lib/plugins/plugin.ts
export interface CinematicPlugin {
  name: string;
  version: string;
  init(): Promise<void>;
  destroy(): void;
  hooks?: {
    beforeChapterMount?: (chapter: ChapterConfig) => void;
    afterChapterMount?: (chapter: ChapterConfig) => void;
    onScroll?: (progress: number) => void;
    onAnalytics?: (event: AnalyticsEvent) => void;
  };
}

// Example plugin
export const myPlugin: CinematicPlugin = {
  name: 'scroll-progress',
  version: '1.0.0',
  init() {
    console.log('Plugin initialized');
  },
  destroy() {
    console.log('Plugin destroyed');
  },
  hooks: {
    onScroll(progress) {
      // Custom scroll behavior
    }
  }
};
```

### Loading Plugins

```typescript
// src/routes/+layout.svelte
<script lang="ts">
  import { loadPlugins } from '$engine/plugins';
  import { myPlugin } from '$lib/plugins/my-plugin';
  
  onMount(async () => {
    await loadPlugins([myPlugin]);
  });
</script>
```

---

## 8. Dynamic Chapter Loading

```typescript
// Load chapters from external source
export async function loadExternalChapters(url: string) {
  const response = await fetch(url);
  const config = await response.json();
  
  // Validate config structure
  const chapters = config.chapters.map((c: any) => ({
    id: c.id,
    slug: c.slug,
    title: c.title,
    component: () => import(`./chapters/${c.component}`),
    metadata: c.metadata,
    data: c.data
  }));
  
  return chapters;
}
```

---

## 9. Component Variants

### Creating Variant Components

```svelte
<!-- lib/components/Button/Button.svelte -->
<script lang="ts">
  import type { Snippet } from 'svelte';
  
  interface Props {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    children: Snippet;
    onclick?: () => void;
  }
  
  let { variant = 'primary', size = 'md', children, onclick }: Props = $props();
</script>

<button 
  class="btn btn-{variant} btn-{size}"
  onclick={onclick}
>
  {@render children()}
</button>

<style>
  .btn { /* base styles */ }
  .btn-primary { /* primary variant */ }
  .btn-secondary { /* secondary variant */ }
  /* etc */
</style>
```

---

## 10. Middleware/Interceptors

### Route Interceptors

```typescript
// src/hooks.server.ts
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Add custom headers
  const response = await resolve(event);
  
  // Add analytics tracking
  response.headers.set('X-Response-Time', Date.now().toString());
  
  return response;
};
```

---

## Migration Guide: VIVIM Pitch Deck → Platform

| VIVIM-Specific | Platform Equivalent |
|----------------|---------------------|
| Hardcoded 9 chapters | Dynamic chapter registry |
| VC-only personalization | Any viewer type |
| Static mock data | Database-driven content |
| Single theme | Multi-theme support |
| VIVIM particle effects | ParticleCanvas component |
| Problem degradation counter | Configurable backward counter |

---

## Best Practices

1. **Keep extensions isolated** — Don't modify core files
2. **Version your plugins** — Maintain compatibility
3. **Document customizations** — Future you will thank you
4. **Test extensions thoroughly** — Especially animations
5. **Use TypeScript** — Type safety helps maintenance

---

*End of Extensibility Guide*