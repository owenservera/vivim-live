# Phase 4: Memory System

## Objective
Integrate the long-term memory storage, extraction, consolidation, and retrieval system.

## Duration
2-3 days

## Risk Level
Medium

---

## Overview

The Memory System provides:
- **Memory Extraction**: Extracting memories from conversations
- **Memory Consolidation**: Organizing and consolidating memories
- **Memory Retrieval**: Intelligent memory search and retrieval
- **Proactive Awareness**: Proactive memory suggestions
- **Profile Evolution**: User profile updates based on memories

---

## Step 4.1: Analyze Memory Directory Structure

### Source Directories
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\memory\
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\memory\
```

### Memory in Context Directory
```
context/memory/
├── index.ts                        # Memory exports
├── memory-consolidation-service.ts # Memory consolidation
├── memory-extraction-engine.ts     # Memory extraction
├── memory-retrieval-service.ts     # Memory retrieval
├── memory-service.ts               # Main memory service
└── memory-types.ts                 # Memory type definitions
```

### Memory in Services Directory
```
services/memory/
├── conversation-index-builder.ts   # Build conversation indices
├── conversation-recall.ts          # Conversation recall
├── proactive-awareness.ts          # Proactive suggestions
├── profile-evolver.ts              # Profile evolution
├── realtime-extractor.ts           # Real-time extraction
└── session-end-extractor.ts        # Session-end extraction
```

---

## Step 4.2: Migrate Context Memory Files

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\memory\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\memory\index.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\memory\memory-consolidation-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\memory\memory-consolidation-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\memory\memory-extraction-engine.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\memory\memory-extraction-engine.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\memory\memory-retrieval-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\memory\memory-retrieval-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\memory\memory-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\memory\memory-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\memory\memory-types.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\memory\memory-types.ts"
```

---

## Step 4.3: Create Services Memory Directory

### Create directory
```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\memory"
```

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\memory\conversation-index-builder.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\memory\conversation-index-builder.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\memory\conversation-recall.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\memory\conversation-recall.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\memory\proactive-awareness.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\memory\proactive-awareness.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\memory\profile-evolver.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\memory\profile-evolver.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\memory\realtime-extractor.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\memory\realtime-extractor.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\memory\session-end-extractor.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\memory\session-end-extractor.ts"
```

---

## Step 4.4: Migrate Additional Memory-Related Services

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\memory-conflict-detection.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\memory-conflict-detection.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\virtual-memory-adapter.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\virtual-memory-adapter.ts"
```

---

## Step 4.5: Migrate Memory Routes

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\memory.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\memory.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\memory-search.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\memory-search.js"
```

---

## Step 4.6: Add Memory Database Models

### Add to Prisma Schema

```prisma
// Memory Profile - Long-term memory storage
model MemoryProfile {
  id                String   @id @default(uuid())
  virtualUserId     String
  
  // Profile data
  profileType       String   // 'preference', 'fact', 'behavior', 'context'
  category          String   // 'personal', 'professional', 'preference', 'behavior'
  
  // Memory content
  key               String   // e.g., 'favorite_color', 'job_title'
  value             Json     @db.JsonB
  confidence        Float    @default(1.0)
  
  // Source tracking
  sourceType        String   // 'conversation', 'explicit', 'inferred'
  sourceConversationId String?
  
  // Lifecycle
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime @updatedAt @db.Timestamptz(6)
  lastAccessedAt    DateTime @default(now()) @db.Timestamptz(6)
  accessCount       Int      @default(0)
  expiresAt         DateTime? @db.Timestamptz(6)
  
  // Decay and relevance
  decayFactor       Float    @default(1.0)
  relevanceScore    Float    @default(1.0)
  
  // Relations
  virtualUser       VirtualUser @relation(fields: [virtualUserId], references: [id], onDelete: Cascade)
  
  @@unique([virtualUserId, profileType, key])
  @@index([virtualUserId])
  @@index([profileType])
  @@index([category])
  @@index([key])
  @@map("memory_profiles")
}

// Atomic Chat Unit - Granular conversation memory
model AtomicChatUnit {
  id                String   @id @default(uuid())
  conversationId    String
  messageId         String?
  virtualUserId     String?
  
  // ACU content
  content           String
  contentHash       String?
  embedding         Unsupported("vector(1536)")?
  
  // Classification
  unitType          String   // 'question', 'answer', 'statement', 'command', 'preference'
  topics            String[]
  entities          Json     @default("[]") @db.JsonB
  sentiment         String?
  
  // Metadata
  tokenCount        Int?
  qualityScore      Float?
  relevanceScore    Float?
  
  // Memory association
  memoryProfileId   String?
  
  // Timestamps
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  
  // Relations
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  message           Message? @relation(fields: [messageId], references: [id], onDelete: SetNull)
  virtualUser       VirtualUser? @relation(fields: [virtualUserId], references: [id], onDelete: SetNull)
  memoryProfile     MemoryProfile? @relation(fields: [memoryProfileId], references: [id], onDelete: SetNull)
  
  @@index([conversationId])
  @@index([virtualUserId])
  @@index([unitType])
  @@index([contentHash])
  @@index([createdAt(sort: Desc)])
  @@map("atomic_chat_units")
}

// Conversation Compaction - Summarized conversation segments
model ConversationCompaction {
  id                String   @id @default(uuid())
  conversationId    String
  
  // Compaction range
  startMessageIndex Int
  endMessageIndex   Int
  
  // Summary content
  summary           String
  keyTopics         String[]
  keyEntities       Json     @default("[]") @db.JsonB
  sentimentSummary  String?
  
  // Metadata
  tokenCount        Int
  originalTokens    Int
  compressionRatio  Float
  
  // Timestamps
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  
  // Relations
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@unique([conversationId, startMessageIndex, endMessageIndex])
  @@index([conversationId])
  @@map("conversation_compactions")
}
```

### Run Migration
```bash
cd packages/backend
bunx prisma migrate dev --name add_memory_system
bunx prisma generate
```

---

## Step 4.7: Update Memory Profile Relation

### Add to VirtualUser model in Prisma Schema

```prisma
model VirtualUser {
  // ... existing fields ...
  
  // Add memory profile relation
  memoryProfiles    MemoryProfile[]
}
```

### Add to MemoryProfile model

```prisma
model MemoryProfile {
  // ... existing fields ...
  
  // Add ACU relation
  acus              AtomicChatUnit[]
}
```

---

## Step 4.8: Register Memory Routes

### File to Modify: `src/server.js`

```javascript
// Add imports
import memoryRoutes from './routes/memory.js';
import memorySearchRoutes from './routes/memory-search.js';

// Register routes
app.use('/api/memory', memoryRoutes);
app.use('/api/memory-search', memorySearchRoutes);
```

---

## Step 4.9: Initialize Memory Services

### File to Modify: `src/server.js`

```javascript
// Add imports
import { MemoryService } from './context/memory/memory-service.js';
import { MemoryExtractionEngine } from './context/memory/memory-extraction-engine.js';
import { MemoryRetrievalService } from './context/memory/memory-retrieval-service.js';
import { ProfileEvolver } from './services/memory/profile-evolver.js';

// Initialize services
let memoryService;
let memoryExtractionEngine;
let memoryRetrievalService;
let profileEvolver;

async function initializeMemoryServices() {
  memoryService = new MemoryService(prisma);
  memoryExtractionEngine = new MemoryExtractionEngine(prisma);
  memoryRetrievalService = new MemoryRetrievalService(prisma);
  profileEvolver = new ProfileEvolver(prisma);
  
  await memoryService.initialize();
}

// Call in startup
await initializeMemoryServices();
```

---

## Step 4.10: Add Environment Variables

### Add to `.env`
```env
# Memory System
MEMORY_EMBEDDING_MODEL="text-embedding-3-small"
MEMORY_MAX_PROFILES=1000
MEMORY_DECAY_ENABLED=true
MEMORY_PROACTIVE_ENABLED=true
MEMORY_CONSOLIDATION_INTERVAL=3600000  # 1 hour in ms
```

---

## Step 4.11: Add pgvector Extension (if not exists)

### Check and add extension
```sql
-- Connect to database and run:
CREATE EXTENSION IF NOT EXISTS vector;
```

### Verify in Prisma Schema
```prisma
datasource db {
  provider   = "postgresql"
  url        = env("DATABASE_URL")
  extensions = [pgvector(map: "vector")]
}
```

---

## Verification Checklist

- [ ] All memory context files migrated
- [ ] All memory services migrated
- [ ] Memory routes registered
- [ ] Database migration completed
- [ ] pgvector extension enabled
- [ ] Memory services initialized
- [ ] Server starts without errors
- [ ] Memory API endpoints respond correctly

---

## API Endpoint Tests

```bash
# Store memory
curl -X POST http://localhost:3001/api/memory \
  -H "Content-Type: application/json" \
  -d '{
    "virtualUserId": "uuid",
    "profileType": "preference",
    "category": "personal",
    "key": "favorite_color",
    "value": "blue",
    "confidence": 0.9
  }'

# Get memories
curl http://localhost:3001/api/memory/{virtualUserId}

# Search memories
curl -X POST http://localhost:3001/api/memory-search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "color preferences",
    "virtualUserId": "uuid",
    "limit": 10
  }'

# Get user profile
curl http://localhost:3001/api/memory/profile/{virtualUserId}
```

---

## Git Checkpoint

```bash
git add .
git commit -m "feat(integration): Phase 4 - Memory System

- Migrate memory context files (extraction, consolidation, retrieval)
- Migrate memory services (index builder, recall, proactive, profile evolver)
- Add memory database models (profiles, ACUs, compactions)
- Add memory routes
- Initialize memory services
- Add pgvector extension support
- Add memory environment variables"
```
