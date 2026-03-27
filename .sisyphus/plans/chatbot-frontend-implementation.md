# VIVIM Chatbot Frontend Implementation Plan

> **Status:** Planning Phase  
> **Library:** [assistant-ui](https://www.assistant-ui.com/)  
> **Backend:** Supabase PostgreSQL with Dual Context System `{USER}{DOCS CORPUS}`  
> **Created:** 2026-03-27

---

## 1. Project Analysis Summary

### Current Tech Stack
| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 15.x |
| React | React | 19.2.0 |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.x |
| Components | shadcn/ui (Radix UI) | Latest |
| Runtime | Bun | Latest |
| Language | TypeScript | 5.x |

### Existing Patterns
- **Utility:** `cn()` function for class merging (`clsx` + `tailwind-merge`)
- **Design:** Glassmorphism with dark theme (`bg-slate-950`, `backdrop-blur`)
- **Structure:** `src/app/` (routes), `src/components/` (UI), `src/lib/` (utils)
- **Client Components:** `"use client"` directive for interactive components
- **Fonts:** Inter (body), JetBrains Mono (code)

---

## 2. Package Installation

```bash
# Core assistant-ui package
bun add @assistant-ui/react

# Optional: Markdown rendering with syntax highlighting
bun add @assistant-ui/react-markdown @assistant-ui/react-syntax-highlighter

# Optional: For Vercel AI SDK compatibility (if needed later)
bun add @assistant-ui/react-ai-sdk ai
```

### Package Justification
| Package | Reason |
|---------|--------|
| `@assistant-ui/react` | Core primitives, runtime, hooks |
| `@assistant-ui/react-markdown` | Rich text rendering in messages |
| `@assistant-ui/react-syntax-highlighter` | Code block highlighting |

---

## 3. File Structure

```
src/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts              # Backend API endpoint
│   ├── chat/
│   │   └── page.tsx                  # Chat page route
│   └── layout.tsx
├── components/
│   ├── assistant-ui/                 # assistant-ui components
│   │   ├── thread.tsx                # Main thread component
│   │   ├── composer.tsx              # Message input component
│   │   ├── message.tsx               # Individual message component
│   │   ├── assistant-modal.tsx       # Floating chat widget (optional)
│   │   └── styles.css                # Custom assistant-ui styles
│   ├── chat/
│   │   ├── chat-provider.tsx         # Runtime provider wrapper
│   │   ├── chat-container.tsx        # Main chat layout
│   │   └── context-indicator.tsx     # Shows {USER}{DOCS} context state
│   └── ui/                           # Existing shadcn/ui components
├── hooks/
│   └── use-chat-runtime.ts           # Custom runtime hook
├── lib/
│   ├── chat/
│   │   ├── runtime.ts                # Runtime configuration
│   │   ├── types.ts                  # Chat message types
│   │   └── context.ts                # Dual context management
│   └── utils.ts
└── types/
    └── chat.ts                       # Chat-specific types
```

---

## 4. Runtime Architecture

### Runtime Selection: `useLocalRuntime`

**Why LocalRuntime?**
- Custom Supabase backend (not Vercel AI SDK)
- Full control over API calls and streaming
- Handles state while you handle the API

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              AssistantRuntimeProvider                    │    │
│  │  ┌─────────────────────────────────────────────────┐    │    │
│  │  │              useLocalRuntime                     │    │    │
│  │  │  • Message state management                      │    │    │
│  │  │  • UI streaming status                           │    │    │
│  │  │  • Thread/branch management                      │    │    │
│  │  └─────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              /api/chat (Next.js Route)                  │    │
│  │  • Receives messages + context                         │    │
│  │  • Streams response back                               │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Dual Context System                        │    │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐  │    │
│  │  │   USER Context  │  │     DOCS CORPUS Context     │  │    │
│  │  │  • Preferences  │  │  • Knowledge base           │  │    │
│  │  │  • History      │  │  • Document embeddings      │  │    │
│  │  │  • Session      │  │  • Semantic search          │  │    │
│  │  └─────────────────┘  └─────────────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Supabase                             │    │
│  │  • PostgreSQL (messages, threads, users)               │    │
│  │  • pgvector (embeddings)                               │    │
│  │  • Real-time subscriptions                             │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. Component Implementation

### 5.1 Chat Provider (`src/components/chat/chat-provider.tsx`)

```tsx
"use client";

import { AssistantRuntimeProvider } from "@assistant-ui/react";
import { useLocalRuntime } from "@assistant-ui/react";
import type { ReactNode } from "react";

interface ChatProviderProps {
  children: ReactNode;
  threadId?: string;
  userId?: string;
}

export function ChatProvider({ children, threadId, userId }: ChatProviderProps) {
  const runtime = useLocalRuntime({
    initialMessages: [],
    // Hook for backend communication
    onNewMessage: async (message) => {
      // Will call /api/chat with dual context
    },
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
```

### 5.2 Thread Component (`src/components/assistant-ui/thread.tsx`)

```tsx
"use client";

import {
  ThreadPrimitive,
  ComposerPrimitive,
  MessagePrimitive,
} from "@assistant-ui/react";
import { cn } from "@/lib/utils";

export function Thread() {
  return (
    <ThreadPrimitive.Root
      className={cn(
        "flex flex-col h-full",
        "glass rounded-2xl border border-white/10",
        "bg-slate-900/50 backdrop-blur-xl"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-sm text-slate-400">VIVIM Assistant</span>
        </div>
        <ContextIndicator />
      </div>

      {/* Messages Viewport */}
      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto px-4 py-4">
        <ThreadPrimitive.Empty>
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mb-4">
              <Brain className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">
              Start a conversation
            </h3>
            <p className="text-sm text-slate-400 max-w-xs">
              Ask anything. Your context is ready.
            </p>
          </div>
        </ThreadPrimitive.Empty>

        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      {/* Composer */}
      <div className="p-4 border-t border-white/5">
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  );
}
```

### 5.3 Composer Component (`src/components/assistant-ui/composer.tsx`)

```tsx
"use client";

import { ComposerPrimitive } from "@assistant-ui/react";
import { Send, Paperclip, Mic } from "lucide-react";
import { cn } from "@/lib/utils";

export function Composer() {
  return (
    <ComposerPrimitive.Root
      className={cn(
        "flex items-end gap-2 p-2 rounded-xl",
        "bg-slate-800/50 border border-white/5"
      )}
    >
      {/* Attachment button (future) */}
      <ComposerPrimitive.Action
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        onClick={() => {/* TODO: File attachment */}}
      >
        <Paperclip className="w-4 h-4" />
      </ComposerPrimitive.Action>

      {/* Text Input */}
      <ComposerPrimitive.Input
        placeholder="Ask VIVIM anything..."
        className={cn(
          "flex-1 bg-transparent text-white placeholder:text-slate-500",
          "focus:outline-none text-sm resize-none"
        )}
        rows={1}
      />

      {/* Voice button (future) */}
      <ComposerPrimitive.Action
        className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        onClick={() => {/* TODO: Voice input */}}
      >
        <Mic className="w-4 h-4" />
      </ComposerPrimitive.Action>

      {/* Send Button */}
      <ComposerPrimitive.Send
        className={cn(
          "p-2 rounded-lg transition-all",
          "bg-gradient-to-r from-violet-600 to-cyan-600",
          "hover:from-violet-500 hover:to-cyan-500",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        <Send className="w-4 h-4 text-white" />
      </ComposerPrimitive.Send>
    </ComposerPrimitive.Root>
  );
}
```

### 5.4 Message Components (`src/components/assistant-ui/message.tsx`)

```tsx
"use client";

import { MessagePrimitive, ActionBarPrimitive } from "@assistant-ui/react";
import { cn } from "@/lib/utils";
import { Copy, RotateCcw, ThumbsUp, ThumbsDown } from "lucide-react";

export function UserMessage() {
  return (
    <MessagePrimitive.Root
      className={cn(
        "flex justify-end mb-4",
        "group" // for hover actions
      )}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl rounded-br-md",
          "bg-gradient-to-r from-violet-600 to-cyan-600",
          "text-white text-sm"
        )}
      >
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
}

export function AssistantMessage() {
  return (
    <MessagePrimitive.Root
      className={cn(
        "flex justify-start mb-4",
        "group" // for hover actions
      )}
    >
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl rounded-bl-md",
          "bg-slate-800/80 border border-white/5",
          "text-slate-200 text-sm"
        )}
      >
        <MessagePrimitive.Content
          components={{
            Text: ({ text }) => <p className="whitespace-pre-wrap">{text}</p>,
            // Add markdown rendering here
          }}
        />
        
        {/* Action Bar */}
        <ActionBarPrimitive.Root
          className={cn(
            "flex items-center gap-1 mt-2 pt-2 border-t border-white/5",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
        >
          <ActionBarPrimitive.Copy
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5"
          >
            <Copy className="w-3.5 h-3.5" />
          </ActionBarPrimitive.Copy>
          
          <ActionBarPrimitive.Reload
            className="p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </ActionBarPrimitive.Reload>
        </ActionBarPrimitive.Root>
      </div>
    </MessagePrimitive.Root>
  );
}
```

---

## 6. API Route Design (`src/app/api/chat/route.ts`)

### Request/Response Contract

```typescript
// Request
interface ChatRequest {
  messages: ChatMessage[];
  context: {
    user: UserContext;
    docs: DocsContext;
  };
  threadId?: string;
}

interface UserContext {
  id: string;
  preferences: Record<string, unknown>;
  sessionHistory: string[];
}

interface DocsContext {
  relevantDocs: string[];
  searchQuery?: string;
  corpusVersion: string;
}

// Response (Streaming)
// Uses Vercel AI SDK stream format or custom SSE
```

### API Route Skeleton

```typescript
// src/app/api/chat/route.ts
import { NextRequest } from "next/server";
import { StreamingTextResponse } from "ai"; // if using AI SDK

export async function POST(req: NextRequest) {
  const { messages, context, threadId } = await req.json();

  // 1. Validate request
  // 2. Load user context from Supabase
  // 3. Query docs corpus (pgvector)
  // 4. Combine contexts
  // 5. Stream response from LLM
  // 6. Save to Supabase

  // Return streaming response
  return new StreamingTextResponse(stream);
}
```

---

## 7. Backend Wiring Documentation

### 7.1 Dual Context System Contract

The frontend must pass context to the backend on every request:

```typescript
// Frontend → Backend Context Shape
interface DualContext {
  user: {
    id: string;           // Supabase auth user ID
    preferences: {
      language: string;
      theme: 'light' | 'dark';
      responseStyle: 'concise' | 'detailed';
    };
    sessionContext: {
      currentPage?: string;
      recentActions?: string[];
    };
  };
  
  docs: {
    corpusId: string;     // Which docs corpus to use
    filters?: {
      categories?: string[];
      dateRange?: [Date, Date];
      tags?: string[];
    };
    semanticSearch?: {
      enabled: boolean;
      threshold: number;  // Similarity threshold
    };
  };
}
```

### 7.2 Supabase Tables Required

```sql
-- Threads
CREATE TABLE chat_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID REFERENCES chat_threads(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Documents Corpus
CREATE TABLE docs_corpus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  content TEXT,
  embedding vector(1536),  -- OpenAI embeddings
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Context State (for resuming sessions)
CREATE TABLE user_context_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  context JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 7.3 Runtime-to-Backend Integration

```typescript
// src/lib/chat/runtime.ts
import { useLocalRuntime } from "@assistant-ui/react";

export function useVivimRuntime(userId: string, threadId?: string) {
  return useLocalRuntime({
    initialMessages: async () => {
      // Load messages from Supabase
      const res = await fetch(`/api/chat/messages?threadId=${threadId}`);
      return res.json();
    },

    onNewMessage: async (message) => {
      // 1. Build context
      const context = await buildDualContext(userId);
      
      // 2. Send to backend
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [message],
          context,
          threadId,
        }),
      });

      // 3. Handle streaming response
      return response.body;
    },
  });
}

async function buildDualContext(userId: string): Promise<DualContext> {
  // Fetch user context from Supabase
  // Fetch docs corpus configuration
  // Return combined context
}
```

---

## 8. Styling Integration

### 8.1 CSS Variables (add to `globals.css`)

```css
/* Assistant UI Theming */
:root {
  --assistant-bg: theme(colors.slate.900);
  --assistant-border: rgba(255, 255, 255, 0.1);
  --assistant-text: theme(colors.slate.200);
  --assistant-text-muted: theme(colors.slate.400);
  --assistant-accent: theme(colors.violet.500);
  --assistant-accent-secondary: theme(colors.cyan.500);
}
```

### 8.2 Glassmorphism Utility Classes

```css
/* Add to globals.css */
.glass-chat {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(24px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-chat-strong {
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(32px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

---

## 9. Implementation Phases

### Phase 1: Core Setup (Day 1)
- [ ] Install `@assistant-ui/react` packages
- [ ] Create `src/components/assistant-ui/` directory
- [ ] Implement `ChatProvider` with `useLocalRuntime`
- [ ] Create basic `Thread` component
- [ ] Create `Composer` component
- [ ] Add CSS variables for theming

### Phase 2: Message Components (Day 2)
- [ ] Implement `UserMessage` component
- [ ] Implement `AssistantMessage` component
- [ ] Add `ActionBar` (copy, reload)
- [ ] Integrate markdown rendering
- [ ] Add syntax highlighting for code blocks

### Phase 3: API Integration (Day 3)
- [ ] Create `/api/chat` route skeleton
- [ ] Define request/response types
- [ ] Implement streaming response handler
- [ ] Wire runtime to API endpoint

### Phase 4: Dual Context (Day 4)
- [ ] Implement context builder function
- [ ] Create `ContextIndicator` component
- [ ] Add context state management
- [ ] Test with mock context data

### Phase 5: Polish (Day 5)
- [ ] Add loading states
- [ ] Add error handling UI
- [ ] Implement suggestions/welcome screen
- [ ] Add keyboard shortcuts
- [ ] Mobile responsive adjustments

### Phase 6: Backend Connection (When Backend Ready)
- [ ] Connect to Supabase
- [ ] Implement message persistence
- [ ] Add thread management
- [ ] Wire dual context to actual data

---

## 10. Optional: Floating Chat Widget

For a support-style floating chat bubble:

```tsx
// src/components/assistant-ui/assistant-modal.tsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X } from "lucide-react";
import { ChatProvider } from "@/components/chat/chat-provider";
import { Thread } from "./thread";

export function AssistantModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 p-4 rounded-full bg-gradient-to-r from-violet-600 to-cyan-600 shadow-lg hover:scale-105 transition-transform"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 right-6 z-50 w-[400px] h-[600px] rounded-2xl overflow-hidden shadow-2xl"
          >
            <ChatProvider>
              <Thread />
            </ChatProvider>
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-white/10 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
```

---

## 11. Key Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Runtime | `useLocalRuntime` | Custom Supabase backend, not Vercel AI SDK |
| Styling | Unstyled primitives + Tailwind | Match existing glassmorphism aesthetic |
| Placement | Dedicated `/chat` page + optional modal | Flexible deployment options |
| State | Runtime-managed | assistant-ui handles message state |
| Streaming | SSE via API route | Compatible with any LLM backend |

---

## 12. Backend Team Handoff

### What Backend Needs to Provide

1. **`POST /api/chat`** endpoint that:
   - Accepts `{ messages, context: { user, docs }, threadId }`
   - Returns streaming response (SSE or AI SDK format)
   - Handles dual context merging

2. **`GET /api/chat/messages?threadId=...`** endpoint:
   - Returns message history for thread

3. **`POST /api/chat/threads`** endpoint:
   - Creates new thread
   - Returns thread ID

4. **Supabase schema** (see Section 7.2)

### Context Contract

Backend must accept and process:
```typescript
{
  user: { id, preferences, sessionContext },
  docs: { corpusId, filters, semanticSearch }
}
```

---

## 13. Resources

- [assistant-ui Documentation](https://www.assistant-ui.com/docs)
- [assistant-ui Runtime Guide](https://www.assistant-ui.com/docs/runtimes/custom/local)
- [assistant-ui Primitives](https://www.assistant-ui.com/docs/primitives)
- [Vercel AI SDK Streaming](https://sdk.vercel.ai/docs/ai-sdk-ui/streaming)

---

*Plan created by Sisyphus. Ready for implementation approval.*
