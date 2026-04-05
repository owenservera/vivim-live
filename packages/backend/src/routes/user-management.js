/**
 * User Management Routes
 *
 * API endpoints for virtual user lifecycle management:
 * - GET /users/:id - User profile retrieval
 * - PUT /users/:id - Profile updates
 * - DELETE /users/:id - User deletion (GDPR)
 * - GET /users/:id/sessions - Session management
 * - POST /users/:id/export - Data export
 */

import { Router } from 'express';
import { getPrismaClient } from '../lib/database.js';
import { logger } from '../lib/logger.js';
import * as crypto from 'crypto';

const router = Router();
const prisma = getPrismaClient();

/**
 * GET /users/:id - Get user profile
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.virtualUser.findUnique({
      where: { id },
      include: {
        sessions: {
          where: { isActive: true },
          orderBy: { lastActivityAt: 'desc' },
          take: 5,
        },
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            title: true,
            messageCount: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        memories: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: {
            id: true,
            summary: true,
            category: true,
            importance: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        profile: {
          id: user.id,
          displayName: user.displayName,
          fingerprint: user.fingerprint,
          confidenceScore: user.confidenceScore,
          conversationCount: user.conversationCount,
          memoryCount: user.memoryCount,
          firstSeenAt: user.firstSeenAt,
          lastSeenAt: user.lastSeenAt,
          consentGiven: user.consentGiven,
          consentTimestamp: user.consentTimestamp,
          dataRetentionPolicy: user.dataRetentionPolicy,
          currentAvatar: user.currentAvatar,
          topicInterests: user.topicInterests,
        },
        activeSessions: user.sessions,
        recentConversations: user.conversations,
        recentMemories: user.memories,
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'User profile fetch failed');
    res.status(500).json({
      error: 'User profile fetch failed',
      message: error.message,
    });
  }
});

/**
 * PUT /users/:id - Update user profile
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      displayName,
      topicInterests,
      dataRetentionPolicy,
      consentGiven,
      metadata,
    } = req.body;

    const user = await prisma.virtualUser.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (topicInterests !== undefined) updateData.topicInterests = topicInterests;
    if (dataRetentionPolicy !== undefined) updateData.dataRetentionPolicy = dataRetentionPolicy;
    if (consentGiven !== undefined) {
      updateData.consentGiven = consentGiven;
      if (consentGiven) {
        updateData.consentTimestamp = new Date();
      }
    }
    if (metadata !== undefined) updateData.metadata = metadata;

    const updatedUser = await prisma.virtualUser.update({
      where: { id },
      data: updateData,
    });

    logger.info({ userId: id, updates: Object.keys(updateData) }, 'User profile updated');

    res.json({
      success: true,
      data: {
        id: updatedUser.id,
        displayName: updatedUser.displayName,
        consentGiven: updatedUser.consentGiven,
        dataRetentionPolicy: updatedUser.dataRetentionPolicy,
        updatedAt: updatedUser.lastSeenAt,
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'User profile update failed');
    res.status(500).json({
      error: 'User profile update failed',
      message: error.message,
    });
  }
});

/**
 * DELETE /users/:id - Delete user (GDPR compliance)
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { hardDelete = false } = req.query;

    const user = await prisma.virtualUser.findUnique({
      where: { id },
      include: {
        conversations: true,
        memories: true,
        sessions: true,
        acus: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (hardDelete === 'true') {
      // Hard delete - remove all data
      await prisma.virtualUser.delete({ where: { id } });
      logger.warn({ userId: id, hardDelete: true }, 'User hard deleted');
    } else {
      // Soft delete - anonymize and mark as deleted
      const anonymizedData = {
        displayName: 'Deleted User',
        fingerprint: `deleted_${crypto.randomUUID()}`,
        fingerprintSignals: {},
        ipHistory: [],
        userAgentHistory: [],
        deviceCharacteristics: {},
        topicInterests: [],
        entityProfiles: [],
        consentGiven: false,
        consentTimestamp: null,
        dataRetentionPolicy: 'deleted',
        anonymizedAt: new Date(),
        deletedAt: new Date(),
        metadata: { ...user.metadata, deletedReason: 'user_request' },
      };

      await prisma.virtualUser.update({
        where: { id },
        data: anonymizedData,
      });

      // Delete associated sessions
      await prisma.virtualSession.deleteMany({
        where: { virtualUserId: id },
      });

      logger.warn({ userId: id, hardDelete: false }, 'User soft deleted and anonymized');
    }

    res.json({
      success: true,
      data: {
        deleted: true,
        hardDelete: hardDelete === 'true',
        deletedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'User deletion failed');
    res.status(500).json({
      error: 'User deletion failed',
      message: error.message,
    });
  }
});

/**
 * GET /users/:id/sessions - Get user sessions
 */
router.get('/:id/sessions', async (req, res) => {
  try {
    const { id } = req.params;
    const { activeOnly = 'true', limit = 50 } = req.query;

    const user = await prisma.virtualUser.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const whereClause = { virtualUserId: id };
    if (activeOnly === 'true') {
      whereClause.isActive = true;
      whereClause.expiresAt = { gt: new Date() };
    }

    const sessions = await prisma.virtualSession.findMany({
      where: whereClause,
      orderBy: { lastActivityAt: 'desc' },
      take: Number(limit),
      select: {
        id: true,
        sessionToken: true,
        fingerprint: true,
        ipAddress: true,
        userAgent: true,
        timezone: true,
        language: true,
        isActive: true,
        createdAt: true,
        expiresAt: true,
        lastActivityAt: true,
        metadata: true,
      },
    });

    res.json({
      success: true,
      data: {
        sessions,
        total: sessions.length,
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Session fetch failed');
    res.status(500).json({
      error: 'Session fetch failed',
      message: error.message,
    });
  }
});

/**
 * DELETE /users/:id/sessions/:sessionId - Revoke a session
 */
router.delete('/:id/sessions/:sessionId', async (req, res) => {
  try {
    const { id, sessionId } = req.params;

    const session = await prisma.virtualSession.findFirst({
      where: { id: sessionId, virtualUserId: id },
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    await prisma.virtualSession.update({
      where: { id: sessionId },
      data: { isActive: false },
    });

    logger.info({ sessionId, userId: id }, 'Session revoked');

    res.json({
      success: true,
      data: { revoked: true, sessionId },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Session revocation failed');
    res.status(500).json({
      error: 'Session revocation failed',
      message: error.message,
    });
  }
});

/**
 * POST /users/:id/export - Export user data (GDPR compliance)
 */
router.post('/:id/export', async (req, res) => {
  try {
    const { id } = req.params;
    const { format = 'json' } = req.body;

    const user = await prisma.virtualUser.findUnique({
      where: { id },
      include: {
        conversations: {
          include: {
            messages: {
              orderBy: { messageIndex: 'asc' },
            },
          },
        },
        memories: {
          orderBy: { createdAt: 'desc' },
        },
        acus: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Compile export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      formatVersion: '1.0',
      user: {
        id: user.id,
        displayName: user.displayName,
        fingerprint: user.fingerprint,
        firstSeenAt: user.firstSeenAt,
        lastSeenAt: user.lastSeenAt,
        consentGiven: user.consentGiven,
        dataRetentionPolicy: user.dataRetentionPolicy,
      },
      statistics: {
        totalConversations: user.conversations.length,
        totalMemories: user.memories.length,
        totalAcus: user.acus.length,
        totalSessions: user.sessions.length,
      },
      conversations: user.conversations.map((c) => ({
        id: c.id,
        title: c.title,
        provider: c.provider,
        model: c.model,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
        messageCount: c.messageCount,
        messages: c.messages.map((m) => ({
          role: m.role,
          content: m.content,
          messageIndex: m.messageIndex,
          createdAt: m.createdAt,
        })),
      })),
      memories: user.memories.map((m) => ({
        id: m.id,
        content: m.content,
        summary: m.summary,
        category: m.category,
        memoryType: m.memoryType,
        importance: m.importance,
        relevance: m.relevance,
        createdAt: m.createdAt,
      })),
      acus: user.acus.map((a) => ({
        id: a.id,
        content: a.content,
        type: a.type,
        category: a.category,
        createdAt: a.createdAt,
      })),
      sessions: user.sessions.map((s) => ({
        id: s.id,
        createdAt: s.createdAt,
        expiresAt: s.expiresAt,
        lastActivityAt: s.lastActivityAt,
        isActive: s.isActive,
      })),
    };

    logger.info({ userId: id, format }, 'User data exported');

    res.json({
      success: true,
      data: exportData,
    });
  } catch (error) {
    logger.error({ error: error.message }, 'User data export failed');
    res.status(500).json({
      error: 'User data export failed',
      message: error.message,
    });
  }
});

/**
 * GET /users/:id/conversations - Get user conversations with pagination
 */
router.get('/:id/conversations', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20, offset = 0, orderBy = 'updatedAt' } = req.query;

    const user = await prisma.virtualUser.findUnique({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [conversations, total] = await Promise.all([
      prisma.virtualConversation.findMany({
        where: { virtualUserId: id },
        orderBy: { [orderBy]: 'desc' },
        take: Number(limit),
        skip: Number(offset),
        select: {
          id: true,
          title: true,
          provider: true,
          model: true,
          messageCount: true,
          createdAt: true,
          updatedAt: true,
          metadata: true,
        },
      }),
      prisma.virtualConversation.count({ where: { virtualUserId: id } }),
    ]);

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          total,
          limit: Number(limit),
          offset: Number(offset),
          hasMore: Number(offset) + Number(limit) < total,
        },
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'User conversations fetch failed');
    res.status(500).json({
      error: 'User conversations fetch failed',
      message: error.message,
    });
  }
});

export { router as userManagementRoutes };
