# VIVIM Backend Integration Plan

> Graceful integration strategy for merging vivim-app/server into vivim-source-code (Next.js 15)

## Executive Summary

This plan outlines a phased, non-breaking integration of the comprehensive Express.js/Prisma backend into the existing Next.js application. The backend contains sophisticated features including AI conversation capture, memory management, social networking, and real-time sync - all built on a robust PostgreSQL + Redis stack.

## Current State Analysis

### Backend (vivim-app/server) - **SOURCE**
- **Runtime**: Bun
- **Framework**: Express.js 5.x
- **ORM**: Prisma 7.x with PostgreSQL + pgvector
- **Architecture**: Monolithic Express server with modular routes/services
- **Key Features**:
  - Multi-provider AI conversation capture (Claude, ChatGPT, Gemini, Grok, DeepSeek, Kimi, Qwen, ZAI, Mistral)
  - Sophisticated memory system with embeddings and semantic search
  - DID-based authentication with session support
  - Real-time sync with vector clocks
  - P2P networking (libp2p)
  - Social features (friends, circles, groups, teams, feeds)
  - Content sharing with access control
  - Import/export functionality
  - Context engine with bundles
  - Rendering templates system
- **Database**: 40+ Prisma models with vector search support
- **Dependencies**: ~100 packages (Playwright, Socket.io, ioredis, multiple AI SDKs, etc.)

### Frontend (vivim-source-code) - **TARGET**
- **Runtime**: Bun
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS 4 + Radix UI (shadcn/ui)
- **Current Database**: Supabase (basic schema, just set up)
- **Architecture**: SPA with API routes
- **Key Features**:
  - Landing page with glassmorphism design
  - Interactive demos for memory and context engine
  - Basic translation API
  - Geolocation API
- **Dependencies**: ~65 packages (Next.js ecosystem, UI components)

## Integration Challenges

### 1. Runtime Compatibility
- Backend uses Bun runtime with ES modules
- Next.js can run on Bun but requires proper configuration
- Server-side dependencies (Prisma, Playwright) need Edge compatibility considerations

### 2. Database Migration
- Backend: Prisma ORM with extensive schema (40+ models)
- Frontend: Supabase with basic schema (5 models)
- Decision needed: Keep Supabase or migrate to Prisma/PostgreSQL

### 3. Architecture Mismatch
- Backend: Express.js monolith with custom middleware
- Frontend: Next.js App Router with API routes
- Need to decide between:
  - **Option A**: Run Express server alongside Next.js (dual-server)
  - **Option B**: Port Express routes to Next.js API routes (full migration)
  - **Option C**: Keep backend separate as microservice (service-oriented)

### 4. Authentication Flow
- Backend: DID-based auth with Google OAuth fallback
- Frontend: Supabase auth (just configured)
- Need unified auth strategy or separate auth contexts

### 5. Real-time Features
- Backend: Socket.io + server-sent events
- Frontend: No real-time infrastructure
- Need to integrate WebSocket support

## Recommended Integration Strategy

### **PHASE 0: Decision Matrix & Setup**

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Database | **Keep Prisma + PostgreSQL, migrate Supabase to it** | Prisma schema is mature (40+ models), better performance, vector search support |
| Architecture | **Dual-server approach with gradual migration** | Faster to ship, allows testing backend features independently |
| Authentication | **Adopt DID-based auth from backend** | More sophisticated, supports crypto keys, better for sovereign identity |
| Runtime | **Continue using Bun for both** | Backend optimized for Bun, Next.js supports it |
| Deployment | **Monorepo structure with separate deployments** | Clear separation, easier to manage, can evolve independently |

### **PHASE 1: Foundation Setup (Week 1-2)**

#### 1.1 Monorepo Structure
```
vivim-live/
├── packages/
│   ├── frontend/           # Current Next.js app
│   ├── backend/           # Express.js server
│   └── shared/           # Shared types, utilities, constants
├── package.json           # Root package with workspaces
├── bun.lockb            # Shared lockfile
└── turbo.json            # Build orchestration (optional)
```

#### 1.2 Database Migration Setup
```sql
-- Create Prisma schema in Supabase PostgreSQL
-- Use supabase migrations to mirror Prisma schema
-- Keep Supabase auth.users table for now
-- Add prisma_migrations table to track sync
```

#### 1.3 Environment Configuration
```env
# Shared (root)
DATABASE_URL=postgresql://user:pass@host:5432/vivim
REDIS_URL=redis://localhost:6379
NODE_ENV=development

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Backend
PORT=3001
JWT_SECRET=...
SESSION_SECRET=...
PLAYWRIGHT_BROWSER_PATH=...
```

### **PHASE 2: Dual-Server Integration (Week 2-4)**

#### 2.1 Backend Server Setup
```bash
# Copy backend code to packages/backend
cp -r ../vivim-app/server/* packages/backend/

# Adjust port to 3001
# Update package.json scripts
```

#### 2.2 Frontend API Proxy
```typescript
// packages/frontend/next.config.ts
export default {
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:3001/api/v1/:path*',
      },
      {
        source: '/api/unified/:path*',
        destination: 'http://localhost:3001/api/unified/:path*',
      },
    ]
  }
}
```

#### 2.3 Authentication Bridge
```typescript
// packages/frontend/src/lib/auth-bridge.ts
import { createClient } from '@supabase/supabase-js'

// Bridge between Supabase and backend DID auth
export class AuthBridge {
  // Sync Supabase user to backend DID
  async syncUserToBackend(supabaseUser: any) {
    const response = await fetch('http://localhost:3001/api/v1/identity/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: supabaseUser.email,
        metadata: supabaseUser.user_metadata,
      })
    })
    return response.json()
  }

  // Get backend auth token
  async getBackendToken() {
    // Exchange Supabase session for backend token
    // or create new DID session
  }
}
```

#### 2.4 First Backend Feature Integration
**Target**: Conversation capture
```typescript
// packages/frontend/src/components/capture-form.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function CaptureForm() {
  const [url, setUrl] = useState('')
  const [capturing, setCapturing] = useState(false)

  const handleCapture = async () => {
    setCapturing(true)
    try {
      const response = await fetch('/api/v1/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      const data = await response.json()
      console.log('Captured:', data)
    } catch (error) {
      console.error('Capture failed:', error)
    } finally {
      setCapturing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="https://chat.openai.com/share/..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />
      <Button onClick={handleCapture} disabled={capturing}>
        {capturing ? 'Capturing...' : 'Capture Conversation'}
      </Button>
    </div>
  )
}
```

### **PHASE 3: Core Features Migration (Week 4-8)**

#### 3.1 Memory System
```typescript
// packages/frontend/src/lib/memory-client.ts
export class MemoryClient {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  async createMemory(data: CreateMemoryInput) {
    const response = await fetch(`${this.baseUrl}/api/v2/memories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify(data),
    })
    return response.json()
  }

  async searchMemories(query: string, filters?: MemoryFilters) {
    const response = await fetch(`${this.baseUrl}/api/v2/memories/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
      body: JSON.stringify({ query, filters }),
    })
    return response.json()
  }

  private getAuthToken() {
    // Get from localStorage or cookie
    return localStorage.getItem('backend_auth_token')
  }
}
```

#### 3.2 Conversation Management
```typescript
// packages/frontend/src/app/conversations/page.tsx
'use client'

import { useQuery } from '@tanstack/react-query'
import { MemoryClient } from '@/lib/memory-client'

const memoryClient = new MemoryClient()

export default function ConversationsPage() {
  const { data: conversations, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const response = await fetch('/api/v1/conversations', {
        headers: { 'Authorization': `Bearer ${memoryClient.getAuthToken()}` },
      })
      return response.json()
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <div className="space-y-4">
      {conversations?.map((conv) => (
        <div key={conv.id} className="p-4 border rounded-lg">
          <h3 className="font-semibold">{conv.title}</h3>
          <p className="text-sm text-gray-600">{conv.provider}</p>
        </div>
      ))}
    </div>
  )
}
```

#### 3.3 Real-time Integration
```typescript
// packages/frontend/src/lib/socket-client.ts
import { io, Socket } from 'socket.io-client'

export class SocketClient {
  private socket: Socket | null = null

  connect(userId: string) {
    this.socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      auth: { userId },
    })

    this.socket.on('connect', () => {
      console.log('Connected to backend')
    })

    this.socket.on('memory-updated', (data) => {
      // Handle real-time memory updates
      console.log('Memory updated:', data)
    })

    this.socket.on('conversation-sync', (data) => {
      // Handle conversation sync events
      console.log('Conversation synced:', data)
    })
  }

  disconnect() {
    this.socket?.disconnect()
  }
}
```

### **PHASE 4: Advanced Features (Week 8-12)**

#### 4.1 Social Features
- Implement friends, circles, groups
- Build feed components with real-time updates
- Add sharing dialogs with access control

#### 4.2 Context Engine
- Integrate context bundle UI
- Build context recipe editor
- Add context preview in chat interfaces

#### 4.3 Import/Export
- Add export UI for all data types
- Implement import validation
- Add data visualization for imports

### **PHASE 5: Migration & Optimization (Week 12-16)**

#### 5.1 Port Critical Routes to Next.js
```typescript
// Convert selected Express routes to Next.js API routes
// Start with highest-traffic routes:
// - /api/v1/capture → /app/api/v1/capture/route.ts
// - /api/v2/memories → /app/api/v2/memories/route.ts
// - /api/v2/memories/query → /app/api/v2/memories/query/route.ts
```

#### 5.2 Performance Optimization
- Implement caching strategy (Redis + Edge)
- Add database connection pooling
- Optimize bundle size with code splitting

#### 5.3 Edge Function Deployment
- Move read-only APIs to Edge functions
- Keep stateful operations on backend server
- Use Vercel Edge Network for global distribution

## Database Migration Strategy

### Option A: Full Prisma Migration (Recommended)

**Pros**:
- Mature schema (40+ models)
- Better performance with direct Prisma
- Vector search with pgvector
- Type-safe queries

**Steps**:
1. Set up PostgreSQL database (Supabase supports this)
2. Run Prisma migrations
3. Keep Supabase auth for user management
4. Migrate Supabase public tables to Prisma schema
5. Update frontend to use Prisma client (via API routes)

### Option B: Supabase-only

**Pros**:
- Simpler infrastructure
- Built-in auth
- Real-time subscriptions

**Cons**:
- Need to recreate 40+ models in Supabase
- Limited ORM features
- Need to migrate complex Prisma logic

**Steps**:
1. Create Supabase migrations for all Prisma models
2. Implement complex queries in SQL
3. Add edge functions for complex operations
4. Use Supabase JS client throughout frontend

**Decision**: Start with Option A, evaluate Option B if performance issues arise.

## Stepwise Tasks for Immediate Action

### Task 1: Monorepo Setup (Priority: P0)
```bash
# Create monorepo structure
mkdir packages
mkdir packages/frontend
mkdir packages/backend
mkdir packages/shared

# Move existing code
mv src/* packages/frontend/
mv ../vivim-app/server/* packages/backend/

# Create root package.json
cat > package.json << 'EOF'
{
  "name": "vivim-live",
  "version": "1.0.0",
  "private": true,
  "workspaces": ["packages/*"],
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd packages/backend && bun run dev",
    "dev:frontend": "cd packages/frontend && bun run dev",
    "build": "npm run build:backend && npm run build:frontend",
    "build:backend": "cd packages/backend && bun run build",
    "build:frontend": "cd packages/frontend && bun run build"
  }
}
EOF

# Install concurrently
bun add -d concurrently
```

### Task 2: Backend Port Configuration (Priority: P0)
```bash
# Update backend port to avoid conflict
cd packages/backend
sed -i 's/PORT=3000/PORT=3001/' .env.example
```

### Task 3: Next.js Config Rewrite (Priority: P0)
```typescript
// packages/frontend/next.config.ts
export default {
  // Existing config...
  async rewrites() {
    return [
      // Proxy all backend API calls
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*',
      },
    ]
  },
  // Add backend server to dependency list for dev
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
}
```

### Task 4: Shared Types Package (Priority: P1)
```typescript
// packages/shared/src/types/index.ts
export interface User {
  id: string
  did: string
  email?: string
  displayName?: string
  avatarUrl?: string
  createdAt: Date
}

export interface Memory {
  id: string
  userId: string
  content: string
  summary?: string
  memoryType: 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL' | 'FACTUAL'
  importance: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Conversation {
  id: string
  title: string
  provider: string
  sourceUrl: string
  messageCount: number
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  conversationId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
}
```

### Task 5: Environment Variable Sync (Priority: P1)
```bash
# Create shared environment file
cat > .env.example << 'EOF'
# Database (PostgreSQL with Supabase)
DATABASE_URL=postgresql://user:pass@host:5432/vivim
NEXT_PUBLIC_SUPABASE_URL=https://hrdoyqlvwipzuslaphva.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379

# Backend
PORT=3001
NODE_ENV=development
JWT_SECRET=generate-with-openssl
SESSION_SECRET=generate-with-openssl

# AI Providers
ZAI_API_KEY=...
OPENAI_API_KEY=...

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF
```

### Task 6: Authentication Integration (Priority: P1)
```typescript
// packages/shared/src/auth/index.ts
export interface AuthConfig {
  supabaseUrl: string
  supabaseAnonKey: string
  backendUrl: string
}

export class UnifiedAuthService {
  private supabase: any
  private backendUrl: string

  constructor(config: AuthConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey)
    this.backendUrl = config.backendUrl
  }

  async signInWithSupabase(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Sync to backend
    await this.syncUserToBackend(data.user)

    return data
  }

  async signInWithGoogle() {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider: 'google',
    })

    if (error) throw error

    // Redirect to backend callback
    window.location.href = `${this.backendUrl}/api/v1/auth/google/callback`
  }

  private async syncUserToBackend(user: any) {
    const response = await fetch(`${this.backendUrl}/api/v1/identity/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user.access_token}`,
      },
      body: JSON.stringify({
        email: user.email,
        metadata: user.user_metadata,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to sync user to backend')
    }
  }
}
```

### Task 7: Capture Feature Demo (Priority: P2)
```typescript
// packages/frontend/src/app/demo/capture/page.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function CaptureDemoPage() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCapture = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/v1/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Capture failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold">AI Conversation Capture</h1>

      <div className="space-y-4">
        <Input
          placeholder="Paste conversation URL here..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <Button onClick={handleCapture} disabled={loading || !url}>
          {loading ? 'Capturing...' : 'Capture Conversation'}
        </Button>
      </div>

      {result && (
        <div className="p-4 bg-green-50 border rounded-lg">
          <h2 className="font-semibold text-green-800">Capture Successful!</h2>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
```

## Testing Strategy

### Unit Tests
```bash
# Backend
cd packages/backend
bun test

# Frontend
cd packages/frontend
bun test
```

### Integration Tests
```typescript
// tests/integration/capture.spec.ts
import { describe, it, expect, beforeAll } from 'bun:test'
import { MemoryClient } from '../../packages/frontend/src/lib/memory-client'

describe('Conversation Capture Integration', () => {
  let memoryClient: MemoryClient

  beforeAll(() => {
    memoryClient = new MemoryClient()
  })

  it('should capture a conversation from ChatGPT', async () => {
    const result = await memoryClient.captureConversation({
      url: 'https://chat.openai.com/share/test',
    })

    expect(result).toBeDefined()
    expect(result.status).toBe('success')
    expect(result.data).toHaveProperty('messages')
  })

  it('should persist captured conversation to database', async () => {
    const conversations = await memoryClient.getConversations()
    expect(conversations.length).toBeGreaterThan(0)
  })
})
```

### E2E Tests
```bash
# Use Playwright for full-stack testing
bun run test:e2e
```

## Deployment Plan

### Development
```bash
# Start both servers
bun run dev

# Backend: http://localhost:3001
# Frontend: http://localhost:3000
```

### Production
```yaml
# vercel.json
{
  "buildCommand": "bun run build",
  "outputDirectory": "packages/frontend/.next",
  "installCommand": "bun install",
  "framework": "nextjs",
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "env": {
    "DATABASE_URL": "@database_url",
    "NEXT_PUBLIC_API_URL": "https://api.vivim.live",
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### Backend Deployment (VPS/Render/Railway)
```bash
# Deploy Express server separately
cd packages/backend
vercel deploy --prod
# Or use Railway/Render for long-running server
```

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Database schema conflicts | Use feature flags, gradual migration |
| Auth incompatibility | Build auth bridge, support both systems temporarily |
| Performance degradation | Load testing, caching strategy, CDN |
| Broken dependencies | Use lock files, test in staging first |
| Real-time failures | Fallback to polling, error boundaries |

## Success Metrics

### Phase 1
- [ ] Monorepo structure created
- [ ] Backend running on port 3001
- [ ] Frontend proxying to backend
- [ ] Basic auth bridge working

### Phase 2
- [ ] Capture feature integrated
- [ ] Conversation list view working
- [ ] Memory CRUD operations working
- [ ] Real-time sync functional

### Phase 3
- [ ] All core features migrated
- [ ] Social features deployed
- [ ] Context engine integrated
- [ ] Performance benchmarks met (<500ms p95)

## Next Steps

1. **Immediately**:
   - Create monorepo structure
   - Move backend code to `packages/backend`
   - Update Next.js config for API proxying

2. **This Week**:
   - Set up shared types package
   - Create auth bridge
   - Integrate first backend feature (capture)

3. **Next Month**:
   - Migrate core features
   - Set up real-time infrastructure
   - Begin database migration to Prisma

4. **Long-term**:
   - Port all routes to Next.js (optional)
   - Optimize for Edge deployment
   - Implement advanced features

## Conclusion

This integration plan prioritizes speed to market while maintaining the flexibility to evolve the architecture. The dual-server approach allows the team to ship backend features immediately while gradually migrating to a more unified architecture over time.

The key to success is maintaining clear separation between concerns and using well-defined interfaces (types, API contracts) to prevent tight coupling between frontend and backend code.
