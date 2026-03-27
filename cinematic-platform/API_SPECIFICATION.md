# API Specification

## Overview

The Cinematic Platform provides a RESTful API built on Hono running on Cloudflare Workers. All endpoints return JSON and follow consistent response patterns.

**Base URL**: `https://your-domain.com/api`

---

## Authentication

Currently, the API is open (no authentication) since:
- Analytics events are fire-and-forget
- Experience data is public
- Viewer data is resolved from URL slugs

**Future**: Add API key authentication for:
- Admin endpoints
- Bulk data export
- Webhook integrations

---

## Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": 1709500000000,
    "version": "1.0"
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [...]
  },
  "meta": {
    "timestamp": 1709500000000
  }
}
```

---

## Endpoints

### Health Check

**GET** `/api/health`

Returns API health status.

```typescript
// Response
{
  "success": true,
  "data": {
    "status": "ok",
    "region": "iad1",
    "uptime": 86400
  }
}
```

---

### Experience Endpoints

#### Get Experience by Slug

**GET** `/api/experience/:slug`

Returns experience configuration.

```typescript
// Params
slug: string

// Response
{
  "success": true,
  "data": {
    "id": "exp_vivim_pitch",
    "slug": "vivim-pitch",
    "title": "VIVIM — Cinematic Pitch Deck",
    "description": "AI memory platform pitch deck",
    "theme": "dark",
    "chapters": [
      {
        "id": "gate",
        "slug": "00-gate",
        "title": "Gate",
        "orderIndex": 0,
        "data": {...},
        "metadata": {...}
      },
      ...
    ],
    "settings": {
      "primaryColor": "#3ecfb2",
      "enableAudio": true,
      "enableAnalytics": true
    }
  }
}
```

---

### Viewer Endpoints

#### Get Viewer by Slug

**GET** `/api/viewer/:slug`

Returns viewer profile for personalization.

```typescript
// Params
slug: string

// Response
{
  "success": true,
  "data": {
    "id": "vc_seq",
    "slug": "sequoia",
    "name": "Sequoia Capital",
    "type": "vc",
    "metadata": {
      "firm": "Sequoia Capital",
      "checkMin": 5000000,
      "checkMax": 50000000,
      "portfolio": ["Cursor", "Figma"],
      "thesisTags": ["AI", "Infrastructure"]
    }
  }
}
```

#### Create or Update Viewer

**POST** `/api/viewer`

Creates a new viewer or updates existing.

```typescript
// Body
{
  "slug": "new-vc",
  "name": "New VC Firm",
  "type": "vc",
  "metadata": {
    "firm": "New VC",
    "checkMin": 1000000,
    "checkMax": 10000000
  }
}

// Response
{
  "success": true,
  "data": {
    "id": "vc_new",
    "slug": "new-vc",
    "created": true
  }
}
```

---

### Analytics Endpoints

#### Ingest Events

**POST** `/api/analytics`

Records analytics events. This endpoint is fire-and-forget — it returns immediately and processes asynchronously.

```typescript
// Body
{
  "sessionId": "abc123",
  "experienceId": "exp_vivim_pitch",
  "viewerId": "vc_seq",
  "events": [
    {
      "type": "scroll_enter",
      "chapter": "problem",
      "timestamp": 1709500000000
    },
    {
      "type": "scroll_exit",
      "chapter": "problem",
      "dwellMs": 8500,
      "timestamp": 1709500015000
    },
    {
      "type": "cta_click",
      "chapter": "ask",
      "data": {
        "ctaId": "schedule-meeting"
      },
      "timestamp": 1709500500000
    }
  ]
}

// Response - immediate
{
  "success": true,
  "data": {
    "received": 3
  }
}

// Validation rules
- sessionId: required, string
- experienceId: required, string
- events: required, array (max 50 per request)
- events[].type: required, enum
- events[].timestamp: required, number (unix ms)
```

#### Get Session Analytics

**GET** `/api/analytics/session/:sessionId`

Returns all events for a session.

```typescript
// Response
{
  "success": true,
  "data": {
    "sessionId": "abc123",
    "events": [...],
    "totalDwellMs": 125000,
    "chaptersVisited": ["gate", "problem", "vision", "ask"]
  }
}
```

#### Get Experience Analytics Summary

**GET** `/api/analytics/experience/:experienceId`

Returns aggregated analytics for an experience.

```typescript
// Query params
? from=1709500000000 & to=1709600000000

// Response
{
  "success": true,
  "data": {
    "totalSessions": 150,
    "uniqueViewers": 45,
    "avgSessionDuration": 180000,
    "topChapters": [
      { "chapter": "model", "avgDwellMs": 45000 },
      { "chapter": "problem", "avgDwellMs": 12000 }
    ],
    "ctaClickRate": 0.23,
    "completionRate": 0.67
  }
}
```

---

### Metrics Endpoints

#### Get Live Metrics

**GET** `/api/metrics`

Returns cached live metrics. Results are cached for 60 seconds.

```typescript
// Response
{
  "success": true,
  "data": {
    "activeSessions": 12,
    "viewsToday": 47,
    "viewsThisWeek": 234,
    "ctaClicksToday": 8,
    "ctaClicksThisWeek": 42,
    "topViewers": [
      { "slug": "sequoia", "views": 5 },
      { "slug": "a16z", "views": 3 }
    ]
  },
  "cached": true,
  "cacheExpiry": 1709500060000
}
```

---

### Model Calculation Endpoints

#### Validate Financial Model

**POST** `/api/model/validate`

Server-side validation of financial model calculations.

```typescript
// Body
{
  "inputs": {
    "arr": 600000,
    "growthRate": 0.15,
    "churnRate": 0.02,
    "grossMargin": 0.72,
    "burnMonthly": 85000,
    "cashOnHand": 2400000
  }
}

// Response
{
  "success": true,
  "data": {
    "mrr": 50000,
    "arr": 600000,
    "arr12m": 7200000,
    "runway": 28,
    "rule40": 41,
    "ltv": 18000,
    "warnings": []
  }
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | Database connection failed |

---

## Rate Limiting

- **Analytics**: 1000 requests/minute per IP
- **All others**: 60 requests/minute per IP

Rate limit headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 950
X-RateLimit-Reset: 1709500000
```

---

## Implementation

### Hono Router Setup

```typescript
// workers/api/index.ts
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { rateLimit } from 'hono/rate-limit';

import experience from './routes/experience';
import viewer from './routes/viewer';
import analytics from './routes/analytics';
import metrics from './routes/metrics';
import model from './routes/model';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger());
app.use('*', rateLimit({
  window: 60000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false
}));

// Routes
app.get('/api/health', (c) => c.json({ 
  success: true, 
  data: { status: 'ok' } 
}));

app.route('/api/experience', experience);
app.route('/api/viewer', viewer);
app.route('/api/analytics', analytics);
app.route('/api/metrics', metrics);
app.route('/api/model', model);

// 404 handler
app.notFound((c) => c.json({
  success: false,
  error: { code: 'NOT_FOUND', message: 'Endpoint not found' }
}, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error' }
  }, 500);
});

export default app;
```

---

### Zod Schemas

```typescript
// lib/validators.ts
import { z } from 'zod';

export const ViewerSchema = z.object({
  slug: z.string().min(1).max(100),
  name: z.string().min(1).max(200),
  type: z.enum(['vc', 'lead', 'user', 'guest']).default('guest'),
  metadata: z.record(z.unknown()).optional()
});

export const EventSchema = z.object({
  type: z.enum([
    'scroll_enter', 'scroll_exit', 'interaction',
    'cta_click', 'slider_touch', 'video_play',
    'video_complete', 'audio_enable', 'audio_mute',
    'share', 'download'
  ]),
  chapter: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  dwellMs: z.number().optional(),
  timestamp: z.number()
});

export const AnalyticsIngestSchema = z.object({
  sessionId: z.string().min(1),
  experienceId: z.string().min(1),
  viewerId: z.string().optional(),
  events: z.array(EventSchema).min(1).max(50)
});
```

---

*Next: [Animation Guide](ANIMATION_GUIDE.md)*