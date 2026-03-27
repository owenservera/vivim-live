# Data Migration

## Schema and API Design

The Cinematic Platform defines a comprehensive database schema. For VIVIM, we'll implement a phased approach: static configuration first, then dynamic data.

---

## Phase 1: Static Configuration (Current)

```typescript
// lib/data/experiences/vivim-pitch.ts
export const vivimExperience = {
  id: 'exp_vivim_live',
  slug: 'vivim-live',
  title: 'VIVIM — Sovereign AI Memory',
  description: 'The living memory layer for your AI',
  theme: 'dark',
  chapters: [
    {
      id: 'overview',
      slug: '00-overview',
      title: 'Overview',
      orderIndex: 0,
      data: {
        headline: 'The Living Memory for Your AI',
        subhead: 'Sovereign • Portable • Personal',
        providers: PROVIDERS
      }
    },
    {
      id: 'problem',
      slug: '01-problem',
      title: 'The Problem',
      orderIndex: 1,
      data: {
        headline: 'Every AI Conversation Starts Broken',
        stats: PROBLEM_STATS,
        problems: PROBLEMS
      }
    },
    // ... more chapters
  ],
  settings: {
    primaryColor: '#8b5cf6', // violet-500
    enableAudio: true,
    enableAnalytics: true
  }
};
```

---

## Phase 2: API Routes

### Experience API

```typescript
// app/api/experience/[slug]/route.ts
import { NextResponse } from 'next/server';
import { getExperienceBySlug } from '@/lib/data/experiences';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const experience = await getExperienceBySlug(slug);
  
  if (!experience) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Experience not found' } },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: experience });
}
```

### Analytics API

```typescript
// app/api/analytics/route.ts
import { NextResponse } from 'next/server';

interface AnalyticsEvent {
  sessionId: string;
  experienceId: string;
  viewerId?: string;
  events: Array<{
    type: 'scroll_enter' | 'scroll_exit' | 'interaction' | 'cta_click';
    chapter?: string;
    data?: Record<string, unknown>;
    dwellMs?: number;
    timestamp: number;
  }>;
}

export async function POST(request: Request) {
  const body: AnalyticsEvent = await request.json();
  
  // Validate required fields
  if (!body.sessionId || !body.experienceId || !body.events) {
    return NextResponse.json(
      { success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } },
      { status: 400 }
    );
  }
  
  // Process events asynchronously (fire-and-forget)
  queueEventsForProcessing(body);
  
  return NextResponse.json({ success: true, data: { received: body.events.length } });
}
```

### Viewer API

```typescript
// app/api/viewer/[slug]/route.ts
import { NextResponse } from 'next/server';
import { getViewerBySlug } from '@/lib/data/viewers';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const viewer = await getViewerBySlug(slug);
  
  if (!viewer) {
    return NextResponse.json(
      { success: false, error: { code: 'NOT_FOUND', message: 'Viewer not found' } },
      { status: 404 }
    );
  }
  
  return NextResponse.json({ success: true, data: viewer });
}
```

---

## TypeScript Types

```typescript
// lib/config/types.ts

export interface Experience {
  id: string;
  slug: string;
  title: string;
  description?: string;
  theme: 'dark' | 'light';
  chapters: Chapter[];
  settings: ExperienceSettings;
}

export interface Chapter {
  id: string;
  slug: string;
  title: string;
  orderIndex: number;
  data: ChapterData;
  metadata?: ChapterMetadata;
}

export interface ChapterMetadata {
  emotionalTarget?: string;
  duration?: number;
  hasAudio?: boolean;
  has3D?: boolean;
  interactive?: boolean;
}

export interface ExperienceSettings {
  primaryColor: string;
  enableAudio: boolean;
  enableAnalytics: boolean;
}

export interface Viewer {
  id: string;
  slug: string;
  name: string;
  type: 'vc' | 'lead' | 'user' | 'guest';
  metadata?: Record<string, unknown>;
  attributes?: Record<string, string>;
}

export interface AnalyticsEvent {
  sessionId: string;
  experienceId: string;
  viewerId?: string;
  event: {
    type: EventType;
    chapter?: string;
    data?: Record<string, unknown>;
    dwellMs?: number;
    timestamp: number;
  };
}

export type EventType = 
  | 'scroll_enter' 
  | 'scroll_exit' 
  | 'interaction' 
  | 'cta_click' 
  | 'slider_touch' 
  | 'video_play'
  | 'audio_enable'
  | 'audio_mute';
```

---

## Database Schema (Future)

When implementing dynamic storage:

```sql
-- experiences table
CREATE TABLE experiences (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  config TEXT, -- JSON: chapters, settings
  theme TEXT DEFAULT 'dark',
  published INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (unixepoch())
);

-- viewers table
CREATE TABLE viewers (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'guest',
  metadata TEXT, -- JSON
  created_at INTEGER DEFAULT (unixepoch())
);

-- sessions table
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  experience_id TEXT REFERENCES experiences(id),
  viewer_id TEXT REFERENCES viewers(id),
  created_at INTEGER DEFAULT (unixepoch())
);

-- events table
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT REFERENCES sessions(id),
  event_type TEXT NOT NULL,
  chapter TEXT,
  data TEXT, -- JSON
  dwell_ms INTEGER,
  ts INTEGER DEFAULT (unixepoch())
);
```

---

## Analytics Tracking

```typescript
// lib/engine/analytics.ts
import { useEffect, useRef } from 'react';

type EventType = 'scroll_enter' | 'scroll_exit' | 'cta_click' | 'interaction';

interface TrackEvent {
  type: EventType;
  chapter?: string;
  data?: Record<string, unknown>;
}

let sessionId: string | null = null;
const chapterEnterTimes = new Map<string, number>();
const pendingEvents: TrackEvent[] = [];

export function useAnalytics(experienceId: string) {
  useEffect(() => {
    sessionId = `${experienceId}-${Date.now()}`;
    
    // Flush events every 5 seconds
    const flushInterval = setInterval(flushEvents, 5000);
    
    return () => {
      clearInterval(flushInterval);
      flushEvents();
    };
  }, [experienceId]);
  
  const trackEvent = (event: TrackEvent) => {
    pendingEvents.push({ ...event, timestamp: Date.now() });
    
    // Immediate flush for critical events
    if (event.type === 'cta_click') {
      flushEvents();
    }
  };
  
  const trackChapterEnter = (chapter: string) => {
    chapterEnterTimes.set(chapter, Date.now());
    trackEvent({ type: 'scroll_enter', chapter });
  };
  
  const trackChapterExit = (chapter: string) => {
    const enterTime = chapterEnterTimes.get(chapter);
    if (enterTime) {
      const dwellMs = Date.now() - enterTime;
      trackEvent({ type: 'scroll_exit', chapter, data: { dwellMs } });
      chapterEnterTimes.delete(chapter);
    }
  };
  
  return { trackEvent, trackChapterEnter, trackChapterExit };
}

async function flushEvents() {
  if (pendingEvents.length === 0 || !sessionId) return;
  
  const events = [...pendingEvents];
  pendingEvents.length = 0;
  
  try {
    await fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionId, events })
    });
  } catch {
    // Re-queue failed events
    pendingEvents.push(...events);
  }
}
```

---

## Data Migration Checklist

- [ ] Create type definitions in `lib/config/types.ts`
- [ ] Build static experience configuration
- [ ] Implement experience API route
- [ ] Add viewer API route
- [ ] Create analytics hook
- [ ] Build analytics API route
- [ ] (Future) Database schema migration

---

*Next: [Design System Migration](DESIGN_SYSTEM_MIGRATION.md)*
