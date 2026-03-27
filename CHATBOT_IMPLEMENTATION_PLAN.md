# VIVIM Assistant-UI Chatbot Implementation Plan

## Overview

**Project:** VIVIM Chatbot Frontend  
**Framework:** Next.js 15 + React 19  
**UI Library:** assistant-ui + Tailwind CSS v4  
**Backend:** `packages/backend` (Express + Prisma + Vercel AI SDK)

---

## Current State

### Completed Components
- `src/app/chat/page.tsx` - Chat page layout with VIVIM branding
- `src/components/assistant-ui/thread.tsx` - Thread primitive with custom styling
- `src/components/assistant-ui/message.tsx` - Message rendering components
- `src/components/chat/chat-provider.tsx` - Runtime provider with local runtime
- `src/lib/chat/context.ts` - Dual context builder (stub implementation)
- `src/types/chat.ts` - TypeScript types for chat and dual context

### Missing / Next Steps
- `/api/chat` endpoint (proxies to backend)
- Update `chat-provider.tsx` to call local API
- Integrate dual-engine orchestrator into chatbot route
- Thread persistence via backend
- Tool registration for memory/doc queries

---

## Implementation Phases

### Phase 1: Next.js Chat API Route (Proxy to Backend)

**File:** `src/app/api/chat/route.ts`

Creates an API route in Next.js that proxies requests to the backend:

- Receives messages from frontend
- Forwards to backend context engine
- Streams response back to frontend

**Tasks:**
1. Create `/api/chat` route handler
2. Implement SSE streaming response  
3. Add error handling and validation

---

### Phase 2: Backend Integration

**Context Architecture:**

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Dual Context System                              │
├──────────────────────────┬──────────────────────────────────────────┤
│      USER Context        │         DOCS Context                     │
├──────────────────────────┼──────────────────────────────────────────┤
│ • virtualUser (Prisma)   │ • docCorpus / docChunk (Prisma)          │
│ • memoryBlock (ACUs)     │ • semantic search                         │
│ • topicProfile           │ • keyword search                          │
│ • entityProfile          │ • reranking                               │
├──────────────────────────┼──────────────────────────────────────────┤
│  Backend Services:       │  Backend Services:                      │
│  - MemoryRetrieval       │  - CorpusRetrievalService                │
│  - ProfileEvolver        │  - ContextAssembler                      │
│  - SessionExtractor      │  - QA matching                            │
└──────────────────────────┴──────────────────────────────────────────┘
```

**Backend Endpoints Used:**
- `POST /api/v2/context-engine/assemble` → Get full context
- `POST /api/v2/memories/query` → Search user memories
- `POST /api/docs` → Search documentation corpus

**Tasks:**
1. Update `chat-provider.tsx` to call local `/api/chat`
2. Create backend client helper in `src/lib/chat/backend.ts`
3. Integrate `DualEngineOrchestrator` into chatbot route

---

### Phase 3: Runtime & State Management

**Current:** `useLocalRuntime` (in-browser state only)

**Options for Production:**
| Option | Package | Use Case |
|--------|---------|----------|
| Cloud Persistence | `assistant-cloud` | Full-managed threads |
| Custom Thread List | `@assistant-ui/react` + custom API | Self-hosted threads |
| External Store | `useExternalStoreRuntime` | Redux/Zustand state |

**Recommended:** Custom Thread List with Supabase backend

**Tasks:**
1. Create thread management API endpoints
2. Implement thread list component
3. Add thread persistence (create, load, archive, delete)
4. Configure runtime for multi-thread support

---

### Phase 4: Tools & Capabilities

**Enable AI tools for:**
- Database queries (user memory, preferences)
- Semantic search (docs corpus)
- Context injection
- Memory updates

**Tasks:**
1. Register tools via `makeAssistantTool`
2. Create tool UI components with `makeAssistantToolUI`
3. Implement tool handlers that query Supabase

---

### Phase 5: UI Enhancements

**Available primitives to add:**
- `ThreadListPrimitive` - Conversation list sidebar
- `SuggestionPrimitive` - Quick-start prompts
- `AttachmentPrimitive` - File uploads
- `ChainOfThoughtPrimitive` - Reasoning display
- `BranchPickerPrimitive` - Message branching

**Styling:**
- Already uses Tailwind with custom VIVIM theme
- Extend with `@assistant-ui/react-markdown` for rich text
- Add `@assistant-ui/react-syntax-highlighter` for code blocks

---

## Backend Integration (packages/backend)

### Backend Architecture

The backend is a mature Express server with:
- **Runtime:** Bun + Express
- **Database:** Prisma (PostgreSQL)
- **AI:** Vercel AI SDK with multiple providers (OpenAI, Anthropic, Google, xAI)
- **Context System:** Full dual-engine orchestration (USER + DOCS CORPUS)

### Key Endpoints for Chatbot

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v2/context-engine/assemble` | POST | Get full context for chat |
| `/api/v2/context-engine/assemble/stream` | POST | Streaming context delivery |
| `/api/v2/context-engine/health` | GET | Engine health check |
| `/api/v2/context-engine/settings/:userId` | GET/PUT | User context settings |
| `/api/v2/memories` | POST/GET | Memory CRUD |
| `/api/v2/memories/query` | POST | Semantic memory search |
| `/api/v1/chatbot/:tenantSlug/chat` | POST | Chat with dual-engine (stub) |
| `/api/docs` | POST | Doc search (corpus) |

### Wiring Design

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (Next.js)                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  assistant-ui Runtime                                                       │
│  ├── ThreadPrimitive (messages)                                            │
│  ├── ComposerPrimitive (input)                                             │
│  └── ChatProvider (runtime wrapper)                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                     Next.js API Route                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│  src/app/api/chat/route.ts                                                  │
│  ├── Receives: messages[], threadId                                         │
│  ├── Builds: DualContext via backend                                        │
│  └── Streams: SSE response back to frontend                                │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ (HTTP)
┌─────────────────────────────────────────────────────────────────────────────┐
│                    Backend (packages/backend)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Express Server (Bun)                                                       │
│  ├── Routes:                                                                │
│  │   ├── /api/v2/context-engine/* → Context assembly + streaming          │
│  │   ├── /api/v2/memories/* → Memory retrieval                            │
│  │   └── /api/docs → Doc corpus search                                    │
│  ├── Services:                                                              │
│  │   ├── DualEngineOrchestrator → Merges USER + DOCS context              │
│  │   ├── UnifiedContextService → Context generation                      │
│  │   ├── MemoryRetrievalService → User memory                             │
│  │   └── CorpusRetrievalService → Docs corpus                            │
│  └── AI SDK: OpenAI, Anthropic, Google, xAI                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                      Database (Prisma/PostgreSQL)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│  Tables:                                                                    │
│  ├── virtualUser → User profiles, preferences                              │
│  ├── virtualConversation → Chat threads                                    │
│  ├── virtualMessage → Chat messages                                         │
│  ├── memoryBlock → User memories (ACUs)                                    │
│  ├── topicProfile → User interests                                         │
│  ├── entityProfile → Known entities                                        │
│  ├── contextBundle → Compiled context bundles                              │
│  └── docCorpus / docChunk → Documentation corpus                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Integration Steps

#### Step 1: Create Next.js Chat API Route

**File:** `src/app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { messages, threadId, userId } = await req.json();
  
  // Build dual context via backend
  const contextResponse = await fetch(
    `${process.env.BACKEND_URL}/api/v2/context-engine/assemble`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        userId,
        conversationId: threadId,
        userMessage: messages[messages.length - 1]?.content,
      }),
    }
  );
  
  const context = await contextResponse.json();
  
  // Stream chat response
  const chatResponse = await fetch(
    `${process.env.BACKEND_URL}/api/v1/ai/chat`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': userId,
      },
      body: JSON.stringify({
        messages,
        systemPrompt: context.systemPrompt,
        providerId: context.providerId,
        modelId: context.modelId,
      }),
    }
  });
  
  // Return as SSE
  return new NextResponse(chatResponse.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
    },
  });
}
```

#### Step 2: Update ChatProvider

**File:** `src/components/chat/chat-provider.tsx`

```typescript
// Update adapter to call local Next.js API
const adapter: ChatModelAdapter = {
  async *run({ messages, abortSignal }) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        threadId,
        userId: 'current-user', // Get from auth
      }),
      signal: abortSignal,
    });
    
    // Parse SSE stream
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    let fullContent = '';
    
    while (true) {
      const { done, value } = await reader?.read() ?? {};
      if (done) break;
      
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          
          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              yield { content: [{ type: 'text', text: fullContent }] };
            }
          } catch {}
        }
      }
    }
  },
};
```

#### Step 3: Add Environment Variables

**File:** `.env.local`

```env
# Backend
BACKEND_URL=http://localhost:3000

# Or for production
# BACKEND_URL=https://your-backend-domain.com
```

#### Step 4: Implement Chatbot Endpoint (Backend)

The existing `/api/v1/chatbot/:tenantSlug/chat` endpoint needs integration with the dual-engine orchestrator:

**File:** `packages/backend/src/routes/chatbot/index.ts`

```typescript
// Replace placeholder with actual orchestrator
router.post('/:tenantSlug/chat', virtualUserAutoAuth, async (req: Request, res: Response) => {
  // ... existing setup ...
  
  // Get context from context engine
  const contextResult = await unifiedContextService.generateContextForChat(conversationId, {
    userId: virtualUserId,
    userMessage: message,
  });
  
  // Use AI SDK to generate response with context
  const result = await generateText({
    model: openai('gpt-4o'),
    messages: [
      { role: 'system', content: contextResult.systemPrompt },
      ...messages.map(m => ({ role: m.role, content: m.content })),
    ],
    stream: true,
  });
  
  // Stream response
  res.setHeader('Content-Type', 'text/event-stream');
  for await (const chunk of result) {
    res.write(`data: ${JSON.stringify(chunk)}\n\n`);
  }
  res.write('data: [DONE]\n\n');
  res.end();
});
```

### Context Flow

1. **User sends message** → `ComposerPrimitive` captures input
2. **Runtime triggers adapter** → Calls `/api/chat`
3. **Next.js API receives** → Forwards to backend context engine
4. **Backend assembles context:**
   - `unifiedContextService.generateContextForChat()`
   - Fetches user memory + docs corpus
   - Runs dual-engine orchestration
   - Returns system prompt + budget
5. **AI generates response** → With full context
6. **Stream back** → SSE to frontend
7. **UI renders** → `ThreadPrimitive` displays

### Files to Create/Update

| File | Action | Purpose |
|------|--------|---------|
| `src/app/api/chat/route.ts` | Create | Proxy to backend |
| `src/components/chat/chat-provider.tsx` | Update | Use local API |
| `.env.local` | Update | Add BACKEND_URL |
| `packages/backend/src/routes/chatbot/index.ts` | Update | Integrate orchestrator |

---

## File Structure

```
src/
├── app/
│   ├── chat/
│   │   └── page.tsx          ✅ Existing chat page
│   └── api/
│       └── chat/
│           └── route.ts      🔲 Create - proxy to backend
├── components/
│   ├── assistant-ui/
│   │   ├── thread.tsx        ✅ Existing
│   │   ├── message.tsx       ✅ Existing
│   │   └── thread-list.tsx   🔲 Create - conversation list
│   └── chat/
│       ├── chat-provider.tsx ✅ Existing (needs update)
│       └── tools.ts          🔲 Create - tool definitions
├── lib/
│   ├── chat/
│   │   ├── context.ts        ✅ Existing (stub)
│   │   └── backend.ts       🔲 Create - backend client
│   └── utils.ts              ✅ Existing
└── types/
    └── chat.ts               ✅ Existing

packages/backend/
├── src/
│   ├── server.js             ✅ Existing
│   ├── routes/
│   │   ├── chatbot/
│   │   │   └── index.ts      🔲 Update - integrate orchestrator
│   │   └── context-engine.ts ✅ Existing - context API
│   └── services/
│       ├── orchestrator/
│       │   └── dual-engine-orchestrator.ts  🔲 Integrate
│       └── unified-context-service.ts      ✅ Existing
└── prisma/
    └── schema.prisma         ✅ Existing - database schema
```

## Dependencies

```bash
# Frontend (already installed)
npm install @assistant-ui/react
npm install @radix-ui/react-* tailwindcss framer-motion

# For production (optional)
npm install assistant-cloud        # Cloud persistence
npm install @assistant-ui/react-markdown  # Rich text
npm install @assistant-ui/react-syntax-highlighter  # Code highlighting

# Backend (already installed in packages/backend)
# Uses: ai@^6.0.82, @prisma/client, express
```

## Environment Variables

**Frontend (.env.local):**
```env
BACKEND_URL=http://localhost:3000
```

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
# ... other provider keys
```

## Next Steps

1. **Immediate:** Create `/api/chat` route in Next.js to proxy to backend
2. **Short-term:** Update `chat-provider.tsx` to use local API
3. **Medium-term:** Integrate dual-engine orchestrator into chatbot route
4. **Long-term:** Add thread persistence, tools, and production features

---

## Key Integration Points

### 1. Context Assembly
- Backend: `POST /api/v2/context-engine/assemble`
- Returns: `systemPrompt`, `layers`, `providerId`, `modelId`

### 2. Chat Generation  
- Backend: `POST /api/v1/ai/chat` (or update chatbot endpoint)
- Accepts: `messages[]`, `systemPrompt`, `providerId`, `modelId`
- Returns: SSE stream

### 3. Memory Retrieval
- Backend: `POST /api/v2/memories/query`
- Semantic search over user memories

### 4. Docs Search
- Backend: `POST /api/docs`
- Search documentation corpus