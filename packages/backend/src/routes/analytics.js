/**
 * Analytics Routes
 *
 * API endpoints for conversation analytics, user behavior tracking,
 * and performance monitoring.
 *
 * Endpoints:
 * - GET /analytics/conversations - Conversation metrics
 * - GET /analytics/users - User analytics
 * - GET /analytics/performance - Performance metrics
 * - GET /analytics/realtime - Real-time dashboard data
 */

import { Router } from 'express';
import { getPrismaClient } from '../lib/database.js';
import { logger } from '../lib/logger.js';

const router = Router();
const prisma = getPrismaClient();

/**
 * GET /analytics/conversations
 * Get conversation metrics and statistics
 */
router.get('/conversations', async (req, res) => {
  try {
    const { virtualUserId, startDate, endDate, limit = 100 } = req.query;

    const whereClause = {};
    if (virtualUserId) {
      whereClause.virtualUserId = virtualUserId;
    }
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt.gte = new Date(startDate);
      if (endDate) whereClause.createdAt.lte = new Date(endDate);
    }

    // Get conversation count
    const totalConversations = await prisma.virtualConversation.count({
      where: whereClause,
    });

    // Get message statistics
    const messageStats = await prisma.virtualMessage.groupBy({
      by: ['role'],
      _count: true,
      where: {
        conversation: whereClause,
      },
    });

    // Get average messages per conversation
    const avgStats = await prisma.virtualConversation.aggregate({
      where: whereClause,
      _avg: {
        messageCount: true,
        userMessageCount: true,
        aiMessageCount: true,
        totalTokens: true,
      },
      _sum: {
        messageCount: true,
        totalTokens: true,
      },
    });

    // Get recent conversations
    const recentConversations = await prisma.virtualConversation.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      select: {
        id: true,
        title: true,
        messageCount: true,
        createdAt: true,
        updatedAt: true,
        virtualUserId: true,
        provider: true,
        model: true,
      },
    });

    // Get conversations by provider
    const providerStats = await prisma.virtualConversation.groupBy({
      by: ['provider'],
      _count: true,
      where: whereClause,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalConversations,
          totalMessages: avgStats._sum.messageCount || 0,
          totalTokens: avgStats._sum.totalTokens || 0,
          avgMessagesPerConversation: avgStats._avg.messageCount || 0,
          avgUserMessagesPerConversation: avgStats._avg.userMessageCount || 0,
          avgAiMessagesPerConversation: avgStats._avg.aiMessageCount || 0,
          avgTokensPerConversation: avgStats._avg.totalTokens || 0,
        },
        byRole: messageStats.reduce((acc, stat) => {
          acc[stat.role] = stat._count;
          return acc;
        }, {}),
        byProvider: providerStats.reduce((acc, stat) => {
          acc[stat.provider] = stat._count;
          return acc;
        }, {}),
        recent: recentConversations,
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Conversation analytics failed');
    res.status(500).json({
      success: false,
      error: 'Conversation analytics failed',
      message: error.message,
    });
  }
});

/**
 * GET /analytics/users
 * Get user behavior analytics
 */
router.get('/users', async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    // Get total virtual users
    const totalUsers = await prisma.virtualUser.count();

    // Get active users (seen in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await prisma.virtualUser.count({
      where: { lastSeenAt: { gte: sevenDaysAgo } },
    });

    // Get users with conversations
    const usersWithConversations = await prisma.virtualUser.findMany({
      where: { conversationCount: { gt: 0 } },
      orderBy: { conversationCount: 'desc' },
      take: Number(limit),
      select: {
        id: true,
        displayName: true,
        fingerprint: true,
        conversationCount: true,
        memoryCount: true,
        firstSeenAt: true,
        lastSeenAt: true,
        consentGiven: true,
        currentAvatar: true,
      },
    });

    // Get user engagement stats
    const engagementStats = await prisma.virtualUser.aggregate({
      _avg: {
        conversationCount: true,
        memoryCount: true,
      },
      _sum: {
        conversationCount: true,
        memoryCount: true,
      },
    });

    // Get consent stats
    const consentStats = await prisma.virtualUser.groupBy({
      by: ['consentGiven'],
      _count: true,
    });

    // Get avatar distribution
    const avatarStats = await prisma.virtualUser.groupBy({
      by: ['currentAvatar'],
      _count: true,
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalUsers,
          activeUsers,
          activeUsersPercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0,
        },
        engagement: {
          avgConversationsPerUser: engagementStats._avg.conversationCount || 0,
          avgMemoriesPerUser: engagementStats._avg.memoryCount || 0,
          totalConversations: engagementStats._sum.conversationCount || 0,
          totalMemories: engagementStats._sum.memoryCount || 0,
        },
        consent: consentStats.reduce((acc, stat) => {
          acc[stat.consentGiven ? 'consented' : 'notConsented'] = stat._count;
          return acc;
        }, {}),
        avatarDistribution: avatarStats.reduce((acc, stat) => {
          acc[stat.currentAvatar] = stat._count;
          return acc;
        }, {}),
        topUsers: usersWithConversations,
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'User analytics failed');
    res.status(500).json({
      success: false,
      error: 'User analytics failed',
      message: error.message,
    });
  }
});

/**
 * GET /analytics/performance
 * Get performance metrics
 */
router.get('/performance', async (req, res) => {
  try {
    // Get recent message response times (from metadata)
    const recentMessages = await prisma.virtualMessage.findMany({
      where: { role: 'assistant' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: {
        metadata: true,
        createdAt: true,
        tokenCount: true,
      },
    });

    // Calculate average response time estimation
    const messagesWithTokens = recentMessages.filter((m) => m.metadata && typeof m.metadata === 'object' && 'tokens' in m.metadata);
    const avgTokens = messagesWithTokens.length > 0
      ? messagesWithTokens.reduce((sum, m) => (m.metadata.tokens || 0) + sum, 0) / messagesWithTokens.length
      : 0;

    // Get conversation response times
    const conversationsWithDuration = await prisma.virtualConversation.findMany({
      where: { metadata: { path: ['lastResponseTimeMs'], not: null } },
      orderBy: { updatedAt: 'desc' },
      take: 100,
      select: {
        metadata: true,
      },
    });

    const avgResponseTime = conversationsWithDuration.length > 0
      ? conversationsWithDuration.reduce((sum, c) => (c.metadata.lastResponseTimeMs || 0) + sum, 0) / conversationsWithDuration.length
      : 0;

    // Get database query performance (from recent slow queries logged in memory)
    // This is a placeholder - in production you'd query a metrics database
    const dbStats = {
      avgQueryTime: 'N/A (check logs)',
      slowQueriesCount: 0,
    };

    res.json({
      success: true,
      data: {
        responseMetrics: {
          avgTokensPerResponse: avgTokens.toFixed(2),
          avgResponseTimeMs: avgResponseTime.toFixed(2),
          totalResponsesAnalyzed: recentMessages.length,
        },
        databasePerformance: dbStats,
        contextEngine: {
          // These would come from context engine telemetry
          avgContextAssemblyTime: 'N/A',
          cacheHitRate: 'N/A',
        },
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Performance analytics failed');
    res.status(500).json({
      success: false,
      error: 'Performance analytics failed',
      message: error.message,
    });
  }
});

/**
 * GET /analytics/realtime
 * Get real-time dashboard data
 */
router.get('/realtime', async (req, res) => {
  try {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get conversations in last hour
    const conversationsLastHour = await prisma.virtualConversation.count({
      where: { createdAt: { gte: oneHourAgo } },
    });

    // Get conversations in last 24 hours
    const conversationsLastDay = await prisma.virtualConversation.count({
      where: { createdAt: { gte: oneDayAgo } },
    });

    // Get messages in last hour
    const messagesLastHour = await prisma.virtualMessage.count({
      where: { createdAt: { gte: oneHourAgo } },
    });

    // Get messages in last 24 hours
    const messagesLastDay = await prisma.virtualMessage.count({
      where: { createdAt: { gte: oneDayAgo } },
    });

    // Get active users in last hour
    const activeUsersLastHour = await prisma.virtualUser.count({
      where: { lastSeenAt: { gte: oneHourAgo } },
    });

    // Get active users in last 24 hours
    const activeUsersLastDay = await prisma.virtualUser.count({
      where: { lastSeenAt: { gte: oneDayAgo } },
    });

    // Get total counts
    const [totalUsers, totalConversations, totalMessages, totalMemories] = await Promise.all([
      prisma.virtualUser.count(),
      prisma.virtualConversation.count(),
      prisma.virtualMessage.count(),
      prisma.virtualMemory.count(),
    ]);

    // Get recent activity
    const recentConversations = await prisma.virtualConversation.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        messageCount: true,
        updatedAt: true,
        virtualUser: {
          select: { displayName: true },
        },
      },
    });

    res.json({
      success: true,
      data: {
        realtime: {
          conversationsLastHour,
          conversationsLastDay,
          messagesLastHour,
          messagesLastDay,
          activeUsersLastHour,
          activeUsersLastDay,
        },
        totals: {
          totalUsers,
          totalConversations,
          totalMessages,
          totalMemories,
        },
        recentActivity: recentConversations,
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Realtime analytics failed');
    res.status(500).json({
      success: false,
      error: 'Realtime analytics failed',
      message: error.message,
    });
  }
});

/**
 * GET /analytics/memory
 * Get memory extraction analytics
 */
router.get('/memory', async (req, res) => {
  try {
    const { virtualUserId, limit = 100 } = req.query;

    const whereClause = {};
    if (virtualUserId) {
      whereClause.virtualUserId = virtualUserId;
    }

    // Get memory count
    const totalMemories = await prisma.virtualMemory.count({
      where: whereClause,
    });

    // Get memories by type
    const memoriesByType = await prisma.virtualMemory.groupBy({
      by: ['memoryType'],
      _count: true,
      where: whereClause,
    });

    // Get memories by category
    const memoriesByCategory = await prisma.virtualMemory.groupBy({
      by: ['category'],
      _count: true,
      where: whereClause,
      orderBy: { _count: 'desc' },
      take: 20,
    });

    // Get average importance
    const avgImportance = await prisma.virtualMemory.aggregate({
      where: whereClause,
      _avg: { importance: true },
    });

    // Get recent memories
    const recentMemories = await prisma.virtualMemory.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: Number(limit),
      select: {
        id: true,
        content: true,
        summary: true,
        memoryType: true,
        category: true,
        importance: true,
        relevance: true,
        createdAt: true,
        virtualUserId: true,
      },
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalMemories,
          avgImportance: avgImportance._avg.importance || 0,
        },
        byType: memoriesByType.reduce((acc, stat) => {
          acc[stat.memoryType] = stat._count;
          return acc;
        }, {}),
        byCategory: memoriesByCategory.reduce((acc, stat) => {
          acc[stat.category] = stat._count;
          return acc;
        }, {}),
        recent: recentMemories,
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Memory analytics failed');
    res.status(500).json({
      success: false,
      error: 'Memory analytics failed',
      message: error.message,
    });
  }
});

export { router as analyticsRoutes };
