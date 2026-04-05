# Production Environment Configuration

## Frontend (Vercel) Environment Variables

Set these in Vercel dashboard for production:

```bash
# Backend API Configuration
BACKEND_URL=https://vivim-api-production.up.railway.app
NEXT_PUBLIC_API_URL=https://vivim-api-production.up.railway.app

# Z.AI API Configuration (Production Keys)
ZAI_API_KEY=your_production_zai_api_key_here
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
ZAI_CHAT_MODEL=glm-4.7
ZAI_CHAT_TEMPERATURE=0.7
ZAI_MAX_TOKENS=4096

# Chat Configuration
DEBUG_CHAT=false

# Build Configuration
NODE_ENV=production
NEXT_PUBLIC_NODE_ENV=production
```

## Backend (Railway) Environment Variables

```bash
# Database Configuration
DATABASE_URL=postgresql://postgres.hrdoyqlvwipzuslaphva:RMVHuylOJN9gEbAI@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require
DATABASE_SSL_REQUIRED=true

# Server Configuration
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
TRUST_PROXY=true

# Security (Generate secure random strings)
SESSION_SECRET=your-secure-session-secret-here
JWT_SECRET=your-secure-jwt-secret-here

# CORS Configuration
CORS_ORIGINS=https://vivim.live,https://www.vivim.live

# Z.AI Integration
ZAI_API_KEY=your_production_zai_api_key_here
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
ZAI_MODEL=glm-4.7

# Context Engine Configuration
USE_DYNAMIC_CONTEXT=true
LIBRARIAN_ENABLED=true
ENABLE_IDLE_DETECTION=true

# Logging Configuration
LOG_LEVEL=info
DEBUG=false

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

## Domain Configuration

### Vercel Custom Domain
- Domain: `vivim.live`
- Configure in Vercel dashboard
- Set up DNS records as instructed by Vercel

### Railway Custom Domain
- Domain: `api.vivim.live`
- Configure in Railway dashboard
- Point CNAME to Railway's domain

## SSL Certificates

### Automatic SSL
- **Vercel**: Automatic SSL for `vivim.live`
- **Railway**: Automatic SSL for backend domain
- **Supabase**: SSL handled by Supabase

### Certificate Chain
- Supabase Root CA 2021 certificate embedded in application
- SSL validation enabled in production
- SSL bypass used in development

## Build Commands

### Frontend (Vercel)
```bash
# Build Command (automatic)
next build

# Install Command (automatic)
npm install
```

### Backend (Railway)
```bash
# Build Command
cd packages/backend && npm run build

# Start Command
cd packages/backend && npm start
```

## Health Checks

### Frontend Health
```bash
curl https://vivim.live/api/chat -X GET
# Expected: {"status":"ok","service":"vivim-chat",...}
```

### Backend Health
```bash
curl https://api.vivim.live/health
# Expected: {"status":"ok","timestamp":"...","version":"..."}

curl https://api.vivim.live/api/v2/context-engine/health
# Expected: Context engine health response
```

## Monitoring & Logs

### Vercel Monitoring
- Dashboard: https://vercel.com/dashboard
- Logs: Real-time deployment logs
- Analytics: Performance metrics

### Railway Monitoring
- Dashboard: Railway project dashboard
- Logs: Application logs
- Metrics: CPU, memory, network usage

### Supabase Monitoring
- Dashboard: Supabase project dashboard
- Database: Query performance, connection count
- API: Request logs, error rates

## Rollback Plan

### Frontend Rollback
1. Go to Vercel dashboard
2. Select previous deployment
3. Click "Rollback"

### Backend Rollback
1. Go to Railway dashboard
2. Roll back to previous deployment
3. Or redeploy previous git commit

### Database Rollback
1. Supabase maintains backups
2. Restore from backup if needed
3. Schema migrations are versioned

## Performance Expectations

### Frontend (Vercel)
- First load: < 2 seconds
- Subsequent loads: < 500ms
- API calls: < 1 second

### Backend (Railway)
- API response time: < 500ms
- Context assembly: < 2 seconds
- Database queries: < 100ms

### Database (Supabase)
- Connection pool: 10-20 connections
- Query performance: < 50ms average
- SSL overhead: Minimal impact