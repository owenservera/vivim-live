-- VIVIM Full Schema Migration
-- Adds all missing tables and columns to match Prisma schema

-- Add missing columns to virtual_users table
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS confidenceScore FLOAT DEFAULT 50;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS fingerprintSignals JSONB DEFAULT '{}';
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS ipHistory JSONB DEFAULT '[]';
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS userAgentHistory JSONB DEFAULT '[]';
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS deviceCharacteristics JSONB DEFAULT '{}';
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS displayName TEXT;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS topicInterests JSONB DEFAULT '[]';
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS entityProfiles JSONB DEFAULT '[]';
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS conversationCount INTEGER DEFAULT 0;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS memoryCount INTEGER DEFAULT 0;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS firstSeenAt TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS lastSeenAt TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS lastIpAddress TEXT;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS consentGiven BOOLEAN DEFAULT FALSE;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS consentTimestamp TIMESTAMPTZ;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS dataRetentionPolicy TEXT DEFAULT '90_days';
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS anonymizedAt TIMESTAMPTZ;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMPTZ;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS tenantId TEXT;
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS currentAvatar TEXT DEFAULT 'STRANGER';
ALTER TABLE virtual_users ADD COLUMN IF NOT EXISTS profileVersion INTEGER DEFAULT 0;

-- Create tenants table
CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    slug TEXT UNIQUE NOT NULL,
    name TEXT,
    description TEXT,
    settings JSONB DEFAULT '{}',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create virtual_sessions table
CREATE TABLE IF NOT EXISTS virtual_sessions (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    virtualUserId TEXT NOT NULL,
    sessionToken TEXT UNIQUE NOT NULL,
    fingerprint TEXT NOT NULL,
    expiresAt TIMESTAMPTZ NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    lastActivityAt TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create virtual_conversations table
CREATE TABLE IF NOT EXISTS virtual_conversations (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    virtualUserId TEXT NOT NULL,
    title TEXT,
    provider TEXT,
    sourceUrl TEXT,
    model TEXT,
    state TEXT DEFAULT 'ACTIVE',
    visibility TEXT DEFAULT 'private',
    metadata JSONB DEFAULT '{}',
    tags TEXT[] DEFAULT '{}',
    messageCount INTEGER DEFAULT 0,
    userMessageCount INTEGER DEFAULT 0,
    aiMessageCount INTEGER DEFAULT 0,
    totalWords INTEGER DEFAULT 0,
    totalCharacters INTEGER DEFAULT 0,
    totalTokens INTEGER,
    renderedPreview JSONB,
    renderingOptions JSONB,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW(),
    capturedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create virtual_messages table
CREATE TABLE IF NOT EXISTS virtual_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    conversationId TEXT NOT NULL,
    role TEXT NOT NULL,
    author TEXT,
    parts JSONB,
    contentHash TEXT,
    version INTEGER DEFAULT 1,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    messageIndex INTEGER NOT NULL,
    status TEXT DEFAULT 'completed',
    finishReason TEXT,
    tokenCount INTEGER,
    metadata JSONB DEFAULT '{}'
);

-- Create virtual_memories table
CREATE TABLE IF NOT EXISTS virtual_memories (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    virtualUserId TEXT,
    content TEXT NOT NULL,
    summary TEXT,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    importance INTEGER DEFAULT 0 CHECK (importance >= 0 AND importance <= 10),
    isFavorite BOOLEAN DEFAULT FALSE,
    isArchived BOOLEAN DEFAULT FALSE,
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create virtual_acus table
CREATE TABLE IF NOT EXISTS virtual_acus (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    virtualUserId TEXT,
    conversationId TEXT,
    messageId TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create virtual_notebooks table
CREATE TABLE IF NOT EXISTS virtual_notebooks (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    virtualUserId TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    isPublic BOOLEAN DEFAULT FALSE,
    tags TEXT[] DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    createdAt TIMESTAMPTZ DEFAULT NOW(),
    updatedAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversation_indices table
CREATE TABLE IF NOT EXISTS conversation_indices (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    virtualUserId TEXT NOT NULL,
    conversationId TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(1536),
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Create user_profile_snapshots table
CREATE TABLE IF NOT EXISTS user_profile_snapshots (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    virtualUserId TEXT NOT NULL,
    snapshot JSONB NOT NULL,
    version INTEGER NOT NULL,
    createdAt TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraints
ALTER TABLE virtual_users ADD CONSTRAINT virtual_users_tenantId_fkey FOREIGN KEY (tenantId) REFERENCES tenants(id) ON DELETE SET NULL;
ALTER TABLE virtual_sessions ADD CONSTRAINT virtual_sessions_virtualUserId_fkey FOREIGN KEY (virtualUserId) REFERENCES virtual_users(id) ON DELETE CASCADE;
ALTER TABLE virtual_conversations ADD CONSTRAINT virtual_conversations_virtualUserId_fkey FOREIGN KEY (virtualUserId) REFERENCES virtual_users(id) ON DELETE CASCADE;
ALTER TABLE virtual_messages ADD CONSTRAINT virtual_messages_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES virtual_conversations(id) ON DELETE CASCADE;
ALTER TABLE virtual_memories ADD CONSTRAINT virtual_memories_virtualUserId_fkey FOREIGN KEY (virtualUserId) REFERENCES virtual_users(id) ON DELETE CASCADE;
ALTER TABLE virtual_acus ADD CONSTRAINT virtual_acus_virtualUserId_fkey FOREIGN KEY (virtualUserId) REFERENCES virtual_users(id) ON DELETE CASCADE;
ALTER TABLE virtual_acus ADD CONSTRAINT virtual_acus_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES virtual_conversations(id) ON DELETE CASCADE;
ALTER TABLE virtual_notebooks ADD CONSTRAINT virtual_notebooks_virtualUserId_fkey FOREIGN KEY (virtualUserId) REFERENCES virtual_users(id) ON DELETE CASCADE;
ALTER TABLE conversation_indices ADD CONSTRAINT conversation_indices_virtualUserId_fkey FOREIGN KEY (virtualUserId) REFERENCES virtual_users(id) ON DELETE CASCADE;
ALTER TABLE conversation_indices ADD CONSTRAINT conversation_indices_conversationId_fkey FOREIGN KEY (conversationId) REFERENCES virtual_conversations(id) ON DELETE CASCADE;
ALTER TABLE user_profile_snapshots ADD CONSTRAINT user_profile_snapshots_virtualUserId_fkey FOREIGN KEY (virtualUserId) REFERENCES virtual_users(id) ON DELETE CASCADE;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_virtual_users_fingerprint ON virtual_users(fingerprint);
CREATE INDEX IF NOT EXISTS idx_virtual_users_tenantId ON virtual_users(tenantId);
CREATE INDEX IF NOT EXISTS idx_virtual_sessions_sessionToken ON virtual_sessions(sessionToken);
CREATE INDEX IF NOT EXISTS idx_virtual_sessions_expiresAt ON virtual_sessions(expiresAt);
CREATE INDEX IF NOT EXISTS idx_virtual_conversations_virtualUserId ON virtual_conversations(virtualUserId);
CREATE INDEX IF NOT EXISTS idx_virtual_conversations_createdAt ON virtual_conversations(createdAt DESC);
CREATE INDEX IF NOT EXISTS idx_virtual_messages_conversationId ON virtual_messages(conversationId);
CREATE INDEX IF NOT EXISTS idx_virtual_messages_createdAt ON virtual_messages(createdAt);
CREATE INDEX IF NOT EXISTS idx_virtual_memories_virtualUserId ON virtual_memories(virtualUserId);
CREATE INDEX IF NOT EXISTS idx_virtual_acus_virtualUserId ON virtual_acus(virtualUserId);
CREATE INDEX IF NOT EXISTS idx_virtual_acus_conversationId ON virtual_acus(conversationId);
CREATE INDEX IF NOT EXISTS idx_conversation_indices_virtualUserId ON conversation_indices(virtualUserId);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_virtual_users_updated_at BEFORE UPDATE ON virtual_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_virtual_sessions_updated_at BEFORE UPDATE ON virtual_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_virtual_conversations_updated_at BEFORE UPDATE ON virtual_conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_virtual_memories_updated_at BEFORE UPDATE ON virtual_memories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_virtual_notebooks_updated_at BEFORE UPDATE ON virtual_notebooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();