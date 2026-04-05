-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "vector";

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETING', 'DELETED');

-- CreateEnum
CREATE TYPE "MemoryType" AS ENUM ('EPISODIC', 'SEMANTIC', 'PROCEDURAL', 'FACTUAL', 'PREFERENCE', 'IDENTITY', 'RELATIONSHIP', 'GOAL', 'PROJECT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "MemoryImportance" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'MINIMAL');

-- CreateEnum
CREATE TYPE "MemoryConsolidationStatus" AS ENUM ('RAW', 'CONSOLIDATING', 'CONSOLIDATED', 'MERGED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "IntentType" AS ENUM ('SHARE', 'PUBLISH', 'EMBED', 'FORK');

-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('CONVERSATION', 'ACU', 'COLLECTION', 'NOTEBOOK', 'MEMORY');

-- CreateEnum
CREATE TYPE "ContentScope" AS ENUM ('FULL', 'PARTIAL', 'SUMMARY', 'PREVIEW');

-- CreateEnum
CREATE TYPE "AudienceType" AS ENUM ('PUBLIC', 'CIRCLE', 'USERS', 'LINK');

-- CreateEnum
CREATE TYPE "IntentStatus" AS ENUM ('DRAFT', 'PENDING', 'VALIDATED', 'ACTIVE', 'EXPIRED', 'REVOKED', 'CANCELLED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContentRecordStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED', 'ARCHIVED', 'CORRUPTED');

-- CreateEnum
CREATE TYPE "AnalyticsEventType" AS ENUM ('SHARE_CREATED', 'SHARE_VIEWED', 'SHARE_ACCEPTED', 'SHARE_DECLINED', 'SHARE_REVOKED', 'SHARE_EXPIRED', 'LINK_CLICKED', 'LINK_CREATED', 'CONTENT_SAVED', 'CONTENT_FORWARDED', 'CONTENT_ANNOTATED', 'SHARE_BLOCKED', 'SHARE_REPORTED');

-- CreateEnum
CREATE TYPE "MetricType" AS ENUM ('SHARING_METRICS', 'ENGAGEMENT_METRICS', 'REACH_METRICS', 'PERFORMANCE_METRICS');

-- CreateEnum
CREATE TYPE "AggregationType" AS ENUM ('HOURLY', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "InsightType" AS ENUM ('PATTERN_DETECTED', 'ANOMALY_DETECTED', 'RECOMMENDATION', 'TREND_DETECTED', 'ALERT');

-- CreateEnum
CREATE TYPE "ModerationReason" AS ENUM ('SPAM', 'HARASSMENT', 'HATE_SPEECH', 'VIOLENCE', 'SEXUAL', 'DANGEROUS', 'MISINFORMATION', 'PRIVACY', 'COPYRIGHT', 'IMPERSONATION', 'SELF_HARM', 'UNDERAGE', 'OTHER');

-- CreateEnum
CREATE TYPE "ModerationStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'FLAGGED', 'REMOVED', 'WARNED', 'BANNED', 'APPEALED');

-- CreateEnum
CREATE TYPE "ModerationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ImportJobStatus" AS ENUM ('PENDING', 'SCANNING', 'WAITING_FOR_USER', 'PROCESSING', 'TIER_COMPLETE', 'COMPLETED', 'FAILED', 'CANCELLED', 'PAUSED');

-- CreateEnum
CREATE TYPE "ImportTier" AS ENUM ('TIER_0_CORE', 'TIER_1_ACU', 'TIER_2_MEMORY', 'TIER_3_CONTEXT', 'TIER_4_INDEX');

-- CreateEnum
CREATE TYPE "ImportConversationState" AS ENUM ('PENDING', 'VALIDATING', 'STORED', 'ACU_GENERATED', 'MEMORY_EXTRACTED', 'CONTEXT_ENRICHED', 'INDEXED', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "UserAvatar" AS ENUM ('STRANGER', 'ACQUAINTANCE', 'FAMILIAR', 'KNOWN');

-- CreateEnum
CREATE TYPE "TopicScope" AS ENUM ('USER', 'CORPUS');

-- CreateEnum
CREATE TYPE "ChunkContentType" AS ENUM ('prose', 'code', 'table', 'list', 'mixed');

-- CreateEnum
CREATE TYPE "DocumentChangeType" AS ENUM ('major', 'minor', 'patch');

-- CreateEnum
CREATE TYPE "OrchestrationIntent" AS ENUM ('CORPUS_QUERY', 'CORPUS_DEEP_DIVE', 'SUPPORT_QUERY', 'USER_RECALL', 'COMPARISON', 'HOW_TO', 'STATUS_CHECK', 'GENERAL_CHAT', 'FEEDBACK', 'ACCOUNT_SPECIFIC', 'CLARIFICATION', 'NAVIGATION', 'ESCALATION');

-- CreateEnum
CREATE TYPE "ConversationSentiment" AS ENUM ('positive', 'neutral', 'negative', 'mixed');

-- CreateEnum
CREATE TYPE "ResolutionStatus" AS ENUM ('resolved', 'pending', 'escalated', 'unknown');

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "contentHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "title" TEXT NOT NULL,
    "model" TEXT,
    "state" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
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
    "tags" TEXT[],
    "virtualUserId" TEXT,
    "renderedPreview" JSONB,
    "renderingOptions" JSONB,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "author" TEXT,
    "parts" JSONB NOT NULL,
    "contentHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL,
    "messageIndex" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "finishReason" TEXT,
    "tokenCount" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "renderedContent" JSONB,
    "textStyles" JSONB,
    "customClasses" TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_stats" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "totalCaptures" INTEGER NOT NULL DEFAULT 0,
    "successfulCaptures" INTEGER NOT NULL DEFAULT 0,
    "failedCaptures" INTEGER NOT NULL DEFAULT 0,
    "avgDuration" DOUBLE PRECISION,
    "avgMessageCount" DOUBLE PRECISION,
    "avgTokenCount" DOUBLE PRECISION,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalCodeBlocks" INTEGER NOT NULL DEFAULT 0,
    "totalImages" INTEGER NOT NULL DEFAULT 0,
    "totalToolCalls" INTEGER NOT NULL DEFAULT 0,
    "lastCaptureAt" TIMESTAMPTZ(6),
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "provider_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendering_templates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "templateType" TEXT NOT NULL,
    "provider" TEXT,
    "role" TEXT,
    "styles" JSONB NOT NULL DEFAULT '{}',
    "classes" TEXT[],
    "layout" TEXT NOT NULL DEFAULT 'default',
    "showMetadata" BOOLEAN NOT NULL DEFAULT true,
    "showTimestamp" BOOLEAN NOT NULL DEFAULT true,
    "showProvider" BOOLEAN NOT NULL DEFAULT true,
    "maxPreviewLength" INTEGER,
    "enableSyntaxHighlighting" BOOLEAN NOT NULL DEFAULT true,
    "enableLazyLoading" BOOLEAN NOT NULL DEFAULT true,
    "conditions" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "rendering_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rendering_cache" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "renderedVersion" TEXT NOT NULL,
    "renderedData" JSONB NOT NULL,
    "viewMode" TEXT NOT NULL DEFAULT 'list',
    "includeMessages" BOOLEAN NOT NULL DEFAULT true,
    "messageLimit" INTEGER,
    "renderTimeMs" INTEGER,
    "messageCount" INTEGER,
    "contentSize" INTEGER,
    "hits" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rendering_cache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_style_presets" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "backgroundColor" TEXT,
    "borderColor" TEXT,
    "textColor" TEXT,
    "fontFamily" TEXT,
    "fontSize" TEXT,
    "lineHeight" TEXT,
    "padding" TEXT,
    "margin" TEXT,
    "borderRadius" TEXT,
    "boxShadow" TEXT,
    "twClasses" TEXT[],
    "applyToRole" TEXT,
    "applyToProvider" TEXT,
    "applyToContentTypes" TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "message_style_presets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "displayName" TEXT,
    "email" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastSeenAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "settings" JSONB NOT NULL DEFAULT '{}',
    "privacyPreferences" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "lastUsed" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "deviceType" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "fingerprint" TEXT,
    "publicKey" TEXT NOT NULL,
    "refreshTokenHash" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isTrusted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastSeenAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "virtualUserId" TEXT,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "atomic_chat_units" (
    "id" TEXT NOT NULL,
    "authorDid" TEXT NOT NULL,
    "signature" BYTEA NOT NULL,
    "content" TEXT NOT NULL,
    "contentHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'extraction',
    "embedding" vector(1536),
    "embeddingModel" TEXT,
    "conversationId" TEXT,
    "messageId" TEXT,
    "messageIndex" INTEGER,
    "provider" TEXT,
    "model" TEXT,
    "sourceTimestamp" TIMESTAMPTZ(6),
    "parentId" TEXT,
    "extractorVersion" TEXT,
    "parserVersion" TEXT,
    "state" TEXT NOT NULL DEFAULT 'ACTIVE',
    "securityLevel" INTEGER NOT NULL DEFAULT 0,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 4,
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "qualityOverall" DOUBLE PRECISION,
    "contentRichness" DOUBLE PRECISION,
    "structuralIntegrity" DOUBLE PRECISION,
    "uniqueness" DOUBLE PRECISION,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "quoteCount" INTEGER NOT NULL DEFAULT 0,
    "rediscoveryScore" DOUBLE PRECISION,
    "sharingPolicy" TEXT NOT NULL DEFAULT 'self',
    "sharingCircles" TEXT[],
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canAnnotate" BOOLEAN NOT NULL DEFAULT false,
    "canRemix" BOOLEAN NOT NULL DEFAULT false,
    "canReshare" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[],
    "virtualUserId" TEXT,

    CONSTRAINT "atomic_chat_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "acu_links" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdByDid" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "acu_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notebooks" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "virtualUserId" TEXT,

    CONSTRAINT "notebooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notebook_entries" (
    "id" TEXT NOT NULL,
    "notebookId" TEXT NOT NULL,
    "acuId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notebook_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_cursors" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT,
    "deviceDid" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "lastSyncId" TEXT,
    "lastSyncAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vectorClock" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "sync_cursors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_operations" (
    "id" TEXT NOT NULL,
    "authorDid" TEXT NOT NULL,
    "deviceDid" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "operation" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "hlcTimestamp" TEXT NOT NULL,
    "vectorClock" JSONB NOT NULL DEFAULT '{}',
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMPTZ(6),

    CONSTRAINT "sync_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_personas" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "systemPrompt" TEXT NOT NULL,
    "provider" TEXT,
    "model" TEXT,
    "temperature" DOUBLE PRECISION,
    "includeOwnerContext" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "ai_personas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_facts" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "source" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_facts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_commands" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "subLabel" TEXT,
    "description" TEXT,
    "actionCode" TEXT NOT NULL,
    "icon" TEXT,
    "scope" TEXT NOT NULL DEFAULT 'global',

    CONSTRAINT "system_commands_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_actions" (
    "id" TEXT NOT NULL,
    "trigger" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "subLabel" TEXT,
    "description" TEXT,
    "actionCode" TEXT NOT NULL,
    "icon" TEXT,

    CONSTRAINT "system_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "virtualUserId" TEXT,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "aliases" TEXT[],
    "parentSlug" TEXT,
    "domain" TEXT NOT NULL,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "totalAcus" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "totalTokensSpent" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDepth" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "firstEngagedAt" TIMESTAMPTZ(6) NOT NULL,
    "lastEngagedAt" TIMESTAMPTZ(6) NOT NULL,
    "engagementStreak" INTEGER NOT NULL DEFAULT 0,
    "peakHour" INTEGER,
    "proficiencyLevel" TEXT NOT NULL DEFAULT 'unknown',
    "proficiencySignals" JSONB NOT NULL DEFAULT '[]',
    "importanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "compiledContext" TEXT,
    "compiledAt" TIMESTAMPTZ(6),
    "compiledTokenCount" INTEGER,
    "contextVersion" INTEGER NOT NULL DEFAULT 0,
    "isDirty" BOOLEAN NOT NULL DEFAULT true,
    "embedding" vector(1536),
    "embeddingModel" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "relatedMemoryIds" TEXT[],
    "relatedAcuIds" TEXT[],

    CONSTRAINT "topic_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topic_conversations" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,

    CONSTRAINT "topic_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "entity_profiles" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "virtualUserId" TEXT,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "aliases" TEXT[],
    "relationship" TEXT,
    "sentiment" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "facts" JSONB NOT NULL DEFAULT '[]',
    "mentionCount" INTEGER NOT NULL DEFAULT 0,
    "conversationCount" INTEGER NOT NULL DEFAULT 0,
    "lastMentionedAt" TIMESTAMPTZ(6),
    "firstMentionedAt" TIMESTAMPTZ(6),
    "compiledContext" TEXT,
    "compiledAt" TIMESTAMPTZ(6),
    "compiledTokenCount" INTEGER,
    "contextVersion" INTEGER NOT NULL DEFAULT 0,
    "isDirty" BOOLEAN NOT NULL DEFAULT true,
    "embedding" vector(1536),
    "embeddingModel" TEXT,
    "importanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "entity_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "context_bundles" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "virtualUserId" TEXT,
    "bundleType" TEXT NOT NULL,
    "topicProfileId" TEXT,
    "entityProfileId" TEXT,
    "conversationId" TEXT,
    "personaId" TEXT,
    "compiledPrompt" TEXT NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "composition" JSONB NOT NULL DEFAULT '{}',
    "version" INTEGER NOT NULL DEFAULT 1,
    "isDirty" BOOLEAN NOT NULL DEFAULT false,
    "priority" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "compiledAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6),
    "lastUsedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "hitCount" INTEGER NOT NULL DEFAULT 0,
    "missCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "context_bundles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_compactions" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "fromMessageIndex" INTEGER NOT NULL,
    "toMessageIndex" INTEGER NOT NULL,
    "originalTokenCount" INTEGER NOT NULL,
    "compactedTokenCount" INTEGER NOT NULL,
    "summary" TEXT NOT NULL,
    "keyDecisions" JSONB NOT NULL DEFAULT '[]',
    "openQuestions" JSONB NOT NULL DEFAULT '[]',
    "codeArtifacts" JSONB NOT NULL DEFAULT '[]',
    "compressionRatio" DOUBLE PRECISION NOT NULL,
    "compactionLevel" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_compactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_presence" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT,
    "deviceId" TEXT NOT NULL,
    "activeConversationId" TEXT,
    "visibleConversationIds" TEXT[],
    "activeNotebookId" TEXT,
    "activePersonaId" TEXT,
    "lastNavigationPath" TEXT,
    "navigationHistory" JSONB NOT NULL DEFAULT '[]',
    "localTime" TIMESTAMPTZ(6),
    "sessionStartedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "idleSince" TIMESTAMPTZ(6),
    "predictedTopics" TEXT[],
    "predictedEntities" TEXT[],
    "lastHeartbeatAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "client_presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "custom_instructions" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT,
    "content" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "topicTags" TEXT[],
    "priority" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "custom_instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memories" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "provenanceId" TEXT,
    "provider" TEXT,
    "sourceUrl" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'conversation',
    "sourcePlatform" TEXT,
    "extractionMethod" TEXT,
    "extractionModel" TEXT,
    "extractionConfidence" DOUBLE PRECISION,
    "extractionPromptVersion" TEXT,
    "captureSessionId" TEXT,
    "captureMethod" TEXT,
    "capturedAt" TIMESTAMP(3),
    "lineageDepth" INTEGER NOT NULL DEFAULT 0,
    "lineageParentId" TEXT,
    "derivedFromIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "contentHash" TEXT,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationSource" TEXT,
    "memoryType" "MemoryType" NOT NULL DEFAULT 'EPISODIC',
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "relevance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "parentMemoryId" TEXT,
    "childMemoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedMemoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mergedFromIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceConversationIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceAcuIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceMessageIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "embedding" vector(1536),
    "embeddingModel" TEXT,
    "embeddingDimension" INTEGER,
    "consolidationStatus" "MemoryConsolidationStatus" NOT NULL DEFAULT 'RAW',
    "consolidationScore" DOUBLE PRECISION,
    "lastConsolidatedAt" TIMESTAMP(3),
    "occurredAt" TIMESTAMP(3),
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_conflicts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "memoryId1" TEXT NOT NULL,
    "memoryId2" TEXT NOT NULL,
    "conflictType" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "explanation" TEXT NOT NULL,
    "suggestedResolution" TEXT NOT NULL,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMP(3),
    "resolutionMethod" TEXT,
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "memory_conflicts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_relationships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sourceMemoryId" TEXT NOT NULL,
    "targetMemoryId" TEXT NOT NULL,
    "relationshipType" TEXT NOT NULL,
    "strength" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "failed_jobs" (
    "id" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "payload" JSONB,
    "errorMessage" TEXT NOT NULL,
    "errorStack" TEXT,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "failed_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_extraction_jobs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "messageRange" JSONB,
    "extractedMemories" JSONB,
    "extractionPrompt" TEXT,
    "errorMessage" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 3,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "memory_extraction_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memory_analytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalMemories" INTEGER NOT NULL DEFAULT 0,
    "memoriesByType" JSONB NOT NULL DEFAULT '{}',
    "memoriesByCategory" JSONB NOT NULL DEFAULT '{}',
    "memoriesCreatedToday" INTEGER NOT NULL DEFAULT 0,
    "memoriesCreatedThisWeek" INTEGER NOT NULL DEFAULT 0,
    "memoriesCreatedThisMonth" INTEGER NOT NULL DEFAULT 0,
    "criticalCount" INTEGER NOT NULL DEFAULT 0,
    "highCount" INTEGER NOT NULL DEFAULT 0,
    "mediumCount" INTEGER NOT NULL DEFAULT 0,
    "lowCount" INTEGER NOT NULL DEFAULT 0,
    "totalAccesses" INTEGER NOT NULL DEFAULT 0,
    "avgRelevance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "consolidatedCount" INTEGER NOT NULL DEFAULT 0,
    "mergedCount" INTEGER NOT NULL DEFAULT 0,
    "lastExtractionAt" TIMESTAMP(3),
    "lastConsolidationAt" TIMESTAMP(3),
    "lastCleanupAt" TIMESTAMP(3),
    "lastUpdated" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "memory_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "librarian_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "operation" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "status" TEXT NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "librarian_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_context_settings" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "maxContextTokens" INTEGER NOT NULL DEFAULT 12000,
    "responseStyle" TEXT NOT NULL DEFAULT 'balanced',
    "memoryThreshold" TEXT NOT NULL DEFAULT 'moderate',
    "focusMode" TEXT NOT NULL DEFAULT 'balanced',
    "layerBudgetOverrides" JSONB NOT NULL DEFAULT '{}',
    "compressionStrategy" TEXT NOT NULL DEFAULT 'auto',
    "predictionAggressiveness" TEXT NOT NULL DEFAULT 'balanced',
    "ttlMultipliers" JSONB NOT NULL DEFAULT '{}',
    "enabledSignals" JSONB NOT NULL DEFAULT '{}',
    "topicSimilarityThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "entitySimilarityThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.40,
    "acuSimilarityThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.35,
    "memorySimilarityThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.40,
    "elasticityOverrides" JSONB NOT NULL DEFAULT '{}',
    "customBudgetFormulas" JSONB NOT NULL DEFAULT '{}',
    "excludedTopicSlugs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedEntityIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedMemoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludedConversationIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "enablePredictions" BOOLEAN NOT NULL DEFAULT true,
    "enableJitRetrieval" BOOLEAN NOT NULL DEFAULT true,
    "enableCompression" BOOLEAN NOT NULL DEFAULT true,
    "enableEntityContext" BOOLEAN NOT NULL DEFAULT true,
    "enableTopicContext" BOOLEAN NOT NULL DEFAULT true,
    "prioritizeLatency" BOOLEAN NOT NULL DEFAULT false,
    "cacheAggressively" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_context_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sharing_policies" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'conversation',
    "virtualUserId" TEXT NOT NULL,
    "audience" JSONB NOT NULL,
    "permissions" JSONB NOT NULL,
    "temporal" JSONB,
    "geographic" JSONB,
    "contextual" JSONB,
    "collaborative" JSONB,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "createdBy" TEXT NOT NULL,

    CONSTRAINT "sharing_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_stakeholders" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "contribution" TEXT NOT NULL,
    "privacySettings" JSONB NOT NULL,
    "influenceScore" INTEGER NOT NULL DEFAULT 50,
    "resolutionDecision" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_stakeholders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_access_grants" (
    "id" TEXT NOT NULL,
    "policyId" TEXT NOT NULL,
    "grantedTo" TEXT NOT NULL,
    "grantedToType" TEXT NOT NULL DEFAULT 'user',
    "grantedBy" TEXT NOT NULL,
    "accessLevel" TEXT NOT NULL DEFAULT 'view',
    "permissions" JSONB,
    "grantedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6),
    "viewsUsed" INTEGER NOT NULL DEFAULT 0,
    "maxViews" INTEGER,
    "lastAccessedAt" TIMESTAMPTZ(6),
    "status" TEXT NOT NULL DEFAULT 'active',

    CONSTRAINT "content_access_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_access_logs" (
    "id" TEXT NOT NULL,
    "policyId" TEXT,
    "intentId" TEXT,
    "contentRecordId" TEXT,
    "accessorId" TEXT NOT NULL,
    "accessorType" TEXT NOT NULL DEFAULT 'user',
    "action" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "denialReason" TEXT,
    "viaCircleId" TEXT,
    "viaGrantId" TEXT,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "deviceId" TEXT,
    "location" JSONB,

    CONSTRAINT "content_access_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sharing_intents" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "intentType" "IntentType" NOT NULL DEFAULT 'SHARE',
    "actor_did" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "contentIds" TEXT[],
    "contentScope" "ContentScope" NOT NULL DEFAULT 'FULL',
    "includeACUs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excludeACUs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audienceType" "AudienceType" NOT NULL,
    "circleIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userDids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "linkId" TEXT,
    "permissions" JSONB NOT NULL,
    "schedule" JSONB,
    "transformations" JSONB,
    "metadata" JSONB,
    "policy" JSONB,
    "status" "IntentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "publishedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),
    "revokedReason" TEXT,
    "owner_did" TEXT NOT NULL,
    "coOwners" JSONB,

    CONSTRAINT "sharing_intents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "share_links" (
    "id" TEXT NOT NULL,
    "linkCode" TEXT NOT NULL,
    "intentId" TEXT NOT NULL,
    "maxUses" INTEGER,
    "usesCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMPTZ(6),
    "passwordHash" TEXT,
    "created_by_did" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUsedAt" TIMESTAMPTZ(6),

    CONSTRAINT "share_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_records" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "contentType" "ContentType" NOT NULL,
    "size" INTEGER NOT NULL,
    "mimeType" TEXT,
    "owner_did" TEXT NOT NULL,
    "creator_did" TEXT NOT NULL,
    "intentId" TEXT,
    "discoveryMetadata" JSONB NOT NULL,
    "status" "ContentRecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "publishedAt" TIMESTAMPTZ(6),
    "expiresAt" TIMESTAMPTZ(6),
    "revokedAt" TIMESTAMPTZ(6),

    CONSTRAINT "content_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_providers" (
    "id" TEXT NOT NULL,
    "content_record_id" TEXT NOT NULL,
    "node_id" TEXT NOT NULL,
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "replicaNumber" INTEGER NOT NULL DEFAULT 1,
    "isOnline" BOOLEAN NOT NULL DEFAULT true,
    "lastVerifiedAt" TIMESTAMPTZ(6),
    "localPath" TEXT,
    "size" BIGINT,
    "checksum" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "eventType" "AnalyticsEventType" NOT NULL,
    "actor_did" TEXT,
    "intent_id" TEXT,
    "content_record_id" TEXT,
    "eventData" JSONB NOT NULL,
    "isAnonymized" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isProcessed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "aggregated_metrics" (
    "id" TEXT NOT NULL,
    "metricType" "MetricType" NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "aggregationType" "AggregationType" NOT NULL,
    "aggregationKey" TEXT NOT NULL,
    "metrics" JSONB NOT NULL,
    "computedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "aggregated_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "insights" (
    "id" TEXT NOT NULL,
    "insightType" "InsightType" NOT NULL,
    "user_did" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "relevanceScore" DOUBLE PRECISION NOT NULL,
    "data" JSONB,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "isDismissed" BOOLEAN NOT NULL DEFAULT false,
    "generatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMPTZ(6),

    CONSTRAINT "insights_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_flags" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "contentOwnerId" TEXT,
    "contentText" TEXT,
    "reporterId" TEXT NOT NULL,
    "reason" "ModerationReason" NOT NULL,
    "description" TEXT,
    "status" "ModerationStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ModerationPriority" NOT NULL DEFAULT 'MEDIUM',
    "aiDetected" BOOLEAN NOT NULL DEFAULT false,
    "aiConfidence" DOUBLE PRECISION,
    "aiFlags" JSONB,
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMPTZ(6),
    "resolution" TEXT,
    "appealReason" TEXT,
    "appealedAt" TIMESTAMPTZ(6),
    "appealReviewerId" TEXT,
    "appealResolvedAt" TIMESTAMPTZ(6),
    "actionTaken" TEXT,
    "userNotified" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "content_flags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderator_notes" (
    "id" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "moderatorId" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "resolvedAt" TIMESTAMPTZ(6),
    "resolvedBy" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "moderator_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "moderation_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "conditionType" TEXT NOT NULL,
    "condition" JSONB NOT NULL,
    "action" TEXT NOT NULL,
    "actionConfig" JSONB,
    "contentTypes" TEXT[],
    "appliesTo" TEXT NOT NULL DEFAULT 'all',
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "maxStrikes" INTEGER,
    "timeWindow" INTEGER,
    "createdBy" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "moderation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_moderation_records" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "spamCount" INTEGER NOT NULL DEFAULT 0,
    "harassmentCount" INTEGER NOT NULL DEFAULT 0,
    "hateSpeechCount" INTEGER NOT NULL DEFAULT 0,
    "violenceCount" INTEGER NOT NULL DEFAULT 0,
    "sexualCount" INTEGER NOT NULL DEFAULT 0,
    "misinformationCount" INTEGER NOT NULL DEFAULT 0,
    "otherCount" INTEGER NOT NULL DEFAULT 0,
    "totalStrikes" INTEGER NOT NULL DEFAULT 0,
    "warningsIssued" INTEGER NOT NULL DEFAULT 0,
    "contentRemoved" INTEGER NOT NULL DEFAULT 0,
    "isWarningActive" BOOLEAN NOT NULL DEFAULT false,
    "warningExpiresAt" TIMESTAMPTZ(6),
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "banReason" TEXT,
    "banExpiresAt" TIMESTAMPTZ(6),
    "banAppealReason" TEXT,
    "appealDeniedAt" TIMESTAMPTZ(6),
    "lastStrikedAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "user_moderation_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "context_recipes" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "layerWeights" JSONB NOT NULL DEFAULT '{}',
    "excludedLayers" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "customBudget" INTEGER,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "virtualUserId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "context_recipes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feed_impressions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "contextTags" TEXT[],
    "viewedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dwellTimeMs" INTEGER,
    "clicked" BOOLEAN NOT NULL DEFAULT false,
    "shared" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "feed_impressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "import_jobs" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT,
    "status" "ImportJobStatus" NOT NULL DEFAULT 'PENDING',
    "tierConfig" JSONB NOT NULL DEFAULT '{}',
    "currentTier" "ImportTier",
    "tierProgress" JSONB NOT NULL DEFAULT '{}',
    "sourceProvider" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "fileHash" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT,
    "fileSize" INTEGER NOT NULL,
    "totalConversations" INTEGER NOT NULL,
    "processedConversations" INTEGER NOT NULL DEFAULT 0,
    "failedConversations" INTEGER NOT NULL DEFAULT 0,
    "acuGenerated" INTEGER NOT NULL DEFAULT 0,
    "memoriesExtracted" INTEGER NOT NULL DEFAULT 0,
    "contextEnriched" INTEGER NOT NULL DEFAULT 0,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "errors" JSONB NOT NULL DEFAULT '[]',

    CONSTRAINT "import_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "imported_conversations" (
    "id" TEXT NOT NULL,
    "importJobId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "title" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "state" "ImportConversationState" NOT NULL DEFAULT 'PENDING',
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "importedAt" TIMESTAMP(3),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "errors" JSONB NOT NULL DEFAULT '[]',
    "conversationId" TEXT,

    CONSTRAINT "imported_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_users" (
    "id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "confidenceScore" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "fingerprintSignals" JSONB NOT NULL DEFAULT '{}',
    "ipHistory" JSONB NOT NULL DEFAULT '[]',
    "userAgentHistory" JSONB NOT NULL DEFAULT '[]',
    "deviceCharacteristics" JSONB NOT NULL DEFAULT '{}',
    "displayName" TEXT,
    "topicInterests" JSONB NOT NULL DEFAULT '[]',
    "entityProfiles" JSONB NOT NULL DEFAULT '[]',
    "conversationCount" INTEGER NOT NULL DEFAULT 0,
    "memoryCount" INTEGER NOT NULL DEFAULT 0,
    "firstSeenAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMPTZ(6) NOT NULL,
    "lastIpAddress" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "consentTimestamp" TIMESTAMPTZ(6),
    "dataRetentionPolicy" TEXT NOT NULL DEFAULT '90_days',
    "anonymizedAt" TIMESTAMPTZ(6),
    "deletedAt" TIMESTAMPTZ(6),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tenantId" TEXT,
    "currentAvatar" TEXT NOT NULL DEFAULT 'STRANGER',
    "profileVersion" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "virtual_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_sessions" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "screenResolution" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActivityAt" TIMESTAMPTZ(6) NOT NULL,
    "activeConversationId" TEXT,
    "contextBundleVersion" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "virtual_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_memories" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "provenanceId" TEXT,
    "provider" TEXT,
    "sourceUrl" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'conversation',
    "sourcePlatform" TEXT,
    "extractionMethod" TEXT,
    "extractionModel" TEXT,
    "extractionConfidence" DOUBLE PRECISION,
    "extractionPromptVersion" TEXT,
    "captureSessionId" TEXT,
    "captureMethod" TEXT,
    "capturedAt" TIMESTAMPTZ(6),
    "lineageDepth" INTEGER NOT NULL DEFAULT 0,
    "lineageParentId" TEXT,
    "derivedFromIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "version" INTEGER NOT NULL DEFAULT 1,
    "contentHash" TEXT,
    "contentVersion" INTEGER NOT NULL DEFAULT 1,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verificationSource" TEXT,
    "memoryType" "MemoryType" NOT NULL DEFAULT 'EPISODIC',
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "importance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "relevance" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "accessCount" INTEGER NOT NULL DEFAULT 0,
    "lastAccessedAt" TIMESTAMP(3),
    "parentMemoryId" TEXT,
    "childMemoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "relatedMemoryIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "mergedFromIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceConversationIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceAcuIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "sourceMessageIds" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "embedding" vector(1536),
    "embeddingModel" TEXT,
    "embeddingDimension" INTEGER,
    "consolidationStatus" "MemoryConsolidationStatus" NOT NULL DEFAULT 'RAW',
    "consolidationScore" DOUBLE PRECISION,
    "lastConsolidatedAt" TIMESTAMP(3),
    "occurredAt" TIMESTAMP(3),
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "virtual_memories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_conversations" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "title" TEXT,
    "provider" TEXT,
    "sourceUrl" TEXT,
    "model" TEXT,
    "state" TEXT NOT NULL DEFAULT 'ACTIVE',
    "visibility" TEXT NOT NULL DEFAULT 'private',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "messageCount" INTEGER NOT NULL DEFAULT 0,
    "userMessageCount" INTEGER NOT NULL DEFAULT 0,
    "aiMessageCount" INTEGER NOT NULL DEFAULT 0,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "totalCharacters" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER,
    "renderedPreview" JSONB,
    "renderingOptions" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "capturedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "virtual_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_messages" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "author" TEXT,
    "parts" JSONB NOT NULL,
    "contentHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "messageIndex" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "finishReason" TEXT,
    "tokenCount" INTEGER,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "renderedContent" JSONB,
    "textStyles" JSONB,
    "customClasses" TEXT[],
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "virtual_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_acus" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "authorDid" TEXT,
    "signature" BYTEA,
    "content" TEXT NOT NULL,
    "contentHash" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "language" TEXT,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "origin" TEXT NOT NULL DEFAULT 'extraction',
    "embedding" vector(1536),
    "embeddingModel" TEXT,
    "conversationId" TEXT,
    "messageId" TEXT,
    "messageIndex" INTEGER,
    "provider" TEXT,
    "model" TEXT,
    "sourceTimestamp" TIMESTAMPTZ(6),
    "parentId" TEXT,
    "extractorVersion" TEXT,
    "parserVersion" TEXT,
    "state" TEXT NOT NULL DEFAULT 'ACTIVE',
    "securityLevel" INTEGER NOT NULL DEFAULT 0,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "level" INTEGER NOT NULL DEFAULT 4,
    "contentType" TEXT NOT NULL DEFAULT 'text',
    "qualityOverall" DOUBLE PRECISION,
    "contentRichness" DOUBLE PRECISION,
    "structuralIntegrity" DOUBLE PRECISION,
    "uniqueness" DOUBLE PRECISION,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "quoteCount" INTEGER NOT NULL DEFAULT 0,
    "rediscoveryScore" DOUBLE PRECISION,
    "sharingPolicy" TEXT NOT NULL DEFAULT 'self',
    "sharingCircles" TEXT[],
    "canView" BOOLEAN NOT NULL DEFAULT true,
    "canAnnotate" BOOLEAN NOT NULL DEFAULT false,
    "canRemix" BOOLEAN NOT NULL DEFAULT false,
    "canReshare" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "indexedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "tags" TEXT[],

    CONSTRAINT "virtual_acus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_acu_links" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdByDid" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "virtual_acu_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_notebooks" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "color" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "virtual_notebooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_notebook_entries" (
    "id" TEXT NOT NULL,
    "notebookId" TEXT NOT NULL,
    "acuId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "addedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "virtual_notebook_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_user_analytics" (
    "id" TEXT NOT NULL,
    "date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "newVirtualUsers" INTEGER NOT NULL DEFAULT 0,
    "activeVirtualUsers" INTEGER NOT NULL DEFAULT 0,
    "totalSessions" INTEGER NOT NULL DEFAULT 0,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "memoriesCreated" INTEGER NOT NULL DEFAULT 0,
    "highConfidenceIdentifications" INTEGER NOT NULL DEFAULT 0,
    "mediumConfidenceIdentifications" INTEGER NOT NULL DEFAULT 0,
    "lowConfidenceIdentifications" INTEGER NOT NULL DEFAULT 0,
    "falsePositives" INTEGER NOT NULL DEFAULT 0,
    "consentsGiven" INTEGER NOT NULL DEFAULT 0,
    "consentsDenied" INTEGER NOT NULL DEFAULT 0,
    "deletionsRequested" INTEGER NOT NULL DEFAULT 0,
    "avgSessionDuration" INTEGER NOT NULL DEFAULT 0,
    "avgConversationsPerUser" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgMemoriesPerUser" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "virtual_user_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_user_audit_logs" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "details" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "virtual_user_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "chatbotConfig" JSONB NOT NULL,
    "brandVoice" JSONB NOT NULL,
    "guardrails" TEXT[],
    "defaultModel" TEXT NOT NULL DEFAULT 'gpt-4o',
    "embeddingModel" TEXT NOT NULL DEFAULT 'text-embedding-3-small',
    "maxContextTokens" INTEGER NOT NULL DEFAULT 12000,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corpus_documents" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceUrl" TEXT,
    "rawContent" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "topicId" TEXT,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "previousVersionId" TEXT,
    "authors" TEXT[],
    "lastPublishedAt" TIMESTAMP(3) NOT NULL,
    "wordCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "ingestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corpus_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corpus_document_versions" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "contentHash" TEXT NOT NULL,
    "changeType" TEXT NOT NULL DEFAULT 'patch',
    "changelog" TEXT,
    "changedSections" TEXT[],
    "addedChunkIds" TEXT[],
    "modifiedChunkIds" TEXT[],
    "removedChunkIds" TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "ingestedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "corpus_document_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corpus_chunks" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "parentChunkId" TEXT,
    "chunkIndex" INTEGER NOT NULL,
    "totalChunks" INTEGER NOT NULL,
    "sectionPath" TEXT[],
    "headingLevel" INTEGER NOT NULL,
    "contentType" TEXT NOT NULL DEFAULT 'prose',
    "embedding" vector(1536),
    "embeddingModel" TEXT,
    "keywords" TEXT[],
    "topicSlug" TEXT NOT NULL,
    "difficulty" TEXT NOT NULL DEFAULT 'intermediate',
    "generatedQuestions" TEXT[],
    "generatedAnswer" TEXT,
    "questionEmbeddings" JSONB,
    "sourceUpdatedAt" TIMESTAMP(3) NOT NULL,
    "freshnessScore" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "qualityScore" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "retrievalCount" INTEGER NOT NULL DEFAULT 0,
    "avgRelevanceScore" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastRetrievedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "corpus_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corpus_topics" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "parentTopicId" TEXT,
    "path" TEXT[],
    "depth" INTEGER NOT NULL DEFAULT 0,
    "documentCount" INTEGER NOT NULL DEFAULT 0,
    "chunkCount" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "embedding" vector(1536),
    "representativeQuestions" TEXT[],
    "queryCount" INTEGER NOT NULL DEFAULT 0,
    "avgConfidence" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "popularity" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "lastUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "corpus_topics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "corpus_faqs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "sourceChunkId" TEXT,
    "isManual" BOOLEAN NOT NULL DEFAULT false,
    "questionEmbedding" vector(1536),
    "topicSlug" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "matchCount" INTEGER NOT NULL DEFAULT 0,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "unhelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "corpus_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_indices" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "embedding" vector(1536),
    "topics" TEXT[],
    "keyFacts" JSONB NOT NULL,
    "questionsAsked" TEXT[],
    "issuesDiscussed" TEXT[],
    "decisionsReached" TEXT[],
    "actionItems" TEXT[],
    "messageCount" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "sentiment" TEXT NOT NULL DEFAULT 'neutral',
    "resolutionStatus" TEXT NOT NULL DEFAULT 'unknown',
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "lastReferencedAt" TIMESTAMP(3),
    "referenceCount" INTEGER NOT NULL DEFAULT 0,
    "relatedConversationIds" TEXT[],
    "memoryIds" TEXT[],
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_indices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profile_snapshots" (
    "id" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'STRANGER',
    "version" INTEGER NOT NULL DEFAULT 1,
    "identity" JSONB NOT NULL,
    "preferences" JSONB NOT NULL,
    "topicExpertise" JSONB NOT NULL,
    "behavior" JSONB NOT NULL,
    "activeConcerns" JSONB NOT NULL,
    "evolutionLog" JSONB NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastEvolvedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_profile_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orchestration_logs" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "virtualUserId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "intent" TEXT NOT NULL,
    "intentConfidence" DOUBLE PRECISION NOT NULL,
    "avatar" TEXT NOT NULL,
    "corpusWeight" DOUBLE PRECISION NOT NULL,
    "userWeight" DOUBLE PRECISION NOT NULL,
    "assemblyTimeMs" INTEGER NOT NULL,
    "totalTokens" INTEGER NOT NULL,
    "corpusTokens" INTEGER NOT NULL,
    "userTokens" INTEGER NOT NULL,
    "historyTokens" INTEGER NOT NULL,
    "corpusConfidence" DOUBLE PRECISION NOT NULL,
    "chunksRetrieved" INTEGER NOT NULL,
    "memoriesUsed" INTEGER NOT NULL,
    "proactiveInsights" INTEGER NOT NULL,
    "userSatisfaction" TEXT,
    "followUpRequired" BOOLEAN NOT NULL DEFAULT false,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orchestration_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doc_corpus" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourcePath" TEXT,
    "category" TEXT,
    "tags" TEXT[],
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "doc_corpus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doc_chunks" (
    "id" TEXT NOT NULL,
    "corpusId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" vector(1536),
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "doc_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversations_sourceUrl_key" ON "conversations"("sourceUrl");

-- CreateIndex
CREATE INDEX "conversations_provider_idx" ON "conversations"("provider");

-- CreateIndex
CREATE INDEX "conversations_capturedAt_idx" ON "conversations"("capturedAt" DESC);

-- CreateIndex
CREATE INDEX "conversations_provider_capturedAt_idx" ON "conversations"("provider", "capturedAt" DESC);

-- CreateIndex
CREATE INDEX "conversations_sourceUrl_idx" ON "conversations"("sourceUrl");

-- CreateIndex
CREATE INDEX "conversations_createdAt_idx" ON "conversations"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "conversations_virtualUserId_idx" ON "conversations"("virtualUserId");

-- CreateIndex
CREATE INDEX "conversations_tags_idx" ON "conversations"("tags");

-- CreateIndex
CREATE INDEX "conversations_version_idx" ON "conversations"("version");

-- CreateIndex
CREATE INDEX "messages_conversationId_messageIndex_idx" ON "messages"("conversationId", "messageIndex");

-- CreateIndex
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "messages_role_idx" ON "messages"("role");

-- CreateIndex
CREATE INDEX "messages_contentHash_idx" ON "messages"("contentHash");

-- CreateIndex
CREATE INDEX "messages_displayOrder_idx" ON "messages"("displayOrder");

-- CreateIndex
CREATE UNIQUE INDEX "provider_stats_provider_key" ON "provider_stats"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "rendering_templates_name_key" ON "rendering_templates"("name");

-- CreateIndex
CREATE INDEX "rendering_templates_templateType_idx" ON "rendering_templates"("templateType");

-- CreateIndex
CREATE INDEX "rendering_templates_provider_idx" ON "rendering_templates"("provider");

-- CreateIndex
CREATE INDEX "rendering_templates_name_idx" ON "rendering_templates"("name");

-- CreateIndex
CREATE UNIQUE INDEX "rendering_cache_conversationId_key" ON "rendering_cache"("conversationId");

-- CreateIndex
CREATE INDEX "rendering_cache_contentHash_idx" ON "rendering_cache"("contentHash");

-- CreateIndex
CREATE INDEX "rendering_cache_lastAccessedAt_idx" ON "rendering_cache"("lastAccessedAt");

-- CreateIndex
CREATE INDEX "rendering_cache_expiresAt_idx" ON "rendering_cache"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "message_style_presets_name_key" ON "message_style_presets"("name");

-- CreateIndex
CREATE INDEX "message_style_presets_applyToRole_idx" ON "message_style_presets"("applyToRole");

-- CreateIndex
CREATE INDEX "message_style_presets_applyToProvider_idx" ON "message_style_presets"("applyToProvider");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_keyHash_key" ON "api_keys"("keyHash");

-- CreateIndex
CREATE INDEX "api_keys_userId_idx" ON "api_keys"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "devices_deviceId_key" ON "devices"("deviceId");

-- CreateIndex
CREATE INDEX "devices_userId_idx" ON "devices"("userId");

-- CreateIndex
CREATE INDEX "devices_deviceId_idx" ON "devices"("deviceId");

-- CreateIndex
CREATE INDEX "devices_userId_isActive_idx" ON "devices"("userId", "isActive");

-- CreateIndex
CREATE INDEX "devices_virtualUserId_idx" ON "devices"("virtualUserId");

-- CreateIndex
CREATE INDEX "atomic_chat_units_origin_idx" ON "atomic_chat_units"("origin");

-- CreateIndex
CREATE INDEX "atomic_chat_units_parentId_idx" ON "atomic_chat_units"("parentId");

-- CreateIndex
CREATE INDEX "atomic_chat_units_conversationId_idx" ON "atomic_chat_units"("conversationId");

-- CreateIndex
CREATE INDEX "atomic_chat_units_messageId_idx" ON "atomic_chat_units"("messageId");

-- CreateIndex
CREATE INDEX "atomic_chat_units_virtualUserId_idx" ON "atomic_chat_units"("virtualUserId");

-- CreateIndex
CREATE INDEX "atomic_chat_units_virtualUserId_createdAt_idx" ON "atomic_chat_units"("virtualUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "atomic_chat_units_type_idx" ON "atomic_chat_units"("type");

-- CreateIndex
CREATE INDEX "atomic_chat_units_category_idx" ON "atomic_chat_units"("category");

-- CreateIndex
CREATE INDEX "atomic_chat_units_qualityOverall_idx" ON "atomic_chat_units"("qualityOverall" DESC);

-- CreateIndex
CREATE INDEX "atomic_chat_units_rediscoveryScore_idx" ON "atomic_chat_units"("rediscoveryScore" DESC);

-- CreateIndex
CREATE INDEX "atomic_chat_units_createdAt_idx" ON "atomic_chat_units"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "atomic_chat_units_sharingPolicy_idx" ON "atomic_chat_units"("sharingPolicy");

-- CreateIndex
CREATE INDEX "atomic_chat_units_tags_idx" ON "atomic_chat_units"("tags");

-- CreateIndex
CREATE INDEX "atomic_chat_units_contentHash_idx" ON "atomic_chat_units"("contentHash");

-- CreateIndex
CREATE INDEX "atomic_chat_units_embedding_idx" ON "atomic_chat_units"("embedding");

-- CreateIndex
CREATE INDEX "acu_links_sourceId_idx" ON "acu_links"("sourceId");

-- CreateIndex
CREATE INDEX "acu_links_targetId_idx" ON "acu_links"("targetId");

-- CreateIndex
CREATE INDEX "acu_links_relation_idx" ON "acu_links"("relation");

-- CreateIndex
CREATE UNIQUE INDEX "acu_links_sourceId_targetId_relation_key" ON "acu_links"("sourceId", "targetId", "relation");

-- CreateIndex
CREATE INDEX "notebooks_ownerId_idx" ON "notebooks"("ownerId");

-- CreateIndex
CREATE INDEX "notebooks_virtualUserId_idx" ON "notebooks"("virtualUserId");

-- CreateIndex
CREATE INDEX "notebook_entries_notebookId_sortOrder_idx" ON "notebook_entries"("notebookId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "notebook_entries_notebookId_acuId_key" ON "notebook_entries"("notebookId", "acuId");

-- CreateIndex
CREATE INDEX "sync_cursors_virtualUserId_deviceDid_idx" ON "sync_cursors"("virtualUserId", "deviceDid");

-- CreateIndex
CREATE UNIQUE INDEX "sync_cursors_virtualUserId_deviceDid_tableName_key" ON "sync_cursors"("virtualUserId", "deviceDid", "tableName");

-- CreateIndex
CREATE INDEX "sync_operations_authorDid_idx" ON "sync_operations"("authorDid");

-- CreateIndex
CREATE INDEX "sync_operations_deviceDid_idx" ON "sync_operations"("deviceDid");

-- CreateIndex
CREATE INDEX "sync_operations_tableName_recordId_idx" ON "sync_operations"("tableName", "recordId");

-- CreateIndex
CREATE INDEX "sync_operations_entityType_entityId_idx" ON "sync_operations"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "sync_operations_hlcTimestamp_idx" ON "sync_operations"("hlcTimestamp");

-- CreateIndex
CREATE INDEX "sync_operations_createdAt_idx" ON "sync_operations"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "ai_personas_type_idx" ON "ai_personas"("type");

-- CreateIndex
CREATE INDEX "user_facts_category_idx" ON "user_facts"("category");

-- CreateIndex
CREATE UNIQUE INDEX "system_commands_trigger_key" ON "system_commands"("trigger");

-- CreateIndex
CREATE UNIQUE INDEX "system_actions_trigger_key" ON "system_actions"("trigger");

-- CreateIndex
CREATE INDEX "topic_profiles_userId_importanceScore_idx" ON "topic_profiles"("userId", "importanceScore" DESC);

-- CreateIndex
CREATE INDEX "topic_profiles_virtualUserId_importanceScore_idx" ON "topic_profiles"("virtualUserId", "importanceScore" DESC);

-- CreateIndex
CREATE INDEX "topic_profiles_userId_lastEngagedAt_idx" ON "topic_profiles"("userId", "lastEngagedAt" DESC);

-- CreateIndex
CREATE INDEX "topic_profiles_virtualUserId_lastEngagedAt_idx" ON "topic_profiles"("virtualUserId", "lastEngagedAt" DESC);

-- CreateIndex
CREATE INDEX "topic_profiles_userId_isDirty_idx" ON "topic_profiles"("userId", "isDirty");

-- CreateIndex
CREATE INDEX "topic_profiles_virtualUserId_isDirty_idx" ON "topic_profiles"("virtualUserId", "isDirty");

-- CreateIndex
CREATE INDEX "topic_profiles_domain_idx" ON "topic_profiles"("domain");

-- CreateIndex
CREATE INDEX "topic_profiles_embedding_idx" ON "topic_profiles"("embedding");

-- CreateIndex
CREATE UNIQUE INDEX "topic_profiles_userId_slug_key" ON "topic_profiles"("userId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "topic_profiles_virtualUserId_slug_key" ON "topic_profiles"("virtualUserId", "slug");

-- CreateIndex
CREATE INDEX "topic_conversations_topicId_idx" ON "topic_conversations"("topicId");

-- CreateIndex
CREATE INDEX "topic_conversations_conversationId_idx" ON "topic_conversations"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "topic_conversations_topicId_conversationId_key" ON "topic_conversations"("topicId", "conversationId");

-- CreateIndex
CREATE INDEX "entity_profiles_userId_importanceScore_idx" ON "entity_profiles"("userId", "importanceScore" DESC);

-- CreateIndex
CREATE INDEX "entity_profiles_virtualUserId_importanceScore_idx" ON "entity_profiles"("virtualUserId", "importanceScore" DESC);

-- CreateIndex
CREATE INDEX "entity_profiles_userId_type_idx" ON "entity_profiles"("userId", "type");

-- CreateIndex
CREATE INDEX "entity_profiles_virtualUserId_type_idx" ON "entity_profiles"("virtualUserId", "type");

-- CreateIndex
CREATE INDEX "entity_profiles_userId_lastMentionedAt_idx" ON "entity_profiles"("userId", "lastMentionedAt" DESC);

-- CreateIndex
CREATE INDEX "entity_profiles_virtualUserId_lastMentionedAt_idx" ON "entity_profiles"("virtualUserId", "lastMentionedAt" DESC);

-- CreateIndex
CREATE INDEX "entity_profiles_embedding_idx" ON "entity_profiles"("embedding");

-- CreateIndex
CREATE UNIQUE INDEX "entity_profiles_userId_name_type_key" ON "entity_profiles"("userId", "name", "type");

-- CreateIndex
CREATE UNIQUE INDEX "entity_profiles_virtualUserId_name_type_key" ON "entity_profiles"("virtualUserId", "name", "type");

-- CreateIndex
CREATE INDEX "context_bundles_userId_bundleType_idx" ON "context_bundles"("userId", "bundleType");

-- CreateIndex
CREATE INDEX "context_bundles_virtualUserId_bundleType_idx" ON "context_bundles"("virtualUserId", "bundleType");

-- CreateIndex
CREATE INDEX "context_bundles_userId_priority_idx" ON "context_bundles"("userId", "priority" DESC);

-- CreateIndex
CREATE INDEX "context_bundles_virtualUserId_priority_idx" ON "context_bundles"("virtualUserId", "priority" DESC);

-- CreateIndex
CREATE INDEX "context_bundles_userId_isDirty_idx" ON "context_bundles"("userId", "isDirty");

-- CreateIndex
CREATE INDEX "context_bundles_virtualUserId_isDirty_idx" ON "context_bundles"("virtualUserId", "isDirty");

-- CreateIndex
CREATE INDEX "context_bundles_expiresAt_idx" ON "context_bundles"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "context_bundles_userId_bundleType_topicProfileId_entityProf_key" ON "context_bundles"("userId", "bundleType", "topicProfileId", "entityProfileId", "conversationId", "personaId");

-- CreateIndex
CREATE UNIQUE INDEX "context_bundles_virtualUserId_bundleType_topicProfileId_ent_key" ON "context_bundles"("virtualUserId", "bundleType", "topicProfileId", "entityProfileId", "conversationId", "personaId");

-- CreateIndex
CREATE INDEX "conversation_compactions_conversationId_fromMessageIndex_idx" ON "conversation_compactions"("conversationId", "fromMessageIndex");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_compactions_conversationId_fromMessageIndex_to_key" ON "conversation_compactions"("conversationId", "fromMessageIndex", "toMessageIndex");

-- CreateIndex
CREATE INDEX "client_presence_virtualUserId_isOnline_idx" ON "client_presence"("virtualUserId", "isOnline");

-- CreateIndex
CREATE INDEX "client_presence_lastHeartbeatAt_idx" ON "client_presence"("lastHeartbeatAt");

-- CreateIndex
CREATE UNIQUE INDEX "client_presence_virtualUserId_deviceId_key" ON "client_presence"("virtualUserId", "deviceId");

-- CreateIndex
CREATE INDEX "custom_instructions_virtualUserId_scope_isActive_idx" ON "custom_instructions"("virtualUserId", "scope", "isActive");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_memoryType_idx" ON "memories"("virtualUserId", "memoryType");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_category_idx" ON "memories"("virtualUserId", "category");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_importance_idx" ON "memories"("virtualUserId", "importance" DESC);

-- CreateIndex
CREATE INDEX "memories_virtualUserId_relevance_idx" ON "memories"("virtualUserId", "relevance" DESC);

-- CreateIndex
CREATE INDEX "memories_virtualUserId_isPinned_idx" ON "memories"("virtualUserId", "isPinned");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_consolidationStatus_idx" ON "memories"("virtualUserId", "consolidationStatus");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_createdAt_idx" ON "memories"("virtualUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "memories_virtualUserId_lastAccessedAt_idx" ON "memories"("virtualUserId", "lastAccessedAt");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_tags_idx" ON "memories"("virtualUserId", "tags");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_occurredAt_idx" ON "memories"("virtualUserId", "occurredAt");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_memoryType_importance_idx" ON "memories"("virtualUserId", "memoryType", "importance" DESC);

-- CreateIndex
CREATE INDEX "memories_virtualUserId_consolidationStatus_createdAt_idx" ON "memories"("virtualUserId", "consolidationStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "memories_virtualUserId_isPinned_importance_idx" ON "memories"("virtualUserId", "isPinned", "importance" DESC);

-- CreateIndex
CREATE INDEX "memories_virtualUserId_expiresAt_idx" ON "memories"("virtualUserId", "expiresAt");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_provider_idx" ON "memories"("virtualUserId", "provider");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_sourceType_idx" ON "memories"("virtualUserId", "sourceType");

-- CreateIndex
CREATE INDEX "memories_virtualUserId_sourcePlatform_idx" ON "memories"("virtualUserId", "sourcePlatform");

-- CreateIndex
CREATE INDEX "memories_captureSessionId_idx" ON "memories"("captureSessionId");

-- CreateIndex
CREATE INDEX "memories_contentHash_idx" ON "memories"("contentHash");

-- CreateIndex
CREATE INDEX "memories_provenanceId_idx" ON "memories"("provenanceId");

-- CreateIndex
CREATE INDEX "memories_embedding_idx" ON "memories"("embedding");

-- CreateIndex
CREATE INDEX "memory_conflicts_userId_isResolved_idx" ON "memory_conflicts"("userId", "isResolved");

-- CreateIndex
CREATE INDEX "memory_conflicts_userId_conflictType_idx" ON "memory_conflicts"("userId", "conflictType");

-- CreateIndex
CREATE INDEX "memory_conflicts_memoryId1_idx" ON "memory_conflicts"("memoryId1");

-- CreateIndex
CREATE INDEX "memory_conflicts_memoryId2_idx" ON "memory_conflicts"("memoryId2");

-- CreateIndex
CREATE INDEX "memory_relationships_userId_idx" ON "memory_relationships"("userId");

-- CreateIndex
CREATE INDEX "memory_relationships_sourceMemoryId_idx" ON "memory_relationships"("sourceMemoryId");

-- CreateIndex
CREATE INDEX "memory_relationships_targetMemoryId_idx" ON "memory_relationships"("targetMemoryId");

-- CreateIndex
CREATE UNIQUE INDEX "memory_relationships_sourceMemoryId_targetMemoryId_relation_key" ON "memory_relationships"("sourceMemoryId", "targetMemoryId", "relationshipType");

-- CreateIndex
CREATE INDEX "failed_jobs_jobType_idx" ON "failed_jobs"("jobType");

-- CreateIndex
CREATE INDEX "failed_jobs_createdAt_idx" ON "failed_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "memory_extraction_jobs_userId_status_idx" ON "memory_extraction_jobs"("userId", "status");

-- CreateIndex
CREATE INDEX "memory_extraction_jobs_conversationId_idx" ON "memory_extraction_jobs"("conversationId");

-- CreateIndex
CREATE UNIQUE INDEX "memory_analytics_userId_key" ON "memory_analytics"("userId");

-- CreateIndex
CREATE INDEX "librarian_logs_userId_timestamp_idx" ON "librarian_logs"("userId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "user_context_settings_virtualUserId_key" ON "user_context_settings"("virtualUserId");

-- CreateIndex
CREATE INDEX "user_context_settings_virtualUserId_idx" ON "user_context_settings"("virtualUserId");

-- CreateIndex
CREATE UNIQUE INDEX "sharing_policies_contentId_key" ON "sharing_policies"("contentId");

-- CreateIndex
CREATE INDEX "sharing_policies_virtualUserId_idx" ON "sharing_policies"("virtualUserId");

-- CreateIndex
CREATE INDEX "sharing_policies_virtualUserId_createdAt_idx" ON "sharing_policies"("virtualUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "sharing_policies_contentId_idx" ON "sharing_policies"("contentId");

-- CreateIndex
CREATE INDEX "sharing_policies_status_idx" ON "sharing_policies"("status");

-- CreateIndex
CREATE INDEX "content_stakeholders_policyId_idx" ON "content_stakeholders"("policyId");

-- CreateIndex
CREATE INDEX "content_stakeholders_virtualUserId_idx" ON "content_stakeholders"("virtualUserId");

-- CreateIndex
CREATE UNIQUE INDEX "content_stakeholders_policyId_virtualUserId_key" ON "content_stakeholders"("policyId", "virtualUserId");

-- CreateIndex
CREATE INDEX "content_access_grants_policyId_idx" ON "content_access_grants"("policyId");

-- CreateIndex
CREATE INDEX "content_access_grants_grantedTo_idx" ON "content_access_grants"("grantedTo");

-- CreateIndex
CREATE INDEX "content_access_grants_status_idx" ON "content_access_grants"("status");

-- CreateIndex
CREATE INDEX "content_access_grants_expiresAt_idx" ON "content_access_grants"("expiresAt");

-- CreateIndex
CREATE INDEX "content_access_logs_policyId_idx" ON "content_access_logs"("policyId");

-- CreateIndex
CREATE INDEX "content_access_logs_intentId_idx" ON "content_access_logs"("intentId");

-- CreateIndex
CREATE INDEX "content_access_logs_accessorId_idx" ON "content_access_logs"("accessorId");

-- CreateIndex
CREATE INDEX "content_access_logs_timestamp_idx" ON "content_access_logs"("timestamp");

-- CreateIndex
CREATE INDEX "content_access_logs_action_idx" ON "content_access_logs"("action");

-- CreateIndex
CREATE UNIQUE INDEX "sharing_intents_linkId_key" ON "sharing_intents"("linkId");

-- CreateIndex
CREATE INDEX "sharing_intents_actor_did_idx" ON "sharing_intents"("actor_did");

-- CreateIndex
CREATE INDEX "sharing_intents_owner_did_idx" ON "sharing_intents"("owner_did");

-- CreateIndex
CREATE INDEX "sharing_intents_contentType_status_idx" ON "sharing_intents"("contentType", "status");

-- CreateIndex
CREATE INDEX "sharing_intents_audienceType_idx" ON "sharing_intents"("audienceType");

-- CreateIndex
CREATE INDEX "sharing_intents_publishedAt_idx" ON "sharing_intents"("publishedAt");

-- CreateIndex
CREATE INDEX "sharing_intents_expiresAt_idx" ON "sharing_intents"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_linkCode_key" ON "share_links"("linkCode");

-- CreateIndex
CREATE UNIQUE INDEX "share_links_intentId_key" ON "share_links"("intentId");

-- CreateIndex
CREATE INDEX "share_links_created_by_did_idx" ON "share_links"("created_by_did");

-- CreateIndex
CREATE INDEX "share_links_isActive_expiresAt_idx" ON "share_links"("isActive", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "content_records_contentId_key" ON "content_records"("contentId");

-- CreateIndex
CREATE INDEX "content_records_contentType_idx" ON "content_records"("contentType");

-- CreateIndex
CREATE INDEX "content_records_owner_did_idx" ON "content_records"("owner_did");

-- CreateIndex
CREATE INDEX "content_records_status_idx" ON "content_records"("status");

-- CreateIndex
CREATE INDEX "content_records_publishedAt_idx" ON "content_records"("publishedAt");

-- CreateIndex
CREATE INDEX "content_records_expiresAt_idx" ON "content_records"("expiresAt");

-- CreateIndex
CREATE INDEX "content_providers_content_record_id_idx" ON "content_providers"("content_record_id");

-- CreateIndex
CREATE INDEX "content_providers_node_id_idx" ON "content_providers"("node_id");

-- CreateIndex
CREATE UNIQUE INDEX "content_providers_content_record_id_node_id_key" ON "content_providers"("content_record_id", "node_id");

-- CreateIndex
CREATE INDEX "analytics_events_eventType_idx" ON "analytics_events"("eventType");

-- CreateIndex
CREATE INDEX "analytics_events_actor_did_idx" ON "analytics_events"("actor_did");

-- CreateIndex
CREATE INDEX "analytics_events_intent_id_idx" ON "analytics_events"("intent_id");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- CreateIndex
CREATE INDEX "analytics_events_isProcessed_timestamp_idx" ON "analytics_events"("isProcessed", "timestamp");

-- CreateIndex
CREATE INDEX "aggregated_metrics_entityType_entityId_idx" ON "aggregated_metrics"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "aggregated_metrics_aggregationType_aggregationKey_idx" ON "aggregated_metrics"("aggregationType", "aggregationKey");

-- CreateIndex
CREATE UNIQUE INDEX "aggregated_metrics_metricType_entityType_entityId_aggregati_key" ON "aggregated_metrics"("metricType", "entityType", "entityId", "aggregationType", "aggregationKey");

-- CreateIndex
CREATE INDEX "insights_user_did_isRead_idx" ON "insights"("user_did", "isRead");

-- CreateIndex
CREATE INDEX "insights_user_did_generatedAt_idx" ON "insights"("user_did", "generatedAt");

-- CreateIndex
CREATE INDEX "content_flags_contentType_contentId_idx" ON "content_flags"("contentType", "contentId");

-- CreateIndex
CREATE INDEX "content_flags_reporterId_idx" ON "content_flags"("reporterId");

-- CreateIndex
CREATE INDEX "content_flags_contentOwnerId_idx" ON "content_flags"("contentOwnerId");

-- CreateIndex
CREATE INDEX "content_flags_status_idx" ON "content_flags"("status");

-- CreateIndex
CREATE INDEX "content_flags_reason_idx" ON "content_flags"("reason");

-- CreateIndex
CREATE INDEX "content_flags_priority_idx" ON "content_flags"("priority");

-- CreateIndex
CREATE INDEX "content_flags_createdAt_idx" ON "content_flags"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "content_flags_aiDetected_status_idx" ON "content_flags"("aiDetected", "status");

-- CreateIndex
CREATE INDEX "moderator_notes_targetType_targetId_idx" ON "moderator_notes"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "moderator_notes_moderatorId_idx" ON "moderator_notes"("moderatorId");

-- CreateIndex
CREATE INDEX "moderator_notes_isResolved_idx" ON "moderator_notes"("isResolved");

-- CreateIndex
CREATE INDEX "moderation_rules_isEnabled_priority_idx" ON "moderation_rules"("isEnabled", "priority");

-- CreateIndex
CREATE INDEX "moderation_rules_conditionType_idx" ON "moderation_rules"("conditionType");

-- CreateIndex
CREATE UNIQUE INDEX "user_moderation_records_userId_key" ON "user_moderation_records"("userId");

-- CreateIndex
CREATE INDEX "user_moderation_records_totalStrikes_idx" ON "user_moderation_records"("totalStrikes" DESC);

-- CreateIndex
CREATE INDEX "user_moderation_records_isBanned_idx" ON "user_moderation_records"("isBanned");

-- CreateIndex
CREATE INDEX "user_moderation_records_warningExpiresAt_idx" ON "user_moderation_records"("warningExpiresAt");

-- CreateIndex
CREATE INDEX "context_recipes_virtualUserId_idx" ON "context_recipes"("virtualUserId");

-- CreateIndex
CREATE INDEX "context_recipes_isDefault_idx" ON "context_recipes"("isDefault");

-- CreateIndex
CREATE INDEX "feed_impressions_userId_viewedAt_idx" ON "feed_impressions"("userId", "viewedAt");

-- CreateIndex
CREATE INDEX "feed_impressions_contentId_contentType_idx" ON "feed_impressions"("contentId", "contentType");

-- CreateIndex
CREATE INDEX "feed_impressions_userId_createdAt_idx" ON "feed_impressions"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "import_jobs_virtualUserId_status_idx" ON "import_jobs"("virtualUserId", "status");

-- CreateIndex
CREATE INDEX "import_jobs_virtualUserId_currentTier_idx" ON "import_jobs"("virtualUserId", "currentTier");

-- CreateIndex
CREATE INDEX "import_jobs_createdAt_idx" ON "import_jobs"("createdAt");

-- CreateIndex
CREATE INDEX "imported_conversations_importJobId_state_idx" ON "imported_conversations"("importJobId", "state");

-- CreateIndex
CREATE UNIQUE INDEX "imported_conversations_importJobId_sourceId_key" ON "imported_conversations"("importJobId", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_users_fingerprint_key" ON "virtual_users"("fingerprint");

-- CreateIndex
CREATE INDEX "virtual_users_fingerprint_idx" ON "virtual_users"("fingerprint");

-- CreateIndex
CREATE INDEX "virtual_users_lastSeenAt_idx" ON "virtual_users"("lastSeenAt");

-- CreateIndex
CREATE INDEX "virtual_users_confidenceScore_idx" ON "virtual_users"("confidenceScore");

-- CreateIndex
CREATE INDEX "virtual_users_consentGiven_idx" ON "virtual_users"("consentGiven");

-- CreateIndex
CREATE INDEX "virtual_users_tenantId_idx" ON "virtual_users"("tenantId");

-- CreateIndex
CREATE INDEX "virtual_users_currentAvatar_idx" ON "virtual_users"("currentAvatar");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_sessions_sessionToken_key" ON "virtual_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "virtual_sessions_virtualUserId_idx" ON "virtual_sessions"("virtualUserId");

-- CreateIndex
CREATE INDEX "virtual_sessions_sessionToken_idx" ON "virtual_sessions"("sessionToken");

-- CreateIndex
CREATE INDEX "virtual_sessions_expiresAt_idx" ON "virtual_sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "virtual_sessions_isActive_idx" ON "virtual_sessions"("isActive");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_memoryType_idx" ON "virtual_memories"("virtualUserId", "memoryType");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_category_idx" ON "virtual_memories"("virtualUserId", "category");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_importance_idx" ON "virtual_memories"("virtualUserId", "importance" DESC);

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_relevance_idx" ON "virtual_memories"("virtualUserId", "relevance" DESC);

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_isPinned_idx" ON "virtual_memories"("virtualUserId", "isPinned");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_consolidationStatus_idx" ON "virtual_memories"("virtualUserId", "consolidationStatus");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_createdAt_idx" ON "virtual_memories"("virtualUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_lastAccessedAt_idx" ON "virtual_memories"("virtualUserId", "lastAccessedAt");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_tags_idx" ON "virtual_memories"("virtualUserId", "tags");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_memoryType_importance_idx" ON "virtual_memories"("virtualUserId", "memoryType", "importance" DESC);

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_consolidationStatus_createdA_idx" ON "virtual_memories"("virtualUserId", "consolidationStatus", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_expiresAt_idx" ON "virtual_memories"("virtualUserId", "expiresAt");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_provider_idx" ON "virtual_memories"("virtualUserId", "provider");

-- CreateIndex
CREATE INDEX "virtual_memories_virtualUserId_sourceType_idx" ON "virtual_memories"("virtualUserId", "sourceType");

-- CreateIndex
CREATE INDEX "virtual_memories_captureSessionId_idx" ON "virtual_memories"("captureSessionId");

-- CreateIndex
CREATE INDEX "virtual_memories_contentHash_idx" ON "virtual_memories"("contentHash");

-- CreateIndex
CREATE INDEX "virtual_memories_embedding_idx" ON "virtual_memories"("embedding");

-- CreateIndex
CREATE INDEX "virtual_conversations_virtualUserId_idx" ON "virtual_conversations"("virtualUserId");

-- CreateIndex
CREATE INDEX "virtual_conversations_createdAt_idx" ON "virtual_conversations"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "virtual_conversations_virtualUserId_createdAt_idx" ON "virtual_conversations"("virtualUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "virtual_conversations_tags_idx" ON "virtual_conversations"("tags");

-- CreateIndex
CREATE INDEX "virtual_messages_conversationId_messageIndex_idx" ON "virtual_messages"("conversationId", "messageIndex");

-- CreateIndex
CREATE INDEX "virtual_messages_conversationId_createdAt_idx" ON "virtual_messages"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "virtual_messages_role_idx" ON "virtual_messages"("role");

-- CreateIndex
CREATE INDEX "virtual_acus_origin_idx" ON "virtual_acus"("origin");

-- CreateIndex
CREATE INDEX "virtual_acus_parentId_idx" ON "virtual_acus"("parentId");

-- CreateIndex
CREATE INDEX "virtual_acus_conversationId_idx" ON "virtual_acus"("conversationId");

-- CreateIndex
CREATE INDEX "virtual_acus_messageId_idx" ON "virtual_acus"("messageId");

-- CreateIndex
CREATE INDEX "virtual_acus_virtualUserId_idx" ON "virtual_acus"("virtualUserId");

-- CreateIndex
CREATE INDEX "virtual_acus_virtualUserId_createdAt_idx" ON "virtual_acus"("virtualUserId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "virtual_acus_type_idx" ON "virtual_acus"("type");

-- CreateIndex
CREATE INDEX "virtual_acus_category_idx" ON "virtual_acus"("category");

-- CreateIndex
CREATE INDEX "virtual_acus_qualityOverall_idx" ON "virtual_acus"("qualityOverall" DESC);

-- CreateIndex
CREATE INDEX "virtual_acus_rediscoveryScore_idx" ON "virtual_acus"("rediscoveryScore" DESC);

-- CreateIndex
CREATE INDEX "virtual_acus_createdAt_idx" ON "virtual_acus"("createdAt" DESC);

-- CreateIndex
CREATE INDEX "virtual_acus_sharingPolicy_idx" ON "virtual_acus"("sharingPolicy");

-- CreateIndex
CREATE INDEX "virtual_acus_tags_idx" ON "virtual_acus"("tags");

-- CreateIndex
CREATE INDEX "virtual_acus_contentHash_idx" ON "virtual_acus"("contentHash");

-- CreateIndex
CREATE INDEX "virtual_acus_embedding_idx" ON "virtual_acus"("embedding");

-- CreateIndex
CREATE INDEX "virtual_acu_links_sourceId_idx" ON "virtual_acu_links"("sourceId");

-- CreateIndex
CREATE INDEX "virtual_acu_links_targetId_idx" ON "virtual_acu_links"("targetId");

-- CreateIndex
CREATE INDEX "virtual_acu_links_relation_idx" ON "virtual_acu_links"("relation");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_acu_links_sourceId_targetId_relation_key" ON "virtual_acu_links"("sourceId", "targetId", "relation");

-- CreateIndex
CREATE INDEX "virtual_notebooks_virtualUserId_idx" ON "virtual_notebooks"("virtualUserId");

-- CreateIndex
CREATE INDEX "virtual_notebook_entries_notebookId_sortOrder_idx" ON "virtual_notebook_entries"("notebookId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_notebook_entries_notebookId_acuId_key" ON "virtual_notebook_entries"("notebookId", "acuId");

-- CreateIndex
CREATE INDEX "virtual_user_analytics_date_idx" ON "virtual_user_analytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_user_analytics_date_key" ON "virtual_user_analytics"("date");

-- CreateIndex
CREATE INDEX "virtual_user_audit_logs_virtualUserId_idx" ON "virtual_user_audit_logs"("virtualUserId");

-- CreateIndex
CREATE INDEX "virtual_user_audit_logs_action_idx" ON "virtual_user_audit_logs"("action");

-- CreateIndex
CREATE INDEX "virtual_user_audit_logs_createdAt_idx" ON "virtual_user_audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "tenants_slug_idx" ON "tenants"("slug");

-- CreateIndex
CREATE INDEX "corpus_documents_tenantId_category_idx" ON "corpus_documents"("tenantId", "category");

-- CreateIndex
CREATE INDEX "corpus_documents_tenantId_topicId_idx" ON "corpus_documents"("tenantId", "topicId");

-- CreateIndex
CREATE INDEX "corpus_documents_contentHash_idx" ON "corpus_documents"("contentHash");

-- CreateIndex
CREATE INDEX "corpus_document_versions_documentId_version_idx" ON "corpus_document_versions"("documentId", "version");

-- CreateIndex
CREATE INDEX "corpus_chunks_tenantId_topicSlug_idx" ON "corpus_chunks"("tenantId", "topicSlug");

-- CreateIndex
CREATE INDEX "corpus_chunks_tenantId_contentType_idx" ON "corpus_chunks"("tenantId", "contentType");

-- CreateIndex
CREATE INDEX "corpus_chunks_documentId_chunkIndex_idx" ON "corpus_chunks"("documentId", "chunkIndex");

-- CreateIndex
CREATE INDEX "corpus_chunks_tenantId_embedding_idx" ON "corpus_chunks"("tenantId", "embedding");

-- CreateIndex
CREATE INDEX "corpus_chunks_isActive_idx" ON "corpus_chunks"("isActive");

-- CreateIndex
CREATE INDEX "corpus_topics_tenantId_parentTopicId_idx" ON "corpus_topics"("tenantId", "parentTopicId");

-- CreateIndex
CREATE INDEX "corpus_topics_tenantId_embedding_idx" ON "corpus_topics"("tenantId", "embedding");

-- CreateIndex
CREATE UNIQUE INDEX "corpus_topics_tenantId_slug_key" ON "corpus_topics"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "corpus_faqs_tenantId_topicSlug_idx" ON "corpus_faqs"("tenantId", "topicSlug");

-- CreateIndex
CREATE INDEX "corpus_faqs_tenantId_questionEmbedding_idx" ON "corpus_faqs"("tenantId", "questionEmbedding");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_indices_conversationId_key" ON "conversation_indices"("conversationId");

-- CreateIndex
CREATE INDEX "conversation_indices_virtualUserId_startedAt_idx" ON "conversation_indices"("virtualUserId", "startedAt");

-- CreateIndex
CREATE INDEX "conversation_indices_virtualUserId_embedding_idx" ON "conversation_indices"("virtualUserId", "embedding");

-- CreateIndex
CREATE INDEX "conversation_indices_virtualUserId_topics_idx" ON "conversation_indices"("virtualUserId", "topics");

-- CreateIndex
CREATE INDEX "user_profile_snapshots_virtualUserId_idx" ON "user_profile_snapshots"("virtualUserId");

-- CreateIndex
CREATE UNIQUE INDEX "user_profile_snapshots_virtualUserId_version_key" ON "user_profile_snapshots"("virtualUserId", "version");

-- CreateIndex
CREATE INDEX "orchestration_logs_tenantId_createdAt_idx" ON "orchestration_logs"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "orchestration_logs_virtualUserId_idx" ON "orchestration_logs"("virtualUserId");

-- CreateIndex
CREATE INDEX "orchestration_logs_intent_idx" ON "orchestration_logs"("intent");

-- CreateIndex
CREATE INDEX "doc_corpus_category_idx" ON "doc_corpus"("category");

-- CreateIndex
CREATE INDEX "doc_corpus_createdAt_idx" ON "doc_corpus"("createdAt");

-- CreateIndex
CREATE INDEX "doc_chunks_corpusId_idx" ON "doc_chunks"("corpusId");

-- CreateIndex
CREATE INDEX "doc_chunks_embedding_idx" ON "doc_chunks"("embedding");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendering_cache" ADD CONSTRAINT "rendering_cache_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atomic_chat_units" ADD CONSTRAINT "atomic_chat_units_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atomic_chat_units" ADD CONSTRAINT "atomic_chat_units_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atomic_chat_units" ADD CONSTRAINT "atomic_chat_units_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "atomic_chat_units" ADD CONSTRAINT "atomic_chat_units_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "atomic_chat_units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acu_links" ADD CONSTRAINT "acu_links_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "atomic_chat_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "acu_links" ADD CONSTRAINT "acu_links_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "atomic_chat_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notebooks" ADD CONSTRAINT "notebooks_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notebook_entries" ADD CONSTRAINT "notebook_entries_acuId_fkey" FOREIGN KEY ("acuId") REFERENCES "atomic_chat_units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notebook_entries" ADD CONSTRAINT "notebook_entries_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "notebooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_cursors" ADD CONSTRAINT "sync_cursors_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_profiles" ADD CONSTRAINT "topic_profiles_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_conversations" ADD CONSTRAINT "topic_conversations_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topic_conversations" ADD CONSTRAINT "topic_conversations_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "topic_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "entity_profiles" ADD CONSTRAINT "entity_profiles_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_bundles" ADD CONSTRAINT "context_bundles_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_bundles" ADD CONSTRAINT "context_bundles_entityProfileId_fkey" FOREIGN KEY ("entityProfileId") REFERENCES "entity_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_bundles" ADD CONSTRAINT "context_bundles_personaId_fkey" FOREIGN KEY ("personaId") REFERENCES "ai_personas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_bundles" ADD CONSTRAINT "context_bundles_topicProfileId_fkey" FOREIGN KEY ("topicProfileId") REFERENCES "topic_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "context_bundles" ADD CONSTRAINT "context_bundles_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_compactions" ADD CONSTRAINT "conversation_compactions_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_presence" ADD CONSTRAINT "client_presence_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "custom_instructions" ADD CONSTRAINT "custom_instructions_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memories" ADD CONSTRAINT "memories_parentMemoryId_fkey" FOREIGN KEY ("parentMemoryId") REFERENCES "memories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_context_settings" ADD CONSTRAINT "user_context_settings_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sharing_policies" ADD CONSTRAINT "sharing_policies_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_stakeholders" ADD CONSTRAINT "content_stakeholders_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "sharing_policies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_stakeholders" ADD CONSTRAINT "content_stakeholders_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_access_grants" ADD CONSTRAINT "content_access_grants_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "sharing_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_access_logs" ADD CONSTRAINT "content_access_logs_policyId_fkey" FOREIGN KEY ("policyId") REFERENCES "sharing_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_access_logs" ADD CONSTRAINT "content_access_logs_contentRecordId_fkey" FOREIGN KEY ("contentRecordId") REFERENCES "content_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "share_links" ADD CONSTRAINT "share_links_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "sharing_intents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_records" ADD CONSTRAINT "content_records_intentId_fkey" FOREIGN KEY ("intentId") REFERENCES "sharing_intents"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_providers" ADD CONSTRAINT "content_providers_content_record_id_fkey" FOREIGN KEY ("content_record_id") REFERENCES "content_records"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "import_jobs" ADD CONSTRAINT "import_jobs_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imported_conversations" ADD CONSTRAINT "imported_conversations_importJobId_fkey" FOREIGN KEY ("importJobId") REFERENCES "import_jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "imported_conversations" ADD CONSTRAINT "imported_conversations_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_users" ADD CONSTRAINT "virtual_users_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_sessions" ADD CONSTRAINT "virtual_sessions_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_memories" ADD CONSTRAINT "virtual_memories_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_memories" ADD CONSTRAINT "virtual_memories_parentMemoryId_fkey" FOREIGN KEY ("parentMemoryId") REFERENCES "virtual_memories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_conversations" ADD CONSTRAINT "virtual_conversations_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_messages" ADD CONSTRAINT "virtual_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "virtual_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_acus" ADD CONSTRAINT "virtual_acus_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_acus" ADD CONSTRAINT "virtual_acus_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "virtual_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_acus" ADD CONSTRAINT "virtual_acus_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "virtual_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_acus" ADD CONSTRAINT "virtual_acus_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "virtual_acus"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_acu_links" ADD CONSTRAINT "virtual_acu_links_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "virtual_acus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_acu_links" ADD CONSTRAINT "virtual_acu_links_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "virtual_acus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_notebooks" ADD CONSTRAINT "virtual_notebooks_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_notebook_entries" ADD CONSTRAINT "virtual_notebook_entries_notebookId_fkey" FOREIGN KEY ("notebookId") REFERENCES "virtual_notebooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_notebook_entries" ADD CONSTRAINT "virtual_notebook_entries_acuId_fkey" FOREIGN KEY ("acuId") REFERENCES "virtual_acus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_documents" ADD CONSTRAINT "corpus_documents_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_documents" ADD CONSTRAINT "corpus_documents_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "corpus_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_document_versions" ADD CONSTRAINT "corpus_document_versions_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "corpus_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_chunks" ADD CONSTRAINT "corpus_chunks_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_chunks" ADD CONSTRAINT "corpus_chunks_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "corpus_documents"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_chunks" ADD CONSTRAINT "corpus_chunks_parentChunkId_fkey" FOREIGN KEY ("parentChunkId") REFERENCES "corpus_chunks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_topics" ADD CONSTRAINT "corpus_topics_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_topics" ADD CONSTRAINT "corpus_topics_parentTopicId_fkey" FOREIGN KEY ("parentTopicId") REFERENCES "corpus_topics"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_faqs" ADD CONSTRAINT "corpus_faqs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "corpus_faqs" ADD CONSTRAINT "corpus_faqs_sourceChunkId_fkey" FOREIGN KEY ("sourceChunkId") REFERENCES "corpus_chunks"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_indices" ADD CONSTRAINT "conversation_indices_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_profile_snapshots" ADD CONSTRAINT "user_profile_snapshots_virtualUserId_fkey" FOREIGN KEY ("virtualUserId") REFERENCES "virtual_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orchestration_logs" ADD CONSTRAINT "orchestration_logs_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "doc_chunks" ADD CONSTRAINT "doc_chunks_corpusId_fkey" FOREIGN KEY ("corpusId") REFERENCES "doc_corpus"("id") ON DELETE CASCADE ON UPDATE CASCADE;
