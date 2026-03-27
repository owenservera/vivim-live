# Deployment Guide

## Overview

The Cinematic Platform deploys to **Cloudflare Pages** with API routes on **Cloudflare Workers**. This provides:
- Global edge deployment with <50ms latency
- Zero cold starts
- No cost for low-traffic (generous free tier)
- Integrated Workers for API backend

---

## Prerequisites

```bash
# Required tools
- Node.js 20+ (for native fetch, module support)
- npm or pnpm
- Cloudflare account
- Turso account (libSQL database)

# Optional
- Wrangler CLI (npm install -g wrangler)
```

---

## Step 1: Configure Environment

```bash
# Create .env file
TURSO_URL=libsql://your-db.turso.io
TURSO_TOKEN=your-turso-token
SESSION_SECRET=random-32-char-string-for-session-encryption
```

---

## Step 2: Database Setup

```bash
# Using Turso CLI
turso db create cinematic-platform
turso db list

# Get connection URL
turso db show cinematic-platform

# Or use HTTP endpoint
export TURSO_URL="https://libsql://your-db.turso.io"
```

```sql
-- Apply schema
# From the Turso shell or using a migration tool
-- See DATA_SCHEMA.md for full schema
```

---

## Step 3: Wrangler Configuration

```toml
# wrangler.toml
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
database_id = "your-d1-database-id"

[env.production]
vars = { ENVIRONMENT = "production" }
```

---

## Step 4: Build

```bash
# Development build (for local testing)
npm run build

# Production build
npm run build -- --mode production
```

---

## Step 5: Deploy to Cloudflare

### Option A: CLI Deployment

```bash
# Deploy Pages + Workers
npm run deploy

# Or with Wrangler directly
wrangler pages deploy .svelte-kit/cloudflare
```

### Option B: GitHub Integration

1. Connect GitHub repository in Cloudflare Dashboard
2. Select branch to deploy (typically `main`)
3. Set build command: `npm run build`
4. Set output directory: `.svelte-kit/cloudflare`
5. Add environment variables in Cloudflare settings

### Option C: Manual Upload

```bash
# Create a _routes.json for Pages functions
echo '[]' > .svelte-kit/cloudflare/_routes.json

# Upload via dashboard
# Settings > Pages > Deployments > Upload
```

---

## Environment Configuration

### Production Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TURSO_URL` | Database connection URL | `libsql://db.turso.io` |
| `TURSO_TOKEN` | Database auth token | `eyJ...` |
| `SESSION_SECRET` | Session encryption key | 32-char random string |
| `ENVIRONMENT` | Environment identifier | `production` |

### Development Variables

```bash
# .dev.vars (for wrangler dev)
TURSO_URL=libsql://localhost:8080
TURSO_TOKEN=dev-token
SESSION_SECRET=dev-secret-key-123456789012345
```

---

## Local Development

```bash
# Start local dev server with Cloudflare bindings
npm run dev

# Or with Wrangler (for API testing)
wrangler dev --local

# TypeScript check
npm run check

# Format check
npm run format
```

---

## Testing Deployment

```bash
# Check deployment status
wrangler pages deployment list

# View logs
wrangler pages project list
wrangler pages deployment tail

# Or from Cloudflare Dashboard:
# Workers & Pages > Cinematic Platform > Logs
```

---

## Performance Optimization

### Cache Headers

Configure in `wrangler.toml`:

```toml
[[routes]]
pattern = "/*"
headers = {
  "Cache-Control" = "public, max-age=0, must-revalidate"
}

[[redirects]]
from = "/_app/*"
to = "/.svelte-kit/cloudflare/_app/:splat"
status = 200
```

### Edge Functions

The API routes run on the Cloudflare Edge. For optimal performance:
- Keep payloads small
- Use prepared statements for DB queries
- Implement caching where appropriate

---

## Troubleshooting

### Common Issues

**Build fails with "Cannot find module"**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Database connection fails**
```bash
# Check Turso URL format
# Should be: libsql://org-db.turso.io
# Not: https://org-db.turso.io
```

**CORS errors in development**
```bash
# Add to wrangler.toml
[dev]
url = "localhost:8788"
```

**Assets not loading**
```bash
# Check static folder is properly configured
# Ensure build output is in .svelte-kit/cloudflare
ls -la .svelte-kit/cloudflare
```

---

## Monitoring

### Cloudflare Dashboard

- **Analytics**: Real-time requests, bandwidth, errors
- **Workers**: Execution time, memory, invocations
- **D1**: Query count, row reads/writes

### Logging

```typescript
// In API routes for debugging
console.log('Request:', c.req.path, c.req.method);
```

View logs:
```bash
wrangler pages deployment tail
```

---

## CI/CD Example

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          TURSO_URL: ${{ secrets.TURSO_URL }}
          TURSO_TOKEN: ${{ secrets.TURSO_TOKEN }}
          
      - name: Deploy to Cloudflare
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy .svelte-kit/cloudflare --project-name=cinematic-platform
```

---

## Security Checklist

- [ ] `SESSION_SECRET` is random and not committed
- [ ] API routes validate all input with Zod
- [ ] Database uses prepared statements
- [ ] CORS configured appropriately
- [ ] No sensitive data in client-side code
- [ ] Environment variables are set in Cloudflare, not in code

---

*Next: [Extensibility Guide](EXTENSIBILITY.md)*