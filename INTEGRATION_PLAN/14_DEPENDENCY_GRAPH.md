# System Dependency Graph

## How Everything Connects

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (Next.js)                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Chat Page   │  │  Chat Widget │  │  Memory UI  │  │ Context UI  │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │            │
│         └─────────────────┴────────┬────────┴─────────────────┘            │
│                                    │                                         │
│                           ┌───────▼───────┐                                 │
│                           │  API Routes   │                                 │
│                           │  (Next.js)     │                                 │
│                           └───────┬───────┘                                 │
└──────────────────────────────────┼──────────────────────────────────────────┘
                                   │ HTTP/WebSocket
┌──────────────────────────────────▼──────────────────────────────────────────┐
│                              BACKEND (Express + Bun)                        │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                         ROUTING LAYER                                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │AI Chat   │ │Context   │ │ Memory   │ │Virtual   │ │Health   │  │  │
│  │  │ Routes   │ │ Routes   │ │ Routes   │ │User      │ │Routes   │  │  │
│  │  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘  │  │
│  └───────┼───────────┼───────────┼───────────┼───────────┼───────────┘  │
│          │           │           │           │           │              │
│  ┌───────▼───────────▼───────────▼───────────▼───────────▼───────────┐  │
│  │                      MIDDLEWARE CHAIN                              │  │
│  │  Rate Limit → Auth → Virtual User → Request ID → Error Handler    │  │
│  └──────────────────────────┬──────────────────────────────────────────┘  │
└─────────────────────────────┼──────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────────────────────┐
│                           SERVICE LAYER                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐  │
│  │                        AI SERVICES                                   │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │UnifiedProvider│  │AgentPipeline   │  │ SecondBrainTools       │  │  │
│  │  │(OpenAI/Anthrop│◄─┤(Context+Memory)│◄─┤ (Memory Operations)   │  │  │
│  │  │ic/Google/XAI) │  └───────┬────────┘  └────────────────────────┘  │  │
│  │  └────────────────┘          │                                       │  │
│  └─────────────────────────────┼───────────────────────────────────────┘  │
│                                │                                            │
│  ┌─────────────────────────────▼───────────────────────────────────────┐  │
│  │                    CONTEXT ENGINE                                     │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │ContextOrchestr│  │ ContextAssembler│  │ContextPipeline        │  │  │
│  │  │   ator        │◄─┤  (Budget+Merge) │◄─┤ (Multi-stage)        │  │  │
│  │  └───────┬────────┘  └───────┬────────┘  └────────────────────────┘  │  │
│  │          │                   │                                       │  │
│  │  ┌───────▼───────────────────▼───────────────────────────────────┐  │  │
│  │  │                     CORTEX LAYER                              │  │  │
│  │  │  AdaptiveAssembler │ MemoryCompression │ SituationDetector    │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                │                                            │
│  ┌─────────────────────────────▼───────────────────────────────────────┐  │
│  │                     MEMORY SYSTEM                                    │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │MemoryService  │  │MemoryExtract   │  │MemoryRetrieval        │  │  │
│  │  │(CRUD+Profile)│◄─┤  Engine       │◄─┤  Service              │  │  │
│  │  └───────┬────────┘  └───────┬────────┘  └────────────────────────┘  │  │
│  │          │                   │                                       │  │
│  │  ┌───────▼───────────────────▼───────────────────────────────────┐  │  │
│  │  │                   PROFILE EVOLUTION                            │  │  │
│  │  │  ConversationRecall │ ProactiveAwareness │ SessionExtractor     │  │  │
│  │  └───────────────────────────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
│                                │                                            │
│  ┌─────────────────────────────▼───────────────────────────────────────┐  │
│  │                  USER IDENTIFICATION                                │  │
│  │  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────┐  │  │
│  │  │IdentityService│  │DeviceFingerprint│  │VirtualUserManager    │  │  │
│  │  │              │◄─┘  Service         │◄─┘                      │  │  │
│  │  └────────────────┘  └────────────────┘  └────────────────────────┘  │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────┬───────────────────────────────────┘
                                        │
┌───────────────────────────────────────▼───────────────────────────────────┐
│                          DATA LAYER                                         │
│                                                                             │
│  ┌──────────────────────────────┐  ┌──────────────────────────────────┐   │
│  │      POSTGRESQL + PRISMA     │  │          REDIS                   │   │
│  │                              │  │                                  │   │
│  │  VirtualUsers                │  │  Rate Limit Store               │   │
│  │  MemoryProfiles              │◄─┤  Session Cache                  │   │
│  │  AtomicChatUnits             │  │  Real-time Pub/Sub              │   │
│  │  ContextBundles              │  │  Context Cache                  │   │
│  │  Conversations               │  │                                  │   │
│  │  Messages                    │  │                                  │   │
│  │                              │  │                                  │   │
│  │        ◄─────────────────────┼──┘                                  │   │
│  │        │    pgvector for embeddings                               │   │
│  └────────┴───────────────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Service Dependencies

### Who Depends On What

```
┌─────────────────────┐
│   UnifiedProvider   │◄──────────── AI API Keys
└─────────┬───────────┘
          │
    ┌─────▼─────┐
    │AgentPipeline│
    └─────┬─────┘
          │
    ┌─────▼─────────────────────────────────────────────┐
    │              SecondBrainTools                       │
    │  ┌─────────────┐  ┌──────────────┐  ┌───────────┐  │
    │  │MemoryService│  │MemoryRetrieval│  │Profile    │  │
    │  └──────┬──────┘  └──────┬───────┘  │Evolution │  │
    │         │                │           └─────┬─────┘  │
    └─────────┼────────────────┼─────────────────┼────────┘
              │                │                 │
        ┌─────▼───────────────▼─────────────────▼─────┐
        │           ContextEngine                    │
        │  ┌─────────────────────────────────────┐  │
        │  │ContextAssembler │Cortex │Pipeline   │  │
        │  └─────────────────┬───────────────────┘  │
        └──────────────────┼──────────────────────┘
                           │
        ┌─────────────────┼─────────────────────┐
        │                 │                      │
    ┌───▼───┐        ┌────▼────┐           ┌─────▼─────┐
    │Prisma │        │Redis    │           │VirtualUser │
    │Client │◄──────┤Cache    │           │ Manager    │
    └───────┘        └─────────┘           └───────────┘
```

---

## Data Flow: Chat Message

```
User Message
    │
    ▼
┌────────────────────────┐
│  Frontend Chat Widget  │
│  (React + Socket.IO)   │
└──────────┬─────────────┘
           │ WebSocket: 'chat:message'
           ▼
┌────────────────────────┐
│   Socket.IO Server      │
│   (Express + Bun)       │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│   Rate Limiter          │
│   (Redis-backed)        │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  Virtual User Auth      │
│  (Extract fingerprint) │
└──────────┬─────────────┘
           │
           ▼
┌────────────────────────┐
│  AgentPipeline          │
│  ┌──────────────────┐ │
│  │1. Get Context    │ │
│  │2. Get Memory     │ │
│  │3. Build Prompt   │ │
│  │4. Call AI        │ │
│  │5. Stream Response│ │
│  └──────────────────┘ │
└──────────┬─────────────┘
           │
     ┌─────┼─────┬──────────────┐
     │     │     │              │
     ▼     ▼     ▼              ▼
┌───────┐┌─────┐┌─────────┐ ┌──────────┐
│Context││Memory││AI Call  │ │WebSocket│
│Engine ││System││Provider │ │ Response │
└───┬───┘└───┬──┘└────┬────┘ └────┬────┘
    │        │        │            │
    │        │        │            │ 'chat:chunk'
    │        │        │            ▼
    │        │        │     ┌──────────┐
    │        │        │     │ Frontend │
    │        │        │     │ Update   │
    │        │        │     └──────────┘
    │        │        │
    │        │        │ 'chat:complete'
    │        │        │         │
    │        │        │         ▼
    │        │        │  ┌──────────┐
    │        │        │  │ Extract  │
    │        │        │  │ Memory   │
    │        │        │  └────┬─────┘
    │        │        │       │
    └────────┴────────┴───────┘
              │
              ▼
       ┌──────────────┐
       │   Prisma     │
       │   (Persist)  │
       └──────────────┘
```

---

## Key Entry Points

| Endpoint | File | Purpose |
|----------|------|---------|
| `/api/ai-chat` | `routes/ai-chat.js` | Main chat endpoint |
| `/api/context/*` | `routes/context-engine.ts` | Context management |
| `/api/memory/*` | `routes/memory.ts` | Memory CRUD |
| `/api/virtual-user/*` | `routes/virtual-user.ts` | User management |
| WebSocket `/` | `server.js` | Real-time chat |
| `/api/health` | `routes/health.js` | Health check |

---

## Shared Utilities

```
┌─────────────────────────────────────────────┐
│              SHARED UTILITIES               │
├─────────────────────────────────────────────┤
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Logger     │  │  Config (env vars)   │ │
│  │   (pino)     │  │                      │ │
│  └──────────────┘  └──────────────────────┘ │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │    Prisma    │  │    Validation        │ │
│  │   Client     │  │    (Zod)            │ │
│  └──────────────┘  └──────────────────────┘ │
│                                              │
│  ┌──────────────┐  ┌──────────────────────┐ │
│  │   Crypto     │  │    Rate Limiter      │ │
│  │  (tweetnacl) │  │  (express-rate-limit) │ │
│  └──────────────┘  └──────────────────────┘ │
│                                              │
└─────────────────────────────────────────────┘
                    │
                    ▼ uses all of these
```

---

## External Dependencies

```
┌────────────────────────────────────────────────────┐
│                  EXTERNAL APIS                      │
├────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌────────────┐ │
│  │   OpenAI    │  │  Anthropic  │  │  Google AI │ │
│  │   (GPT-4)  │  │  (Claude)   │  │ (Gemini)  │ │
│  └──────┬──────┘  └──────┬──────┘  └─────┬─────┘ │
│         │                │               │        │
│         └────────────────┼───────────────┘        │
│                          │                        │
│                    AI Responses                   │
│                    (Streaming)                    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## Critical Paths

### Path 1: User Sends Message
```
Frontend → Socket → RateLimit → AgentPipeline → AI → Socket → Frontend
```

### Path 2: Memory Extraction
```
Message → MemoryExtractor → AI → MemoryProfile → Prisma
```

### Path 3: Context Assembly
```
Request → ContextEngine → MemoryRetrieval → ContextAssembler → Prisma → Redis
```

### Path 4: User Identification
```
Request → Fingerprint → Hash → VirtualUser Manager → Prisma
```

---

## What Can Fail Where

| Component | Failure Mode | Impact |
|-----------|--------------|--------|
| AI Provider | Rate limit / down | Chat fails |
| Prisma | Connection lost | All DB ops fail |
| Redis | Connection lost | Cache/Rate limit fail |
| Virtual User | Fingerprint change | User identity lost |
| Memory | Extraction fails | No learning |
| Context | Budget overflow | Poor responses |
