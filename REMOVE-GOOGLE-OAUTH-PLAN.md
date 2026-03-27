# Remove Google OAuth - Execution Plan

## Goal
Remove all Google OAuth authentication code from the backend since VirtualUser-only mode uses fingerprint-based anonymous authentication.

---

## Phase 1: Remove Files

### P1.1 Delete Middleware Files
- [ ] `packages/backend/src/middleware/google-auth.js` - Google OAuth strategy (DELETED)
- [ ] `packages/backend/src/routes/auth.js` - Google OAuth routes

---

## Phase 2: Update Server Configuration

### P2.1 Update `server.js`
**Changes:**
- Remove Google OAuth conditional loading
- Remove passport session middleware
- Remove `app.use(passport.initialize())` and `app.use(passport.session())`

**Lines to modify:** ~348-400

---

## Phase 3: Update Routes

### P3.1 Remove Auth Routes Import
**File:** `server.js`
- Remove: `import authRouter from './routes/auth.js';`
- Remove: `app.use('/api/v1/auth', authRouter);`

### P3.2 Update CSRF Middleware
**File:** `middleware/csrf.js`
- Remove Google OAuth paths from `STATELESS_PATHS`:
  - `/api/v1/auth/google`
  - `/api/v1/auth/google/callback`

---

## Phase 4: Update AI Provider (Keep Google AI Model)

### P4.1 Keep `@ai-sdk/google` for Gemini Model
**Note:** Keep Google AI/Generative AI for chat (Gemini model), only remove OAuth

**File:** `ai/unified-provider.js`
- Keep: `import { google } from '@ai-sdk/google';` (for Gemini chat model)
- Keep: Provider configuration for `google`/`gemini`

---

## Phase 5: Update Identity/Context Files

### P5.1 Update `middleware/unified-auth.js`
**Changes:**
- Remove Google OAuth session check
- Keep only DID-based and VirtualUser authentication

### P5.2 Update Context Identity Files (Keep References to Gemini Platform)
**Files:**
- `context/vivim-identity-service.ts` - Keep Google AI platform reference (for capture)
- `context/vivim-identity-context.json` - Keep Gemini in supported platforms
- `services/context-generator.js` - Keep Google AI in BYOK list

**Note:** These reference Google's Gemini AI platform for capture/BYOK, not OAuth login

---

## Phase 6: Update Dependencies

### P6.1 Update `package.json`
**Remove:**
- `passport-google-oauth20`
- `passport` (if only used for Google OAuth)
- `express-session` (if only used for OAuth sessions)

**Keep:**
- `@ai-sdk/google` (for Gemini chat model)

---

## Phase 7: Update Environment Files

### P7.1 Update `.env.example`
**Remove:**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `GOOGLE_SUCCESS_REDIRECT`
- `SKIP_AUTH_FOR_DEVELOPMENT`

---

## Phase 8: Testing

### P8.1 Backend Startup
```bash
cd packages/backend
bun run dev
```
**Expected:** Server starts without Google OAuth errors

### P8.2 Health Check
```bash
curl http://localhost:3001/api/v2/context-engine/health
```
**Expected:** Returns health status

### P8.3 VirtualUser Auth
```bash
curl -X POST http://localhost:3001/api/v2/context-engine/assemble \
  -H "Content-Type: application/json" \
  -H "x-user-fingerprint: test-user-123" \
  -d '{"conversationId":"conv-1","userMessage":"Hello"}'
```
**Expected:** Context assembled for VirtualUser

---

## Files to Modify

| File | Action | Priority |
|------|--------|----------|
| `middleware/google-auth.js` | DELETE | P0 |
| `routes/auth.js` | DELETE | P0 |
| `server.js` | MODIFY | P0 |
| `middleware/csrf.js` | MODIFY | P1 |
| `middleware/unified-auth.js` | MODIFY | P1 |
| `.env.example` | MODIFY | P2 |
| `package.json` | MODIFY | P2 |

---

## Risk Assessment

### Low Risk (Safe to Remove)
- Google OAuth middleware and routes
- Passport session handling
- OAuth-related environment variables

### Keep (Not OAuth Related)
- `@ai-sdk/google` - Used for Gemini chat model
- Google AI platform references - For BYOK/capture features
- Gemini URLs in link-validator - For conversation sharing

---

## Execution Order

1. Delete `google-auth.js` ✅ (DONE)
2. Delete `routes/auth.js`
3. Update `server.js` - Remove passport/session
4. Update `middleware/csrf.js` - Remove OAuth paths
5. Update `middleware/unified-auth.js` - Remove Google session check
6. Update `.env.example` - Remove OAuth vars
7. Update `package.json` - Remove OAuth dependencies
8. Test backend startup
9. Run `bun install` to clean dependencies

---

*Created: March 27, 2026*
*Status: Ready for execution*
