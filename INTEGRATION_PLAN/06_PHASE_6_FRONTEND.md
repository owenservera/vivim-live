# Phase 6: Frontend Integration

## Objective
Integrate the frontend components to support AI chat, context visualization, and memory display.

## Duration
2-3 days

## Risk Level
Medium

---

## Overview

The frontend integration includes:
- **Chat UI Components**: Chat input, thread, widget
- **Context Visualization**: Budget controls, extraction pipeline
- **Memory Display**: Timeline, knowledge graph
- **Demo Pages**: Live memory, context engine demos

---

## Step 6.1: Analyze Frontend Source Structure

### Source Directory
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\
```

### Key Directories
```
src/
├── app/
│   ├── api/
│   │   ├── chat/route.ts          # Chat API route
│   │   ├── geolocation/route.ts   # Geolocation API
│   │   └── translate/route.ts     # Translation API
│   ├── chat/page.tsx              # Chat page
│   └── demos/
│       ├── live-memory/           # Memory demo
│       └── context-engine/        # Context demo
├── components/
│   ├── chat/                      # Chat components
│   │   ├── chat-header.tsx
│   │   ├── chat-input.tsx
│   │   ├── chat-panel.tsx
│   │   ├── chat-provider.tsx
│   │   ├── chat-thread.tsx
│   │   ├── chat-widget.tsx
│   │   └── chat-widget-button.tsx
│   ├── assistant-ui/              # Assistant UI components
│   ├── context-budget-viz.tsx     # Context budget visualization
│   ├── EnhancedBudgetControls.tsx # Budget controls
│   ├── ExtractionPipeline.tsx     # Extraction pipeline UI
│   ├── InteractiveKnowledgeGraph.tsx
│   ├── LiveInputTab.tsx
│   ├── MemoryTimeline.tsx
│   └── GraphNodeDetail.tsx
├── hooks/
├── lib/
├── types/
└── utils/
```

---

## Step 6.2: Migrate Chat Components

### Create chat directory if not exists
```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat"
```

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\chat\chat-header.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat\chat-header.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\chat\chat-input.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat\chat-input.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\chat\chat-panel.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat\chat-panel.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\chat\chat-provider.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat\chat-provider.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\chat\chat-thread.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat\chat-thread.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\chat\chat-widget.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat\chat-widget.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\chat\chat-widget-button.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat\chat-widget-button.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\chat\error-boundary.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\chat\error-boundary.tsx"
```

---

## Step 6.3: Migrate Assistant UI Components

### Create assistant-ui directory if not exists
```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\assistant-ui"
```

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\assistant-ui\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\assistant-ui\index.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\assistant-ui\message.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\assistant-ui\message.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\assistant-ui\thread.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\assistant-ui\thread.tsx"
```

---

## Step 6.4: Migrate Context Visualization Components

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\context-budget-viz.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\context-budget-viz.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\EnhancedBudgetControls.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\EnhancedBudgetControls.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\ExtractionPipeline.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\ExtractionPipeline.tsx"
```

---

## Step 6.5: Migrate Memory Visualization Components

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\InteractiveKnowledgeGraph.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\InteractiveKnowledgeGraph.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\LiveInputTab.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\LiveInputTab.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\MemoryTimeline.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\MemoryTimeline.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\GraphNodeDetail.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\GraphNodeDetail.tsx"
```

---

## Step 6.6: Migrate Demo Components

### Live Memory Demo

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\live-memory-demo.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\live-memory-demo.tsx"
```

### Other Demo Components

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\decentralized-network-demo.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\decentralized-network-demo.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\dynamic-intelligence-demo.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\dynamic-intelligence-demo.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\secure-collaboration-demo.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\secure-collaboration-demo.tsx"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\components\sovereign-history-demo.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\components\sovereign-history-demo.tsx"
```

---

## Step 6.7: Update Chat Page

### File: `packages/frontend/src/app/chat/page.tsx`

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\app\chat\page.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\app\chat\page.tsx"
```

---

## Step 6.8: Update Demo Pages

### Context Engine Demo

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\app\demos\context-engine\page.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\app\demos\context-engine\page.tsx"
```

### Live Memory Demo

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\app\demos\live-memory\page.tsx" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\app\demos\live-memory\page.tsx"
```

---

## Step 6.9: Update API Routes

### Chat API Route

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\app\api\chat\route.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\app\api\chat\route.ts"
```

### Geolocation API Route

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\app\api\geolocation\route.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\app\api\geolocation\route.ts"
```

### Translate API Route

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\app\api\translate\route.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\app\api\translate\route.ts"
```

---

## Step 6.10: Add Frontend Hooks

### Create hooks directory if not exists
```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\hooks"
```

### Check for hooks to migrate
```bash
ls "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\hooks\"
```

### Migrate all hooks
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\hooks\"* \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\hooks\"
```

---

## Step 6.11: Add Frontend Types

### Update types directory
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\types\"* \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\types\"
```

### Add user types if not exist
**File: `packages/frontend/src/types/user.ts`**
```typescript
export interface VirtualUser {
  id: string;
  fingerprintHash: string;
  createdAt: string;
  lastSeenAt: string;
  visitCount: number;
  preferences: Record<string, unknown>;
  privacySettings: PrivacySettings;
  consentGiven: boolean;
}

export interface PrivacySettings {
  dataCollection: boolean;
  personalization: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
}

export interface MemoryProfile {
  id: string;
  profileType: 'preference' | 'fact' | 'behavior' | 'context';
  category: string;
  key: string;
  value: unknown;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  metadata?: {
    tokens?: number;
    model?: string;
    provider?: string;
  };
}

export interface ContextBundle {
  id: string;
  bundleType: string;
  tokens: number;
  qualityScore?: number;
  relevanceScore?: number;
  createdAt: string;
}
```

---

## Step 6.12: Add Frontend Utilities

### Update lib and utils directories
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\lib\"* \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\lib\" 2>/dev/null || true

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend\src\utils\"* \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\frontend\src\utils\" 2>/dev/null || true
```

---

## Step 6.13: Update Frontend Package.json

### Add Dependencies

**File: `packages/frontend/package.json`**
```json
{
  "dependencies": {
    "socket.io-client": "^4.8.3",
    "@assistant-ui/react": "^0.7.0",
    "framer-motion": "^11.0.0"
  }
}
```

### Install Dependencies
```bash
cd packages/frontend
bun install
```

---

## Step 6.14: Add Environment Variables

### Frontend `.env.local`
```env
# Backend URL
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Feature Flags
NEXT_PUBLIC_CHAT_ENABLED=true
NEXT_PUBLIC_MEMORY_ENABLED=true
NEXT_PUBLIC_CONTEXT_ENGINE_ENABLED=true

# Analytics (optional)
NEXT_PUBLIC_ANALYTICS_ID=
```

---

## Step 6.15: Create Chat Provider Wrapper

### File: `packages/frontend/src/providers/chat-provider.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';

interface ChatContextType {
  socket: Socket | null;
  messages: ChatMessage[];
  isConnected: boolean;
  sendMessage: (content: string) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const connect = useCallback(() => {
    const newSocket = io(process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001');
    
    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    newSocket.on('chat:chunk', (chunk: { content: string }) => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage?.role === 'assistant' && !lastMessage.id.endsWith('-complete')) {
          return [
            ...prev.slice(0, -1),
            { ...lastMessage, content: lastMessage.content + chunk.content }
          ];
        }
        return [...prev, {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: chunk.content,
          createdAt: new Date().toISOString()
        }];
      });
    });

    newSocket.on('chat:complete', () => {
      setMessages(prev => {
        const lastMessage = prev[prev.length - 1];
        if (lastMessage) {
          return [...prev.slice(0, -1), { ...lastMessage, id: `${lastMessage.id}-complete` }];
        }
        return prev;
      });
    });

    setSocket(newSocket);
    return newSocket;
  }, []);

  const sendMessage = useCallback((content: string) => {
    if (!socket) {
      const newSocket = connect();
      newSocket.emit('chat:message', { message: content });
      return;
    }

    setMessages(prev => [...prev, {
      id: `${Date.now()}-user`,
      role: 'user',
      content,
      createdAt: new Date().toISOString()
    }]);

    socket.emit('chat:message', { message: content });
  }, [socket, connect]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider value={{ socket, messages, isConnected, sendMessage, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
```

---

## Verification Checklist

- [ ] All chat components migrated
- [ ] All assistant-ui components migrated
- [ ] Context visualization components migrated
- [ ] Memory visualization components migrated
- [ ] Demo components migrated
- [ ] API routes updated
- [ ] Hooks migrated
- [ ] Types updated
- [ ] Utilities updated
- [ ] Dependencies installed
- [ ] Environment variables configured
- [ ] Chat provider created
- [ ] Frontend builds successfully
- [ ] Frontend runs without errors
- [ ] Chat widget appears on page
- [ ] Messages can be sent and received

---

## Testing

### Build Test
```bash
cd packages/frontend
bun run build
```

### Dev Test
```bash
cd packages/frontend
bun run dev
```

### Component Test
- Navigate to `/chat` - Chat page should load
- Navigate to `/demos/context-engine` - Context demo should load
- Navigate to `/demos/live-memory` - Memory demo should load

---

## Git Checkpoint

```bash
git add .
git commit -m "feat(integration): Phase 6 - Frontend Integration

- Migrate chat components (header, input, panel, thread, widget)
- Migrate assistant-ui components
- Migrate context visualization components
- Migrate memory visualization components
- Migrate demo components
- Update API routes
- Add frontend hooks and types
- Add Socket.IO client dependency
- Create chat provider wrapper
- Add frontend environment variables"
```
