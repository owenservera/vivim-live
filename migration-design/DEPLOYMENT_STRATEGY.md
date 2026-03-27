# Deployment & Environment Strategy

## Current Deployment

The project currently has no CI/CD pipeline and is deployed manually.

---

## Environment Variables

### Required Variables

```bash
# .env.local (development)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_ANALYTICS_ID=development

# .env.production
NEXT_PUBLIC_BASE_URL=https://vivim.live
NEXT_PUBLIC_ANALYTICS_ID=prod_xxxxx
```

### Recommended Variables

```bash
# .env.production
# Analytics
NEXT_PUBLIC_ANALYTICS_ID=prod_xxxxx

# Feature Flags
NEXT_PUBLIC_ENABLE_AUDIO=true
NEXT_PUBLIC_ENABLE_PARTICLES=true
NEXT_PUBLIC_ENABLE_3D=false

# Performance
NEXT_PUBLIC_PARTICLE_COUNT_DESKTOP=150000
NEXT_PUBLIC_PARTICLE_COUNT_MOBILE=30000
```

### Access Variables (Server-Side Only)

```bash
# These should NEVER be exposed to client
# API keys for analytics services
ANALYTICS_WRITE_KEY=sk_xxxxx

# Database (future)
TURSO_URL=libsql://xxxxx
TURSO_TOKEN=xxxxx

# Auth (future)
AUTH_SECRET=xxxxx
```

---

## Environment TypeScript Types

```typescript
// lib/config/env.ts
interface Env {
  // Public (exposed to client)
  readonly NEXT_PUBLIC_BASE_URL: string;
  readonly NEXT_PUBLIC_ANALYTICS_ID: string;
  readonly NEXT_PUBLIC_ENABLE_AUDIO: string;
  readonly NEXT_PUBLIC_ENABLE_PARTICLES: string;
  
  // Server-only
  readonly ANALYTICS_WRITE_KEY?: string;
  readonly TURSO_URL?: string;
  readonly TURSO_TOKEN?: string;
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
```

---

## CI/CD Pipeline (GitHub Actions)

### Workflow: `deploy.yml`

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Type check
        run: bun run typecheck
      
      - name: Lint
        run: bun run lint
      
      - name: Build
        run: bun run build
      
      - name: Run tests
        run: bun test

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
      
      - name: Install dependencies
        run: bun install
      
      - name: Build
        run: bun run build
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

### Environment-Specific Builds

```yaml
# Deploy to preview on PR
deploy-preview:
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - uses: oven-sh/setup-bun@v1
    - run: bun install && bun run build
    - name: Deploy Preview
      uses: amondnet/vercel-action@v25
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
        vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
        github-token: ${{ secrets.GITHUB_TOKEN }}
```

---

## Deployment Platforms

### Recommended: Vercel

The current Next.js project is optimized for Vercel:

```bash
# Install Vercel CLI
bun add -g vercel

# Deploy
vercel --prod
```

### Alternative: Cloudflare Pages

The Cinematic Platform specifies Cloudflare Workers, but Vercel is simpler for Next.js.

---

## Rollback Strategy

### Vercel Rollback

```bash
# List deployments
vercel ls

# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Git Rollback

```bash
# Find the last working commit
git log --oneline -20

# Rollback to specific commit
git revert [commit-hash]

# Force push (if needed - USE WITH CAUTION)
git push origin main --force
```

### CI/CD Rollback

```bash
# GitHub Actions - redeploy previous workflow
gh run list --workflow=deploy.yml
gh run rerun [run-id]
```

---

## Health Checks

### Endpoint: `/api/health`

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    timestamp: Date.now(),
    version: process.env.npm_package_version,
    uptime: process.uptime()
  });
}
```

### Monitoring

```yaml
# Uptime monitoring (e.g., Grafana, Pingdom)
- url: https://vivim.live/api/health
  interval: 5m
  timeout: 30s
```

---

## CDN & Asset Strategy

### Static Assets

```typescript
// next.config.ts
const nextConfig = {
  images: {
    domains: ['vivim.live', 'cdn.vivim.live'],
    formats: ['image/avif', 'image/webp'],
  },
  
  // Aggressive caching for static assets
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ],
    },
  ],
};
```

### Analytics Endpoint

```typescript
// Should use beacon API for fire-and-forget
navigator.sendBeacon('/api/analytics', JSON.stringify(events));
```

---

## Checklist

- [ ] Create `.env.example` file
- [ ] Set up GitHub Actions workflow
- [ ] Configure Vercel project
- [ ] Set up environment secrets
- [ ] Add health check endpoint
- [ ] Configure CDN caching rules
- [ ] Set up monitoring/alerting
- [ ] Document rollback procedure
- [ ] Test CI/CD pipeline
- [ ] Create runbook for common issues

---

*Related: [DECISIONS_LOG.md](DECISIONS_LOG.md) for open decisions*
