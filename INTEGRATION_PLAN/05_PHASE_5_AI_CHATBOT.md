# Phase 5: AI Chat Bot Integration

## Objective
Integrate the complete AI chatbot system with streaming responses, context integration, and memory awareness.

## Duration
2-3 days

## Risk Level
High

---

## Overview

The AI Chat Bot system provides:
- **Streaming Responses**: Real-time AI response streaming
- **Multi-Provider Support**: OpenAI, Anthropic, Google, X.AI
- **Context Integration**: Full integration with context engine
- **Memory Awareness**: Chat bot is aware of user memories
- **Tool Calling**: Second brain tools for memory operations

---

## Step 5.1: Analyze AI Chat Directory Structure

### Source Directories
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\
```

### AI Directory Structure
```
ai/
├── agent-pipeline.js          # Agent execution pipeline
├── errors.js                  # AI error handling
├── system-prompts.js          # System prompt templates
├── unified-provider.js        # Unified AI provider interface
├── middleware/
│   └── telemetry.js           # AI telemetry/monitoring
├── providers/
│   ├── base.js                # Base provider class
│   ├── zai-provider.js        # ZAI provider
│   └── zai.js                 # ZAI implementation
├── tools/
│   ├── index.js               # Tool exports
│   └── second-brain-tools.js  # Memory/context tools
├── types/                     # AI type definitions
└── utils/                     # AI utilities
```

### Chat Routes
```
routes/
├── ai-chat.js                 # Main AI chat route
├── ai.js                      # AI operations
├── ai-settings.js             # AI configuration
├── chatbot/
│   └── index.ts               # Chatbot route handlers
```

---

## Step 5.2: Migrate AI Core Files

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\agent-pipeline.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\agent-pipeline.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\errors.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\errors.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\system-prompts.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\system-prompts.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\unified-provider.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\unified-provider.js"
```

---

## Step 5.3: Migrate AI Middleware

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\middleware\telemetry.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\middleware\telemetry.js"
```

---

## Step 5.4: Migrate AI Providers

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\providers\base.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\providers\base.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\providers\zai-provider.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\providers\zai-provider.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\providers\zai.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\providers\zai.js"
```

---

## Step 5.5: Migrate AI Tools (Critical for Memory Integration)

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\tools\index.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\tools\index.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\tools\second-brain-tools.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\tools\second-brain-tools.js"
```

---

## Step 5.6: Create AI Types and Utils Directories (if not exist)

```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\types"
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\ai\utils"
```

### Check for files to copy from source
```bash
# Copy any type or utility files if they exist in source
ls "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\types\"
ls "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\utils\"
```

---

## Step 5.7: Migrate Chat Routes

### Main AI Chat Route

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\ai-chat.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\ai-chat.js"
```

### AI Settings Route

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\ai-settings.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\ai-settings.js"
```

### AI Operations Route

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\ai.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\ai.js"
```

### Chatbot Subdirectory

```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\chatbot"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\chatbot\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\chatbot\index.ts"
```

---

## Step 5.8: Migrate AI Services

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\ai-service.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\ai-service.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\ai-storage-service.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\ai-storage-service.js"
```

---

## Step 5.9: Register Chat Routes in Server

### File to Modify: `src/server.js`

```javascript
// Add imports
import aiChatRoutes from './routes/ai-chat.js';
import aiSettingsRoutes from './routes/ai-settings.js';
import aiRoutes from './routes/ai.js';
import chatbotRoutes from './routes/chatbot/index.ts';

// Register routes
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/ai-settings', aiSettingsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chatbot', chatbotRoutes);
```

---

## Step 5.10: Initialize AI Services

### File to Modify: `src/server.js`

```javascript
// Add imports
import { UnifiedProvider } from './ai/unified-provider.js';
import { AgentPipeline } from './ai/agent-pipeline.js';
import { registerSecondBrainTools } from './ai/tools/index.js';

// Initialize AI services
let unifiedProvider;
let agentPipeline;

async function initializeAIServices() {
  unifiedProvider = new UnifiedProvider();
  agentPipeline = new AgentPipeline(unifiedProvider, {
    contextEngine,
    memoryService,
    prisma
  });
  
  // Register memory tools
  registerSecondBrainTools(agentPipeline, {
    memoryService,
    memoryRetrievalService,
    profileEvolver
  });
}

// Call in startup
await initializeAIServices();
```

---

## Step 5.11: Add Socket.IO for Streaming

### Update Server for WebSocket Support

```javascript
// src/server.js
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('chat:message', async (data) => {
    try {
      // Stream AI response
      const stream = await agentPipeline.streamResponse(data);
      for await (const chunk of stream) {
        socket.emit('chat:chunk', chunk);
      }
      socket.emit('chat:complete');
    } catch (error) {
      socket.emit('chat:error', { message: error.message });
    }
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Replace app.listen with httpServer.listen
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Step 5.12: Add Environment Variables

### Add to `.env`
```env
# AI Providers
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GOOGLE_AI_API_KEY="..."
XAI_API_KEY="..."

# AI Settings
AI_DEFAULT_PROVIDER="openai"
AI_DEFAULT_MODEL="gpt-4o"
AI_MAX_TOKENS=4096
AI_TEMPERATURE=0.7
AI_STREAMING_ENABLED=true

# Rate Limiting
AI_RATE_LIMIT_REQUESTS=100
AI_RATE_LIMIT_WINDOW=60000
```

---

## Step 5.13: Add Rate Limiting for AI Endpoints

### Update Rate Limit Configuration

```javascript
// src/middleware/rate-limit.js or in server.js

import rateLimit from 'express-rate-limit';

export const aiRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AI_RATE_LIMIT_WINDOW) || 60000, // 1 minute
  max: parseInt(process.env.AI_RATE_LIMIT_REQUESTS) || 100,
  message: {
    error: 'Too many AI requests, please try again later.',
    retryAfter: '1 minute'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to AI routes
app.use('/api/ai-chat', aiRateLimiter);
app.use('/api/chatbot', aiRateLimiter);
```

---

## Step 5.14: Update Frontend Chat Integration

### Frontend API Route Update

**File: `packages/frontend/src/app/api/chat/route.ts`**

This file should be updated to connect to the backend AI chat service:

```typescript
import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  const response = await fetch(`${BACKEND_URL}/api/ai-chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response;
}
```

---

## Verification Checklist

- [ ] All AI core files migrated
- [ ] All AI providers migrated
- [ ] AI tools (second-brain-tools) migrated
- [ ] AI routes registered
- [ ] AI services initialized
- [ ] Socket.IO configured for streaming
- [ ] Rate limiting applied
- [ ] Environment variables configured
- [ ] Server starts without errors
- [ ] Chat API endpoints respond correctly
- [ ] Streaming responses work
- [ ] Memory tools integrated

---

## API Endpoint Tests

```bash
# Send chat message
curl -X POST http://localhost:3001/api/ai-chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, can you remember that my favorite color is blue?",
    "virtualUserId": "uuid",
    "conversationId": "uuid"
  }'

# Get AI settings
curl http://localhost:3001/api/ai-settings

# Update AI settings
curl -X PUT http://localhost:3001/api/ai-settings \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "openai",
    "model": "gpt-4o",
    "temperature": 0.7
  }'

# Chatbot endpoint
curl -X POST http://localhost:3001/api/chatbot/message \
  -H "Content-Type: application/json" \
  -d '{
    "message": "What do you know about me?",
    "sessionId": "session-uuid"
  }'
```

---

## WebSocket Tests

```javascript
// Client-side test
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
  
  socket.emit('chat:message', {
    message: 'Hello from WebSocket',
    virtualUserId: 'uuid',
    conversationId: 'uuid'
  });
});

socket.on('chat:chunk', (chunk) => {
  console.log('Received chunk:', chunk);
});

socket.on('chat:complete', () => {
  console.log('Chat complete');
});

socket.on('chat:error', (error) => {
  console.error('Chat error:', error);
});
```

---

## Git Checkpoint

```bash
git add .
git commit -m "feat(integration): Phase 5 - AI Chat Bot Integration

- Migrate AI core files (agent pipeline, unified provider)
- Migrate AI providers (base, ZAI)
- Migrate AI tools (second-brain-tools for memory)
- Migrate AI routes (ai-chat, ai-settings, chatbot)
- Add Socket.IO for streaming responses
- Add rate limiting for AI endpoints
- Initialize AI services with context/memory integration
- Add AI environment variables
- Update frontend chat API route"
```
