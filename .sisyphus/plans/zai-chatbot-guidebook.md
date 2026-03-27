# Z.AI Chatbot Implementation Guidebook

> **Status:** Ready for Implementation  
> **Target:** VIVIM Chatbot with assistant-ui + Z.AI API  
> **Backend:** Supabase PostgreSQL with Dual Context `{USER}{DOCS CORPUS}`  
> **Created:** 2026-03-27

---

## Table of Contents

1. [Current Z.AI Setup Analysis](#1-current-zai-setup-analysis)
2. [Z.AI Chat API Reference](#2-zai-chat-api-reference)
3. [Streaming Protocol (SSE)](#3-streaming-protocol-sse)
4. [Frontend Integration (assistant-ui)](#4-frontend-integration-assistant-ui)
5. [Backend API Route Design](#5-backend-api-route-design)
6. [Dual Context System Wiring](#6-dual-context-system-wiring)
7. [Complete Implementation Examples](#7-complete-implementation-examples)
8. [Environment Configuration](#8-environment-configuration)
9. [Testing & Debugging](#9-testing--debugging)

---

## 1. Current Z.AI Setup Analysis

### Existing Configuration (Translation)

From `src/app/api/translate/route.ts`:

```typescript
// Environment Variables
ZAI_API_KEY=your-api-key-here
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4  // or /api/paas/v4
ZAI_MODEL=glm-4.7
TRANSLATE_TEMPERATURE=0.1
```

### Current API Pattern

```typescript
const response = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${ZAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: MODEL,           // "glm-4.7"
    temperature: 0.1,       // Low for deterministic translation
    stream: false,          // Non-streaming for batch
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
  }),
});
```

### Key Observations

| Aspect | Translation | Chatbot (Planned) |
|--------|-------------|-------------------|
| `stream` | `false` | `true` (SSE) |
| `temperature` | `0.1` | `0.7-1.0` (creative) |
| `response_format` | `json_object` | Default (text) |
| Messages | 2 (system + user) | Multi-turn conversation |
| Context | Translation rules | Dual context {USER}{DOCS} |

---

## 2. Z.AI Chat API Reference

### Endpoint

```
POST https://api.z.ai/api/paas/v4/chat/completions
```

### Request Format

```typescript
interface ChatCompletionRequest {
  model: string;           // "glm-5", "glm-4.7", "glm-4.6v"
  messages: Message[];     // Conversation history
  stream?: boolean;        // Enable SSE streaming
  temperature?: number;    // 0.0 - 2.0 (default varies by model)
  max_tokens?: number;     // Max output tokens
  top_p?: number;          // 0.01 - 1.0 (default 0.95)
  tools?: Tool[];          // Function calling
  tool_choice?: "auto" | "none" | { type: "function"; function: { name: string } };
  response_format?: { type: "text" | "json_object" };
  user_id?: string;        // End user identifier (6-128 chars)
}

interface Message {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];  // String or multimodal
}

interface ContentPart {
  type: "text" | "image_url" | "video_url" | "audio_url";
  text?: string;
  image_url?: { url: string };
  // ... other multimodal types
}
```

### Response Format (Non-Streaming)

```typescript
interface ChatCompletionResponse {
  id: string;              // "chatcmpl-xxxxxxxx"
  object: "chat.completion";
  created: number;         // Unix timestamp
  model: string;           // Model used
  choices: [{
    index: number;
    message: {
      role: "assistant";
      content: string;
      tool_calls?: ToolCall[];
    };
    finish_reason: "stop" | "length" | "tool_calls";
  }];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### Available Models

| Model | Best For | Context Window |
|-------|----------|----------------|
| `glm-5` | Latest, best quality | 128K |
| `glm-4.7` | Balanced performance | 128K |
| `glm-4-32b-0414-128k` | Large context | 128K |
| `glm-4.6v` | Vision/multimodal | 8K |
| `charglm-3` | Character roleplay | 4K |

---

## 3. Streaming Protocol (SSE)

### Enabling Streaming

```typescript
// Request with streaming enabled
{
  model: "glm-5",
  messages: [...],
  stream: true,  // Enable SSE
  temperature: 0.7
}
```

### SSE Response Format

Z.AI returns **Server-Sent Events (SSE)** format:

```
data: {"id":"chat-123","choices":[{"index":0,"delta":{"content":"Hello"},"finish_reason":null}]}

data: {"id":"chat-123","choices":[{"index":0,"delta":{"content":" there"},"finish_reason":null}]}

data: {"id":"chat-123","choices":[{"index":0,"delta":{"content":"!"},"finish_reason":null}]}

data: {"id":"chat-123","choices":[{"index":0,"delta":{},"finish_reason":"stop"}],"usage":{"prompt_tokens":10,"completion_tokens":5,"total_tokens":15}}

data: [DONE]
```

### Stream Chunk Structure

```typescript
interface StreamChunk {
  id: string;
  choices: [{
    index: number;
    delta: {
      content?: string;              // Incremental text
      reasoning_content?: string;    // Reasoning (if enabled)
      role?: "assistant";            // Only in first chunk
    };
    finish_reason: null | "stop" | "length" | "tool_calls";
  }];
  usage?: {                          // Only in final chunk
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
```

### Parsing SSE in TypeScript

```typescript
async function* parseSSE(stream: ReadableStream<Uint8Array>): AsyncGenerator<StreamChunk> {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";  // Keep incomplete line

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;
        yield JSON.parse(data);
      }
    }
  }
}
```

---

## 4. Frontend Integration (assistant-ui)

### Runtime Selection

For Z.AI with custom streaming, use **`useLocalRuntime`**:

```typescript
import { useLocalRuntime } from "@assistant-ui/react";

const runtime = useLocalRuntime({
  initialMessages: [],
  
  // Called when user sends a message
  onNewMessage: async (message) => {
    // Will stream response from Z.AI via our API
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages: [...existingMessages, message],
        context: { user, docs },
      }),
    });
    
    return response.body;  // Return stream for runtime to consume
  },
});
```

### Message Format Mapping

assistant-ui ↔ Z.AI message format:

```typescript
// assistant-ui format
interface AuiMessage {
  id: string;
  role: "user" | "assistant";
  content: MessagePart[];
}

// Z.AI format
interface ZaiMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Conversion
function toZaiMessage(msg: AuiMessage): ZaiMessage {
  return {
    role: msg.role,
    content: msg.content
      .filter(p => p.type === "text")
      .map(p => p.text)
      .join(""),
  };
}
```

### Streaming Integration

```typescript
// src/hooks/use-vivim-runtime.ts
import { useLocalRuntime } from "@assistant-ui/react";

export function useVivimRuntime(threadId?: string, userId?: string) {
  return useLocalRuntime({
    initialMessages: async () => {
      if (!threadId) return [];
      const res = await fetch(`/api/chat/messages?threadId=${threadId}`);
      return res.json();
    },

    onNewMessage: async (message) => {
      // Build dual context
      const context = await buildDualContext(userId);
      
      // Get current messages from runtime
      const messages = /* get from runtime state */;
      
      // Stream from Z.AI
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, message],
          context,
          threadId,
          stream: true,
        }),
      });

      // Return stream - runtime will handle SSE parsing
      return response.body;
    },
  });
}
```

---

## 5. Backend API Route Design

### Route Structure

```
src/app/api/
├── chat/
│   ├── route.ts              # POST: Stream chat completion
│   ├── messages/
│   │   └── route.ts          # GET: Load thread history
│   └── threads/
│       └── route.ts          # POST: Create thread
```

### Main Chat Endpoint

```typescript
// src/app/api/chat/route.ts
import { NextRequest } from "next/server";

const ZAI_API_KEY = process.env.ZAI_API_KEY!;
const ZAI_BASE_URL = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/paas/v4";
const ZAI_CHAT_MODEL = process.env.ZAI_CHAT_MODEL ?? "glm-5";
const ZAI_CHAT_TEMPERATURE = parseFloat(process.env.ZAI_CHAT_TEMPERATURE ?? "0.7");

interface ChatRequest {
  messages: Array<{ role: string; content: string }>;
  context: {
    user: UserContext;
    docs: DocsContext;
  };
  threadId?: string;
}

export async function POST(req: NextRequest) {
  const body: ChatRequest = await req.json();
  const { messages, context, threadId } = body;

  // 1. Build system prompt with dual context
  const systemPrompt = buildSystemPrompt(context);

  // 2. Prepare messages for Z.AI
  const zaiMessages = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  // 3. Call Z.AI with streaming
  const response = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ZAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: ZAI_CHAT_MODEL,
      messages: zaiMessages,
      stream: true,
      temperature: ZAI_CHAT_TEMPERATURE,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Z.AI API error" }), {
      status: response.status,
    });
  }

  // 4. Return streaming response
  return new Response(response.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

function buildSystemPrompt(context: { user: UserContext; docs: DocsContext }): string {
  return `You are VIVIM Assistant, an intelligent memory companion.

## USER CONTEXT
- User ID: ${context.user.id}
- Preferences: ${JSON.stringify(context.user.preferences)}
- Current session: ${context.user.sessionContext?.currentPage ?? "unknown"}

## KNOWLEDGE CONTEXT
${context.docs.relevantDocs?.map(doc => `- ${doc}`).join("\n") ?? "No specific documents loaded."}

## INSTRUCTIONS
- Be helpful, concise, and accurate
- Reference the user's memory when relevant
- Acknowledge uncertainty when appropriate
- Format responses clearly with markdown when helpful`;
}
```

### With Dual Context Processing

```typescript
// Extended version with Supabase context loading
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { messages, context, threadId } = body;

  // 1. Load user context from Supabase
  const { data: userContext } = await supabase
    .from("user_context_state")
    .select("context")
    .eq("user_id", context.user.id)
    .single();

  // 2. Query docs corpus (pgvector semantic search)
  const lastMessage = messages[messages.length - 1]?.content ?? "";
  const { data: relevantDocs } = await supabase.rpc("search_docs", {
    query_embedding: await generateEmbedding(lastMessage),
    match_threshold: 0.7,
    match_count: 5,
  });

  // 3. Merge contexts
  const enrichedContext = {
    user: { ...context.user, ...userContext?.context },
    docs: {
      ...context.docs,
      relevantDocs: relevantDocs?.map((d: any) => d.content) ?? [],
    },
  };

  // 4. Build prompt and stream response
  const systemPrompt = buildSystemPrompt(enrichedContext);
  
  // ... rest of streaming logic
}
```

---

## 6. Dual Context System Wiring

### Context Shape

```typescript
// src/types/chat.ts

export interface DualContext {
  user: UserContext;
  docs: DocsContext;
}

export interface UserContext {
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
}

export interface DocsContext {
  corpusId: string;
  relevantDocs: string[];
  filters?: {
    categories?: string[];
    tags?: string[];
    dateRange?: [string, string];
  };
  semanticSearch?: {
    enabled: boolean;
    threshold: number;
    maxResults: number;
  };
}
```

### Frontend Context Builder

```typescript
// src/lib/chat/context.ts

export async function buildDualContext(userId?: string): Promise<DualContext> {
  // Default context
  const defaultContext: DualContext = {
    user: {
      id: userId ?? "anonymous",
      preferences: {
        language: navigator.language,
        responseStyle: "balanced",
        expertise: "intermediate",
      },
      sessionContext: {
        currentPage: window.location.pathname,
        recentActions: [],
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    },
    docs: {
      corpusId: "default",
      relevantDocs: [],
      semanticSearch: {
        enabled: true,
        threshold: 0.7,
        maxResults: 5,
      },
    },
  };

  // If user is authenticated, fetch enriched context
  if (userId) {
    try {
      const res = await fetch(`/api/context?userId=${userId}`);
      if (res.ok) {
        const serverContext = await res.json();
        return { ...defaultContext, ...serverContext };
      }
    } catch (e) {
      console.warn("Failed to load user context, using defaults");
    }
  }

  return defaultContext;
}
```

### Backend Context Endpoint

```typescript
// src/app/api/context/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Load user preferences and memory
  const { data: userData } = await supabase
    .from("user_context_state")
    .select("context")
    .eq("user_id", userId)
    .single();

  return NextResponse.json({
    user: userData?.context ?? {},
    docs: {
      corpusId: "default",
      // Docs will be loaded dynamically based on query
    },
  });
}
```

---

## 7. Complete Implementation Examples

### Full Chat Provider

```typescript
// src/components/chat/chat-provider.tsx
"use client";

import { AssistantRuntimeProvider, useLocalRuntime } from "@assistant-ui/react";
import { ReactNode, useEffect, useState } from "react";
import { buildDualContext, DualContext } from "@/lib/chat/context";

interface ChatProviderProps {
  children: ReactNode;
  threadId?: string;
  userId?: string;
}

export function ChatProvider({ children, threadId, userId }: ChatProviderProps) {
  const [initialMessages, setInitialMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(!!threadId);

  useEffect(() => {
    if (threadId) {
      fetch(`/api/chat/messages?threadId=${threadId}`)
        .then(res => res.json())
        .then(data => {
          setInitialMessages(data.messages ?? []);
          setIsLoading(false);
        })
        .catch(() => setIsLoading(false));
    }
  }, [threadId]);

  const runtime = useLocalRuntime({
    initialMessages,
    
    onNewMessage: async (message) => {
      // Build dual context for this request
      const context = await buildDualContext(userId);
      
      // Get all messages including new one
      const allMessages = [...initialMessages, message];
      
      // Stream from Z.AI
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: allMessages.map(m => ({
            role: m.role,
            content: m.content
              .filter((p: any) => p.type === "text")
              .map((p: any) => p.text)
              .join(""),
          })),
          context,
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      return response.body;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse text-slate-400">Loading conversation...</div>
      </div>
    );
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
```

### Full API Route with SSE Passthrough

```typescript
// src/app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";

const ZAI_API_KEY = process.env.ZAI_API_KEY!;
const ZAI_BASE_URL = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/paas/v4";
const ZAI_CHAT_MODEL = process.env.ZAI_CHAT_MODEL ?? "glm-5";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, context, threadId } = body;

    // Validate
    if (!messages?.length) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Build system prompt with dual context
    const systemPrompt = `You are VIVIM Assistant, an intelligent memory companion.

## USER CONTEXT
- ID: ${context?.user?.id ?? "anonymous"}
- Preferences: ${JSON.stringify(context?.user?.preferences ?? {})}
- Session: ${context?.user?.sessionContext?.currentPage ?? "unknown"}

## KNOWLEDGE BASE
${context?.docs?.relevantDocs?.length 
  ? context.docs.relevantDocs.map((doc: string, i: number) => `${i + 1}. ${doc}`).join("\n")
  : "No specific context loaded."}

## GUIDELINES
- Be helpful, accurate, and concise
- Reference user context when relevant
- Use markdown formatting when appropriate
- Acknowledge limitations honestly`;

    // Call Z.AI with streaming
    const zaiResponse = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ZAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: ZAI_CHAT_MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
        temperature: 0.7,
        max_tokens: 4096,
      }),
    });

    if (!zaiResponse.ok) {
      const error = await zaiResponse.text();
      console.error("Z.AI error:", error);
      return NextResponse.json(
        { error: `Z.AI API error: ${zaiResponse.status}` },
        { status: zaiResponse.status }
      );
    }

    // Stream response back to client
    return new Response(zaiResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });

  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    model: ZAI_CHAT_MODEL,
    endpoint: ZAI_BASE_URL,
    configured: !!ZAI_API_KEY,
  });
}
```

### Message History Endpoint

```typescript
// src/app/api/chat/messages/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET(req: NextRequest) {
  const threadId = req.nextUrl.searchParams.get("threadId");
  
  if (!threadId) {
    return NextResponse.json({ error: "threadId required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .select("id, role, content, created_at")
    .eq("thread_id", threadId)
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Convert to assistant-ui format
  const messages = data.map(msg => ({
    id: msg.id,
    role: msg.role,
    content: [{ type: "text", text: msg.content }],
    createdAt: new Date(msg.created_at),
  }));

  return NextResponse.json({ messages });
}
```

---

## 8. Environment Configuration

### Required Environment Variables

```bash
# .env.local

# Z.AI Configuration
ZAI_API_KEY=your-zai-api-key-here
ZAI_BASE_URL=https://api.z.ai/api/paas/v4

# Chat Model Settings
ZAI_CHAT_MODEL=glm-5
ZAI_CHAT_TEMPERATURE=0.7

# Translation (existing)
ZAI_MODEL=glm-4.7
TRANSLATE_TEMPERATURE=0.1

# Supabase (for persistence)
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key  # Server-side only!

# Optional: Rate Limiting
CHAT_RATE_LIMIT=60  # requests per minute
CHAT_MAX_TOKENS=4096
```

### Model Selection Guide

```bash
# For best quality (recommended)
ZAI_CHAT_MODEL=glm-5

# For faster responses
ZAI_CHAT_MODEL=glm-4.7

# For large context (128K)
ZAI_CHAT_MODEL=glm-4-32b-0414-128k

# For vision/multimodal
ZAI_CHAT_MODEL=glm-4.6v
```

---

## 9. Testing & Debugging

### Test Chat Endpoint

```bash
# Test streaming chat
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello, who are you?"}],
    "context": {
      "user": {"id": "test-user"},
      "docs": {"corpusId": "default"}
    }
  }'
```

### Test Z.AI Directly

```bash
# Test Z.AI streaming directly
curl -X POST "https://api.z.ai/api/paas/v4/chat/completions" \
  -H "Authorization: Bearer $ZAI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-5",
    "messages": [{"role": "user", "content": "Say hello"}],
    "stream": true
  }'
```

### Debug Logging

Add to `src/app/api/chat/route.ts`:

```typescript
const DEBUG = process.env.DEBUG_CHAT === "true";

function log(...args: any[]) {
  if (DEBUG) console.log("[chat]", new Date().toISOString(), ...args);
}

// Usage
log("Request:", { messages: messages.length, threadId });
log("Z.AI response status:", zaiResponse.status);
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Invalid API key | Check `ZAI_API_KEY` env var |
| Empty response | Stream not parsed | Ensure SSE headers are passed through |
| Slow first response | Cold start | Pre-warm or use edge functions |
| Context not loading | Supabase connection | Check `SUPABASE_URL` and keys |
| Rate limited | Too many requests | Implement client-side throttling |

---

## 10. Quick Reference

### Z.AI API at a Glance

```
Base URL: https://api.z.ai/api/paas/v4
Endpoint: POST /chat/completions
Auth:     Bearer {ZAI_API_KEY}
Format:   OpenAI-compatible
Streaming: SSE (data: {...})
```

### Key Parameters

| Parameter | Default | Recommended |
|-----------|---------|-------------|
| `model` | - | `glm-5` |
| `temperature` | 0.7 | 0.7-1.0 |
| `max_tokens` | - | 4096 |
| `stream` | false | true |
| `top_p` | 0.95 | 0.95 |

### Message Roles

- `system` - Instructions, context, personality
- `user` - User input
- `assistant` - AI responses (for history)

### Stream Events

```
data: {"choices":[{"delta":{"content":"text"}}]}  → Content chunk
data: {"choices":[{"finish_reason":"stop"}]}      → Completion
data: [DONE]                                      → Stream end
```

---

## 11. Next Steps

1. **Install Dependencies**
   ```bash
   bun add @assistant-ui/react @assistant-ui/react-markdown
   ```

2. **Create Environment**
   ```bash
   # Add to .env.local
   ZAI_CHAT_MODEL=glm-5
   ZAI_CHAT_TEMPERATURE=0.7
   ```

3. **Implement Components** (see implementation plan)
   - `ChatProvider`
   - `Thread` / `Composer` / `Message`
   - API route `/api/chat`

4. **Wire Backend** (when ready)
   - Supabase connection
   - Dual context loading
   - Message persistence

5. **Test & Iterate**
   - Start with mock context
   - Add Supabase integration
   - Optimize streaming

---

*Guidebook created by Sisyphus. Ready for implementation.*
