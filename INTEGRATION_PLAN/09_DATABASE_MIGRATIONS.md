# Database Migrations

## Overview

This document details all database schema changes required for the integration.

---

## Prerequisites

- PostgreSQL 14+ with pgvector extension
- Prisma CLI installed
- Database backup before migration

---

## Migration 1: Add Virtual User System

### File: `prisma/migrations/xxx_add_virtual_users/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETING', 'DELETED');

-- CreateTable
CREATE TABLE "virtual_users" (
    "id" TEXT NOT NULL,
    "fingerprint_hash" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "visit_count" INTEGER DEFAULT 1,
    "preferences" JSONB DEFAULT '{}',
    "privacy_settings" JSONB DEFAULT '{}',
    "consent_given" BOOLEAN DEFAULT false,
    "consented_at" TIMESTAMPTZ(6),
    "data_retention_days" INTEGER DEFAULT 365,

    CONSTRAINT "virtual_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_fingerprints" (
    "id" TEXT NOT NULL,
    "virtual_user_id" TEXT NOT NULL,
    "browser_hash" TEXT NOT NULL,
    "os_hash" TEXT NOT NULL,
    "device_hash" TEXT NOT NULL,
    "screen_hash" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "first_seen" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "last_seen" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "device_fingerprints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtual_users_fingerprint_hash_key" ON "virtual_users"("fingerprint_hash");

-- CreateIndex
CREATE INDEX "virtual_users_fingerprint_hash_idx" ON "virtual_users"("fingerprint_hash");

-- CreateIndex
CREATE INDEX "virtual_users_last_seen_at_idx" ON "virtual_users"("last_seen_at");

-- CreateIndex
CREATE UNIQUE INDEX "device_fingerprints_virtual_user_id_browser_hash_os_ha_key" ON "device_fingerprints"("virtual_user_id", "browser_hash", "os_hash", "device_hash");

-- CreateIndex
CREATE INDEX "device_fingerprints_virtual_user_id_idx" ON "device_fingerprints"("virtual_user_id");

-- AddForeignKey
ALTER TABLE "device_fingerprints" ADD CONSTRAINT "device_fingerprints_virtual_user_id_fkey" FOREIGN KEY ("virtual_user_id") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Migration 2: Add Memory System

### File: `prisma/migrations/xxx_add_memory_system/migration.sql`

```sql
-- CreateTable
CREATE TABLE "memory_profiles" (
    "id" TEXT NOT NULL,
    "virtual_user_id" TEXT NOT NULL,
    "profile_type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "confidence" DOUBLE PRECISION DEFAULT 1.0,
    "source_type" TEXT NOT NULL,
    "source_conversation_id" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6),
    "last_accessed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "access_count" INTEGER DEFAULT 0,
    "expires_at" TIMESTAMPTZ(6),
    "decay_factor" DOUBLE PRECISION DEFAULT 1.0,
    "relevance_score" DOUBLE PRECISION DEFAULT 1.0,

    CONSTRAINT "memory_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atomic_chat_units" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "message_id" TEXT,
    "virtual_user_id" TEXT,
    "content" TEXT NOT NULL,
    "content_hash" TEXT,
    "embedding" vector(1536),
    "unit_type" TEXT NOT NULL,
    "topics" TEXT[],
    "entities" JSONB DEFAULT '[]',
    "sentiment" TEXT,
    "token_count" INTEGER,
    "quality_score" DOUBLE PRECISION,
    "relevance_score" DOUBLE PRECISION,
    "memory_profile_id" TEXT,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "atomic_chat_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_compactions" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "start_message_index" INTEGER NOT NULL,
    "end_message_index" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "key_topics" TEXT[],
    "key_entities" JSONB DEFAULT '[]',
    "sentiment_summary" TEXT,
    "token_count" INTEGER NOT NULL,
    "original_tokens" INTEGER NOT NULL,
    "compression_ratio" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_compactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "memory_profiles_virtual_user_id_profile_type_key_key" ON "memory_profiles"("virtual_user_id", "profile_type", "key");

-- CreateIndex
CREATE INDEX "memory_profiles_virtual_user_id_idx" ON "memory_profiles"("virtual_user_id");

-- CreateIndex
CREATE INDEX "memory_profiles_profile_type_idx" ON "memory_profiles"("profile_type");

-- CreateIndex
CREATE INDEX "memory_profiles_category_idx" ON "memory_profiles"("category");

-- CreateIndex
CREATE INDEX "memory_profiles_key_idx" ON "memory_profiles"("key");

-- CreateIndex
CREATE INDEX "atomic_chat_units_conversation_id_idx" ON "atomic_chat_units"("conversation_id");

-- CreateIndex
CREATE INDEX "atomic_chat_units_virtual_user_id_idx" ON "atomic_chat_units"("virtual_user_id");

-- CreateIndex
CREATE INDEX "atomic_chat_units_unit_type_idx" ON "atomic_chat_units"("unit_type");

-- CreateIndex
CREATE INDEX "atomic_chat_units_content_hash_idx" ON "atomic_chat_units"("content_hash");

-- CreateIndex
CREATE INDEX "atomic_chat_units_created_at_idx" ON "atomic_chat_units"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_compactions_conversation_id_start_message_index__key" ON "conversation_compactions"("conversation_id", "start_message_index", "end_message_index");

-- CreateIndex
CREATE INDEX "conversation_compactions_conversation_id_idx" ON "conversation_compactions"("conversation_id");

-- AddForeignKey
ALTER TABLE "memory_profiles" ADD CONSTRAINT "memory_profiles_virtual_user_id_fkey" FOREIGN KEY ("virtual_user_id") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atomic_chat_units" ADD CONSTRAINT "atomic_chat_units_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atomic_chat_units" ADD CONSTRAINT "atomic_chat_units_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atomic_chat_units" ADD CONSTRAINT "atomic_chat_units_virtual_user_id_fkey" FOREIGN KEY ("virtual_user_id") REFERENCES "virtual_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atomic_chat_units" ADD CONSTRAINT "atomic_chat_units_memory_profile_id_fkey" FOREIGN KEY ("memory_profile_id") REFERENCES "memory_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_compactions" ADD CONSTRAINT "conversation_compactions_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Migration 3: Add Context Bundles

### File: `prisma/migrations/xxx_add_context_bundles/migration.sql`

```sql
-- CreateTable
CREATE TABLE "context_bundles" (
    "id" TEXT NOT NULL,
    "virtual_user_id" TEXT,
    "conversation_id" TEXT,
    "bundle_type" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL,
    "compressed_tokens" INTEGER,
    "content" JSONB NOT NULL,
    "quality_score" DOUBLE PRECISION,
    "relevance_score" DOUBLE PRECISION,
    "decay_factor" DOUBLE PRECISION DEFAULT 1.0,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6),
    "last_accessed_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "access_count" INTEGER DEFAULT 0,

    CONSTRAINT "context_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "context_bundles_virtual_user_id_idx" ON "context_bundles"("virtual_user_id");

-- CreateIndex
CREATE INDEX "context_bundles_conversation_id_idx" ON "context_bundles"("conversation_id");

-- CreateIndex
CREATE INDEX "context_bundles_bundle_type_idx" ON "context_bundles"("bundle_type");

-- CreateIndex
CREATE INDEX "context_bundles_created_at_idx" ON "context_bundles"("created_at");

-- AddForeignKey
ALTER TABLE "context_bundles" ADD CONSTRAINT "context_bundles_virtual_user_id_fkey" FOREIGN KEY ("virtual_user_id") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_bundles" ADD CONSTRAINT "context_bundles_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

---

## Migration 4: Update Conversations Table

### File: `prisma/migrations/xxx_update_conversations/migration.sql`

```sql
-- Add virtual_user_id to conversations if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'conversations' AND column_name = 'virtual_user_id') THEN
        ALTER TABLE "conversations" ADD COLUMN "virtual_user_id" TEXT;
    END IF;
END $$;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "conversations_virtual_user_id_idx" ON "conversations"("virtual_user_id");

-- AddForeignKey
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_virtual_user_id_fkey'
    ) THEN
        ALTER TABLE "conversations" ADD CONSTRAINT "conversations_virtual_user_id_fkey" 
        FOREIGN KEY ("virtual_user_id") REFERENCES "virtual_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;
```

---

## Complete Prisma Schema

### File: `packages/backend/prisma/schema.prisma`

Add the following models to the existing schema:

```prisma
// ============================================================================
// VIRTUAL USER SYSTEM
// ============================================================================

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
  deviceFingerprints DeviceFingerprint[]
  
  @@index([fingerprintHash])
  @@index([lastSeenAt])
  @@map("virtual_users")
}

model DeviceFingerprint {
  id              String   @id @default(uuid())
  virtualUserId   String
  browserHash     String
  osHash          String
  deviceHash      String
  screenHash      String?
  timezone        String?
  language        String?
  firstSeen       DateTime @default(now()) @db.Timestamptz(6)
  lastSeen        DateTime @default(now()) @db.Timestamptz(6)
  
  virtualUser     VirtualUser @relation(fields: [virtualUserId], references: [id], onDelete: Cascade)
  
  @@unique([virtualUserId, browserHash, osHash, deviceHash])
  @@index([virtualUserId])
  @@map("device_fingerprints")
}

// ============================================================================
// MEMORY SYSTEM
// ============================================================================

model MemoryProfile {
  id                String   @id @default(uuid())
  virtualUserId     String
  
  profileType       String   // 'preference', 'fact', 'behavior', 'context'
  category          String   // 'personal', 'professional', 'preference', 'behavior'
  key               String
  value             Json     @db.JsonB
  confidence        Float    @default(1.0)
  
  sourceType        String   // 'conversation', 'explicit', 'inferred'
  sourceConversationId String?
  
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  updatedAt         DateTime @updatedAt @db.Timestamptz(6)
  lastAccessedAt    DateTime @default(now()) @db.Timestamptz(6)
  accessCount       Int      @default(0)
  expiresAt         DateTime? @db.Timestamptz(6)
  
  decayFactor       Float    @default(1.0)
  relevanceScore    Float    @default(1.0)
  
  // Relations
  virtualUser       VirtualUser @relation(fields: [virtualUserId], references: [id], onDelete: Cascade)
  acus              AtomicChatUnit[]
  
  @@unique([virtualUserId, profileType, key])
  @@index([virtualUserId])
  @@index([profileType])
  @@index([category])
  @@index([key])
  @@map("memory_profiles")
}

model AtomicChatUnit {
  id                String   @id @default(uuid())
  conversationId    String
  messageId         String?
  virtualUserId     String?
  
  content           String
  contentHash       String?
  embedding         Unsupported("vector(1536)")?
  
  unitType          String   // 'question', 'answer', 'statement', 'command', 'preference'
  topics            String[]
  entities          Json     @default("[]") @db.JsonB
  sentiment         String?
  
  tokenCount        Int?
  qualityScore      Float?
  relevanceScore    Float?
  
  memoryProfileId   String?
  
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  
  // Relations
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  message           Message? @relation(fields: [messageId], references: [id], onDelete: SetNull)
  virtualUser       VirtualUser? @relation(fields: [virtualUserId], references: [id], onDelete: SetNull)
  memoryProfile     MemoryProfile? @relation(fields: [memoryProfileId], references: [id], onDelete: SetNull)
  
  @@index([conversationId])
  @@index([virtualUserId])
  @@index([unitType])
  @@index([contentHash])
  @@index([createdAt(sort: Desc)])
  @@map("atomic_chat_units")
}

model ConversationCompaction {
  id                String   @id @default(uuid())
  conversationId    String
  
  startMessageIndex Int
  endMessageIndex   Int
  
  summary           String
  keyTopics         String[]
  keyEntities       Json     @default("[]") @db.JsonB
  sentimentSummary  String?
  
  tokenCount        Int
  originalTokens    Int
  compressionRatio  Float
  
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  
  // Relations
  conversation      Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@unique([conversationId, startMessageIndex, endMessageIndex])
  @@index([conversationId])
  @@map("conversation_compactions")
}

// ============================================================================
// CONTEXT BUNDLES
// ============================================================================

model ContextBundle {
  id                String   @id @default(uuid())
  virtualUserId     String?
  conversationId    String?
  
  bundleType        String   // 'conversation', 'user', 'system'
  tokens            Int
  compressedTokens  Int?
  content           Json     @db.JsonB
  
  qualityScore      Float?
  relevanceScore    Float?
  decayFactor       Float    @default(1.0)
  
  createdAt         DateTime @default(now()) @db.Timestamptz(6)
  expiresAt         DateTime? @db.Timestamptz(6)
  lastAccessedAt    DateTime @default(now()) @db.Timestamptz(6)
  accessCount       Int      @default(0)
  
  // Relations
  virtualUser       VirtualUser? @relation(fields: [virtualUserId], references: [id], onDelete: Cascade)
  conversation      Conversation? @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  @@index([virtualUserId])
  @@index([conversationId])
  @@index([bundleType])
  @@index([createdAt(sort: Desc)])
  @@map("context_bundles")
}
```

---

## Run Migrations

```bash
# Navigate to backend
cd packages/backend

# Create migration
bunx prisma migrate dev --name add_integration_systems

# Generate Prisma client
bunx prisma generate

# Verify migration
bunx prisma migrate status

# (Optional) Open Prisma Studio to verify
bunx prisma studio
```

---

## Rollback Instructions

```bash
# Rollback last migration
bunx prisma migrate rollback

# Rollback to specific migration
bunx prisma migrate rollback --to=xxx_previous_migration

# Reset database (WARNING: destroys all data)
bunx prisma migrate reset
```

---

## Index Verification

```sql
-- Verify all indexes exist
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check vector extension
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## Performance Considerations

1. **Vector Index**: For large datasets, consider adding HNSW index:
```sql
CREATE INDEX ON atomic_chat_units USING hnsw (embedding vector_cosine_ops);
```

2. **Partial Indexes**: For frequently queried subsets:
```sql
CREATE INDEX idx_memory_profiles_active ON memory_profiles(virtual_user_id) 
WHERE expires_at IS NULL OR expires_at > NOW();
```

3. **Table Partitioning**: For very large datasets, consider partitioning by date.
