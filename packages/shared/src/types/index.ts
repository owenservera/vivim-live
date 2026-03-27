/**
 * Shared types for VIVIM - used across frontend and backend
 */

// ============================================================================
// CORE ENTITIES
// ============================================================================

export interface User {
  id: string
  did: string
  handle?: string
  displayName?: string
  email?: string
  emailVerified?: boolean
  phoneNumber?: string
  phoneVerified?: boolean
  avatarUrl?: string
  verificationLevel?: number
  verificationBadges?: any[]
  trustScore?: number
  publicKey?: string
  keyType?: string
  status?: AccountStatus
  mfaEnabled?: boolean
  pdsUrl?: string
  createdAt?: Date
  updatedAt?: Date
  lastSeenAt?: Date
  settings?: Record<string, any>
  privacyPreferences?: Record<string, any>
}

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'DELETING' | 'DELETED'

export interface Memory {
  id: string
  userId: string
  content: string
  summary?: string
  memoryType: MemoryType
  importance: number
  tags: string[]
  embedding?: number[]
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export type MemoryType = 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL' | 'FACTUAL'

export interface Conversation {
  id: string
  provider: string
  sourceUrl: string
  title: string
  model?: string
  state?: string
  visibility?: string
  createdAt: Date
  updatedAt: Date
  capturedAt: Date
  messageCount: number
  userMessageCount: number
  aiMessageCount: number
  totalWords: number
  totalCharacters: number
  totalTokens?: number
  metadata?: Record<string, any>
  tags: string[]
  ownerId?: string
  messages?: Message[]
}

export interface Message {
  id: string
  conversationId: string
  role: MessageRole
  author?: string
  parts: any[]
  contentHash?: string
  messageIndex: number
  status?: string
  finishReason?: string
  tokenCount?: number
  metadata?: Record<string, any>
  createdAt: Date
}

export type MessageRole = 'user' | 'assistant' | 'system'

// ============================================================================
// CAPTURE
// ============================================================================

export interface CaptureInput {
  url: string
  provider?: string
  metadata?: Record<string, any>
}

export interface CaptureResult {
  status: 'success' | 'failed' | 'partial'
  data?: {
    conversation: Conversation
    messages: Message[]
  }
  error?: {
    code: string
    message: string
    stack?: string
  }
  attempt?: CaptureAttempt
}

export interface CaptureAttempt {
  id: string
  sourceUrl: string
  provider?: string
  status: string
  errorCode?: string
  errorMessage?: string
  errorStack?: string
  startedAt: Date
  completedAt?: Date
  duration?: number
  conversationId?: string
  retryCount?: number
  createdAt: Date
}

// ============================================================================
// CONTEXT ENGINE
// ============================================================================

export interface ContextBundle {
  id: string
  name: string
  description?: string
  userId: string
  conversationId?: string
  acuIds: string[]
  contextType: ContextType
  priority: number
  expiresAt?: Date
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export type ContextType = 'STATIC' | 'DYNAMIC' | 'HYBRID'

export interface ContextRecipe {
  id: string
  name: string
  description?: string
  userId: string
  rules: ContextRule[]
  triggers: ContextTrigger[]
  isActive: boolean
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface ContextRule {
  id: string
  type: ContextRuleType
  condition: Record<string, any>
  action: ContextAction
  priority: number
}

export type ContextRuleType = 'FILTER' | 'TRANSFORM' | 'ENRICH' | 'RANK'

export interface ContextAction {
  type: string
  config: Record<string, any>
}

export interface ContextTrigger {
  type: 'MANUAL' | 'AUTOMATIC' | 'SCHEDULED'
  config?: Record<string, any>
}

// ============================================================================
// SOCIAL
// ============================================================================

export interface Friend {
  id: string
  requesterId: string
  addresseeId: string
  status: FriendStatus
  message?: string
  requestedAt: Date
  respondedAt?: Date
  metadata?: Record<string, any>
}

export type FriendStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'BLOCKED' | 'CANCELLED'

export interface Follow {
  id: string
  followerId: string
  followingId: string
  status: FollowStatus
  notifyOnPost: boolean
  showInFeed: boolean
  createdAt: Date
  metadata?: Record<string, any>
}

export type FollowStatus = 'PENDING' | 'ACTIVE' | 'BLOCKED'

export interface Circle {
  id: string
  ownerId: string
  name: string
  description?: string
  isPublic: boolean
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
  members?: CircleMember[]
}

export interface CircleMember {
  id: string
  circleId: string
  userId: string
  role: string
  canInvite: boolean
  canShare: boolean
  joinedAt: Date
}

export interface Group {
  id: string
  ownerId: string
  name: string
  description?: string
  avatarUrl?: string
  type: GroupType
  visibility: GroupVisibility
  allowMemberInvite: boolean
  allowMemberPost: boolean
  maxMembers?: number
  createdAt: Date
  updatedAt: Date
}

export type GroupType = 'GENERAL' | 'STUDY' | 'PROJECT' | 'COMMUNITY'
export type GroupVisibility = 'PUBLIC' | 'APPROVAL' | 'PRIVATE'

// ============================================================================
// SYNC
// ============================================================================

export interface SyncCursor {
  id: string
  userId: string
  deviceDid: string
  tableName: string
  lastSyncId?: string
  lastSyncAt: Date
  vectorClock: Record<string, any>
}

export interface SyncOperation {
  id: string
  authorDid: string
  deviceDid: string
  tableName: string
  recordId: string
  entityType?: string
  entityId?: string
  operation: SyncOperationType
  payload: Record<string, any>
  hlcTimestamp: string
  vectorClock: Record<string, any>
  isProcessed: boolean
  createdAt: Date
  appliedAt?: Date
}

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'DELETE'

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: ApiError
  meta?: Record<string, any>
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, any>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// ============================================================================
// AUTH
// ============================================================================

export interface AuthSession {
  userId: string
  userDid: string
  email?: string
  displayName?: string
  avatarUrl?: string
  expiresAt: Date
  token: string
}

export interface AuthConfig {
  supabaseUrl?: string
  supabaseAnonKey?: string
  backendUrl: string
}

export interface DIDAuthResult {
  success: boolean
  user?: User
  session?: AuthSession
  error?: string
}
