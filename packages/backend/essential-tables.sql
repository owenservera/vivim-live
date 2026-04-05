-- Create essential tables for VIVIM backend to start
-- This is a minimal set to get the backend operational

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create conversations table
CREATE TABLE IF NOT EXISTS "conversations" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "provider" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL UNIQUE,
    "contentHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "model" TEXT,
    "state" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "userMessageCount" INTEGER NOT NULL DEFAULT 0,
    "aiMessageCount" INTEGER NOT NULL DEFAULT 0,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "totalCharacters" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER,
    "totalCodeBlocks" INTEGER NOT NULL DEFAULT 0,
    "totalImages" INTEGER NOT NULL DEFAULT 0,
    "totalTables" INTEGER NOT NULL DEFAULT 0,
    "totalLatexBlocks" INTEGER NOT NULL DEFAULT 0,
    "totalMermaidDiagrams" INTEGER NOT NULL DEFAULT 0,
    "totalToolCalls" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[] DEFAULT '{}',
    "virtualUserId" TEXT
);

-- Create messages table
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tokenCount" INTEGER
);

-- Create memories table (for memory system)
CREATE TABLE IF NOT EXISTS "memories" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "userId" TEXT,
    "virtualUserId" TEXT,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "importance" FLOAT NOT NULL DEFAULT 0.5,
    "relevance" FLOAT NOT NULL DEFAULT 0.5,
    "memoryType" TEXT NOT NULL DEFAULT 'EPISODIC',
    "category" TEXT NOT NULL,
    "tags" TEXT[] DEFAULT '{}',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Conversation_provider_idx" ON "conversations"("provider");
CREATE INDEX IF NOT EXISTS "Conversation_capturedAt_idx" ON "conversations"("capturedAt" DESC);
CREATE INDEX IF NOT EXISTS "Conversation_sourceUrl_idx" ON "conversations"("sourceUrl");
CREATE INDEX IF NOT EXISTS "Conversation_createdAt_idx" ON "conversations"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Conversation_virtualUserId_idx" ON "conversations"("virtualUserId");
CREATE INDEX IF NOT EXISTS "Conversation_tags_idx" ON "conversations"("tags");

CREATE INDEX IF NOT EXISTS "Message_conversationId_idx" ON "messages"("conversationId");
CREATE INDEX IF NOT EXISTS "Message_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");
CREATE INDEX IF NOT EXISTS "Message_role_idx" ON "messages"("role");

CREATE INDEX IF NOT EXISTS "Memory_userId_memoryType_idx" ON "memories"("userId", "memoryType");
CREATE INDEX IF NOT EXISTS "Memory_virtualUserId_memoryType_idx" ON "memories"("virtualUserId", "memoryType");
CREATE INDEX IF NOT EXISTS "Memory_userId_importance_idx" ON "memories"("userId", "importance" DESC);
CREATE INDEX IF NOT EXISTS "Memory_virtualUserId_importance_idx" ON "memories"("virtualUserId", "importance" DESC);
CREATE INDEX IF NOT EXISTS "Memory_userId_createdAt_idx" ON "memories"("userId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "Memory_virtualUserId_createdAt_idx" ON "memories"("virtualUserId", "createdAt" DESC);

-- Add foreign key constraints
ALTER TABLE "messages" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;