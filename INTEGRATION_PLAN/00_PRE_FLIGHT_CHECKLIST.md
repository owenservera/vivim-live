# Pre-Flight Checklist

## ⚠️ READ THIS FIRST

Complete this checklist BEFORE starting any integration work. This prevents data loss, reduces errors, and ensures a smooth migration.

---

## 1. Backup & Safety

### 1.1 Create Full Backup
```bash
# Backup the target codebase
cd C:\0-BlackBoxProject-0\vivim-versions
cp -r version-2days-ago version-2days-ago-BACKUP-$(date +%Y%m%d)

# Backup the database
pg_dump -h localhost -U postgres vivim_db > vivim_backup_$(date +%Y%m%d).sql

# Verify backup
ls -la version-2days-ago-BACKUP-*
```

### 1.2 Create Git Branch
```bash
cd C:\0-BlackBoxProject-0\vivim-versions\version-2days-ago
git checkout -b integration/ai-chatbot-memory
git push -u origin integration/ai-chatbot-memory
```

### 1.3 Document Current State
```bash
# Record current working state
bun run typecheck > pre-integration-typecheck.log 2>&1
bun run build > pre-integration-build.log 2>&1
bun test > pre-integration-tests.log 2>&1

# Record current package versions
bun pm ls > pre-integration-packages.log
```

---

## 2. Environment Verification

### 2.1 Check Required Tools
```bash
# Verify Bun version (must be 1.0+)
bun --version

# Verify Node.js (if needed)
node --version

# Verify PostgreSQL
psql --version

# Verify Redis (if using)
redis-cli ping

# Verify Git
git --version
```

### 2.2 Check Environment Variables
Create a `.env.integration-check` file to validate all required variables:

```bash
#!/bin/bash
# Run this script to check environment variables

REQUIRED_VARS=(
  "DATABASE_URL"
  "DIRECT_URL"
  "OPENAI_API_KEY"
  "JWT_SECRET"
  "FINGERPRINT_SALT"
)

OPTIONAL_VARS=(
  "ANTHROPIC_API_KEY"
  "GOOGLE_AI_API_KEY"
  "XAI_API_KEY"
  "REDIS_URL"
  "SENTRY_DSN"
)

echo "=== Checking Required Variables ==="
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "❌ MISSING: $var"
  else
    echo "✅ FOUND: $var"
  fi
done

echo ""
echo "=== Checking Optional Variables ==="
for var in "${OPTIONAL_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    echo "⚠️  NOT SET: $var (optional)"
  else
    echo "✅ FOUND: $var"
  fi
done
```

### 2.3 Test Database Connection
```bash
cd packages/backend
bunx prisma db pull
bunx prisma validate
```

---

## 3. Dependency Analysis

### 3.1 Compare Package Versions

Create a script to identify version conflicts:

```bash
#!/bin/bash
# File: scripts/compare-dependencies.sh

echo "=== Comparing Backend Dependencies ==="

SOURCE_FILE="C:/0-BlackBoxProject-0/vivim-source-code/packages/backend/package.json"
TARGET_FILE="C:/0-BlackBoxProject-0/vivim-versions/version-2days-ago/packages/backend/package.json"

# Extract dependencies from both files and compare
# This will highlight version differences

echo "Source dependencies:"
cat "$SOURCE_FILE" | grep -A 100 '"dependencies"' | head -50

echo ""
echo "Target dependencies:"
cat "$TARGET_FILE" | grep -A 100 '"dependencies"' | head -50
```

### 3.2 New Dependencies to Install

**Backend:**
```json
{
  "ioredis": "^5.9.3",
  "opossum": "^9.0.0",
  "tweetnacl": "^1.0.3",
  "tweetnacl-util": "^0.15.1"
}
```

**Frontend:**
```json
{
  "socket.io-client": "^4.8.3",
  "framer-motion": "^11.0.0"
}
```

### 3.3 Pre-install Dependencies
```bash
# Backend
cd packages/backend
bun add ioredis opossum tweetnacl tweetnacl-util

# Frontend
cd packages/frontend
bun add socket.io-client framer-motion
```

---

## 4. Database Preparation

### 4.1 Check Current Schema State
```bash
cd packages/backend

# Check current migration status
bunx prisma migrate status

# Check for pending migrations
bunx prisma migrate diff --from-schema-datasource prisma/schema.prisma --to-schema-datamodel prisma/schema.prisma
```

### 4.2 Verify pgvector Extension
```sql
-- Connect to database
psql -d vivim_db

-- Check if pgvector is installed
SELECT * FROM pg_extension WHERE extname = 'vector';

-- If not installed:
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

### 4.3 Create Test Database
```bash
# Create a test database for safe migration testing
createdb vivim_integration_test

# Copy current data
pg_dump vivim_db | psql vivim_integration_test

# Test migrations on copy first
DATABASE_URL="postgresql://...vivim_integration_test" bunx prisma migrate dev
```

---

## 5. Code Quality Baseline

### 5.1 Run Current Tests
```bash
cd packages/backend
bun test 2>&1 | tee pre-integration-test-results.log

cd packages/frontend
bun test 2>&1 | tee pre-integration-test-results.log
```

### 5.2 Check TypeScript Errors
```bash
cd packages/backend
bun run typecheck 2>&1 | tee pre-integration-typecheck.log

cd packages/frontend
bun run typecheck 2>&1 | tee pre-integration-typecheck.log
```

### 5.3 Check Lint Errors
```bash
cd packages/backend
bun run lint 2>&1 | tee pre-integration-lint.log

cd packages/frontend
bun run lint 2>&1 | tee pre-integration-lint.log
```

---

## 6. Service Availability Check

### 6.1 Backend Services
```bash
# Check if backend can start
cd packages/backend
timeout 10 bun run dev || echo "Backend startup check completed"
```

### 6.2 Frontend Services
```bash
# Check if frontend can start
cd packages/frontend
timeout 10 bun run dev || echo "Frontend startup check completed"
```

### 6.3 Redis Check
```bash
# If using Redis
redis-cli ping
# Expected: PONG
```

---

## 7. Feature Flags Setup

### 7.1 Create Feature Flag Configuration

**File: `packages/backend/src/config/features.ts`**
```typescript
export const FEATURES = {
  // Phase 2: User Identification
  VIRTUAL_USERS: process.env.FEATURE_VIRTUAL_USERS === 'true',
  
  // Phase 3: Context Engine
  CONTEXT_ENGINE: process.env.FEATURE_CONTEXT_ENGINE === 'true',
  CONTEXT_CACHE: process.env.FEATURE_CONTEXT_CACHE === 'true',
  CORTEX_ENABLED: process.env.FEATURE_CORTEX === 'true',
  
  // Phase 4: Memory System
  MEMORY_SYSTEM: process.env.FEATURE_MEMORY_SYSTEM === 'true',
  MEMORY_EXTRACTION: process.env.FEATURE_MEMORY_EXTRACTION === 'true',
  MEMORY_CONSOLIDATION: process.env.FEATURE_MEMORY_CONSOLIDATION === 'true',
  
  // Phase 5: AI Chat
  AI_STREAMING: process.env.FEATURE_AI_STREAMING === 'true',
  AI_TOOLS: process.env.FEATURE_AI_TOOLS === 'true',
  
  // Phase 6: Frontend
  CHAT_WIDGET: process.env.FEATURE_CHAT_WIDGET === 'true',
  MEMORY_DEMOS: process.env.FEATURE_MEMORY_DEMOS === 'true',
};

export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature] ?? false;
}
```

### 7.2 Add Feature Flag Environment Variables
```env
# Feature Flags (set to 'true' to enable)
FEATURE_VIRTUAL_USERS=false
FEATURE_CONTEXT_ENGINE=false
FEATURE_CONTEXT_CACHE=false
FEATURE_CORTEX=false
FEATURE_MEMORY_SYSTEM=false
FEATURE_MEMORY_EXTRACTION=false
FEATURE_MEMORY_CONSOLIDATION=false
FEATURE_AI_STREAMING=false
FEATURE_AI_TOOLS=false
FEATURE_CHAT_WIDGET=false
FEATURE_MEMORY_DEMOS=false
```

---

## 8. Monitoring Setup

### 8.1 Add Logging Configuration

**File: `packages/backend/src/config/logging.ts`**
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
});

// Integration-specific logger
export const integrationLogger = logger.child({ module: 'integration' });
```

### 8.2 Add Health Check Endpoints

```typescript
// Add to server.js
app.get('/api/health/integration', (req, res) => {
  res.json({
    status: 'ok',
    features: {
      virtualUsers: isFeatureEnabled('VIRTUAL_USERS'),
      contextEngine: isFeatureEnabled('CONTEXT_ENGINE'),
      memorySystem: isFeatureEnabled('MEMORY_SYSTEM'),
      aiChat: isFeatureEnabled('AI_STREAMING'),
    },
    timestamp: new Date().toISOString(),
  });
});
```

---

## 9. Quick Reference Card

Print this and keep it visible during integration:

```
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION QUICK REFERENCE                   │
├─────────────────────────────────────────────────────────────────┤
│ BACKUP LOCATION:  version-2days-ago-BACKUP-YYYYMMDD            │
│ GIT BRANCH:       integration/ai-chatbot-memory                 │
│ DATABASE BACKUP:  vivim_backup_YYYYMMDD.sql                     │
├─────────────────────────────────────────────────────────────────┤
│ PHASE ORDER:                                                     │
│   1. Foundation       (1-2 days)                                │
│   2. User ID          (2-3 days)                                │
│   3. Context Engine   (3-4 days)                                │
│   4. Memory System    (2-3 days)                                │
│   5. AI Chatbot       (2-3 days)                                │
│   6. Frontend         (2-3 days)                                │
│   7. Testing          (2-3 days)                                │
├─────────────────────────────────────────────────────────────────┤
│ ROLLBACK COMMANDS:                                               │
│   git checkout main                                              │
│   git branch -D integration/ai-chatbot-memory                   │
│   psql vivim_db < vivim_backup_YYYYMMDD.sql                     │
├─────────────────────────────────────────────────────────────────┤
│ EMERGENCY CONTACTS:                                              │
│   Database issues: Check Prisma logs                            │
│   AI Provider issues: Verify API keys                           │
│   WebSocket issues: Check CORS config                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 10. Pre-Flight Checklist Summary

### Must Complete Before Starting:

- [ ] **Backup created** - Code and database backed up
- [ ] **Git branch created** - `integration/ai-chatbot-memory`
- [ ] **Current state documented** - Tests, typecheck, build logs saved
- [ ] **Tools verified** - Bun, PostgreSQL, Redis all working
- [ ] **Environment variables checked** - All required vars present
- [ ] **Database connection tested** - Prisma can connect
- [ ] **pgvector extension installed** - Required for embeddings
- [ ] **Test database created** - For safe migration testing
- [ ] **Dependencies pre-installed** - New packages added
- [ ] **Feature flags configured** - All set to `false` initially
- [ ] **Monitoring setup** - Logging configured
- [ ] **Health check endpoint added** - For monitoring

### Verify All Pass:
```bash
# Run all checks at once
bun run packages/backend/scripts/preflight-check.ts
```

---

## 11. Create Pre-flight Check Script

**File: `packages/backend/scripts/preflight-check.ts`**
```typescript
#!/usr/bin/env bun
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface CheckResult {
  name: string;
  passed: boolean;
  message: string;
}

const results: CheckResult[] = [];

function check(name: string, fn: () => boolean, successMsg: string, failMsg: string) {
  try {
    const passed = fn();
    results.push({
      name,
      passed,
      message: passed ? successMsg : failMsg,
    });
  } catch (error) {
    results.push({
      name,
      passed: false,
      message: `${failMsg}: ${error}`,
    });
  }
}

// Run checks
console.log('🔍 Running Pre-flight Checks...\n');

check(
  'Bun Version',
  () => {
    const version = execSync('bun --version').toString().trim();
    return version >= '1.0.0';
  },
  'Bun version OK',
  'Bun version must be 1.0.0 or higher'
);

check(
  'PostgreSQL Connection',
  () => {
    try {
      execSync('psql -c "SELECT 1"', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  },
  'PostgreSQL connection OK',
  'Cannot connect to PostgreSQL'
);

check(
  'Environment File',
  () => fs.existsSync('.env.local'),
  '.env.local exists',
  '.env.local not found'
);

check(
  'Prisma Schema',
  () => fs.existsSync('prisma/schema.prisma'),
  'Prisma schema exists',
  'Prisma schema not found'
);

check(
  'Git Repository',
  () => {
    try {
      execSync('git rev-parse --is-inside-work-tree', { stdio: 'pipe' });
      return true;
    } catch {
      return false;
    }
  },
  'Git repository OK',
  'Not a git repository'
);

check(
  'Node Modules',
  () => fs.existsSync('node_modules'),
  'Dependencies installed',
  'Run bun install first'
);

// Print results
console.log('\n📊 Pre-flight Results:\n');
console.log('─'.repeat(60));

let passed = 0;
let failed = 0;

results.forEach((result) => {
  const icon = result.passed ? '✅' : '❌';
  console.log(`${icon} ${result.name}: ${result.message}`);
  if (result.passed) passed++;
  else failed++;
});

console.log('─'.repeat(60));
console.log(`\n📈 Summary: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('⚠️  Fix the issues above before starting integration.\n');
  process.exit(1);
} else {
  console.log('✨ All checks passed! Ready to start integration.\n');
  process.exit(0);
}
```

---

## Ready to Start?

Once all checks pass, proceed to **Phase 1: Foundation** (`01_PHASE_1_FOUNDATION.md`).

```bash
# Start Phase 1
cd INTEGRATION_PLAN
cat 01_PHASE_1_FOUNDATION.md
```
