# Phase 2: User Identification System

## Objective
Integrate the privacy-preserving user identification system including device fingerprinting, virtual users, and privacy compliance.

## Duration
2-3 days

## Risk Level
Medium

---

## System Overview

The User Identification System provides:
- **Device Fingerprinting**: Browser-based identification without cookies
- **Virtual Users**: Anonymous user profiles with privacy controls
- **Privacy Compliance**: GDPR/CCPA-compliant data handling

---

## Step 2.1: Migrate Core Identity Services

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\
```

### Files to Migrate

| Source File | Target Path | Priority |
|-------------|-------------|----------|
| `services/identity-service.ts` | `src/services/identity-service.ts` | HIGH |
| `services/device-fingerprinting-service.ts` | `src/services/device-fingerprinting-service.ts` | HIGH |
| `services/virtual-user-manager.ts` | `src/services/virtual-user-manager.ts` | HIGH |
| `services/virtual-user-privacy.ts` | `src/services/virtual-user-privacy.ts` | HIGH |

### Exact Migration Commands
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\identity-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\identity-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\device-fingerprinting-service.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\device-fingerprinting-service.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\virtual-user-manager.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\virtual-user-manager.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\virtual-user-privacy.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\virtual-user-privacy.ts"
```

---

## Step 2.2: Migrate Virtual User Middleware

### Source File
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\middleware\virtual-user-auth.ts
```

### Migration Command
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\middleware\virtual-user-auth.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\middleware\virtual-user-auth.ts"
```

### Adaptations Required

**File: `src/middleware/virtual-user-auth.ts`**

```typescript
// Check these imports are correct:
import { VirtualUserManager } from '../services/virtual-user-manager.js';
import { DeviceFingerprintingService } from '../services/device-fingerprinting-service.js';

// If using .js extensions in imports, ensure they match your tsconfig
```

---

## Step 2.3: Migrate Virtual User Routes

### Source File
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\virtual-user.ts
```

### Migration Command
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\virtual-user.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\virtual-user.ts"
```

### Route Endpoints Added
```
POST   /api/virtual-user/create      - Create new virtual user
GET    /api/virtual-user/:id         - Get virtual user by ID
PUT    /api/virtual-user/:id         - Update virtual user
DELETE /api/virtual-user/:id         - Delete virtual user (privacy)
POST   /api/virtual-user/identify    - Identify user by fingerprint
GET    /api/virtual-user/:id/export  - Export user data (GDPR)
```

---

## Step 2.4: Migrate Identity Routes

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\identity.js
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\identity-v2.js
```

### Migration Commands
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\identity.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\identity.js"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\routes\identity-v2.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\routes\identity-v2.js"
```

---

## Step 2.5: Update Database Schema

### New Prisma Models Required

Add to `packages/backend/prisma/schema.prisma`:

```prisma
// Virtual User for Privacy-Preserving Identification
model VirtualUser {
  id                String   @id @default(uuid())
  fingerprintHash   String   @unique
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  lastSeenAt        DateTime @default(now()) @db.Timestamptz(6)
  visitCount        Int      @default(1)
  preferences       Json     @default("{}") @db.JsonB
  privacySettings   Json     @default("{}") @db.JsonB
  consentGiven      Boolean  @default(false)
  consentedAt       DateTime? @db.Timestamptz(6)
  dataRetentionDays Int      @default(365)
  
  // Relations
  conversations     Conversation[]
  contextBundles    ContextBundle[]
  acus              AtomicChatUnit[]
  memoryProfiles    MemoryProfile[]
  
  @@index([fingerprintHash])
  @@index([lastSeenAt])
  @@map("virtual_users")
}

// Device Fingerprint (anonymized)
model DeviceFingerprint {
  id              String   @id @default(uuid())
  virtualUserId   String
  browserHash     String   // Hashed browser info
  osHash          String   // Hashed OS info
  deviceHash      String   // Hashed device info
  screenHash      String?  // Hashed screen resolution
  timezone        String?
  language        String?
  firstSeen       DateTime @default(now()) @db.Timestamptz(6)
  lastSeen        DateTime @default(now()) @db.Timestamptz(6)
  
  virtualUser     VirtualUser @relation(fields: [virtualUserId], references: [id], onDelete: Cascade)
  
  @@unique([virtualUserId, browserHash, osHash, deviceHash])
  @@index([virtualUserId])
  @@map("device_fingerprints")
}
```

### Run Migration
```bash
cd packages/backend
bunx prisma migrate dev --name add_virtual_users
bunx prisma generate
```

---

## Step 2.6: Register Routes in Server

### File to Modify: `src/server.js`

```javascript
// Add imports at top
import virtualUserRoutes from './routes/virtual-user.js';
import identityRoutes from './routes/identity.js';
import identityV2Routes from './routes/identity-v2.js';

// Add routes after existing route registrations
app.use('/api/virtual-user', virtualUserRoutes);
app.use('/api/identity', identityRoutes);
app.use('/api/v2/identity', identityV2Routes);
```

---

## Step 2.7: Update Middleware Chain

### File to Modify: `src/server.js`

```javascript
// Add virtual user middleware before routes
import { virtualUserAuth } from './middleware/virtual-user-auth.js';

// In middleware setup section
app.use(virtualUserAuth);
```

### Middleware Order (Critical)
```
1. helmet()           - Security headers
2. cors()             - CORS handling
3. express.json()     - Body parsing
4. requestId          - Request tracking
5. virtualUserAuth    - Virtual user identification (NEW)
6. rateLimit          - Rate limiting
7. Routes             - API routes
```

---

## Step 2.8: Migrate Supporting Services

### Additional Services to Migrate

| Source File | Target Path | Purpose |
|-------------|-------------|---------|
| `services/tier-orchestrator.ts` | `src/services/tier-orchestrator.ts` | User tier management |

### Migration Command
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\services\tier-orchestrator.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\services\tier-orchestrator.ts"
```

---

## Step 2.9: Add Environment Variables

### Add to `.env`
```env
# User Identification
FINGERPRINT_SALT="your-secret-salt-here"
FINGERPRINT_SECRET="your-fingerprint-secret"
DATA_RETENTION_DAYS=365
GDPR_EXPORT_ENABLED=true
```

---

## Step 2.10: Frontend Integration Preparation

### Create Frontend Types

**File: `packages/frontend/src/types/user.ts`** (create if needed)
```typescript
export interface VirtualUser {
  id: string;
  fingerprintHash: string;
  createdAt: string;
  lastSeenAt: string;
  visitCount: number;
  preferences: Record<string, unknown>;
  privacySettings: PrivacySettings;
  consentGiven: boolean;
}

export interface PrivacySettings {
  dataCollection: boolean;
  personalization: boolean;
  analytics: boolean;
  thirdPartySharing: boolean;
}

export interface DeviceFingerprint {
  browserHash: string;
  osHash: string;
  deviceHash: string;
  screenHash?: string;
  timezone?: string;
  language?: string;
}
```

---

## Verification Checklist

- [ ] `src/services/identity-service.ts` exists and compiles
- [ ] `src/services/device-fingerprinting-service.ts` exists and compiles
- [ ] `src/services/virtual-user-manager.ts` exists and compiles
- [ ] `src/services/virtual-user-privacy.ts` exists and compiles
- [ ] `src/middleware/virtual-user-auth.ts` exists and compiles
- [ ] `src/routes/virtual-user.ts` exists and compiles
- [ ] `src/routes/identity.js` exists and compiles
- [ ] `src/routes/identity-v2.js` exists and compiles
- [ ] Database migration completed successfully
- [ ] Prisma client regenerated
- [ ] Routes registered in server.js
- [ ] Middleware chain updated
- [ ] Environment variables configured
- [ ] Server starts without errors
- [ ] API endpoints respond correctly

---

## API Endpoint Tests

```bash
# Create virtual user
curl -X POST http://localhost:3001/api/virtual-user/create \
  -H "Content-Type: application/json" \
  -d '{"fingerprint": {"browser": "chrome", "os": "windows"}}'

# Get virtual user
curl http://localhost:3001/api/virtual-user/{id}

# Export user data (GDPR)
curl http://localhost:3001/api/virtual-user/{id}/export
```

---

## Git Checkpoint

```bash
git add .
git commit -m "feat(integration): Phase 2 - User Identification System

- Add identity service with device fingerprinting
- Add virtual user manager and privacy controls
- Add virtual user authentication middleware
- Add identity and virtual user routes
- Add database schema for virtual users
- Update middleware chain for user identification
- Add required environment variables"
```

---

## Rollback Instructions

```bash
# Revert database migration
bunx prisma migrate rollback

# Revert code changes
git revert HEAD
```
