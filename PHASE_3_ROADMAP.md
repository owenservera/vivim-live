# Phase 3 Roadmap — Database Consolidation & Core Feature Completion

**Date:** 2026-04-05  
**Context:** Translation done ✅, Infra done ✅, Backend routes done ✅  
**Focus:** Make the system production-ready and reproducible

---

## The Problem

Right now the database is in an unknown state. Twenty-five+ one-off `fix-*.js` scripts were run manually against the live Supabase database. There is no single migration file that can reproduce this state on a new machine, CI pipeline, or staging server.

Additionally, the chat AI receives **fake stub data** instead of real user memories and context.

These are the last two blockers before VIVIM is truly production-ready.

---

## Phase 3 Plan — 3 Waves

### Wave 1: Database Migration Consolidation (P0-1)
**Goal:** One clean Prisma migration that reproduces the entire database schema  
**Effort:** 4-8 hours  
**Risk if skipped:** New environments can't start, deployments fail, team members blocked

**Steps:**
1. Dump current Supabase schema to SQL
2. Compare against `packages/backend/prisma/schema.prisma`
3. Run `prisma db pull` to sync Prisma schema with actual DB state
4. Run `prisma migrate dev --create-only` to generate migration
5. Test migration on fresh database
6. Delete all `fix-*.js`, `check-*.js`, `apply-*.js` scripts
7. Commit single clean migration file

**Deliverable:** `prisma/migrations/YYYYMMDDHHMMSS_consolidate_schema/migration.sql`

---

### Wave 2: Replace Stub Context with Real Queries (P0-2)
**Goal:** Chat AI receives actual user memories, conversation history, and context  
**Effort:** 6-10 hours  
**Risk if skipped:** Core product feature is broken — every chat is stateless with fake data

**Steps:**
1. Audit `src/lib/chat/context.ts` and `packages/frontend/src/lib/chat/context.ts`
2. Identify what data the chat needs:
   - VirtualUser profile
   - Recent memories (VirtualMemory)
   - Conversation history (VirtualMessage)
   - Context layers (L0-L7)
3. Replace `STUB_KNOWLEDGE_BASE` with Prisma queries
4. Wire to existing `unifiedContextService` on backend
5. Add context assembly endpoint: `POST /api/v1/chat/context`
6. Test with real user fingerprint → get real memories
7. Verify in live-memory demo

**Deliverable:** Context queries return real ACUs, not hardcoded stubs

---

### Wave 3: Test Coverage for New Routes (P1-3)
**Goal:** Verify analytics, user management, and GDPR endpoints work correctly  
**Effort:** 8-12 hours  
**Risk if skipped:** GDPR compliance unverified, data integrity at risk

**Steps:**
1. Set up test database with Prisma test fixtures
2. Write integration tests for:
   - `GET /api/v1/analytics/conversations` — returns metrics
   - `GET /api/v1/analytics/users` — returns user stats
   - `GET /api/v1/users/:id/export` — GDPR data export (JSON)
   - `DELETE /api/v1/users/:id` — GDPR account deletion
   - `GET /api/v1/users/:id/sessions` — session listing
3. Write unit tests for:
   - Feature switch toggling
   - Virtual user creation
   - Memory extraction pipeline
4. Add test script to `package.json`
5. Run in CI

**Deliverable:** `npm test` passes, GDPR endpoints verified

---

## Execution Order

```
Wave 1 (Database) → Wave 2 (Context) → Wave 3 (Tests)
```

**Why this order:**
- Wave 1 must come first because Wave 2 needs a stable, reproducible schema
- Wave 2 must come before Wave 3 because tests need real data to validate against
- Wave 3 validates everything works end-to-end

**Total effort:** 18-30 hours  
**Timeline:** 2-4 days of focused work

---

## What Happens After Phase 3

Once Phase 3 is complete:
- ✅ Database is reproducible on any environment
- ✅ Chat AI receives real user context and memories
- ✅ GDPR endpoints are tested and verified
- ✅ CI pipeline validates translations, tests, and build

**Remaining items become nice-to-haves:**
- Arabic translation completion (35% → 100%)
- Context assembly traceability (debugging aid)
- Librarian worker observability (ops dashboard)
- Legacy context engine decommission (tech debt cleanup)
- Socket.IO, P2P sync, AI personas (future features)

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|------|-----------|------------|
| Schema drift too severe for Prisma to reconcile | Medium | Manual SQL migration as fallback |
| Context queries too slow (N+1 problem) | Medium | Add Prisma `$queryRaw` for complex joins |
| GDPR export too large for single response | Low | Stream response or paginate |
| Test fixtures don't match production data patterns | Low | Use anonymized production data subset |

---

## Files That Will Change

### Wave 1:
- `packages/backend/prisma/schema.prisma` (updated)
- `packages/backend/prisma/migrations/*/` (new clean migration)
- `packages/backend/fix-*.js` (deleted — 10 files)
- `packages/backend/check-*.js` (deleted — 5 files)
- `packages/backend/apply-*.js` (deleted — 3 files)

### Wave 2:
- `src/lib/chat/context.ts` (replaced stub → real queries)
- `packages/frontend/src/lib/chat/context.ts` (replaced stub → real queries)
- `packages/backend/src/routes/chatbot/` (new context endpoint)
- `packages/backend/src/context/context-assembler.ts` (updated)

### Wave 3:
- `packages/backend/tests/` (new test files — ~10 files)
- `packages/backend/package.json` (test script)
- `package.json` root (test script)
- `.github/workflows/ci.yml` (test job)

---

**Ready to execute. Starting with Wave 1.**
