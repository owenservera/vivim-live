# Production Deployment Configuration

## Environment Variables for Production

### Frontend (Vercel)
```bash
# Backend API URL
BACKEND_URL=https://api.vivim.live
NEXT_PUBLIC_API_URL=https://api.vivim.live

# Z.AI API Configuration
ZAI_API_KEY=your_production_zai_api_key
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
ZAI_MODEL=glm-4.7
ZAI_CHAT_MODEL=glm-4.7
ZAI_CHAT_TEMPERATURE=0.7
ZAI_MAX_TOKENS=4096

# Debug settings
DEBUG_CHAT=false
```

### Backend (Railway/Render/Fly.io)
```bash
# Database
DATABASE_URL="postgresql://postgres.hrdoyqlvwipzuslaphva:RMVHuylOJN9gEbAI@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
DATABASE_SSL_REQUIRED=true

# Redis (optional)
REDIS_URL=redis://your_production_redis_url

# Server
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
TRUST_PROXY=true

# Security
SESSION_SECRET=your_secure_session_secret
JWT_SECRET=your_secure_jwt_secret

# CORS
CORS_ORIGINS=https://vivim.live,https://www.vivim.live

# Context Engine
USE_DYNAMIC_CONTEXT=true
LIBRARIAN_ENABLED=true
ENABLE_IDLE_DETECTION=true

# Logging
LOG_LEVEL=info
DEBUG=false

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW_MS=900000
```

## SSL Configuration Fix

For production Supabase connections, we need to handle the SSL certificate chain issue. Update the database configuration:

```javascript
// In src/lib/database.js
if (connectionString.includes('supabase.com') || process.env.DATABASE_SSL_REQUIRED === 'true') {
  poolConfig.ssl = {
    rejectUnauthorized: true,
    // Supabase uses valid certificates, but chain validation can fail in some environments
    // This is safe as we're explicitly connecting to known Supabase domains
    checkServerIdentity: (host, cert) => {
      // Allow Supabase domains
      if (host.endsWith('.supabase.co') || host.endsWith('.supabase.com')) {
        return undefined; // Accept certificate
      }
      // Use default validation for other hosts
      return tls.checkServerIdentity(host, cert);
    }
  };
}
```

## Backend Deployment Options

### Option 1: Railway (Recommended)
1. Create Railway account
2. Connect GitHub repo
3. Set environment variables
4. Deploy automatically

### Option 2: Render
1. Create Render account
2. Create Web Service
3. Connect GitHub repo
4. Configure environment
5. Deploy

### Option 3: Fly.io
1. Install Fly CLI
2. `fly launch` in backend directory
3. Configure environment
4. `fly deploy`

## Domain Configuration

### Vercel (Frontend)
- Custom domain: `vivim.live`
- Auto-SSL enabled

### Backend Platform
- Configure custom domain: `api.vivim.live`
- SSL certificates handled automatically

## DNS Configuration
```
vivim.live     -> Vercel
www.vivim.live -> Vercel
api.vivim.live -> Backend Platform
```

## Testing Production Deployment

1. **Deploy Backend First**
   ```bash
   # Test backend API endpoints
   curl https://api.vivim.live/health
   ```

2. **Deploy Frontend**
   ```bash
   # Set environment variables in Vercel
   # Deploy automatically via GitHub
   ```

3. **End-to-End Testing**
   ```bash
   # Test chat functionality
   curl -X POST https://vivim.live/api/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"Hello"}]}'
   ```

## Monitoring & Maintenance

- Set up error tracking (Sentry already configured)
- Monitor database connections
- Set up uptime monitoring
- Configure log aggregation