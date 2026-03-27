/**
 * Test Data Factories
 * 
 * Generate realistic test data for VIVIM testing
 */

import { faker } from '@faker-js/faker';

/**
 * User factory
 */
export function createUser(overrides: Partial<any> = {}) {
  return {
    did: `did:key:${faker.string.uuid()}`,
    handle: faker.internet.userName().toLowerCase(),
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    bio: faker.lorem.sentence(),
    avatarUrl: faker.image.avatar(),
    ...overrides,
  };
}

/**
 * Memory factory
 */
export function createMemory(overrides: Partial<any> = {}) {
  const categories = ['skills', 'preferences', 'employment', 'education', 'relationships', 'health', 'goals'];
  const memoryTypes = ['SEMANTIC', 'EPISODIC', 'PROCEDURAL'];

  return {
    content: faker.lorem.sentence(),
    category: faker.helpers.arrayElement(categories),
    memoryType: faker.helpers.arrayElement(memoryTypes),
    importance: faker.number.float({ min: 0.1, max: 1, fractionDigits: 2 }),
    isVerified: faker.datatype.boolean({ probability: 0.3 }),
    ...overrides,
  };
}

/**
 * Conversation factory
 */
export function createConversation(overrides: Partial<any> = {}) {
  const statuses = ['ACTIVE', 'ARCHIVED', 'COMPLETED'];
  const sources = ['web', 'mobile', 'api', 'import'];

  return {
    title: faker.lorem.sentence(3),
    sourceUrl: faker.internet.url(),
    status: faker.helpers.arrayElement(statuses),
    source: faker.helpers.arrayElement(sources),
    isArchived: faker.datatype.boolean({ probability: 0.2 }),
    ...overrides,
  };
}

/**
 * ACU (Atomic Chat Unit) factory
 */
export function createACU(overrides: Partial<any> = {}) {
  const types = ['message', 'memory_reference', 'context_reference', 'system'];
  const categories = ['general', 'question', 'answer', 'feedback', 'instruction'];
  const states = ['ACTIVE', 'ARCHIVED', 'DELETED'];

  return {
    content: faker.lorem.paragraph(),
    type: faker.helpers.arrayElement(types),
    category: faker.helpers.arrayElement(categories),
    state: faker.helpers.arrayElement(states),
    metadata: {},
    ...overrides,
  };
}

/**
 * Context Recipe factory
 */
export function createContextRecipe(overrides: Partial<any> = {}) {
  const layerWeights = {
    L0_identity: faker.number.float({ min: 0.5, max: 2 }),
    L1_user_profile: faker.number.float({ min: 0.5, max: 1.5 }),
    L2_topic: faker.number.float({ min: 0.5, max: 1.5 }),
    L3_entity_profiles: faker.number.float({ min: 0.3, max: 1 }),
    L4_conversation_history: faker.number.float({ min: 0.5, max: 2 }),
    L5_memories: faker.number.float({ min: 0.5, max: 1.5 }),
    L6_knowledge: faker.number.float({ min: 0.3, max: 1 }),
    L7_social: faker.number.float({ min: 0.1, max: 0.5 }),
  };

  return {
    name: faker.lorem.words(3) + ' Recipe',
    description: faker.lorem.paragraph(),
    layerWeights,
    excludedLayers: [],
    customBudget: faker.helpers.arrayElement([4000, 8000, 12000, 16000]),
    isDefault: faker.datatype.boolean({ probability: 0.1 }),
    isSystem: faker.datatype.boolean({ probability: 0.05 }),
    ...overrides,
  };
}

/**
 * Topic factory
 */
export function createTopic(overrides: Partial<any> = {}) {
  const topics = [
    'typescript', 'javascript', 'programming', 'web-development',
    'artificial-intelligence', 'machine-learning', 'database',
    'api-design', 'cloud-computing', 'devops'
  ];

  return {
    slug: faker.helpers.arrayElement(topics),
    label: faker.lorem.words(2),
    confidence: faker.number.float({ min: 0.5, max: 1 }),
    ...overrides,
  };
}

/**
 * Entity factory
 */
export function createEntity(overrides: Partial<any> = {}) {
  const types = ['person', 'organization', 'location', 'product', 'concept'];

  return {
    name: faker.person.fullName(),
    type: faker.helpers.arrayElement(types),
    description: faker.lorem.sentence(),
    confidence: faker.number.float({ min: 0.6, max: 1 }),
    ...overrides,
  };
}

/**
 * Sync Operation factory
 */
export function createSyncOperation(overrides: Partial<any> = {}) {
  const operations = ['INSERT', 'UPDATE', 'DELETE'];
  const entityTypes = ['conversation', 'memory', 'acu', 'user'];

  return {
    entityType: faker.helpers.arrayElement(entityTypes),
    entityId: faker.string.uuid(),
    operation: faker.helpers.arrayElement(operations),
    payload: {},
    hlcTimestamp: `${Date.now()}:${faker.string.numeric(5)}:${faker.string.alphanumeric(8)}`,
    isProcessed: faker.datatype.boolean({ probability: 0.8 }),
    ...overrides,
  };
}

/**
 * API Key factory
 */
export function createApiKey(overrides: Partial<any> = {}) {
  return {
    name: faker.lorem.words(2) + ' API Key',
    key: `sk_${faker.string.alphanumeric(32)}`,
    permissions: ['read', 'write'],
    expiresAt: faker.date.future(),
    isActive: true,
    ...overrides,
  };
}

/**
 * Device factory
 */
export function createDevice(overrides: Partial<any> = {}) {
  const types = ['desktop', 'mobile', 'tablet', 'api'];
  const osList = ['windows', 'macos', 'linux', 'ios', 'android'];

  return {
    name: `${faker.helpers.arrayElement(types)}-${faker.string.alphanumeric(4)}`,
    type: faker.helpers.arrayElement(types),
    os: faker.helpers.arrayElement(osList),
    fingerprint: faker.string.alphanumeric(64),
    lastActiveAt: faker.date.recent(),
    ...overrides,
  };
}

/**
 * Session factory
 */
export function createSession(overrides: Partial<any> = {}) {
  return {
    token: `sess_${faker.string.alphanumeric(32)}`,
    expiresAt: faker.date.future({ days: 7 }),
    ipAddress: faker.internet.ipv4(),
    userAgent: faker.internet.userAgent(),
    ...overrides,
  };
}

/**
 * Generate multiple items
 */
export function generateMany<T>(
  factory: (overrides?: Partial<T>) => T,
  count: number,
  baseOverrides?: Partial<T>
): T[] {
  return Array.from({ length: count }, () => factory(baseOverrides));
}

/**
 * Generate unique email
 */
export function uniqueEmail(): string {
  return `test_${Date.now()}_${faker.string.alphanumeric(6)}@example.com`;
}

/**
 * Generate unique handle
 */
export function uniqueHandle(): string {
  return `user_${Date.now()}_${faker.string.alphanumeric(6)}`;
}

/**
 * Generate unique DID
 */
export function uniqueDID(): string {
  return `did:key:${faker.string.uuid()}`;
}
