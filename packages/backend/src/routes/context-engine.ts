/**
 * Enhanced Context API Router
 *
 * Exposes the full enhanced dynamic context engine over HTTP:
 *   GET  /api/v2/context-engine/health       - Engine health check
 *   POST /api/v2/context-engine/assemble     - Full parallel context assembly
 *   POST /api/v2/context-engine/assemble/stream - Streaming context delivery
 *   PUT  /api/v2/context-engine/presence/:virtualUserId - Update client presence
 *   POST /api/v2/context-engine/warmup/:virtualUserId   - Trigger bundle warmup
 *   POST /api/v2/context-engine/invalidate/:virtualUserId - Invalidate bundles
 *   GET  /api/v2/context-engine/bundles/:virtualUserId   - List user's context bundles
 *   POST /api/v2/context-engine/settings/:virtualUserId  - Update context settings
 */

import { Router } from 'express';
import { getPrismaClient } from '../lib/database.js';
import { logger } from '../lib/logger.js';
import { unifiedContextService } from '../services/unified-context-service.js';
import { invalidationService } from '../services/invalidation-service.js';
import { getContextWarmupWorker } from '../services/context-warmup-worker.js';
import {
  getContextCache,
  getContextEventBus,
  getContextTelemetry,
  ContextSettingsService,
} from '../context/index.js';
import { isContextSystemBooted } from '../services/context-startup.js';
import { virtualUserAutoAuth, VirtualUserRequest } from '../middleware/virtual-user-auth.js';

const router = Router();
const prisma = getPrismaClient();

// ── Auth middleware – accept virtualUserId from header x-user-fingerprint ─────────────
function extractVirtualUserId(req: any): string | null {
  if ((req as any).virtualUser?.id) return (req as any).virtualUser.id;
  return (req.headers['x-user-fingerprint'] as string) || (req.headers['x-user-id'] as string) || null;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /health
// ─────────────────────────────────────────────────────────────────────────────
router.get('/health', async (req: any, res: any) => {
  try {
    const cache = getContextCache();
    const eventBus = getContextEventBus();
    const engineHealth = await unifiedContextService.healthCheck();
    const invalidationHealth = await invalidationService.getHealth();
    const warmupWorker = getContextWarmupWorker();

    res.json({
      booted: isContextSystemBooted(),
      engines: {
        newEngine: engineHealth.newEngineAvailable,
        oldEngine: engineHealth.oldEngineAvailable,
      },
      database: {
        topicProfiles: engineHealth.stats.topicProfiles,
        entityProfiles: engineHealth.stats.entityProfiles,
        contextBundles: engineHealth.stats.contextBundles,
      },
      invalidation: invalidationHealth,
      cache: cache.getAllStats(),
      eventBus: {
        handlerCount: eventBus.getHandlerCount(),
        recentEvents: eventBus.getRecentEvents(10).length,
      },
      warmupWorker: warmupWorker ? await warmupWorker.getHealth() : { active: false },
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Context engine health check failed');
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /assemble  – Full parallel context assembly
// ─────────────────────────────────────────────────────────────────────────────
router.post('/assemble', async (req: any, res: any) => {
  try {
    const virtualUserId = extractVirtualUserId(req) || req.body.virtualUserId;
    if (!virtualUserId) return res.status(400).json({ error: 'virtualUserId or x-user-fingerprint header required' });

    const {
      conversationId = 'new-chat',
      userMessage = '',
      personaId,
      providerId,
      modelId,
    } = req.body;

    const result = await unifiedContextService.generateContextForChat(conversationId, {
      virtualUserId,
      userMessage,
      personaId,
      deviceId: req.headers['x-device-id'] as string,
      providerId,
      modelId,
    });

    res.json({
      success: true,
      engineUsed: result.engineUsed,
      systemPrompt: result.systemPrompt,
      budget: result.layers,
      stats: result.stats,
    });
  } catch (error: any) {
    logger.error({ error: error.message }, 'Context assemble failed');
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /presence/:virtualUserId  – Upsert client presence
// ─────────────────────────────────────────────────────────────────────────────
router.put('/presence/:virtualUserId', async (req: any, res: any) => {
  const { virtualUserId } = req.params;
  const {
    deviceId = req.headers['x-device-id'] || 'web',
    activeConversationId,
    visibleConversationIds = [],
    activeNotebookId,
    activePersonaId,
    lastNavigationPath,
    localTime,
    isOnline = true,
  } = req.body;

  try {
    const presence = await prisma.clientPresence.upsert({
      where: { virtualUserId_deviceId: { virtualUserId, deviceId } },
      update: {
        activeConversationId: activeConversationId ?? null,
        visibleConversationIds,
        activeNotebookId: activeNotebookId ?? null,
        activePersonaId: activePersonaId ?? null,
        lastNavigationPath: lastNavigationPath ?? null,
        localTime: localTime ? new Date(localTime) : null,
        lastHeartbeatAt: new Date(),
        isOnline,
      },
      create: {
        virtualUserId,
        deviceId,
        activeConversationId: activeConversationId ?? null,
        visibleConversationIds,
        activeNotebookId: activeNotebookId ?? null,
        activePersonaId: activePersonaId ?? null,
        lastNavigationPath: lastNavigationPath ?? null,
        localTime: localTime ? new Date(localTime) : null,
        sessionStartedAt: new Date(),
        lastHeartbeatAt: new Date(),
        isOnline,
      },
    });

    // Emit presence event for context pipeline to react
    getContextEventBus().emit('presence:updated', virtualUserId, {
      deviceId,
      presence,
    }).catch(() => {});

    // Trigger background warmup if active conversation changed
    if (activeConversationId) {
      const warmupWorker = getContextWarmupWorker();
      if (warmupWorker) {
        warmupWorker.warmupForUser(virtualUserId, deviceId).catch(() => {});
      }
    }

    res.json({ success: true, presence });
  } catch (error: any) {
    logger.error({ virtualUserId, error: error.message }, 'Presence update failed');
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /warmup/:virtualUserId  – Trigger bundle warmup
// ─────────────────────────────────────────────────────────────────────────────
router.post('/warmup/:virtualUserId', async (req: any, res: any) => {
  const { virtualUserId } = req.params;
  const deviceId = (req.body.deviceId as string) || (req.headers['x-device-id'] as string) || 'web';

  try {
    const warmupWorker = getContextWarmupWorker();
    if (!warmupWorker) {
      return res.json({ success: true, message: 'Warmup worker not available (Z.AI not configured)' });
    }

    // Non-blocking - warmup runs in background
    warmupWorker.warmupForUser(virtualUserId, deviceId).catch((err: any) =>
      logger.warn({ virtualUserId, error: err.message }, 'Warmup failed')
    );

    res.json({ success: true, message: 'Warmup triggered' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /invalidate/:virtualUserId  – Manual bundle invalidation
// ─────────────────────────────────────────────────────────────────────────────
router.post('/invalidate/:virtualUserId', async (req: any, res: any) => {
  const { virtualUserId } = req.params;
  const { eventType, relatedIds = [] } = req.body;

  if (!eventType) return res.status(400).json({ error: 'eventType required' });

  try {
    await invalidationService.invalidate({ eventType, virtualUserId, relatedIds, timestamp: new Date() });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /bundles/:virtualUserId  – List user context bundles
// ─────────────────────────────────────────────────────────────────────────────
router.get('/bundles/:virtualUserId', async (req: any, res: any) => {
  const { virtualUserId } = req.params;
  const { type, limit = '20' } = req.query;

  try {
    const bundles = await prisma.contextBundle.findMany({
      where: {
        virtualUserId,
        ...(type ? { bundleType: type as string } : {}),
      },
      orderBy: { compiledAt: 'desc' },
      take: parseInt(limit as string),
      select: {
        id: true,
        bundleType: true,
        tokenCount: true,
        isDirty: true,
        compiledAt: true,
        expiresAt: true,
        lastUsedAt: true,
        useCount: true,
        priority: true,
      },
    });

    res.json({ success: true, bundles, count: bundles.length });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /settings/:virtualUserId  – Get context settings
// ─────────────────────────────────────────────────────────────────────────────
router.get('/settings/:virtualUserId', async (req: any, res: any) => {
  const { virtualUserId } = req.params;

  try {
    const settingsService = new ContextSettingsService({ prisma: prisma as any });
    const result = await settingsService.getSettingsWithMetadata(virtualUserId);
    res.json({ success: true, ...result, presets: settingsService.getPresets() });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUT /settings/:virtualUserId  – Update context settings
// ─────────────────────────────────────────────────────────────────────────────
router.put('/settings/:virtualUserId', async (req: any, res: any) => {
  const { virtualUserId } = req.params;

  try {
    const settingsService = new ContextSettingsService({ prisma: prisma as any });
    const result = await settingsService.updateSettings(virtualUserId, req.body);

    if (!result.success) {
      return res.status(400).json({ error: 'Validation failed', details: result.errors });
    }

    // Emit settings change event to invalidate caches
    getContextEventBus().emit('settings:updated', virtualUserId, { settings: result.settings }).catch(() => {});

    res.json({ success: true, settings: result.settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /settings/:virtualUserId/preset/:name  – Apply a preset
// ─────────────────────────────────────────────────────────────────────────────
router.post('/settings/:virtualUserId/preset/:name', async (req: any, res: any) => {
  const { virtualUserId, name } = req.params;

  try {
    const settingsService = new ContextSettingsService({ prisma: prisma as any });
    const result = await settingsService.applyPreset(virtualUserId, name as any);

    if (!result.success) {
      return res.status(400).json({ error: 'Failed to apply preset', details: result.errors });
    }

    getContextEventBus().emit('settings:updated', virtualUserId, { preset: name, settings: result.settings }).catch(() => {});

    res.json({ success: true, preset: name, settings: result.settings });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /telemetry  – Context telemetry stats
// ─────────────────────────────────────────────────────────────────────────────
router.get('/telemetry', async (req: any, res: any) => {
  try {
    const telemetry = getContextTelemetry();
    const report = telemetry.getQualityReport();
    const rawEntries = telemetry.export(60 * 60 * 1000); // last 1h
    const eventBus = getContextEventBus();
    const eventCounts = eventBus.getEventCountByType();
    const recentEvents = eventBus.getRecentEvents(20);

    res.json({ success: true, report, entryCount: rawEntries.length, eventCounts, recentEvents });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
