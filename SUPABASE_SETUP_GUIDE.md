# VIVIM Supabase Setup & Connection Guide

## Overview
This document describes the complete Supabase setup for VIVIM, including database schema, connection configuration, SSL setup, and testing procedures for frontend-backend integration.

## Supabase Project Configuration

### Project Details
- **Project Name:** VIVIM Live
- **Project Reference:** `hrdoyqlvwipzuslaphva`
- **Region:** EU Central (Frankfurt)
- **Plan:** Free Tier

### Database Connection
```bash
# Pooler Connection (Production)
DATABASE_URL="postgresql://postgres.hrdoyqlvwipzuslaphva:RMVHuylOJN9gEbAI@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Direct Connection (Development)
# DATABASE_URL="postgresql://postgres.hrdoyqlvwipzuslaphva:RMVHuylOJN9gEbAI@db.hrdoyqlvwipzuslaphva.supabase.co:5432/postgres?sslmode=require"
```

## SSL Configuration

### SSL Certificate Setup
VIVIM uses embedded SSL certificates for secure Supabase connections:

**Certificate Location:** `google-search/prod-ca-2021.crt`
**Certificate Type:** Supabase Root CA 2021
**Issuer:** Supabase Inc

### SSL Configuration Logic
```javascript
// In packages/backend/src/lib/database.js
if (connectionString.includes('supabase.com') || process.env.DATABASE_SSL_REQUIRED === 'true') {
  if (process.env.NODE_ENV === 'production') {
    // Production: Use embedded certificate for proper SSL validation
    poolConfig.ssl = {
      rejectUnauthorized: true,
      ca: supabaseCert, // Embedded Supabase CA certificate
    };
  } else {
    // Development: Allow SSL bypass for compatibility
    poolConfig.ssl = { rejectUnauthorized: false };
  }
}
```

## Database Schema

### Core Tables (Deployed)

#### 1. Users/Profile Management
```sql
-- Supabase Auth integration
CREATE TABLE auth.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE,
    encrypted_password text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- VIVIM User Profiles
CREATE TABLE profiles (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    full_name text,
    avatar_url text,
    preferences jsonb DEFAULT '{}',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Foreign key constraint to Supabase auth
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
```

#### 2. Conversations
```sql
CREATE TABLE conversations (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    provider text NOT NULL,
    sourceUrl text NOT NULL UNIQUE,
    contentHash text,
    version integer NOT NULL DEFAULT 1,
    title text NOT NULL,
    model text,
    state text NOT NULL DEFAULT 'ACTIVE',
    visibility text NOT NULL DEFAULT 'private',
    createdAt timestamptz DEFAULT now(),
    updatedAt timestamptz DEFAULT now(),
    capturedAt timestamptz DEFAULT now(),
    messageCount integer NOT NULL DEFAULT 0,
    userMessageCount integer NOT NULL DEFAULT 0,
    aiMessageCount integer NOT NULL DEFAULT 0,
    totalWords integer NOT NULL DEFAULT 0,
    totalCharacters integer NOT NULL DEFAULT 0,
    totalTokens integer,
    totalCodeBlocks integer NOT NULL DEFAULT 0,
    totalImages integer NOT NULL DEFAULT 0,
    totalTables integer NOT NULL DEFAULT 0,
    totalLatexBlocks integer NOT NULL DEFAULT 0,
    totalMermaidDiagrams integer NOT NULL DEFAULT 0,
    totalToolCalls integer NOT NULL DEFAULT 0,
    metadata jsonb DEFAULT '{}',
    tags text[] DEFAULT '{}',
    virtualUserId text
);
```

#### 3. Messages
```sql
CREATE TABLE messages (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversationId text NOT NULL,
    role text NOT NULL,
    content text NOT NULL,
    model text,
    createdAt timestamptz DEFAULT now(),
    updatedAt timestamptz DEFAULT now(),
    metadata jsonb DEFAULT '{}',
    tokenCount integer
);
```

#### 4. Memories
```sql
CREATE TABLE memories (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    userId text,
    virtualUserId text,
    content text NOT NULL,
    summary text,
    importance float NOT NULL DEFAULT 0.5,
    relevance float NOT NULL DEFAULT 0.5,
    memoryType text NOT NULL DEFAULT 'EPISODIC',
    category text NOT NULL,
    tags text[] DEFAULT '{}',
    isActive boolean NOT NULL DEFAULT true,
    isPinned boolean NOT NULL DEFAULT false,
    createdAt timestamptz DEFAULT now(),
    updatedAt timestamptz DEFAULT now()
);
```

#### 5. Virtual Users
```sql
CREATE TABLE virtual_users (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    fingerprint text NOT NULL UNIQUE,
    metadata jsonb DEFAULT '{}',
    createdAt timestamptz DEFAULT now(),
    updatedAt timestamptz DEFAULT now()
);
```

#### 6. Context Recipes
```sql
CREATE TABLE context_recipes (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name text NOT NULL,
    description text,
    layerWeights jsonb DEFAULT '{}',
    excludedLayers text[] DEFAULT '{}',
    customBudget integer,
    isDefault boolean NOT NULL DEFAULT false,
    createdAt timestamptz DEFAULT now(),
    updatedAt timestamptz DEFAULT now()
);
```

## Environment Variables

### Backend Environment Variables
```bash
# Database
DATABASE_URL="postgresql://postgres.hrdoyqlvwipzuslaphva:RMVHuylOJN9gEbAI@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
DATABASE_SSL_REQUIRED=true

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

# Z.AI Integration
ZAI_API_KEY=your_production_zai_api_key
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
ZAI_MODEL=glm-4.7

# Context Engine
USE_DYNAMIC_CONTEXT=true
LIBRARIAN_ENABLED=true
ENABLE_IDLE_DETECTION=true
```

### Frontend Environment Variables (Vercel)
```bash
# Backend Connection
BACKEND_URL=https://api.vivim.live
NEXT_PUBLIC_API_URL=https://api.vivim.live

# Z.AI API
ZAI_API_KEY=your_production_zai_api_key
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
ZAI_CHAT_MODEL=glm-4.7
ZAI_CHAT_TEMPERATURE=0.7
ZAI_MAX_TOKENS=4096
DEBUG_CHAT=false
```

## API Endpoints for Testing

### Backend API Endpoints
```
GET  /health                    - Health check
GET  /api-docs                  - Swagger documentation
POST /api/v1/capture            - Capture conversation
GET  /api/v1/conversations      - List conversations
POST /api/v1/conversations      - Create conversation
GET  /api/v1/conversations/:id  - Get conversation
POST /api/v2/context-engine/assemble - Context assembly
```

### Frontend API Routes
```
POST /api/chat                  - Chat endpoint (proxies to backend)
```

## Testing Procedures

### Database State Check
```bash
# Quick database connectivity and state check
cd packages/backend && node check-db-state.js
```

### Virtual User Creation Test
```bash
# Comprehensive end-to-end virtual user testing
cd packages/backend && node test-virtual-user-creation.js
```

### Automated Tests
```bash
# Backend tests
cd packages/backend && npm test

# Frontend tests
cd packages/frontend && npm test

# Integration tests
cd packages/backend && npm run test:e2e
```

### Manual Testing Checklist

#### Database Connection
- [ ] Backend connects to Supabase
- [ ] SSL certificate validation works
- [ ] Database queries execute successfully

#### User Registration
- [ ] Virtual user fingerprint generated
- [ ] Virtual user record created in database
- [ ] Context settings initialized

#### Conversation Management
- [ ] Conversation created with virtual user ID
- [ ] Messages stored with conversation relationship
- [ ] Conversation metadata captured

#### Memory System
- [ ] Conversation processing triggers memory extraction
- [ ] Memories stored with virtual user association
- [ ] Memory importance and relevance calculated

#### Context Assembly
- [ ] Context engine assembles user-specific context
- [ ] Virtual user memories included in context
- [ ] Context recipes applied correctly

## Monitoring & Debugging

### Database Queries
```sql
-- Check virtual users
SELECT id, fingerprint, createdAt FROM virtual_users;

-- Check conversations by virtual user
SELECT c.id, c.title, c.virtualUserId, c.createdAt
FROM conversations c
WHERE c.virtualUserId = 'your-virtual-user-id';

-- Check memories by virtual user
SELECT m.id, m.content, m.importance, m.createdAt
FROM memories m
WHERE m.virtualUserId = 'your-virtual-user-id';

-- Check context settings
SELECT * FROM user_context_settings
WHERE virtualUserId = 'your-virtual-user-id';
```

### Application Logs
```bash
# Backend logs (check your deployment platform)
# Vercel logs: https://vercel.com/dashboard
# Railway logs: railway logs
```

### Common Issues & Solutions

#### SSL Certificate Errors
```javascript
// Check if SSL configuration is correct
console.log('SSL Config:', poolConfig.ssl);
```

#### Virtual User Not Created
```javascript
// Check if fingerprint header is sent
console.log('Fingerprint:', req.headers.get('x-user-fingerprint'));
```

#### Context Not Assembling
```javascript
// Check if virtual user exists
const virtualUser = await prisma.virtualUser.findUnique({
  where: { fingerprint: userFingerprint }
});
console.log('Virtual User:', virtualUser);
```

## Next Steps

1. **Deploy Backend**: Use Railway/Render/Fly.io to deploy backend
2. **Configure Environment**: Set production environment variables
3. **Test Integration**: Run the testing procedures above
4. **Monitor Logs**: Check for any connection or data persistence issues
5. **Optimize**: Fine-tune virtual user creation and context assembly

This setup provides a solid foundation for testing frontend-backend integration and building out the virtual user experience.