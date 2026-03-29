# File Migration Checklist

## Complete File Migration Reference

This document provides a comprehensive checklist of all files that need to be migrated from source to target.

---

## Source Directory
```
C:\0-BlackBoxProject-0\vivim-source-code
```

## Target Directory
```
C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago
```

---

## Phase 1: Foundation Files

### Dependency Injection
- [ ] `packages/backend/src/di/container.ts`

### Interfaces
- [ ] `packages/backend/src/interfaces/service-interfaces.ts`

### Library Files
- [ ] `packages/backend/src/lib/encryption.ts`
- [ ] `packages/backend/src/lib/redis.js`
- [ ] `packages/backend/src/lib/redis.ts`

### Middleware
- [ ] `packages/backend/src/middleware/error-handler.ts`
- [ ] `packages/backend/src/middleware/errorHandler.ts`
- [ ] `packages/backend/src/middleware/requestId.ts`
- [ ] `packages/backend/src/middleware/validation.ts`

### Shared Package
- [ ] `packages/shared/src/types/index.ts`
- [ ] `packages/shared/src/auth/index.ts`

### Type Definitions
- [ ] `packages/backend/src/@types/express.d.ts`
- [ ] `packages/backend/src/@types/opossum.d.ts`

---

## Phase 2: User Identification Files

### Services
- [ ] `packages/backend/src/services/identity-service.ts`
- [ ] `packages/backend/src/services/device-fingerprinting-service.ts`
- [ ] `packages/backend/src/services/virtual-user-manager.ts`
- [ ] `packages/backend/src/services/virtual-user-privacy.ts`
- [ ] `packages/backend/src/services/tier-orchestrator.ts`

### Middleware
- [ ] `packages/backend/src/middleware/virtual-user-auth.ts`
- [ ] `packages/backend/src/middleware/unified-auth.js`

### Routes
- [ ] `packages/backend/src/routes/virtual-user.ts`
- [ ] `packages/backend/src/routes/identity.js`
- [ ] `packages/backend/src/routes/identity-v2.js`

---

## Phase 3: Context Engine Files

### Core Context Files
- [ ] `packages/backend/src/context/index.ts`
- [ ] `packages/backend/src/context/types.ts`
- [ ] `packages/backend/src/context/context-assembler.ts`
- [ ] `packages/backend/src/context/context-orchestrator.ts`
- [ ] `packages/backend/src/context/context-pipeline.ts`
- [ ] `packages/backend/src/context/conversation-context-engine.ts`

### Budget & Optimization
- [ ] `packages/backend/src/context/budget-algorithm.ts`
- [ ] `packages/backend/src/context/bundle-compiler.ts`
- [ ] `packages/backend/src/context/bundle-differ.ts`
- [ ] `packages/backend/src/context/prediction-engine.ts`
- [ ] `packages/backend/src/context/prefetch-engine.ts`
- [ ] `packages/backend/src/context/query-optimizer.ts`

### Context Infrastructure
- [ ] `packages/backend/src/context/context-cache.js`
- [ ] `packages/backend/src/context/context-cache.ts`
- [ ] `packages/backend/src/context/context-event-bus.ts`
- [ ] `packages/backend/src/context/context-graph.ts`
- [ ] `packages/backend/src/context/context-telemetry.ts`
- [ ] `packages/backend/src/context/context-thermodynamics.ts`
- [ ] `packages/backend/src/context/adaptive-prediction.ts`
- [ ] `packages/backend/src/context/hybrid-retrieval.ts`

### Settings
- [ ] `packages/backend/src/context/settings-integration.ts`
- [ ] `packages/backend/src/context/settings-service.ts`
- [ ] `packages/backend/src/context/settings-types.ts`

### Identity & System
- [ ] `packages/backend/src/context/vivim-identity-service.ts`
- [ ] `packages/backend/src/context/vivim-identity-context.json`
- [ ] `packages/backend/src/context/vivim-system-context.json`
- [ ] `packages/backend/src/context/isolated-context-engine.js`
- [ ] `packages/backend/src/context/unified-context-service.js`
- [ ] `packages/backend/src/context/user-context-system.js`
- [ ] `packages/backend/src/context/librarian-worker.ts`

### Context Utils
- [ ] `packages/backend/src/context/utils/acu-quality-scorer.ts`
- [ ] `packages/backend/src/context/utils/circuit-breaker-service.ts`
- [ ] `packages/backend/src/context/utils/embedding-service.ts`
- [ ] `packages/backend/src/context/utils/token-estimator.ts`
- [ ] `packages/backend/src/context/utils/zai-service.ts`

### Cortex Layer
- [ ] `packages/backend/src/context/cortex/index.ts`
- [ ] `packages/backend/src/context/cortex/adaptive-assembler.ts`
- [ ] `packages/backend/src/context/cortex/memory-compression.ts`
- [ ] `packages/backend/src/context/cortex/situation-detector.ts`

### Context Routes
- [ ] `packages/backend/src/routes/context-engine.ts`
- [ ] `packages/backend/src/routes/context-settings.ts`

### Context Services
- [ ] `packages/backend/src/services/context-generator.js`
- [ ] `packages/backend/src/services/context-startup.ts`
- [ ] `packages/backend/src/services/context-warmup-worker.ts`
- [ ] `packages/backend/src/services/streaming-context-service.ts`
- [ ] `packages/backend/src/services/unified-context-service.ts`

### Corpus Services
- [ ] `packages/backend/src/services/corpus/index.ts`
- [ ] `packages/backend/src/services/corpus/ingestion-service.ts`
- [ ] `packages/backend/src/services/corpus/retrieval-service.ts`
- [ ] `packages/backend/src/services/corpus/cache/cache-service.ts`
- [ ] `packages/backend/src/services/corpus/chunker/semantic-chunker.ts`
- [ ] `packages/backend/src/services/corpus/context/assembler.ts`
- [ ] `packages/backend/src/services/corpus/parsers/html-parser.ts`
- [ ] `packages/backend/src/services/corpus/parsers/markdown-parser.ts`
- [ ] `packages/backend/src/services/corpus/parsers/parser-factory.ts`
- [ ] `packages/backend/src/services/corpus/retrieval/keyword-search.ts`
- [ ] `packages/backend/src/services/corpus/retrieval/qa-matching.ts`
- [ ] `packages/backend/src/services/corpus/retrieval/reranker.ts`
- [ ] `packages/backend/src/services/corpus/retrieval/scorer.ts`
- [ ] `packages/backend/src/services/corpus/retrieval/semantic-search.ts`

### Corpus Routes
- [ ] `packages/backend/src/routes/corpus/index.ts`

### Orchestrator Services
- [ ] `packages/backend/src/services/orchestrator/avatar-classifier.ts`
- [ ] `packages/backend/src/services/orchestrator/budget-allocator.ts`
- [ ] `packages/backend/src/services/orchestrator/context-merger.ts`
- [ ] `packages/backend/src/services/orchestrator/dual-engine-orchestrator.ts`
- [ ] `packages/backend/src/services/orchestrator/intent-classifier.ts`
- [ ] `packages/backend/src/services/orchestrator/weight-calculator.ts`

---

## Phase 4: Memory System Files

### Context Memory
- [ ] `packages/backend/src/context/memory/index.ts`
- [ ] `packages/backend/src/context/memory/memory-consolidation-service.ts`
- [ ] `packages/backend/src/context/memory/memory-extraction-engine.ts`
- [ ] `packages/backend/src/context/memory/memory-retrieval-service.ts`
- [ ] `packages/backend/src/context/memory/memory-service.ts`
- [ ] `packages/backend/src/context/memory/memory-types.ts`

### Memory Services
- [ ] `packages/backend/src/services/memory/conversation-index-builder.ts`
- [ ] `packages/backend/src/services/memory/conversation-recall.ts`
- [ ] `packages/backend/src/services/memory/proactive-awareness.ts`
- [ ] `packages/backend/src/services/memory/profile-evolver.ts`
- [ ] `packages/backend/src/services/memory/realtime-extractor.ts`
- [ ] `packages/backend/src/services/memory/session-end-extractor.ts`

### Additional Memory Files
- [ ] `packages/backend/src/services/memory-conflict-detection.ts`
- [ ] `packages/backend/src/services/virtual-memory-adapter.ts`

### Memory Routes
- [ ] `packages/backend/src/routes/memory.ts`
- [ ] `packages/backend/src/routes/memory-search.js`

---

## Phase 5: AI Chat Bot Files

### AI Core
- [ ] `packages/backend/src/ai/agent-pipeline.js`
- [ ] `packages/backend/src/ai/errors.js`
- [ ] `packages/backend/src/ai/system-prompts.js`
- [ ] `packages/backend/src/ai/unified-provider.js`

### AI Middleware
- [ ] `packages/backend/src/ai/middleware/telemetry.js`

### AI Providers
- [ ] `packages/backend/src/ai/providers/base.js`
- [ ] `packages/backend/src/ai/providers/zai-provider.js`
- [ ] `packages/backend/src/ai/providers/zai.js`

### AI Tools
- [ ] `packages/backend/src/ai/tools/index.js`
- [ ] `packages/backend/src/ai/tools/second-brain-tools.js`

### AI Routes
- [ ] `packages/backend/src/routes/ai-chat.js`
- [ ] `packages/backend/src/routes/ai-settings.js`
- [ ] `packages/backend/src/routes/ai.js`
- [ ] `packages/backend/src/routes/chatbot/index.ts`

### AI Services
- [ ] `packages/backend/src/services/ai-service.js`
- [ ] `packages/backend/src/services/ai-storage-service.js`

---

## Phase 6: Frontend Files

### Chat Components
- [ ] `packages/frontend/src/components/chat/chat-header.tsx`
- [ ] `packages/frontend/src/components/chat/chat-input.tsx`
- [ ] `packages/frontend/src/components/chat/chat-panel.tsx`
- [ ] `packages/frontend/src/components/chat/chat-provider.tsx`
- [ ] `packages/frontend/src/components/chat/chat-thread.tsx`
- [ ] `packages/frontend/src/components/chat/chat-widget.tsx`
- [ ] `packages/frontend/src/components/chat/chat-widget-button.tsx`
- [ ] `packages/frontend/src/components/chat/error-boundary.tsx`

### Assistant UI
- [ ] `packages/frontend/src/components/assistant-ui/index.ts`
- [ ] `packages/frontend/src/components/assistant-ui/message.tsx`
- [ ] `packages/frontend/src/components/assistant-ui/thread.tsx`

### Context Components
- [ ] `packages/frontend/src/components/context-budget-viz.tsx`
- [ ] `packages/frontend/src/components/EnhancedBudgetControls.tsx`
- [ ] `packages/frontend/src/components/ExtractionPipeline.tsx`

### Memory Components
- [ ] `packages/frontend/src/components/InteractiveKnowledgeGraph.tsx`
- [ ] `packages/frontend/src/components/LiveInputTab.tsx`
- [ ] `packages/frontend/src/components/MemoryTimeline.tsx`
- [ ] `packages/frontend/src/components/GraphNodeDetail.tsx`

### Demo Components
- [ ] `packages/frontend/src/components/live-memory-demo.tsx`
- [ ] `packages/frontend/src/components/decentralized-network-demo.tsx`
- [ ] `packages/frontend/src/components/dynamic-intelligence-demo.tsx`
- [ ] `packages/frontend/src/components/secure-collaboration-demo.tsx`
- [ ] `packages/frontend/src/components/sovereign-history-demo.tsx`

### Pages
- [ ] `packages/frontend/src/app/chat/page.tsx`
- [ ] `packages/frontend/src/app/demos/context-engine/page.tsx`
- [ ] `packages/frontend/src/app/demos/live-memory/page.tsx`

### API Routes
- [ ] `packages/frontend/src/app/api/chat/route.ts`
- [ ] `packages/frontend/src/app/api/geolocation/route.ts`
- [ ] `packages/frontend/src/app/api/translate/route.ts`

---

## Phase 7: Test Files

- [ ] `packages/backend/tests/ai-chat-dataflow.test.ts`
- [ ] `packages/backend/tests/context-engine-pipeline.test.ts`
- [ ] `packages/backend/tests/context-pipeline-integration.test.ts`
- [ ] `packages/backend/tests/memory-system.test.ts`
- [ ] All other test files in `packages/backend/tests/`

---

## Database Schema Updates

- [ ] Add `VirtualUser` model
- [ ] Add `DeviceFingerprint` model
- [ ] Add `MemoryProfile` model
- [ ] Add `AtomicChatUnit` model
- [ ] Add `ConversationCompaction` model
- [ ] Add `ContextBundle` model
- [ ] Update `Conversation` model (add virtualUserId)
- [ ] Add pgvector extension

---

## Environment Variables

### Backend
- [ ] `DATABASE_URL`
- [ ] `DIRECT_URL`
- [ ] `OPENAI_API_KEY`
- [ ] `ANTHROPIC_API_KEY`
- [ ] `GOOGLE_AI_API_KEY`
- [ ] `XAI_API_KEY`
- [ ] `REDIS_URL`
- [ ] `JWT_SECRET`
- [ ] `ENCRYPTION_KEY`
- [ ] `FINGERPRINT_SALT`
- [ ] `FINGERPRINT_SECRET`
- [ ] `DATA_RETENTION_DAYS`
- [ ] `GDPR_EXPORT_ENABLED`
- [ ] `MEMORY_EMBEDDING_MODEL`
- [ ] `MEMORY_MAX_PROFILES`
- [ ] `MEMORY_DECAY_ENABLED`
- [ ] `MEMORY_PROACTIVE_ENABLED`
- [ ] `MEMORY_CONSOLIDATION_INTERVAL`
- [ ] `AI_DEFAULT_PROVIDER`
- [ ] `AI_DEFAULT_MODEL`
- [ ] `AI_MAX_TOKENS`
- [ ] `AI_TEMPERATURE`
- [ ] `AI_STREAMING_ENABLED`
- [ ] `AI_RATE_LIMIT_REQUESTS`
- [ ] `AI_RATE_LIMIT_WINDOW`
- [ ] `SENTRY_DSN`

### Frontend
- [ ] `BACKEND_URL`
- [ ] `NEXT_PUBLIC_BACKEND_URL`
- [ ] `NEXT_PUBLIC_CHAT_ENABLED`
- [ ] `NEXT_PUBLIC_MEMORY_ENABLED`
- [ ] `NEXT_PUBLIC_CONTEXT_ENGINE_ENABLED`

---

## Summary

| Phase | Files | Status |
|-------|-------|--------|
| Phase 1: Foundation | ~15 files | Pending |
| Phase 2: User Identification | ~10 files | Pending |
| Phase 3: Context Engine | ~60 files | Pending |
| Phase 4: Memory System | ~15 files | Pending |
| Phase 5: AI Chat Bot | ~15 files | Pending |
| Phase 6: Frontend | ~30 files | Pending |
| Phase 7: Testing | ~5+ files | Pending |
| **Total** | **~150 files** | **Pending** |
