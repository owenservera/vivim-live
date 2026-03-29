export interface FingerprintResult {
  hash: string;
  confidence: number;
  components: string[];
}

export interface FingerprintSignals {
  browser?: string;
  os?: string;
  device?: string;
  screen?: string;
  timezone?: string;
  language?: string;
  [key: string]: string | undefined;
}

export interface IdentificationConfidence {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  score: number;
  factors: string[];
}

export interface IDeviceFingerprintingService {
  generateFingerprint(signals: FingerprintSignals): Promise<FingerprintResult>;
  calculateIdentificationConfidence(options: {
    fingerprintSimilarity: number;
    cookieMatch: boolean;
    ipMatch: boolean;
    userAgentMatch: boolean;
  }): IdentificationConfidence;
  compareFingerprints(fp1: FingerprintResult, fp2: FingerprintResult): {
    similarity: number;
    matchingComponents: string[];
    differentComponents: string[];
  };
}

export interface VirtualUserProfile {
  id: string;
  displayName: string | null;
  topicInterests: string[];
  entityProfiles: unknown[];
  conversationCount: number;
  memoryCount: number;
  firstSeenAt: Date;
  lastSeenAt: Date;
  consentGiven: boolean;
  dataRetentionPolicy: string;
}

export interface IdentifyVirtualUserRequest {
  fingerprint: string;
  signals: FingerprintSignals;
  ipAddress?: string;
  userAgent?: string;
  existingSessionToken?: string;
}

export interface IdentifyVirtualUserResponse {
  virtualUserId: string;
  sessionToken: string;
  identification: IdentificationConfidence;
  profile: VirtualUserProfile;
  consentRequired: boolean;
  isNewUser: boolean;
}

export interface MergeVirtualUsersOptions {
  sourceVirtualUserId: string;
  targetVirtualUserId: string;
  reason: 'confidence_match' | 'manual' | 'duplicate_detection';
  sessionToken: string;
}

export interface IVirtualUserManagerService {
  identifyOrCreateVirtualUser(request: IdentifyVirtualUserRequest): Promise<IdentifyVirtualUserResponse>;
  getVirtualUserById(id: string): Promise<unknown | null>;
  getVirtualUserProfile(virtualUserId: string): Promise<VirtualUserProfile | null>;
  updateConsent(virtualUserId: string, consentGiven: boolean, dataRetentionPolicy: string): Promise<void>;
  mergeVirtualUsers(options: MergeVirtualUsersOptions): Promise<{ success: boolean; targetVirtualUserId: string }>;
  rotateSession(sessionToken: string): Promise<unknown | null>;
  invalidateSession(sessionToken: string): Promise<void>;
  invalidateAllSessions(virtualUserId: string): Promise<void>;
  cleanupExpiredSessions(): Promise<number>;
}

export interface ISessionService {
  createSession(userId: string, options?: {
    ipAddress?: string;
    userAgent?: string;
    fingerprint?: string;
  }): Promise<unknown>;
  validateSession(token: string): Promise<unknown | null>;
  invalidateSession(token: string): Promise<void>;
  rotateSession(token: string): Promise<unknown | null>;
  getSessionByToken(token: string): Promise<unknown | null>;
}

export interface MemoryQueryOptions {
  limit?: number;
  offset?: number;
  category?: string;
  memoryType?: string;
  importance?: { gte?: number; lte?: number };
  orderBy?: 'createdAt' | 'importance' | 'relevance';
  orderDirection?: 'asc' | 'desc';
}

export interface IVirtualMemoryService {
  getMemories(virtualUserId: string, options?: MemoryQueryOptions): Promise<unknown[]>;
  createMemory(virtualUserId: string, data: unknown): Promise<unknown>;
  updateMemory(id: string, data: unknown): Promise<unknown>;
  deleteMemory(id: string): Promise<void>;
  searchMemories(virtualUserId: string, query: string, options?: MemoryQueryOptions): Promise<unknown[]>;
}

export interface IConversationService {
  getConversations(virtualUserId: string, options?: {
    limit?: number;
    offset?: number;
    state?: string;
  }): Promise<unknown[]>;
  getConversation(id: string): Promise<unknown | null>;
  createConversation(virtualUserId: string, data: unknown): Promise<unknown>;
  updateConversation(id: string, data: unknown): Promise<unknown>;
  deleteConversation(id: string): Promise<void>;
}

export interface IMemoryExtractionService {
  extractMemories(conversationId: string, options?: unknown): Promise<unknown[]>;
  consolidateMemories(virtualUserId: string): Promise<number>;
  cleanupOldMemories(virtualUserId: string, beforeDate: Date): Promise<number>;
}

export interface IContextService {
  buildContext(virtualUserId: string, conversationId: string): Promise<unknown>;
  assembleContext(request: unknown): Promise<unknown>;
  getContextBudget(virtualUserId: string): Promise<unknown>;
  updateContextSettings(virtualUserId: string, settings: unknown): Promise<unknown>;
}

export interface IEncryptionService {
  encrypt(data: string): string;
  decrypt(data: string): string;
}

export interface ILoggerService {
  info(message: string, context?: unknown): void;
  warn(message: string, context?: unknown): void;
  error(message: string, context?: unknown): void;
  debug(message: string, context?: unknown): void;
}
