# Quick Reference Card

## 🚀 One-Page Integration Guide

Keep this open during integration for quick reference.

---

## Directory Paths

| Item | Path |
|------|------|
| **Source Code** | `C:\0-BlackBoxProject-0\vivim-source-code` |
| **Target Code** | `C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago` |
| **Integration Plan** | `INTEGRATION_PLAN/` |
| **Backend** | `packages/backend/` |
| **Frontend** | `packages/frontend/` |
| **Shared** | `packages/shared/` |

---

## Phase Order (Do NOT Skip)

```
1. Foundation        → 2. User ID      → 3. Context Engine
                                                      ↓
4. Memory System  ←  5. AI Chat Bot  ←  6. Frontend
                                                      ↓
                                                   7. Testing
```

---

## Essential Commands

### Start Development
```bash
# Terminal 1: Backend
cd packages/backend && bun run dev

# Terminal 2: Frontend  
cd packages/frontend && bun run dev
```

### Database Operations
```bash
cd packages/backend
bunx prisma migrate dev --name migration_name
bunx prisma generate
bunx prisma studio
```

### Run Tests
```bash
cd packages/backend
bun test                    # All tests
bun test tests/memory.test.ts  # Specific test
bun test --coverage         # With coverage
```

### Type Check
```bash
cd packages/backend && bun run typecheck
cd packages/frontend && bun run typecheck
```

---

## File Copy Template

```bash
# Single file
cp "SOURCE/packages/backend/src/path/file.ts" \
   "TARGET/packages/backend/src/path/file.ts"

# Example
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\identity-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\identity-service.ts"
```

---

## Git Checkpoints

```bash
# After each phase
git add .
git commit -m "feat(integration): Phase X - Description"

# If something breaks
git revert HEAD~1  # Revert last commit
```

---

## Environment Variables Checklist

### Required Before Starting
- [ ] `DATABASE_URL`
- [ ] `OPENAI_API_KEY`
- [ ] `JWT_SECRET`
- [ ] `FINGERPRINT_SALT`

### Required for Phase 5
- [ ] `ANTHROPIC_API_KEY` (optional)
- [ ] `GOOGLE_AI_API_KEY` (optional)
- [ ] `REDIS_URL` (optional but recommended)

---

## Common Errors & Fixes

| Error | Solution |
|-------|----------|
| `Module not found` | Run `bun install` |
| `Prisma Client not generated` | Run `bunx prisma generate` |
| `Port 3001 in use` | Kill existing process: `bun run kill:3001` |
| `Database connection failed` | Check `DATABASE_URL` in `.env.local` |
| `Type errors` | Run `bun run typecheck` and fix |
| `Import path errors` | Check file extensions (`.js` vs `.ts`) |

---

## Health Check Endpoints

```bash
# Backend health
curl http://localhost:3001/api/health

# Database health
curl http://localhost:3001/api/health/db

# All services
curl http://localhost:3001/api/health/all
```

---

## Rollback Commands

```bash
# Revert code changes
git checkout -- .
git clean -fd

# Revert database
bunx prisma migrate rollback

# Full reset (⚠️ destroys data)
bunx prisma migrate reset
```

---

## Key Files to Watch

| File | Why Important |
|------|----------------|
| `packages/backend/src/server.js` | Main server entry point |
| `packages/backend/prisma/schema.prisma` | Database schema |
| `packages/backend/src/context/index.ts` | Context engine exports |
| `packages/backend/src/ai/unified-provider.js` | AI provider management |
| `packages/frontend/src/app/api/chat/route.ts` | Frontend chat API |
| `.env.local` | Environment configuration |

---

## When Stuck

1. **Check the logs**: `tail -f logs/combined.log`
2. **Verify database**: `bunx prisma studio`
3. **Test in isolation**: Run individual test files
4. **Compare with source**: Use `diff` to compare files
5. **Check environment**: Verify all env vars are set

---

## Success Indicators

- [ ] Server starts without errors
- [ ] Database migrations complete
- [ ] Type check passes
- [ ] Tests pass
- [ ] Health endpoint returns 200
- [ ] Chat widget loads on frontend
- [ ] AI responses stream correctly

---

## Need Help?

1. Check `11_SUMMARY_AND_RISK_ANALYSIS.md` for known issues
2. Check `07_PHASE_7_TESTING.md` for test failures
3. Check `09_DATABASE_MIGRATIONS.md` for DB issues
4. Check `10_API_ENDPOINTS.md` for API issues
