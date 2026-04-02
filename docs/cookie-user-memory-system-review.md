# Cookie, Virtual User & Memory System Review

**Generated:** 2026-04-02
**Status:** Comprehensive Analysis

---

## Executive Summary

This document provides a complete review of VIVIM's cookie usage, virtual user identification system, and memory architecture. The system uses a **header-based fingerprint authentication** approach with minimal cookie reliance, storing user memories in PostgreSQL with vector embeddings for semantic search.

### Key Findings

| Area | Status | Critical Issues |
|------|--------|-----------------|
| Cookie Usage | Minimal | No consent banner |
| Virtual User ID | Functional | Weak fingerprinting, no backend registration |
| Memory System | Complete | Well-architected with ACU decomposition |
| Session Management | Partial | No refresh mechanism |

---

## 1. Cookie Usage Analysis

### 1.1 Current Cookie Inventory

| Cookie Name | Domain | Purpose | Expiry | Secure | SameSite |
|-------------|--------|---------|--------|--------|----------|
| `virtual_session` | Backend | Session token storage | Undefined | No | No |

### 1.2 Cookie Configuration Issues

**Location:** `packages/backend/src/server.js:191`
```javascript
app.use(cookieParser());
```

**Problems:**
- No cookie configuration options passed
- No `secure` flag for HTTPS-only
- No `sameSite` attribute for CSRF protection
- No expiry configuration

### 1.3 Cookie vs Header Authentication

The system primarily uses **header-based authentication** (`x-user-fingerprint`) rather than cookies:

```
Frontend → Backend
Header: x-user-fingerprint: fp_abc123xyz
```

This is less secure than HttpOnly cookies for web applications.

---

## 2. Virtual User Identification System

### 2.1 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Browser)                           │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Fingerprint Generation (chat-provider.tsx)               │ │
│  │                                                            │ │
│  │  Components:                                               │ │
│  │  - navigator.userAgent                                    │ │
│  │  - navigator.language                                     │ │
│  │  - navigator.platform                                     │ │
│  │  - screen.colorDepth                                      │ │
│  │  - timezone offset                                        │ │
│  │                                                            │ │
│  │  Algorithm: Simple hash → fp_[hash36]                     │ │
│  │  Storage: localStorage (vivim_user_fp)                    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Request Header                                            │ │
│  │  x-user-fingerprint: fp_abc123xyz                         │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express)                            │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  virtual-user-auth.ts Middleware                          │ │
│  │                                                            │ │
│  │  extractSessionToken() priority:                          │ │
│  │  1. Authorization: Bearer <token>                         │ │
│  │  2. Cookie: virtual_session=<token>                       │ │
│  │  3. Query: ?session_token=<token>                         │ │
│  └───────────────────────────────────────────────────────────┘ │
│                            │                                    │
│                            ▼                                    │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  virtual-user-manager.ts Service                          │ │
│  │                                                            │ │
│  │  - identifyOrCreateVirtualUser()                          │ │
│  │  - findVirtualUserBySessionToken()                        │ │
│  │  - mergeVirtualUsers()                                    │ │
│  │  - getVirtualUserProfile()                                │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE (PostgreSQL)                        │
│                                                                 │
│  VirtualUser Model:                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ id                 String (UUID)                         │   │
│  │ fingerprint        String (unique)                       │   │
│  │ confidenceScore    Float (0-100)                         │   │
│  │ fingerprintSignals JSON                                   │   │
│  │ ipHistory          JSON[]                                 │   │
│  │ userAgentHistory   JSON[]                                 │   │
│  │ consentGiven       Boolean                                │   │
│  │ dataRetentionPolicy String                                │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Fingerprint Generation Code

**File:** `packages/frontend/src/components/chat/chat-provider.tsx:14-43`

```typescript
const FINGERPRINT_KEY = "vivim_user_fp";

function getFingerprint(): string {
  // Check localStorage first
  const stored = localStorage.getItem(FINGERPRINT_KEY);
  if (stored) return stored;
  
  // Generate from browser signals
  const components = [
    navigator.userAgent,
    navigator.language,
    navigator.platform,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
  ];
  
  // Simple hash algorithm
  const str = components.join("|");
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  
  const fp = `fp_${Math.abs(hash).toString(36)}`;
  localStorage.setItem(FINGERPRINT_KEY, fp);
  
  return fp;
}
```

### 2.3 Identification Issues

| Issue | Severity | Impact |
|-------|----------|--------|
| Weak fingerprinting algorithm | HIGH | Easily spoofed, low uniqueness |
| No canvas/WebGL fingerprinting | MEDIUM | Missing strong identifiers |
| No audio fingerprinting | MEDIUM | Missing strong identifiers |
| No backend registration call | HIGH | Virtual user not properly created |
| No fingerprint rotation | LOW | Same ID forever |
| localStorage only | MEDIUM | Cleared on browser data clear |

---

## 3. Memory System Architecture

### 3.1 ACU (Atomic Chat Unit) System

```
Conversation Input
       │
       ▼
┌──────────────────┐
│  ACU Decomposer  │ (LLM-powered)
│  acu-decomposer  │
└────────┬─────────┘
         │
         ▼
    ┌─────────┐
    │  ACUs   │ (Atomic Chat Units)
    └────┬────┘
         │
    ┌────┴────┬─────────┬─────────┐
    ▼         ▼         ▼         ▼
┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ Fact  │ │Event  │ │Entity │ │Topic  │
└───────┘ └───────┘ └───────┘ └───────┘
    │         │         │         │
    └─────────┴─────────┴─────────┘
                   │
                   ▼
         ┌─────────────────┐
         │  Memory Storage │
         │  (PostgreSQL)   │
         └─────────────────┘
```

### 3.2 Memory Model Schema

**File:** `packages/backend/prisma/schema.prisma:763`

```prisma
model Memory {
  id                    String    @id @default(uuid())
  userId                String?
  virtualUserId         String?
  
  // Content
  content               String
  summary               String?
  
  // Provenance
  provenanceId          String?
  provider              String?    // openai, anthropic, google, etc.
  sourceUrl             String?
  sourceType            String     @default("conversation")
  
  // Extraction
  extractionMethod      String?
  extractionModel       String?
  extractionConfidence  Float?
  
  // Lineage
  lineageDepth          Int        @default(0)
  lineageParentId       String?
  derivedFromIds        String[]   @default([])
  version               Int        @default(1)
  
  // Categorization
  memoryType            MemoryType @default(EPISODIC)
  category              String
  tags                  String[]   @default([])
  
  // Importance
  importance            Float      @default(0.5)
  relevance             Float      @default(0.5)
  accessCount           Int        @default(0)
  
  // Embeddings (1536-dim vectors)
  embedding             Unsupported("vector(1536)")?
  embeddingModel        String?
  
  // Consolidation
  consolidationStatus   MemoryConsolidationStatus @default(RAW)
  consolidationScore    Float?
  
  // Temporal
  occurredAt            DateTime?
  validFrom             DateTime?
  validUntil            DateTime?
}
```

### 3.3 Context Assembly Flow

**File:** `packages/backend/src/routes/context-engine.ts`

```
POST /api/v2/context-engine/assemble
         │
         ▼
┌────────────────────────────────────┐
│  Extract virtualUserId             │
│  - Header: x-user-fingerprint      │
│  - Body: virtualUserId             │
└────────────────┬───────────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  unifiedContextService             │
│  .generateContextForChat()         │
└────────────────┬───────────────────┘
                 │
    ┌────────────┼────────────┐
    ▼            ▼            ▼
┌────────┐  ┌────────┐  ┌────────┐
│ Topic  │  │ Entity │  │ Memory │
│Profiles│  │Profiles│  │  ACUs  │
└────────┘  └────────┘  └────────┘
    │            │            │
    └────────────┼────────────┘
                 │
                 ▼
┌────────────────────────────────────┐
│  System Prompt Assembly            │
│  + Relevant Context                │
└────────────────┬───────────────────┘
                 │
                 ▼
         ┌──────────────┐
         │  LLM (Z.AI)  │
         └──────────────┘
```

### 3.4 API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v2/context-engine/health` | GET | Engine health check |
| `/api/v2/context-engine/assemble` | POST | Full context assembly |
| `/api/v2/context-engine/assemble/stream` | POST | Streaming context |
| `/api/v2/context-engine/presence/:id` | PUT | Update presence |
| `/api/v2/context-engine/warmup/:id` | POST | Trigger warmup |
| `/api/v2/context-engine/invalidate/:id` | POST | Invalidate bundles |
| `/api/v2/context-engine/bundles/:id` | GET | List bundles |
| `/api/v2/context-engine/settings/:id` | POST | Update settings |

---

## 4. Session Management

### 4.1 VirtualSession Model

```prisma
model VirtualSession {
  id                    String    @id @default(uuid())
  virtualUserId         String
  sessionToken          String    @unique
  fingerprint           String
  
  // Session signals
  ipAddress             String?
  userAgent             String?
  timezone              String?
  language              String?
  screenResolution      String?
  
  // State
  isActive              Boolean   @default(true)
  expiresAt             DateTime
  createdAt             DateTime  @default(now())
  lastActivityAt        DateTime  @updatedAt
  
  // Context
  activeConversationId  String?
  contextBundleVersion  String?
}
```

### 4.2 Session Token Extraction

**File:** `packages/backend/src/middleware/virtual-user-auth.ts:27-47`

```typescript
function extractSessionToken(req: Request): string | undefined {
  // 1. Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // 2. Cookie
  const cookieToken = req.cookies?.virtual_session;
  if (cookieToken) return cookieToken;
  
  // 3. Query parameter
  const queryToken = req.query.session_token as string;
  if (queryToken) return queryToken;
  
  return undefined;
}
```

---

## 5. Identified Issues & Recommendations

### 5.1 Critical Issues

| # | Issue | Severity | Location | Recommendation |
|---|-------|----------|----------|----------------|
| 1 | No cookie consent banner | CRITICAL | Frontend | Implement GDPR/CCPA compliant banner |
| 2 | Weak fingerprinting | HIGH | chat-provider.tsx | Use FingerprintJS or similar |
| 3 | No backend registration | HIGH | Frontend | Call `/api/v1/virtual/identify` |
| 4 | No session refresh | MEDIUM | Both | Implement token refresh |
| 5 | Insecure cookie config | MEDIUM | server.js | Add secure, sameSite flags |

### 5.2 Recommended Fixes

#### Fix 1: Cookie Consent Banner

```typescript
// New component: components/cookie-consent-banner.tsx
// Features:
// - Show on first visit
// - Accept/Decline/Customize options
// - Store consent in localStorage
// - Block tracking until consent
```

#### Fix 2: Improved Fingerprinting

```typescript
// Use FingerprintJS or implement:
// - Canvas fingerprinting
// - WebGL fingerprinting
// - Audio fingerprinting
// - Font detection
// - Screen resolution + DPR
// - Installed plugins
// - Battery status (where available)
```

#### Fix 3: Backend Registration

```typescript
// On app load, call:
POST /api/v1/virtual/identify
{
  fingerprint: string,
  signals: FingerprintSignals,
  existingSessionToken?: string
}
```

#### Fix 4: Session Cookie with Proper Config

```typescript
res.cookie('virtual_session', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  path: '/'
});
```

---

## 6. Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          USER BROWSER                                │
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │ Fingerprint │    │  Consent    │    │  Chat UI    │             │
│  │ Generator   │───▶│  Banner     │───▶│  Component  │             │
│  └─────────────┘    └─────────────┘    └──────┬──────┘             │
│                                                │                     │
│                     localStorage               │ HTTP                │
│                     ┌─────────────┐            │ x-user-fingerprint │
│                     │vivim_user_fp│            │                     │
│                     │consent_given│            ▼                     │
│                     └─────────────┘    ┌─────────────┐              │
│                                        │ /api/chat   │              │
│                                        └─────────────┘              │
└──────────────────────────────────────────────┬──────────────────────┘
                                               │
═══════════════════════════════════════════════════════════════════════
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                          BACKEND SERVER                              │
│                                                                      │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                     API LAYER                                 │   │
│  │  /api/chat → /api/v2/context-engine/assemble                 │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                             │                                        │
│  ┌──────────────────────────┼──────────────────────────────────┐   │
│  │                     SERVICE LAYER                             │   │
│  │                                                               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │  Virtual    │  │   Context   │  │    ACU      │          │   │
│  │  │  User       │  │   Engine    │  │  Processor  │          │   │
│  │  │  Manager    │  │  Service    │  │  Service    │          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  │         │                │                │                  │   │
│  └─────────┼────────────────┼────────────────┼──────────────────┘   │
│            │                │                │                       │
│  ┌─────────┼────────────────┼────────────────┼──────────────────┐   │
│  │         │           DATABASE LAYER         │                  │   │
│  │         ▼                ▼                ▼                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │VirtualUser  │  │   Memory    │  │AtomicChat   │          │   │
│  │  │   Table     │  │   Table     │  │  Unit Table │          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  │         │                │                │                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │VirtualSession│ │TopicProfile │  │ContextBundle│          │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       EXTERNAL SERVICES                              │
│                                                                      │
│  ┌─────────────┐           ┌─────────────┐                          │
│  │    Z.AI     │           │  Embedding  │                          │
│  │    LLM      │           │   Service   │                          │
│  └─────────────┘           └─────────────┘                          │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 7. Implementation Priority

### Phase 1: Compliance (Critical)
- [ ] Cookie consent banner
- [ ] Privacy policy page
- [ ] Data retention settings UI

### Phase 2: Security (High)
- [ ] Improved fingerprinting
- [ ] Backend registration flow
- [ ] Secure cookie configuration

### Phase 3: Reliability (Medium)
- [ ] Session refresh mechanism
- [ ] Token rotation
- [ ] Error handling improvements

### Phase 4: Enhancement (Low)
- [ ] Fingerprint rotation option
- [ ] Multi-device linking
- [ ] Account migration

---

## 8. Files Reference

| Category | File Path | Purpose |
|----------|-----------|---------|
| Frontend Auth | `packages/frontend/src/components/chat/chat-provider.tsx` | Fingerprint generation |
| Backend Auth | `packages/backend/src/middleware/virtual-user-auth.ts` | Session extraction |
| User Manager | `packages/backend/src/services/virtual-user-manager.ts` | Virtual user CRUD |
| Context Engine | `packages/backend/src/routes/context-engine.ts` | Context assembly API |
| ACU Processor | `packages/backend/src/services/acu-processor.ts` | ACU decomposition |
| Database Schema | `packages/backend/prisma/schema.prisma` | All models |
| Cookie Parser | `packages/backend/src/server.js:191` | Cookie middleware |

---

## 9. Conclusion

The VIVIM system has a well-architected memory and context system with ACU decomposition, vector embeddings, and comprehensive data models. However, the **user identification layer needs significant improvement**:

1. **Cookie consent is missing** - Legal compliance risk
2. **Fingerprinting is weak** - Security/uniqueness risk
3. **Frontend-backend disconnect** - Virtual users not properly registered
4. **Session management incomplete** - No refresh mechanism

Implementing the recommended fixes will provide a robust, compliant, and secure user identification system.
