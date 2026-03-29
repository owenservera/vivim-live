# Phase 1: Foundation & Shared Types

## Objective
Establish the foundational infrastructure required for all subsequent integration phases.

## Duration
1-2 days

## Risk Level
Low

---

## Step 1.1: Create New Directory Structure

### Directories to Create

```bash
# In target: C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\

mkdir -p src/di                    # Dependency Injection container
mkdir -p src/interfaces            # Service interfaces
mkdir -p src/ai/types              # AI type definitions
mkdir -p src/ai/utils              # AI utilities
```

### Verification
```bash
ls -la packages/backend/src/di
ls -la packages/backend/src/interfaces
ls -la packages/backend/src/ai/types
ls -la packages/backend/src/ai/utils
```

---

## Step 1.2: Migrate Dependency Injection Container

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\di\
```

### Files to Migrate

| Source File | Target Path | Adaptations Required |
|-------------|-------------|---------------------|
| `di/container.ts` | `src/di/container.ts` | Update import paths |

### Exact Migration Command
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\di\container.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\di\container.ts"
```

### Adaptations Required

**File: `src/di/container.ts`**
```typescript
// BEFORE (source)
import { something } from '../services/something';

// AFTER (target) - verify paths are correct
import { something } from '../services/something.js';  // Add .js extension if needed
```

---

## Step 1.3: Migrate Service Interfaces

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\interfaces\
```

### Files to Migrate

| Source File | Target Path | Adaptations Required |
|-------------|-------------|---------------------|
| `interfaces/service-interfaces.ts` | `src/interfaces/service-interfaces.ts` | None expected |

### Exact Migration Command
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\interfaces\service-interfaces.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\interfaces\service-interfaces.ts"
```

---

## Step 1.4: Migrate AI Type Definitions

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\types\
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\utils\
```

### Files to Migrate

| Source File | Target Path | Notes |
|-------------|-------------|-------|
| `ai/types/*` | `src/ai/types/*` | Create if not exists, may be empty |
| `ai/utils/*` | `src/ai/utils/*` | Create if not exists, may be empty |

### Check First
```bash
ls -la "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\types"
ls -la "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\ai\utils"
```

---

## Step 1.5: Update Shared Types Package

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\shared\src\
```

### Files to Migrate

| Source File | Target Path | Adaptations Required |
|-------------|-------------|---------------------|
| `shared/src/auth/index.ts` | `packages/shared/src/auth/index.ts` | Review and merge |
| `shared/src/types/index.ts` | `packages/shared/src/types/index.ts` | Merge with existing |

### Exact Migration Commands
```bash
# Backup existing first
cp "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\shared\src\types\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\shared\src\types\index.ts.backup"

# Copy new version
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\shared\src\types\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\shared\src\types\index.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\shared\src\auth\index.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\shared\src\auth\index.ts"
```

---

## Step 1.6: Migrate Encryption Utilities

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\lib\encryption.ts
```

### Exact Migration Command
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\lib\encryption.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\lib\encryption.ts"
```

### Dependencies to Install
```bash
cd packages/backend
bun add tweetnacl tweetnacl-util
```

---

## Step 1.7: Migrate Redis Client

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\lib\redis.ts
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\lib\redis.js
```

### Exact Migration Commands
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\lib\redis.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\lib\redis.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\lib\redis.js" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\lib\redis.js"
```

### Environment Variable Required
```env
REDIS_URL="redis://localhost:6379"
```

---

## Step 1.8: Migrate Middleware Utilities

### Source Files
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\middleware\
```

### Files to Migrate

| Source File | Target Path | Notes |
|-------------|-------------|-------|
| `middleware/error-handler.ts` | `src/middleware/error-handler.ts` | New file |
| `middleware/errorHandler.ts` | `src/middleware/errorHandler.ts` | New file |
| `middleware/requestId.ts` | `src/middleware/requestId.ts` | New file |
| `middleware/validation.ts` | `src/middleware/validation.ts` | New file |

### Exact Migration Commands
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\middleware\error-handler.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\middleware\error-handler.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\middleware\errorHandler.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\middleware\errorHandler.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\middleware\requestId.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\middleware\requestId.ts"

cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\middleware\validation.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\middleware\validation.ts"
```

---

## Step 1.9: Update Package.json Dependencies

### Compare Dependencies
```bash
diff "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\package.json" \
     "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\package.json"
```

### Dependencies to Add/Update
```json
{
  "dependencies": {
    "ioredis": "^5.9.3",
    "opossum": "^9.0.0"
  }
}
```

### Install Command
```bash
cd packages/backend
bun install
```

---

## Step 1.10: Update Express Type Definitions

### Source File
```
SOURCE: C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\@types\express.d.ts
```

### Migration Command
```bash
cp "C:\0-BlackBoxProject-0\vivim-source-code\packages\backend\src\@types\express.d.ts" \
   "C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago\packages\backend\src\@types\express.d.ts"
```

---

## Verification Checklist

- [ ] `src/di/container.ts` exists and compiles
- [ ] `src/interfaces/service-interfaces.ts` exists and compiles
- [ ] `src/lib/encryption.ts` exists and compiles
- [ ] `src/lib/redis.ts` exists and compiles
- [ ] `src/middleware/error-handler.ts` exists and compiles
- [ ] `src/middleware/errorHandler.ts` exists and compiles
- [ ] `src/middleware/requestId.ts` exists and compiles
- [ ] `src/middleware/validation.ts` exists and compiles
- [ ] `packages/shared/src/types/index.ts` updated
- [ ] `packages/shared/src/auth/index.ts` updated
- [ ] All dependencies installed
- [ ] TypeScript compiles without errors: `bun run typecheck`
- [ ] No runtime errors on server start

---

## Git Checkpoint

```bash
git add .
git commit -m "feat(integration): Phase 1 - Foundation & Shared Types

- Add dependency injection container
- Add service interfaces
- Add encryption utilities
- Add Redis client
- Add middleware utilities (error-handler, requestId, validation)
- Update shared types and auth modules"
```

---

## Rollback Instructions

```bash
git revert HEAD  # Revert the Phase 1 commit
```
