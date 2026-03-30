# REDESIGN 004 — Strip Phantom Crypto (Signatures, DID, Encryption)

> **Status:** Proposed  
> **Priority:** 🟡 Medium — non-blocking but adds confusion and false security claims  
> **Effort:** 1 day  
> **Stack:** Bun + TypeScript (no new dependencies)

---

## Problem Statement

The codebase has multiple crypto-related features that are **permanently stubbed** and create a false impression of security:

| Feature | File | Current State |
|---------|------|---------------|
| ACU Signatures | `acu-processor.js:372` | `signature: Buffer.from([])` — empty buffer |
| User Public Keys | `acu-processor.js:305,335` | `publicKey: 'placeholder_public_key'` |
| DID Generation | `acu-processor.js:327` | `did:key:anon_${userId}` — not a real DID |
| Content Encryption | `acu-processor.js:360-366` | Calls `encryptString()` with placeholder key |
| Server Private Key | `lib/crypto.js:141` | `'server_private_key_placeholder'` |
| Identity Verification | `routes/identity.js:78` | `// In production: Actually verify the signature` |
| Email Verification | `routes/identity.js:213` | `// In production: Send actual email` |
| SMS Verification | `routes/identity.js:337` | `// In production: Send SMS` |

### Why This Matters

1. **Security theater** — the privacy page claims "end-to-end encryption" but keys are `'placeholder_public_key'`
2. **Database bloat** — every ACU stores an empty `signature` buffer and a fake `embeddingModel: 'mock-model'`
3. **Code confusion** — developers see crypto code and assume it works, then build on top of it
4. **Broken conditionals** — `if (acu.securityLevel >= 2 && authorDid)` triggers real encrypt calls with fake keys

---

## Redesign: Remove Production Crypto, Keep Identity Model

### Principle
**Delete features that pretend to work. Keep the data model for future implementation. Add clear `TODO` markers.**

### 1. ACU Processor: Remove Fake Crypto

```typescript
// BEFORE (acu-processor.js:360-394)
let finalContent = acu.content;
if (acu.securityLevel >= 2 && authorDid) {
  const user = await db.user.findUnique({ where: { did: authorDid } });
  if (user) {
    finalContent = encryptString(acu.content, user.publicKey);  // fake key!
  }
}
const acuData = {
  signature: Buffer.from([]),  // empty
  ...
};

// AFTER
const acuData = {
  content: acu.content,          // Plaintext — honest about security state
  signature: null,               // Explicitly null, not fake buffer
  embeddingModel: embeddingService.getModelName(),  // Real model name
  ...
};
```

### 2. User Creation: Remove Fake Keys

```typescript
// BEFORE
const newUser = await getPrismaClient().user.create({
  data: {
    did: `did:key:anon_${userId}`,
    publicKey: 'placeholder_public_key',
    ...
  },
});

// AFTER
const newUser = await getPrismaClient().user.create({
  data: {
    did: userId,                  // Use userId directly as identity until real DID
    publicKey: null,              // Explicitly null
    ...
  },
});
```

### 3. Identity Routes: Replace Stubs with Honest Responses

```typescript
// routes/identity.js — Email verification
// BEFORE
// In production: Send actual email via SendGrid
logger.info({ email, code: verificationCode }, 'Email verification code (dev mode)');

// AFTER  
logger.info({ email }, 'Email verification requested');
return res.status(501).json({
  error: 'Email verification not yet implemented',
  devMode: true,
  // In development, return the code for testing
  ...(config.isDevelopment ? { verificationCode } : {}),
});
```

### 4. Crypto Module: Mark Clearly

```typescript
// lib/crypto.js
// BEFORE
const DEV_SERVER_PRIVATE_KEY = 'server_private_key_placeholder';

// AFTER
// TODO: Implement real crypto when DID system is integrated
// See: https://github.com/vivim/vivim/issues/XXX
export function encryptString(content: string, _publicKey: string | null): string {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Content encryption is not implemented. Do not use in production.');
  }
  // In development, return content as-is (no fake encryption)
  return content;
}

export function isEncryptionAvailable(): boolean {
  return false;
}
```

---

## Schema Changes

The Prisma schema has fields for crypto that should be made nullable:

```prisma
model AtomicChatUnit {
  // BEFORE
  signature    Bytes        // Required, stores Buffer.from([])
  
  // AFTER  
  signature    Bytes?       // Nullable — no fake data
}

model User {
  // BEFORE
  publicKey    String       // Required, stores 'placeholder_public_key'
  
  // AFTER
  publicKey    String?      // Nullable — populated when DID system is ready
}
```

Migration:
```sql
ALTER TABLE atomic_chat_units ALTER COLUMN signature DROP NOT NULL;
ALTER TABLE users ALTER COLUMN "publicKey" DROP NOT NULL;
UPDATE atomic_chat_units SET signature = NULL WHERE signature = E'\\x';
UPDATE users SET "publicKey" = NULL WHERE "publicKey" = 'placeholder_public_key';
```

---

## Files to Modify

| File | Action |
|------|--------|
| `services/acu-processor.js` | Remove encryption block, null signature, remove fake DID generation |
| `services/acu-generator.js` | Same (line 75: `publicKey: 'placeholder_public_key'`) |
| `lib/crypto.js` | Guard with `isEncryptionAvailable()`, throw in production |
| `routes/identity.js` | Return 501 for verification endpoints, remove fake "send email" comments |
| `routes/acus.js` | Remove `authorDid: req.user?.did` fallback with fake DID |
| `prisma/schema.prisma` | Make `signature` and `publicKey` nullable |
| `vivim-identity-service.ts` | Update privacy features: `e2e.enabled = false`, `zk.enabled = false` |

### Update Identity Service Honesty

```typescript
// BEFORE
privacyFeatures: [
  { id: 'e2e', name: 'End-to-End Encryption', enabled: true },   // LIE
  { id: 'zk', name: 'Zero-Knowledge Sync', enabled: true },       // LIE
  { id: 'did', name: 'DID Identity', enabled: false },             // Honest

// AFTER
privacyFeatures: [
  { id: 'e2e', name: 'End-to-End Encryption', enabled: false, status: 'planned_v2' },
  { id: 'zk', name: 'Zero-Knowledge Sync', enabled: false, status: 'planned_v2' },
  { id: 'local', name: 'Local-First', enabled: true },            // This one IS real
  { id: 'no-training', name: 'No AI Training', enabled: true },   // This one IS real
  { id: 'did', name: 'DID Identity', enabled: false, status: 'planned_v2' },
```

---

## What This Does NOT Touch

- The `UnifiedAuthService` in `shared/src/auth/index.ts` — that's dead code but harmless (see AUDIT_003 A-010)
- The fingerprint-based auth — that's a separate issue (AUDIT_001 S-002)
- The VirtualUser session system — that works and is used by the chatbot routes
