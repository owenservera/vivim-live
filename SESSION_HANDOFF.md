# VIVIM Backend Integration - Session Handoff Document

**Session Date:** March 27, 2026
**Project:** VIVIM Live - Chatbot with Persistent User Profiles
**Status:** In Progress - Schema Migration Phase

---

## 1. Executive Summary

### Goal
Build a VIVIM chatbot with **VirtualUser-only authentication** (fingerprint-based, anonymous, persistent profiles). No traditional User auth system. User profiles are built from conversation data over time via the Context Engine.

### Architecture Decision
- **Single User System:** VirtualUser (fingerprint-based identification)
- **No User Model:** Removed traditional DID/email auth
- **Profile Building:** TopicProfile, EntityProfile, Memory, ACU all link to VirtualUser
- **Context Engine:** Wired to VirtualUser tables for personalized AI responses

---

## 2. What Was Accomplished

### ✅ Completed Tasks

#### 2.1 Backend Cleanup (Phase 1)
- [x] Removed capture/extraction system (Playwright, extractors)
- [x] Removed P2P network engine (@vivim/network-engine)
- [x] Removed social features (Friend, Follow, Group, Team, Circle)
- [x] Removed feed system
- [x] Removed import/export
- [x] Removed admin routes
- [x] Removed moderation, integrations, omni, zai-mcp routes
- [x] Cleaned up AI tools (removed social-tools.js)
- [x] Updated server.js imports and routes
- [x] Updated package.json dependencies

#### 2.2 Environment Setup
- [x] Created `.env.local` - Local development config
- [x] Created `.env.production.example` - Supabase production config
- [x] Created `packages/backend/.env` - Backend server config
- [x] Root `package.json` with workspaces

#### 2.3 Monorepo Structure
```
vivim-source-code/
├── packages/
│   ├── frontend/          # Next.js 15 app
│   ├── backend/           # Express.js server (Bun runtime)
│   └── shared/            # Shared types (created but empty)
├── package.json           # Root workspace config
└── .env.local             # Environment variables
```

#### 2.4 Prisma Schema Migration (IN PROGRESS)
- [x] Added `virtualUserId` field to context tables:
  - TopicProfile
  - EntityProfile  
  - ContextBundle
  - Memory
  - Conversation
  - AtomicChatUnit
- [x] Added VirtualUser opposite relations
- [x] Removed User model relations from most tables
- [ ] **BLOCKER:** 6 models still have User relations that need fixing

#### 2.5 Frontend Integration
- [x] Updated `/api/chat/route.ts` - Proxies to backend context engine
- [x] Updated `chat-provider.tsx` - Generates fingerprint, sends to backend
- [ ] Need to add `x-user-fingerprint` header

---

## 3. Current State

### 3.1 Prisma Schema Status

**Models Successfully Updated:**
| Model | Status | virtualUserId Field | VirtualUser Relation |
|-------|--------|---------------------|----------------------|
| VirtualUser | ✅ Complete | N/A (primary) | N/A |
| TopicProfile | ✅ Complete | ✅ Added | ✅ Added |
| EntityProfile | ✅ Complete | ✅ Added | ✅ Added |
| ContextBundle | ✅ Complete | ✅ Added | ✅ Added |
| Memory | ✅ Complete | ✅ Added | ✅ Added |
| Conversation | ✅ Complete | ✅ Added | ✅ Added |
| AtomicChatUnit | ✅ Complete | ✅ Added | ✅ Added |
| Device | ✅ Complete | ✅ Added | ✅ Added |
| Notebook | ✅ Complete | ✅ Added | ✅ Added |

**Models Still Needing Fix (BLOCKING Prisma Generate):**
| Model | Issue | Fix Required |
|-------|-------|--------------|
| SyncCursor | Has `user User @relation(...)` | Change to `virtualUser VirtualUser?` |
| ClientPresence | Has `user User @relation(...)` | Change to `virtualUser VirtualUser?` |
| CustomInstruction | Has `user User @relation(...)` | Change to `virtualUser VirtualUser?` |
| UserContextSettings | Has `user User @relation(...)` | Change to `virtualUser VirtualUser?` |
| SharingPolicy | Has `owner User @relation(...)` | Change to `virtualUser VirtualUser?` |
| ContentStakeholder | Has `user User @relation(...)` | Change to `virtualUser VirtualUser?` |
| ImportJob | Has `user User? @relation(...)` | Change to `virtualUser VirtualUser?` |

### 3.2 Prisma Generate Error

```
Error code: P1012
Validation Error Count: 9

Models with missing opposite relations:
- Device.user → User (FIXED)
- Notebook.owner → User (FIXED)
- SyncCursor.user → User (NEEDS FIX)
- ClientPresence.user → User (NEEDS FIX)
- CustomInstruction.user → User (NEEDS FIX)
- UserContextSettings.user → User (NEEDS FIX)
- SharingPolicy.owner → User (NEEDS FIX)
- ContentStakeholder.user → User (NEEDS FIX)
- ImportJob.user → User (NEEDS FIX)
```

---

## 4. Next Session Tasks (Priority Order)

### P0: Fix Prisma Schema (BLOCKING)
1. **Fix remaining 7 models** with User relations:
   ```prisma
   // Example fix for SyncCursor:
   model SyncCursor {
     id            String    @id @default(uuid())
     virtualUserId String?
     // ... other fields
     virtualUser   VirtualUser? @relation(fields: [virtualUserId], references: [id])
     // REMOVE: user User @relation(...)
   }
   ```

2. **Run Prisma generate:**
   ```bash
   cd packages/backend
   bun run db:generate
   ```

3. **Verify no errors**

### P1: Update Context Engine
4. **Update `DynamicContextAssembler`** (`src/context/context-assembler.ts`):
   - Change `userId` parameter to `virtualUserId`
   - Update all Prisma queries to use `virtualUserId`

5. **Update `unified-context-service.ts`**:
   - Change to accept `virtualUserId`
   - Update context assembly logic

### P2: Wire Middleware
6. **Add `virtualUserAutoAuth` middleware** to routes:
   - `src/routes/context-engine.ts`
   - `src/routes/ai-chat.js` (or create `/api/v1/virtual/chat`)

7. **Update frontend** to send fingerprint header:
   ```typescript
   headers: { "x-user-fingerprint": userId }
   ```

### P3: Test End-to-End
8. **Start backend:**
   ```bash
   cd packages/backend
   bun run dev
   ```

9. **Start frontend:**
   ```bash
   cd packages/frontend
   bun run dev
   ```

10. **Test chat:**
    - Open http://localhost:3000/chat
    - Send message
    - Verify context is loaded from VirtualUser profile
    - Verify conversation is saved

---

## 5. Key Files Reference

### Backend
| File | Purpose | Status |
|------|---------|--------|
| `packages/backend/prisma/schema.prisma` | Database schema | ⚠️ Needs 7 model fixes |
| `packages/backend/src/server.js` | Express server entry | ✅ Updated |
| `packages/backend/src/routes/context-engine.ts` | Context assembly API | ⚠️ Needs middleware |
| `packages/backend/src/routes/ai-chat.js` | Chat API | ⚠️ Needs VirtualUser wiring |
| `packages/backend/src/context/context-assembler.ts` | Context assembly logic | ⚠️ Needs virtualUserId |
| `packages/backend/src/services/unified-context-service.ts` | Context service bridge | ⚠️ Needs virtualUserId |
| `packages/backend/src/services/virtual-user-manager.ts` | VirtualUser lifecycle | ✅ Complete |
| `packages/backend/src/middleware/virtual-user-auth.ts` | Auth middleware | ✅ Complete |
| `packages/backend/.env` | Backend environment | ✅ Complete |

### Frontend
| File | Purpose | Status |
|------|---------|--------|
| `packages/frontend/src/app/chat/page.tsx` | Chat page UI | ✅ Complete |
| `packages/frontend/src/app/api/chat/route.ts` | Chat API proxy | ✅ Updated (needs header) |
| `packages/frontend/src/components/chat/chat-provider.tsx` | Runtime provider | ✅ Updated |
| `packages/frontend/src/components/assistant-ui/thread.tsx` | Thread UI | ✅ Complete |
| `packages/frontend/src/components/assistant-ui/message.tsx` | Message UI | ✅ Complete |
| `packages/frontend/.env.local` | Frontend environment | ✅ Complete |

---

## 6. Environment Variables

### Frontend (.env.local)
```env
BACKEND_URL=http://localhost:3001
ZAI_API_KEY=dd3cb16b31154563b107715d598fa3a4.im4XRbejuJs5qQMy
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
ZAI_CHAT_MODEL=glm-4.7
ZAI_CHAT_TEMPERATURE=0.7
ZAI_MAX_TOKENS=4096
```

### Backend (packages/backend/.env)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/vivim_dev"
REDIS_URL=redis://localhost:6379
PORT=3001
ZAI_API_KEY=dd3cb16b31154563b107715d598fa3a4.im4XRbejuJs5qQMy
ZAI_MODEL=glm-4.7
ZAI_BASE_URL=https://api.z.ai/api/coding/paas/v4
USE_DYNAMIC_CONTEXT=true
LIBRARIAN_ENABLED=true
```

---

## 7. Testing Checklist

### Schema Validation
- [ ] `bun run db:generate` completes without errors
- [ ] Prisma client generated in `node_modules/.prisma/client`

### Backend Startup
- [ ] `bun run dev` starts without errors
- [ ] Backend listens on port 3001
- [ ] Health endpoint responds: `GET /api/v2/context-engine/health`

### Context Engine
- [ ] `POST /api/v2/context-engine/assemble` accepts `virtualUserId`
- [ ] Returns `systemPrompt`, `budget`, `stats`
- [ ] Loads TopicProfile for VirtualUser
- [ ] Loads ContextBundle for VirtualUser
- [ ] Loads ACUs for VirtualUser

### Chat Flow
- [ ] Frontend generates fingerprint on mount
- [ ] Fingerprint sent in `x-user-fingerprint` header
- [ ] VirtualUser created/identified by middleware
- [ ] Context assembled for VirtualUser
- [ ] AI response streamed to frontend
- [ ] Conversation saved to VirtualConversation
- [ ] Messages saved to VirtualMessage

### Persistence
- [ ] Same fingerprint returns same VirtualUser
- [ ] Previous conversations loaded
- [ ] TopicProfile builds over time
- [ ] Memory retrieval works

---

## 8. Known Issues & Blockers

### BLOCKER: Prisma Schema Validation
**Issue:** 7 models still reference User model which was removed

**Solution:** Replace all `user User @relation(...)` with `virtualUser VirtualUser? @relation(...)`

**Files to fix:**
1. `SyncCursor` (line ~432)
2. `ClientPresence` (line ~699)
3. `CustomInstruction` (line ~717)
4. `UserContextSettings` (line ~1055)
5. `SharingPolicy` (line ~1080)
6. `ContentStakeholder` (line ~1108)
7. `ImportJob` (line ~1757)

---

## 9. Design Decisions Made

### VirtualUser-Only System
- **Decision:** Use VirtualUser (fingerprint-based) as the only user system
- **Rationale:** No login required, privacy-focused, profile builds from conversations
- **Trade-off:** No cross-device sync (by design)

### Dual Relations During Migration
- **Decision:** Keep both `userId` and `virtualUserId` temporarily
- **Rationale:** Allows gradual migration, backward compatibility
- **Future:** Can remove `userId` entirely once migration complete

### Context Engine Architecture
- **Decision:** Context Engine reads from VirtualUser relations
- **Rationale:** Single source of truth, no duplication
- **Implementation:** `DynamicContextAssembler.assemble({ virtualUserId, ... })`

---

## 10. Commands Reference

### Development
```bash
# Install dependencies (root)
bun install

# Start both servers
bun run dev

# Start backend only
cd packages/backend && bun run dev

# Start frontend only
cd packages/frontend && bun run dev

# Generate Prisma client
cd packages/backend && bun run db:generate

# Database migrations
cd packages/backend && bun run db:migrate
cd packages/backend && bun run db:push
cd packages/backend && bun run db:studio
```

### Testing
```bash
# Backend health
curl http://localhost:3001/api/v2/context-engine/health

# Frontend health
curl http://localhost:3000/api/chat

# Test context assembly
curl -X POST http://localhost:3001/api/v2/context-engine/assemble \
  -H "Content-Type: application/json" \
  -H "x-user-id: test-user-123" \
  -d '{"conversationId":"conv-1","userMessage":"Hello"}'
```

---

## 11. Session Notes

### What Worked Well
- Backend cleanup was straightforward
- Frontend already had good chat infrastructure
- VirtualUser system was well-designed from the start

### Challenges Encountered
- Prisma schema is large (2700+ lines) with many interrelations
- Removing User model created cascade of relation fixes
- Python script for automated cleanup didn't catch all cases

### Lessons Learned
- Should have fixed all User relations in one pass
- Manual edits are error-prone for large schemas
- Need better testing strategy for schema changes

---

## 12. Contact/Context

**Previous Session Focus:**
1. Backend integration from vivim-app/server
2. Cleanup of unused features (capture, social, P2P)
3. VirtualUser-only architecture decision
4. Prisma schema migration started

**Next Session Should:**
1. Complete Prisma schema fixes (P0)
2. Wire context engine to VirtualUser (P1)
3. Test end-to-end chat flow (P3)

**File Locations:**
- Project root: `C:\0-BlackBoxProject-0\vivim-source-code`
- Backend: `C:\0-BlackBoxProject-0\vivim-source-code\packages\backend`
- Frontend: `C:\0-BlackBoxProject-0\vivim-source-code\packages\frontend`
- Original server reference: `C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\server`

---

*Document generated: March 27, 2026*
*For continuation in new session*
