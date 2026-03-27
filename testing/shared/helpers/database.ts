/**
 * Database Test Helpers
 * 
 * Utilities for database operations in tests
 */

import { PrismaClient } from '@prisma/client';

let testPrisma: PrismaClient | null = null;

/**
 * Create test Prisma client
 */
export async function createTestPrisma(): Promise<PrismaClient> {
  if (testPrisma) {
    return testPrisma;
  }

  const testDbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;

  if (!testDbUrl) {
    throw new Error(
      'TEST_DATABASE_URL or DATABASE_URL environment variable is required for testing'
    );
  }

  testPrisma = new PrismaClient({
    datasourceUrl: testDbUrl,
    log: process.env.NODE_ENV === 'test' ? [] : ['query', 'error', 'warn'],
  });

  await testPrisma.$connect();
  return testPrisma;
}

/**
 * Get test Prisma client (must be initialized first)
 */
export function getTestPrisma(): PrismaClient {
  if (!testPrisma) {
    throw new Error(
      'Test Prisma client not initialized. Call createTestPrisma() first.'
    );
  }
  return testPrisma;
}

/**
 * Close test Prisma connection
 */
export async function closeTestPrisma(): Promise<void> {
  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }
}

/**
 * Clean up test data for a user
 */
export async function cleanupTestData(userId: string): Promise<void> {
  const prisma = getTestPrisma();

  try {
    await prisma.$transaction([
      // Delete ACUs
      prisma.atomicChatUnit.deleteMany({
        where: { authorDid: userId },
      }),

      // Delete memories
      prisma.memory.deleteMany({
        where: { userId },
      }),

      // Delete conversations
      prisma.conversation.deleteMany({
        where: { ownerId: userId },
      }),

      // Delete context recipes
      prisma.contextRecipe.deleteMany({
        where: { userId },
      }),

      // Delete API keys
      prisma.apiKey.deleteMany({
        where: { userId },
      }),

      // Delete devices
      prisma.device.deleteMany({
        where: { userId },
      }),

      // Delete sessions
      prisma.session.deleteMany({
        where: { userId },
      }),

      // Delete sync operations
      prisma.syncOperation.deleteMany({
        where: { authorDid: userId },
      }),

      // Finally delete user
      prisma.user.delete({
        where: { id: userId },
      }),
    ]);
  } catch (error) {
    console.error('Cleanup failed:', error);
    throw error;
  }
}

/**
 * Clean up entire test database (use with caution)
 */
export async function cleanupEntireDatabase(): Promise<void> {
  const prisma = getTestPrisma();

  const tables = [
    'atomicChatUnit',
    'memory',
    'conversation',
    'contextRecipe',
    'apiKey',
    'device',
    'session',
    'syncOperation',
    'user',
  ];

  for (const table of tables) {
    try {
      await (prisma as any)[table].deleteMany({});
    } catch (error) {
      console.warn(`Failed to clean table ${table}:`, error);
    }
  }
}

/**
 * Seed test user
 */
export async function createTestUser(overrides: any = {}): Promise<string> {
  const prisma = getTestPrisma();

  const userData = {
    did: `did:key:test_${Date.now()}`,
    handle: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    name: 'Test User',
    ...overrides,
  };

  const user = await prisma.user.create({
    data: userData,
  });

  return user.id;
}

/**
 * Seed test conversation
 */
export async function createTestConversation(
  userId: string,
  overrides: any = {}
): Promise<string> {
  const prisma = getTestPrisma();

  const conversation = await prisma.conversation.create({
    data: {
      ownerId: userId,
      title: `Test Conversation ${Date.now()}`,
      sourceUrl: 'https://example.com',
      status: 'ACTIVE',
      ...overrides,
    },
  });

  return conversation.id;
}

/**
 * Seed test memories
 */
export async function seedMemories(
  userId: string,
  memories: Array<{ content: string; category: string; memoryType?: string }>
): Promise<void> {
  const prisma = getTestPrisma();

  await prisma.memory.createMany({
    data: memories.map((m) => ({
      userId,
      content: m.content,
      category: m.category,
      memoryType: m.memoryType || 'SEMANTIC',
      importance: 0.5,
    })),
  });
}

/**
 * Seed test ACUs
 */
export async function seedACUs(
  userId: string,
  conversationId: string,
  acus: Array<{ content: string; type?: string; category?: string }>
): Promise<void> {
  const prisma = getTestPrisma();

  await prisma.atomicChatUnit.createMany({
    data: acus.map((acu) => ({
      authorDid: userId,
      conversationId,
      content: acu.content,
      type: acu.type || 'message',
      category: acu.category || 'general',
      state: 'ACTIVE',
    })),
  });
}

/**
 * Create test context recipe
 */
export async function createTestRecipe(
  userId: string | null,
  overrides: any = {}
): Promise<any> {
  const prisma = getTestPrisma();

  const recipe = await prisma.contextRecipe.create({
    data: {
      name: `Test Recipe ${Date.now()}`,
      userId,
      description: 'Test recipe for testing',
      layerWeights: {},
      excludedLayers: [],
      isDefault: false,
      ...overrides,
    },
  });

  return recipe;
}

/**
 * Get count of records by table
 */
export async function getRecordCounts(): Promise<Record<string, number>> {
  const prisma = getTestPrisma();

  const tables = [
    'user',
    'conversation',
    'memory',
    'atomicChatUnit',
    'contextRecipe',
  ];

  const counts: Record<string, number> = {};

  for (const table of tables) {
    try {
      counts[table] = await (prisma as any)[table].count();
    } catch (error) {
      counts[table] = 0;
    }
  }

  return counts;
}

/**
 * Print database state
 */
export async function printDatabaseState(): Promise<void> {
  const counts = await getRecordCounts();

  console.log('\n📊 Database State:');
  console.log('─'.repeat(40));
  for (const [table, count] of Object.entries(counts)) {
    console.log(`  ${table.padEnd(20)} ${count.toString().padStart(5)} records`);
  }
  console.log('─'.repeat(40));
}

/**
 * Transaction helper for tests
 */
export async function withTransaction<T>(
  fn: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = getTestPrisma();

  return prisma.$transaction(async (tx) => {
    return fn(tx);
  });
}

/**
 * Disable foreign key checks (for cleanup)
 */
export async function disableForeignKeyChecks(): Promise<void> {
  const prisma = getTestPrisma();
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 0;');
}

/**
 * Enable foreign key checks
 */
export async function enableForeignKeyChecks(): Promise<void> {
  const prisma = getTestPrisma();
  await prisma.$executeRawUnsafe('SET FOREIGN_KEY_CHECKS = 1;');
}
