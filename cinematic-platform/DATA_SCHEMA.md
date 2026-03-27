# Data Schema

## Overview

The Cinematic Platform uses a schema-driven approach where experiences, chapters, and viewer profiles are stored in the database and resolved at runtime. This enables:
- Dynamic experience configuration
- Per-viewer personalization
- Comprehensive analytics
- CMS-like content management

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│ experiences │       │   chapters  │       │   viewers   │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ id          │       │ id          │       │ id          │
│ slug        │       │ experience_ │───────│ slug        │
│ title       │       │   id (FK)   │       │ name        │
│ description │       │ slug        │       │ type        │
│ config      │       │ order_index │       │ metadata    │
│ theme       │       │ title       │       │ attributes  │
│ published   │       │ data        │       │ created_at  │
│ created_at  │       │ metadata    │       └──────┬──────┘
└──────┬──────┘       └──────┬──────┘              │
       │                    │                     │
       │                    │                     │
       └────────┬───────────┴──────────┬──────────┘
                │                      │
                ▼                      ▼
        ┌─────────────┐        ┌─────────────┐
        │  sessions   │        │   events    │
        ├─────────────┤        ├─────────────┤
        │ id          │        │ id          │
        │ experience_ │─────── │ session_id  │
        │   id (FK)   │        │ (FK)        │
        │ viewer_id   │─────── │ experience_ │
        │ (FK)        │        │   id (FK)   │
        │ created_at  │        │ viewer_id   │
        │ user_agent  │        │ (FK)        │
        │ ip_hash     │        │ event_type  │
        └─────────────┘        │ chapter     │
                               │ data        │
                               │ dwell_ms    │
                               │ ts          │
                               └─────────────┘
```

---

## Table Definitions

### experiences

Stores the main experience configurations (pitch decks, stories, etc.).

```sql
CREATE TABLE experiences (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  config TEXT,                    -- JSON: theme, settings, chapter order
  theme TEXT DEFAULT 'dark',       -- 'dark', 'light' (dark only supported)
  published INTEGER DEFAULT 0,    -- 0 = draft, 1 = published
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_experiences_slug ON experiences(slug);
CREATE INDEX idx_experiences_published ON experiences(published);
```

**Config JSON Structure:**
```json
{
  "chapters": [
    {
      "id": "problem",
      "slug": "01-problem",
      "title": "The Problem",
      "data": {
        "headline": "Every conversation starts broken",
        "stats": [...]
      }
    }
  ],
  "settings": {
    "primaryColor": "#3ecfb2",
    "enableAudio": true,
    "enableAnalytics": true
  },
  "personalization": {
    "enabled": true,
    "viewerTypes": ["vc", "lead", "guest"]
  }
}
```

---

### chapters

Defines individual chapters within an experience.

```sql
CREATE TABLE chapters (
  id TEXT PRIMARY KEY,
  experience_id TEXT REFERENCES experiences(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  data TEXT,                       -- JSON: chapter-specific content
  metadata TEXT,                   -- JSON: emotional target, duration, etc.
  created_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_chapters_experience ON chapters(experience_id);
CREATE INDEX idx_chapters_order ON chapters(experience_id, order_index);
```

**Metadata JSON Structure:**
```json
{
  "emotionalTarget": "recognition",
  "duration": 6000,
  "hasAudio": false,
  "has3D": false,
  "interactive": false,
  "minScroll": 0.11,
  "maxScroll": 0.22
}
```

---

### viewers

People who view experiences (VCs, leads, general users).

```sql
CREATE TABLE viewers (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  type TEXT DEFAULT 'guest',       -- 'vc', 'lead', 'user', 'guest'
  email TEXT,
  metadata TEXT,                   -- JSON: firm, check size, portfolio, etc.
  attributes TEXT,                 -- JSON: computed attributes for personalization
  created_at INTEGER DEFAULT (unixepoch()),
  updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_viewers_slug ON viewers(slug);
CREATE INDEX idx_viewers_type ON viewers(type);
```

**Metadata JSON Structure (VC Example):**
```json
{
  "firm": "Sequoia Capital",
  "firmSlug": "sequoia",
  "checkMin": 5000000,
  "checkMax": 25000000,
  "portfolio": ["Cursor", "Figma", "Stripe"],
  "thesisTags": ["AI", "Infrastructure", "Developer Tools"],
  "lastViewedAt": 1709500000,
  "viewCount": 3
}
```

---

### sessions

Tracks viewing sessions for analytics and persistence.

```sql
CREATE TABLE sessions (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(8)))),
  experience_id TEXT REFERENCES experiences(id) ON DELETE SET NULL,
  viewer_id TEXT REFERENCES viewers(id) ON DELETE SET NULL,
  created_at INTEGER DEFAULT (unixepoch()),
  user_agent TEXT,
  ip_hash TEXT,                    -- Hash of IP for uniqueness (not storage)
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT
);

CREATE INDEX idx_sessions_experience ON sessions(experience_id);
CREATE INDEX idx_sessions_viewer ON sessions(viewer_id);
CREATE INDEX idx_sessions_created ON sessions(created_at);
```

---

### events

Records all interactions for analytics.

```sql
CREATE TABLE events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT REFERENCES sessions(id) ON DELETE CASCADE,
  experience_id TEXT REFERENCES experiences(id) ON DELETE SET NULL,
  viewer_id TEXT REFERENCES viewers(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,         -- See Event Types below
  chapter TEXT,                     -- Chapter ID or 'global'
  data TEXT,                        -- JSON: event-specific data
  dwell_ms INTEGER,                 -- For dwell events
  ts INTEGER DEFAULT (unixepoch())
);

CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_viewer ON events(viewer_id);
CREATE INDEX idx_events_experience ON events(experience_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_ts ON events(ts);
```

---

## Event Types

| Event Type | Description | Data Fields |
|------------|-------------|-------------|
| `scroll_enter` | User enters a chapter | `chapter` |
| `scroll_exit` | User leaves a chapter | `chapter`, `dwell_ms` |
| `interaction` | Generic interaction | `type`, `element`, `value` |
| `cta_click` | CTA button clicked | `cta_id`, `chapter` |
| `slider_touch` | Financial model slider moved | `slider_id`, `value`, `old_value` |
| `video_play` | Video started | `video_id` |
| `video_complete` | Video finished | `video_id` |
| `audio_enable` | Audio turned on | - |
| `audio_mute` | Audio muted | - |
| `share` | Experience shared | `platform` |
| `download` | Content downloaded | `format` |

---

## Seed Data

### Sample Experiences

```sql
-- VIVIM Pitch Deck
INSERT INTO experiences (id, slug, title, description, config, published)
VALUES (
  'exp_vivim_pitch',
  'vivim-pitch',
  'VIVIM — Cinematic Pitch Deck',
  'AI memory platform pitch deck',
  '{"chapters": [...], "settings": {"primaryColor": "#3ecfb2", "enableAudio": true}}',
  1
);

-- Custom Experience
INSERT INTO experiences (id, slug, title, description, config, published)
VALUES (
  'exp_custom',
  'my-experience',
  'My Custom Experience',
  'A custom cinematic experience',
  '{"chapters": [...],"settings": {"enableAudio": false}}',
  1
);
```

### Sample Viewers

```sql
-- VCs
INSERT INTO viewers (id, slug, name, type, metadata, attributes)
VALUES 
  ('vc_seq', 'sequoia', 'Sequoia Capital', 'vc', 
   '{"firm": "Sequoia Capital", "checkMin": 5000000, "checkMax": 50000000, "portfolio": ["Cursor", "Figma"]}',
   '{"theses": ["AI", "Developer Tools"]}'),
  ('vc_a16z', 'a16z', 'Andreessen Horowitz', 'vc',
   '{"firm": "a16z", "checkMin": 1000000, "checkMax": 25000000, "portfolio": ["Coinbase", "Discord"]}',
   '{"theses": ["Crypto", "Consumer"]}');
```

---

## API Data Flow

### Experience Resolution

```typescript
// Server: src/routes/[experience]/[viewer]/+page.server.ts

export const load = async ({ params }) => {
  // 1. Get experience
  const experience = await db.query(
    'SELECT * FROM experiences WHERE slug = ? AND published = 1',
    [params.experience]
  );

  // 2. Get viewer (if exists)
  const viewer = params.viewer 
    ? await db.query('SELECT * FROM viewers WHERE slug = ?', [params.viewer])
    : null;

  // 3. Get chapters in order
  const chapters = await db.query(
    'SELECT * FROM chapters WHERE experience_id = ? ORDER BY order_index',
    [experience.id]
  );

  // 4. Create session
  const sessionId = await createSession(experience.id, viewer?.id);

  return {
    experience: { ...experience, config: JSON.parse(experience.config) },
    viewer: viewer ? { ...viewer, metadata: JSON.parse(viewer.metadata) } : null,
    chapters: chapters.map(c => ({
      ...c,
      data: c.data ? JSON.parse(c.data) : null,
      metadata: c.metadata ? JSON.parse(c.metadata) : null
    })),
    sessionId
  };
};
```

---

## Queries for Analytics

### Chapter Dwell Time

```sql
SELECT 
  chapter,
  AVG(dwell_ms) / 1000.0 as avg_seconds,
  COUNT(*) as visits
FROM events 
WHERE event_type = 'scroll_exit' 
  AND experience_id = ?
GROUP BY chapter
ORDER BY chapter;
```

### Viewer Engagement Score

```sql
SELECT 
  v.id,
  v.name,
  v.slug,
  COUNT(DISTINCT s.id) as sessions,
  COUNT(e.id) as total_events,
  SUM(CASE WHEN e.event_type = 'cta_click' THEN 1 ELSE 0 END) as cta_clicks
FROM viewers v
LEFT JOIN sessions s ON s.viewer_id = v.id
LEFT JOIN events e ON e.viewer_id = v.id
GROUP BY v.id
ORDER BY cta_clicks DESC;
```

### Conversion Funnel

```sql
SELECT 
  event_type,
  COUNT(DISTINCT session_id) as unique_sessions
FROM events
WHERE experience_id = ?
  AND event_type IN ('scroll_enter', 'scroll_exit', 'cta_click')
GROUP BY event_type
ORDER BY 
  CASE event_type 
    WHEN 'scroll_enter' THEN 1 
    WHEN 'cta_click' THEN 2 
    WHEN 'scroll_exit' THEN 3 
  END;
```

---

## Migration Guide

### Adding New Fields

1. **Add to table**: `ALTER TABLE [table] ADD COLUMN new_field TEXT;`
2. **Update types**: Add to TypeScript interfaces
3. **Update seed**: Add to seed data
4. **Update API**: Handle new field in responses

### Adding New Tables

1. **Create table**: Define schema in `schema.sql`
2. **Create type**: Add TypeScript interface
3. **Create API**: Add route for CRUD operations
4. **Create migration**: Document in migration notes

---

*Next: [API Specification](API_SPECIFICATION.md)*