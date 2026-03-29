# Phase 3: Context Engine Core

## Objective
Integrate the advanced context engine that provides intelligent context assembly, budget management, and context-aware AI interactions.

## Duration
3-4 days

## Risk Level
Medium

---

## Overview

The Context Engine is the heart of VIVIM's intelligent memory system. It manages:
- **Context Assembly**: Building relevant context for AI conversations
- **Budget Management**: Token budget allocation and optimization
- **Context Pipelining**: Multi-stage context processing
- **Thermodynamics**: Context decay and relevance scoring
- **Cortex Layer**: Advanced features (adaptive assembly, compression, situation detection)

---

## Step 3.1: Analyze Context Directory Structure

### Source Directory
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\
```

### Directory Tree
```
context/
├── adaptive-prediction.ts          # Predictive context loading
├── budget-algorithm.ts             # Token budget management
├── bundle-compiler.ts              # Context bundle compilation
├── bundle-differ.ts                # Context bundle diffing
├── context-assembler.ts            # Main context assembly
├── context-cache.js                # Caching layer (JS)
├── context-cache.ts                # Caching layer (TS)
├── context-event-bus.ts            # Event-driven context updates
├── context-graph.ts                # Context relationship graph
├── context-orchestrator.ts         # Context pipeline orchestration
├── context-pipeline.ts             # Multi-stage processing
├── context-telemetry.ts            # Context metrics
├── context-thermodynamics.ts       # Context decay/relevance
├── conversation-context-engine.ts  # Conversation-specific context
├── cortex/                         # Advanced context features
│   ├── adaptive-assembler.ts       # Adaptive context assembly
│   ├── index.ts                    # Cortex exports
│   ├── memory-compression.ts       # Memory compression
│   └── situation-detector.ts       # Situation awareness
├── hybrid-retrieval.ts             # Hybrid search/retrieval
├── index.ts                        # Main exports
├── isolated-context-engine.js      # Isolated context handling
├── librarian-worker.ts             # Background context processing
├── memory/                         # Memory subsystem (Phase 4)
├── prediction-engine.ts            # Context prediction
├── prefetch-engine.ts              # Context prefetching
├── query-optimizer.ts              # Query optimization
├── settings-integration.ts         # Settings integration
├── settings-service.ts             # Context settings
├── settings-types.ts               # Settings types
├── types.ts                        # Context types
├── unified-context-service.js      # Unified context API
├── user-context-system.js          # User-specific context
├── utils/                          # Utility functions
│   ├── acu-quality-scorer.ts       # ACU quality scoring
│   ├── circuit-breaker-service.ts  # Circuit breaker
│   ├── embedding-service.ts        # Embedding generation
│   ├── token-estimator.ts          # Token estimation
│   └── zai-service.ts              # ZAI integration
├── vivim-identity-context.json     # VIVIM identity context
├── vivim-identity-service.ts       # Identity context service
└── vivim-system-context.json       # System context
```

---

## Step 3.2: Files Requiring Direct Replacement

These files have significant changes and should replace the target versions entirely.

### Context Core Files

| Source File | Target Path | Reason |
|-------------|-------------|--------|
| `context/index.ts` | `src/context/index.ts` | Updated exports |
| `context/types.ts` | `src/context/types.ts` | New type definitions |
| `context/context-assembler.ts` | `src/context/context-assembler.ts` | Major updates |
| `context/context-orchestrator.ts` | `src/context/context-orchestrator.ts` | Major updates |
| `context/context-pipeline.ts` | `src/context/context-pipeline.ts` | Major updates |
| `context/conversation-context-engine.ts` | `src/context/conversation-context-engine.ts` | Major updates |

### Migration Commands
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\index.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\types.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\types.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-assembler.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-assembler.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-orchestrator.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-orchestrator.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-pipeline.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-pipeline.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\conversation-context-engine.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\conversation-context-engine.ts"
```

---

## Step 3.3: Files Requiring Merge/Adaptation

These files exist in both places but need careful merging of changes.

### Budget and Optimization

| Source File | Target Path | Adaptations |
|-------------|-------------|-------------|
| `context/budget-algorithm.ts` | `src/context/budget-algorithm.ts` | Merge new budget strategies |
| `context/bundle-compiler.ts` | `src/context/bundle-compiler.ts` | New compilation features |
| `context/bundle-differ.ts` | `src/context/bundle-differ.ts` | Enhanced diffing |
| `context/prediction-engine.ts` | `src/context/prediction-engine.ts` | New prediction models |
| `context/prefetch-engine.ts` | `src/context/prefetch-engine.ts` | Improved prefetching |
| `context/query-optimizer.ts` | `src/context/query-optimizer.ts` | Query optimization |

### Migration Commands
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\budget-algorithm.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\budget-algorithm.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\bundle-compiler.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\bundle-compiler.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\bundle-differ.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\bundle-differ.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\prediction-engine.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\prediction-engine.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\prefetch-engine.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\prefetch-engine.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\query-optimizer.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\query-optimizer.ts"
```

---

## Step 3.4: New Files to Add

These files don't exist in target and need to be added.

### New Caching Layer

| Source File | Target Path | Purpose |
|-------------|-------------|---------|
| `context/context-cache.js` | `src/context/context-cache.js` | JS caching layer |

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-cache.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-cache.js"
```

---

## Step 3.5: Update Context Utils

### Files to Replace

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\utils\acu-quality-scorer.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\utils\acu-quality-scorer.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\utils\circuit-breaker-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\utils\circuit-breaker-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\utils\embedding-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\utils\embedding-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\utils\token-estimator.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\utils\token-estimator.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\utils\zai-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\utils\zai-service.ts"
```

---

## Step 3.6: Update Cortex Layer

### Cortex Directory Files

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\cortex\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\cortex\index.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\cortex\adaptive-assembler.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\cortex\adaptive-assembler.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\cortex\memory-compression.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\cortex\memory-compression.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\cortex\situation-detector.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\cortex\situation-detector.ts"
```

---

## Step 3.7: Update Remaining Context Files

### Thermodynamics and Event Bus

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-thermodynamics.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-thermodynamics.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-event-bus.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-event-bus.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-graph.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-graph.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-telemetry.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-telemetry.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\context-cache.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\context-cache.ts"
```

### Retrieval and Integration

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\hybrid-retrieval.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\hybrid-retrieval.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\adaptive-prediction.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\adaptive-prediction.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\settings-integration.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\settings-integration.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\settings-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\settings-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\settings-types.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\settings-types.ts"
```

### Identity and System Context

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\vivim-identity-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\vivim-identity-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\vivim-identity-context.json" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\vivim-identity-context.json"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\vivim-system-context.json" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\vivim-system-context.json"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\isolated-context-engine.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\isolated-context-engine.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\unified-context-service.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\unified-context-service.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\user-context-system.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\user-context-system.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\context\librarian-worker.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\context\librarian-worker.ts"
```

---

## Step 3.8: Add Context Engine Routes

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\
```

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\context-engine.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\context-engine.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\context-settings.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\context-settings.ts"
```

---

## Step 3.9: Add Context Services

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\
```

### Files to Migrate

```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\context-generator.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\context-generator.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\context-startup.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\context-startup.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\context-warmup-worker.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\context-warmup-worker.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\streaming-context-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\streaming-context-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\unified-context-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\unified-context-service.ts"
```

---

## Step 3.10: Add Corpus Services (Context-Related)

### Create corpus directory if needed
```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus"
```

### Migrate corpus services
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\index.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\ingestion-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\ingestion-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\retrieval-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\retrieval-service.ts"
```

### Corpus subdirectories
```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\cache"
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\chunker"
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\context"
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\parsers"
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\retrieval"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\cache\cache-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\cache\cache-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\chunker\semantic-chunker.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\chunker\semantic-chunker.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\context\assembler.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\context\assembler.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\parsers\html-parser.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\parsers\html-parser.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\parsers\markdown-parser.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\parsers\markdown-parser.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\parsers\parser-factory.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\parsers\parser-factory.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\retrieval\keyword-search.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\retrieval\keyword-search.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\retrieval\qa-matching.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\retrieval\qa-matching.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\retrieval\reranker.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\retrieval\reranker.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\retrieval\scorer.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\retrieval\scorer.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\corpus\retrieval\semantic-search.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\corpus\retrieval\semantic-search.ts"
```

---

## Step 3.11: Add Orchestrator Services

### Create orchestrator directory if needed
```bash
mkdir -p "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\orchestrator"
```

### Migrate orchestrator services
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\orchestrator\avatar-classifier.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\orchestrator\avatar-classifier.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\orchestrator\budget-allocator.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\orchestrator\budget-allocator.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\orchestrator\context-merger.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\orchestrator\context-merger.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\orchestrator\dual-engine-orchestrator.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\orchestrator\dual-engine-orchestrator.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\orchestrator\intent-classifier.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\orchestrator\intent-classifier.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\orchestrator\weight-calculator.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\orchestrator\weight-calculator.ts"
```

---

## Step 3.12: Update Server Integration

### File to Modify: `src/server.js`

```javascript
// Add imports
import { ContextOrchestrator } from './context/context-orchestrator.js';
import { ConversationContextEngine } from './context/conversation-context-engine.js';
import { ContextPipeline } from './context/context-pipeline.js';

// Initialize context engine
let contextEngine;
let contextPipeline;

async function initializeContextEngine() {
  contextEngine = new ConversationContextEngine(prisma);
  contextPipeline = new ContextPipeline(prisma);
  await contextEngine.initialize();
}

// Call in startup
await initializeContextEngine();

// Register context routes
import contextEngineRoutes from './routes/context-engine.js';
import contextSettingsRoutes from './routes/context-settings.js';

app.use('/api/context', contextEngineRoutes);
app.use('/api/context-settings', contextSettingsRoutes);
```

---

## Step 3.13: Add Context Bundle Database Model

### Add to Prisma Schema

```prisma
model ContextBundle {
  id                String   @id @default(uuid())
  virtualUserId     String?
  conversationId    String?
  
  // Bundle content
  bundleType        String   // 'conversation', 'user', 'system'
  tokens            Int
  compressedTokens  Int?
  content           Json     @db.JsonB
  
  // Metadata
  qualityScore      Float?
  relevanceScore    Float?
  decayFactor       Float    @default(1.0)
  
  // Timestamps
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  expiresAt         DateTime? @db.Timestamptz(6)
  lastAccessedAt    DateTime @default(now()) @db.Timestamptz(6)
  accessCount       Int      @default(0)
  
  // Relations
  virtualUser       VirtualUser?  @relation(fields: [virtualUserId], references: [id], onDelete: Cascade)
  conversation      Conversation? @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([virtualUserId])
  @@index([conversationId])
  @@index([bundleType])
  @@index([createdAt(sort: Desc)])
  @@map("context_bundles")
}
```

### Run Migration
```bash
cd packages/backend
bunx prisma migrate dev --name add_context_bundles
bunx prisma generate
```

---

## Verification Checklist

- [ ] All context files migrated
- [ ] All context utils migrated
- [ ] All cortex files migrated
- [ ] All corpus services migrated
- [ ] All orchestrator services migrated
- [ ] Context routes registered
- [ ] Database migration completed
- [ ] Server starts without errors
- [ ] Context API endpoints respond correctly

---

## API Endpoint Tests

```bash
# Get context for conversation
curl http://localhost:3001/api/context/conversation/{id}

# Get user context
curl http://localhost:3001/api/context/user/{virtualUserId}

# Get context settings
curl http://localhost:3001/api/context-settings

# Update context settings
curl -X PUT http://localhost:3001/api/context-settings \
  -H "Content-Type: application/json" \
  -d '{"budgetLimit": 8000, "decayEnabled": true}'
```

---

## Git Checkpoint

```bash
git add .
git commit -m "feat(integration): Phase 3 - Context Engine Core

- Migrate all context engine files
- Migrate cortex layer (adaptive assembler, compression, situation detector)
- Migrate corpus services (ingestion, retrieval, parsing)
- Migrate orchestrator services (budget allocation, context merger)
- Add context engine routes
- Add context bundle database model
- Update server integration"
```
