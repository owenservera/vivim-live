# VIVIM Chatbot Implementation Documentation

> **Version:** 1.0.0  
> **Status:** Working Prototype with Stub Context  
> **Last Updated:** 2026-03-27

---

## Table of Contents

1. [Overview](#1-overview)
2. [Architecture](#2-architecture)
3. [File Structure](#3-file-structure)
4. [Components Reference](#4-components-reference)
5. [API Reference](#5-api-reference)
6. [Context Engine](#6-context-engine)
7. [Configuration](#7-configuration)
8. [Usage Guide](#8-usage-guide)
9. [Backend Integration Guide](#9-backend-integration-guide)
10. [Customization](#10-customization)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Overview

### What Was Built

A fully functional chatbot prototype integrated into the VIVIM website using:

- **Frontend:** assistant-ui library with custom glassmorphism styling
- **Backend:** Z.AI API with streaming responses (SSE)
- **Context System:** Stub implementation (ready for Supabase)

### Key Features

| Feature | Status | Notes |
|---------|--------|-------|
| Real-time streaming | ✅ Working | SSE from Z.AI |
| Message history | ✅ Working | Per-session (no persistence yet) |
| Dual context badges | ✅ Working | Shows USER/DOCS context active |
| Copy/Regenerate | ✅ Working | Action bar on assistant messages |
| Glassmorphism UI | ✅ Working | Matches VIVIM design system |
| Supabase persistence | 🔲 Ready | Requires backend implementation |
| Semantic search | 🔲 Ready | Requires pgvector setup |

### Tech Stack

```
Next.js 15 (App Router)
├── @assistant-ui/react@0.12.21
├── @assistant-ui/react-markdown@0.12.7
├── Tailwind CSS 4
├── Framer Motion 12
├── Z.AI API (glm-4.7)
└── TypeScript 5
```

---

## 2. Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                               │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  /chat page                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────┐  │  │
│  │  │  ChatProvider                                            │  │  │
│  │  │  ├── useLocalRuntime(adapter)                           │  │  │
│  │  │  └── AssistantRuntimeProvider                           │  │  │
│  │  │      └── Thread                                         │  │  │
│  │  │          ├── Header (context badges)                    │  │  │
│  │  │          ├── Viewport (messages)                        │  │  │
│  │  │          │   ├── UserMessage                            │  │  │
│  │  │          │   └── AssistantMessage                       │  │  │
│  │  │          └── Composer (input + send)                    │  │  │
│  │  └─────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /api/chat
                                    │ { messages, context, threadId }
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         NEXT.JS API ROUTE                            │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  /api/chat/route.ts                                           │  │
│  │  ├── Validate request                                         │  │
│  │  ├── buildDualContext(userId) → { user, docs }               │  │
│  │  ├── buildSystemPrompt(context) → system message             │  │
│  │  └── Fetch Z.AI with stream: true                            │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ POST /chat/completions
                                    │ Authorization: Bearer {API_KEY}
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                            Z.AI API                                  │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  Model: glm-4.7                                               │  │
│  │  Temperature: 0.7                                             │  │
│  │  Max Tokens: 4096                                             │  │
│  │  Stream: true (SSE)                                           │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Response: Server-Sent Events                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  data: {"choices":[{"delta":{"content":"Hello"}}]}            │  │
│  │  data: {"choices":[{"delta":{"content":" there"}}]}           │  │
│  │  data: [DONE]                                                 │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ SSE Stream (passthrough)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND RUNTIME                             │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │  ChatProvider adapter.run()                                   │  │
│  │  ├── Parse SSE chunks                                         │  │
│  │  ├── Accumulate content                                       │  │
│  │  └── yield { content: [{ type: "text", text }] }             │  │
│  │                                                                │  │
│  │  LocalRuntime handles:                                         │  │
│  │  ├── State updates (reactive)                                 │  │
│  │  ├── UI re-renders                                            │  │
│  │  └── Message persistence (in-memory)                          │  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input
    │
    ▼
ComposerPrimitive.Input
    │
    ▼
ComposerPrimitive.Send (onClick)
    │
    ▼
runtime.thread().append({ role: "user", content })
    │
    ▼
ChatModelAdapter.run() triggered
    │
    ├── buildDualContext()
    │       │
    │       ├── User Context (preferences, session)
    │       └── Docs Context (knowledge base)
    │
    ▼
POST /api/chat
    │
    ▼
buildSystemPrompt(context)
    │
    ▼
Z.AI API (streaming)
    │
    ▼
SSE Response → Parse chunks
    │
    ▼
yield { content: [...] }
    │
    ▼
LocalRuntime updates state
    │
    ▼
UI re-renders with new content
```

---

## 3. File Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts              # Z.AI streaming endpoint
│   └── chat/
│       └── page.tsx                  # Chat page route
│
├── components/
│   ├── assistant-ui/
│   │   ├── index.ts                  # Exports
│   │   ├── thread.tsx                # Main thread + composer
│   │   └── message.tsx               # User/Assistant messages
│   │
│   └── chat/
│       └── chat-provider.tsx         # Runtime provider
│
├── lib/
│   └── chat/
│       └── context.ts                # Dual context engine (stub)
│
└── types/
    └── chat.ts                       # TypeScript interfaces

.sisyphus/
└── plans/
    ├── chatbot-frontend-implementation.md   # Original plan
    └── zai-chatbot-guidebook.md             # Z.AI guide
```

---

## 4. Components Reference

### ChatProvider

**Location:** `src/components/chat/chat-provider.tsx`

**Purpose:** Wraps assistant-ui runtime and handles Z.AI communication.

```tsx
import { ChatProvider } from "@/components/chat/chat-provider";

<ChatProvider threadId="optional" userId="optional">
  <Thread />
</ChatProvider>
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | required | Child components |
| `threadId` | `string` | `undefined` | Thread ID for persistence |
| `userId` | `string` | `undefined` | User ID for context |

**Internal Flow:**

1. Creates `ChatModelAdapter` with `run()` generator
2. Calls `buildDualContext()` to get user + docs context
3. Formats messages for Z.AI API
4. Fetches `/api/chat` with streaming
5. Parses SSE and yields content updates

---

### Thread

**Location:** `src/components/assistant-ui/thread.tsx`

**Purpose:** Main chat container with messages and composer.

```tsx
import { Thread } from "@/components/assistant-ui";

<Thread />
```

**Structure:**

```
ThreadPrimitive.Root
├── ThreadPrimitive.Empty          # Welcome screen
├── Header                         # Context badges (USER/DOCS)
├── ThreadPrimitive.Viewport       # Message scroll container
│   └── ThreadPrimitive.Messages   # Message renderer
│       ├── UserMessage
│       └── AssistantMessage
└── Composer                       # Input + send button
    └── ComposerPrimitive.Root
        ├── ComposerPrimitive.Input
        └── ComposerPrimitive.Send
```

**Styling:**
- Glassmorphism: `bg-slate-900/50 backdrop-blur-xl`
- Border: `border border-white/10 rounded-2xl`
- Gradient accents: `from-violet-600 to-cyan-600`

---

### Message Components

**Location:** `src/components/assistant-ui/message.tsx`

#### UserMessage

```tsx
<MessagePrimitive.Root>
  <div className="bg-gradient-to-r from-violet-600 to-cyan-600">
    <MessagePrimitive.Content />
  </div>
</MessagePrimitive.Root>
```

- Right-aligned
- Gradient background (violet → cyan)
- Rounded corners with `rounded-br-md`

#### AssistantMessage

```tsx
<MessagePrimitive.Root>
  <div className="bg-slate-800/80 border border-white/5">
    <MessagePrimitive.Content components={{ Text: TextPart }} />
    <ActionBarPrimitive.Root>
      <ActionBarPrimitive.Copy />
      <ActionBarPrimitive.Reload />
    </ActionBarPrimitive.Root>
  </div>
</MessagePrimitive.Root>
```

- Left-aligned
- Glassmorphism background
- Action bar (copy, regenerate) on hover

---

## 5. API Reference

### POST /api/chat

**Request:**

```typescript
{
  messages: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
  context: {
    user: {
      id: string;
      preferences: {
        language: string;
        responseStyle: "concise" | "detailed" | "balanced";
        expertise: "beginner" | "intermediate" | "expert";
      };
      sessionContext: {
        currentPage?: string;
        recentActions?: string[];
        timeZone?: string;
      };
      memory?: {
        recentTopics?: string[];
        preferredFormat?: string;
      };
    };
    docs: {
      corpusId: string;
      relevantDocs: string[];
      semanticSearch?: {
        enabled: boolean;
        threshold: number;
        maxResults: number;
      };
    };
  };
  threadId?: string;
}
```

**Response:** Server-Sent Events (SSE)

```
data: {"id":"chat-xxx","choices":[{"delta":{"content":"Hello"}}]}
data: {"id":"chat-xxx","choices":[{"delta":{"content":" there"}}]}
data: {"id":"chat-xxx","choices":[{"finish_reason":"stop"}],"usage":{...}}
data: [DONE]
```

**Headers:**

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### GET /api/chat

Health check endpoint.

**Response:**

```json
{
  "status": "ok",
  "service": "vivim-chat",
  "model": "glm-4.7",
  "endpoint": "https://api.z.ai/api/coding/paas/v4",
  "configured": true,
  "features": {
    "streaming": true,
    "dualContext": true,
    "stubContext": true
  }
}
```

---

## 6. Context Engine

### Current Implementation (Stub)

**Location:** `src/lib/chat/context.ts`

```typescript
export async function buildDualContext(userId?: string): Promise<DualContext> {
  // Returns stub user + docs context
  return {
    user: {
      id: userId ?? "anonymous",
      preferences: { language: "en", responseStyle: "balanced", expertise: "intermediate" },
      sessionContext: { currentPage: "/chat", timeZone: "UTC" },
      memory: { recentTopics: ["memory systems", "AI assistants"] }
    },
    docs: {
      corpusId: "vivim-knowledge-base",
      relevantDocs: [
        "VIVIM is a sovereign, portable, personal AI memory system.",
        "VIVIM works with all AI providers...",
        // ... 5 hardcoded items
      ]
    }
  };
}
```

### System Prompt Generation

```typescript
export function buildSystemPrompt(context: DualContext): string {
  return `You are VIVIM Assistant, an intelligent memory companion.

## USER CONTEXT
- User ID: ${context.user.id}
- Language: ${context.user.preferences.language}
- Expertise Level: ${context.user.preferences.expertise}
- Response Style: ${context.user.preferences.responseStyle}
...

## KNOWLEDGE BASE
1. ${context.docs.relevantDocs[0]}
2. ${context.docs.relevantDocs[1]}
...

## INSTRUCTIONS
- Be helpful, accurate, and friendly
- Adapt your responses to the user's expertise level
...`;
}
```

### Future: Supabase Integration

Replace stub functions with:

```typescript
export async function buildDualContext(userId?: string): Promise<DualContext> {
  if (!userId) return getDefaultContext();

  // Fetch user preferences from Supabase
  const { data: userPrefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Fetch relevant docs via pgvector semantic search
  const { data: relevantDocs } = await supabase.rpc("search_docs", {
    query_embedding: await generateEmbedding(lastQuery),
    match_threshold: 0.7,
    match_count: 5,
  });

  return {
    user: { ...userPrefs, id: userId },
    docs: { relevantDocs: relevantDocs.map(d => d.content) }
  };
}
```

---

## 7. Configuration

### Environment Variables

**Location:** `.env.local`

```bash
# Z.AI Configuration (shared with translation)
ZAI_API_KEY=your-api-key
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4

# Chat-Specific Settings
ZAI_CHAT_MODEL=glm-4.7
ZAI_CHAT_TEMPERATURE=0.7
ZAI_MAX_TOKENS=4096
DEBUG_CHAT=false

# Future: Supabase (when backend ready)
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-service-key
```

### Model Options

| Model | Best For | Context | Speed |
|-------|----------|---------|-------|
| `glm-4.7` | Balanced (current) | 128K | Fast |
| `glm-5` | Best quality | 128K | Medium |
| `glm-4-32b-0414-128k` | Large context | 128K | Medium |
| `glm-4.6v` | Vision/multimodal | 8K | Fast |

### Temperature Guide

| Value | Behavior |
|-------|----------|
| `0.1` | Deterministic, factual |
| `0.7` | Balanced (recommended) |
| `1.0` | Creative, varied |
| `1.5+` | Highly creative, unpredictable |

---

## 8. Usage Guide

### Starting the Chat

```bash
# Development
bun run dev

# Open browser
http://localhost:3000/chat
```

### Using the Chat Interface

1. **Send a message:** Type in the input field, press Enter or click send
2. **View streaming:** Response appears character by character
3. **Copy response:** Hover over assistant message, click copy icon
4. **Regenerate:** Click the refresh icon to get a new response

### Context Badges

The header shows active context:
- `USER` - User preferences and session context active
- `DOCS` - Knowledge base context active

Currently both use stub data. When backend is connected, these will show real data.

### Expected Responses

The assistant is configured to:
- Adapt to user expertise level (beginner/intermediate/expert)
- Match response style (concise/balanced/detailed)
- Reference VIVIM knowledge base when relevant
- Use markdown formatting when helpful

---

## 9. Backend Integration Guide

### Required Supabase Tables

```sql
-- User preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  language TEXT DEFAULT 'en',
  response_style TEXT DEFAULT 'balanced',
  expertise TEXT DEFAULT 'intermediate',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat threads
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES chat_threads(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents corpus (for semantic search)
CREATE TABLE docs_corpus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for vector search
CREATE INDEX docs_corpus_embedding_idx ON docs_corpus 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;
```

### Semantic Search Function

```sql
CREATE OR REPLACE FUNCTION search_docs(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM docs_corpus dc
  WHERE 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

### Updating Context Engine

**Replace `src/lib/chat/context.ts`:**

```typescript
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function buildDualContext(userId?: string): Promise<DualContext> {
  const defaultContext = getDefaultContext();
  
  if (!userId) return defaultContext;

  // Fetch user preferences
  const { data: userPrefs } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .single();

  // Fetch recent topics from last 10 messages
  const { data: recentMessages } = await supabase
    .from("chat_messages")
    .select("content")
    .eq("thread.user_id", userId)
    .order("created_at", { ascending: false })
    .limit(10);

  return {
    user: {
      id: userId,
      preferences: {
        language: userPrefs?.language ?? "en",
        responseStyle: userPrefs?.response_style ?? "balanced",
        expertise: userPrefs?.expertise ?? "intermediate",
      },
      sessionContext: defaultContext.user.sessionContext,
      memory: {
        recentTopics: extractTopics(recentMessages),
      },
    },
    docs: defaultContext.docs, // Will be updated per-query
  };
}

export async function searchDocsCorpus(query: string): Promise<string[]> {
  // Generate embedding for query
  const embedding = await generateEmbedding(query);
  
  // Search via pgvector
  const { data } = await supabase.rpc("search_docs", {
    query_embedding: embedding,
    match_threshold: 0.7,
    match_count: 5,
  });

  return data?.map((d: any) => d.content) ?? [];
}
```

### Message Persistence

**Add to API route:**

```typescript
// After successful response
if (threadId) {
  // Save user message
  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    role: "user",
    content: lastUserMessage,
  });

  // Save assistant message
  await supabase.from("chat_messages").insert({
    thread_id: threadId,
    role: "assistant",
    content: fullContent,
  });
}
```

---

## 10. Customization

### Changing the Theme

Edit `src/components/assistant-ui/thread.tsx`:

```tsx
// Change gradient colors
className="bg-gradient-to-r from-violet-600 to-cyan-600"
//                                    ↑            ↑
//                              Change these Tailwind colors

// Change glass effect
className="bg-slate-900/50 backdrop-blur-xl border border-white/10"
//               ↑           ↑                    ↑
//           Background   Blur amount        Border opacity
```

### Adding New Message Types

1. **Add to types:**

```typescript
// src/types/chat.ts
interface ImageMessagePart {
  type: "image";
  url: string;
  alt?: string;
}
```

2. **Add to message renderer:**

```tsx
// src/components/assistant-ui/message.tsx
<MessagePrimitive.Content
  components={{
    Text: TextPart,
    Image: ImagePart,  // Add this
  }}
/>

function ImagePart({ url, alt }: { url: string; alt?: string }) {
  return (
    <img 
      src={url} 
      alt={alt ?? ""} 
      className="rounded-lg max-w-full my-2"
    />
  );
}
```

### Adding Suggestions

Add welcome screen suggestions:

```tsx
// In thread.tsx, inside ThreadPrimitive.Empty
<div className="flex flex-wrap gap-2 mt-4">
  <SuggestionPrimitive.Root>
    <SuggestionPrimitive.Text>What is VIVIM?</SuggestionPrimitive.Text>
  </SuggestionPrimitive.Root>
  <SuggestionPrimitive.Root>
    <SuggestionPrimitive.Text>How does memory work?</SuggestionPrimitive.Text>
  </SuggestionPrimitive.Root>
</div>
```

### Adding Voice Input

```tsx
// In Composer component
<ComposerPrimitive.Action
  className="p-2 rounded-lg text-slate-400 hover:text-white"
  onClick={handleVoiceInput}
>
  <Mic className="w-4 h-4" />
</ComposerPrimitive.Action>
```

---

## 11. Troubleshooting

### Common Issues

#### "Chat API not configured" (503)

**Cause:** `ZAI_API_KEY` not set in `.env.local`

**Fix:**
```bash
# Add to .env.local
ZAI_API_KEY=your-api-key-here
```

#### Empty responses

**Cause:** SSE parsing issue or API error

**Fix:** Enable debug mode
```bash
DEBUG_CHAT=true
```

Check console for `[chat:INFO]` and `[chat:ERROR]` logs.

#### Streaming not working

**Cause:** Response not being parsed correctly

**Check:**
1. Network tab shows SSE content-type
2. Response body is ReadableStream
3. No middleware interfering with streaming

#### Type errors

**Cause:** assistant-ui version mismatch

**Fix:**
```bash
bun add @assistant-ui/react@latest
```

### Debug Mode

Enable verbose logging:

```bash
# .env.local
DEBUG_CHAT=true
```

Logs will show:
- Request details
- Z.AI response status
- Chunk parsing
- Timing information

### Health Check

```bash
curl http://localhost:3000/api/chat
```

Expected response:
```json
{
  "status": "ok",
  "configured": true,
  "features": { "streaming": true, "dualContext": true }
}
```

### Testing Z.AI Directly

```bash
curl -X POST "https://api.z.ai/api/coding/paas/v4/chat/completions" \
  -H "Authorization: Bearer $ZAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4.7",
    "messages": [{"role": "user", "content": "Hello"}],
    "stream": true
  }'
```

---

## Appendix A: File Reference

| File | Lines | Purpose |
|------|-------|---------|
| `src/app/api/chat/route.ts` | ~145 | Z.AI streaming endpoint |
| `src/app/chat/page.tsx` | ~95 | Chat page layout |
| `src/components/chat/chat-provider.tsx` | ~85 | Runtime provider |
| `src/components/assistant-ui/thread.tsx` | ~145 | Thread + Composer UI |
| `src/components/assistant-ui/message.tsx` | ~80 | Message components |
| `src/lib/chat/context.ts` | ~90 | Context engine (stub) |
| `src/types/chat.ts` | ~60 | TypeScript types |

---

## Appendix B: Dependencies

```json
{
  "dependencies": {
    "@assistant-ui/react": "^0.12.21",
    "@assistant-ui/react-markdown": "^0.12.7"
  }
}
```

---

## Appendix C: Related Documentation

- [assistant-ui Documentation](https://www.assistant-ui.com/docs)
- [Z.AI API Reference](https://docs.z.ai/api-reference/llm/chat-completion)
- [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)

---

*Documentation generated by Sisyphus. Last updated: 2026-03-27*
