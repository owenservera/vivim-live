/**
 * Feature Switch System
 * 
 * Comprehensive feature flag and mode switching system for VIVIM.
 * Allows runtime toggling between:
 * - Legacy in-memory chat vs Database-backed chat
 * - userId-based vs virtualUserId-based architecture
 * - Gradual feature rollout with percentage-based rollouts
 * - Environment-specific configurations
 * 
 * Usage:
 *   import { featureSwitch } from './lib/feature-switch.js';
 *   
 *   if (featureSwitch.isEnabled('database_chat')) {
 *     // Use database-backed chat
 *   } else {
 *     // Use legacy in-memory chat
 *   }
 */

import { getPrismaClient } from './database.js';
import { logger } from './logger.js';

// ============================================================================
// FEATURE DEFINITIONS
// ============================================================================

const FEATURE_DEFINITIONS = {
  // Chat System Mode
  database_chat: {
    name: 'Database-Backed Chat',
    description: 'Use Prisma database persistence instead of in-memory Map for conversations',
    defaultEnabled: true,
    environments: {
      development: true,
      staging: true,
      production: false, // Gradual rollout
    },
    rollbackPlan: 'Switch back to in-memory Map storage',
    dependencies: [],
  },
  
  virtual_user_system: {
    name: 'Virtual User System',
    description: 'Use fingerprint-based virtual user identification instead of auth login',
    defaultEnabled: true,
    environments: {
      development: true,
      staging: true,
      production: true,
    },
    rollbackPlan: 'Revert to userId-based identification',
    dependencies: ['database_chat'],
  },
  
  memory_extraction: {
    name: 'Memory Extraction',
    description: 'Automatically extract memories from conversations for context persistence',
    defaultEnabled: true,
    environments: {
      development: true,
      staging: true,
      production: true,
    },
    rollbackPlan: 'Disable automatic memory extraction',
    dependencies: ['virtual_user_system'],
  },
  
  context_engine: {
    name: 'Dynamic Context Engine',
    description: 'Use dynamic context assembly with bundle compilation',
    defaultEnabled: true,
    environments: {
      development: true,
      staging: true,
      production: true,
    },
    rollbackPlan: 'Fall back to legacy context generator',
    dependencies: ['memory_extraction'],
  },
  
  analytics_api: {
    name: 'Analytics API',
    description: 'Enable analytics endpoints for conversation and user metrics',
    defaultEnabled: true,
    environments: {
      development: true,
      staging: true,
      production: false,
    },
    rollbackPlan: 'Disable analytics endpoints',
    dependencies: ['database_chat'],
  },
  
  user_management_api: {
    name: 'User Management API',
    description: 'Enable user profile, session, and GDPR management endpoints',
    defaultEnabled: true,
    environments: {
      development: true,
      staging: true,
      production: true, // GDPR compliance required
    },
    rollbackPlan: 'Disable user management endpoint',
    dependencies: ['virtual_user_system'],
  },
  
  streaming_responses: {
    name: 'Streaming Responses',
    description: 'Enable streaming AI responses with database persistence',
    defaultEnabled: true,
    environments: {
      development: true,
      staging: true,
      production: true,
    },
    rollbackPlan: 'Fall back to non-streaming responses',
    dependencies: ['database_chat'],
  },
  
  zai_mcp_integration: {
    name: 'Z.AI MCP Integration',
    description: 'Enable Z.AI MCP tool calls (websearch, github, rtrvr)',
    defaultEnabled: true,
    environments: {
      development: true,
      staging: true,
      production: true,
    },
    rollbackPlan: 'Disable MCP tool calls',
    dependencies: [],
  },
};

// ============================================================================
// FEATURE SWITCH CLASS
// ============================================================================

class FeatureSwitch {
  constructor() {
    this.prisma = null;
    this.cache = new Map();
    this.cacheTTL = 30 * 1000; // 30 seconds
    this.listeners = new Map();
    this.initialized = false;
  }

  /**
   * Initialize the feature switch system
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      this.prisma = getPrismaClient();
      await this.ensureFeatureFlagsTable();
      await this.seedDefaultFeatures();
      this.initialized = true;
      logger.info('Feature switch system initialized');
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to initialize feature switch');
      // Fallback to in-memory defaults
      this.initialized = true;
    }
  }

  /**
   * Ensure feature_flags table exists
   */
  async ensureFeatureFlagsTable() {
    await this.prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS feature_flags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        enabled BOOLEAN NOT NULL DEFAULT false,
        rollout_percentage INTEGER NOT NULL DEFAULT 0,
        environment TEXT NOT NULL DEFAULT 'development',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  /**
   * Seed default feature flags
   */
  async seedDefaultFeatures() {
    const env = process.env.NODE_ENV || 'development';
    
    for (const [key, def] of Object.entries(FEATURE_DEFINITIONS)) {
      const existing = await this.prisma.$queryRawUnsafe(
        'SELECT id FROM feature_flags WHERE id = $1',
        key
      );
      
      if (existing.length === 0) {
        const envEnabled = def.environments[env] ?? def.defaultEnabled;
        await this.prisma.$executeRawUnsafe(
          `INSERT INTO feature_flags (id, name, description, enabled, rollout_percentage, environment) 
           VALUES ($1, $2, $3, $4, $5, $6)`,
          key,
          def.name,
          def.description,
          envEnabled,
          envEnabled ? 100 : 0,
          env
        );
      }
    }
  }

  /**
   * Check if a feature is enabled
   * @param {string} featureKey - The feature key to check
   * @param {object} context - Optional context (userId, environment, etc.)
   * @returns {boolean} Whether the feature is enabled
   */
  isEnabled(featureKey, context = {}) {
    // If not initialized, use defaults
    if (!this.initialized) {
      const def = FEATURE_DEFINITIONS[featureKey];
      return def?.defaultEnabled ?? false;
    }

    // Check cache first
    const cacheKey = `${featureKey}:${JSON.stringify(context)}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.enabled;
    }

    // Check dependencies first
    const def = FEATURE_DEFINITIONS[featureKey];
    if (def?.dependencies) {
      for (const dep of def.dependencies) {
        if (!this.isEnabled(dep, context)) {
          this.cache.set(cacheKey, { enabled: false, timestamp: Date.now() });
          return false;
        }
      }
    }

    // Check database
    const enabled = this.checkFeatureInDatabase(featureKey, context);
    this.cache.set(cacheKey, { enabled, timestamp: Date.now() });
    return enabled;
  }

  /**
   * Check feature status in database
   */
  async checkFeatureInDatabase(featureKey, context = {}) {
    try {
      const env = context.environment || process.env.NODE_ENV || 'development';
      
      const result = await this.prisma.$queryRawUnsafe(
        'SELECT enabled, rollout_percentage FROM feature_flags WHERE id = $1 AND (environment = $2 OR environment = \'all\')',
        featureKey,
        env
      );
      
      if (result.length === 0) {
        // Fall back to default
        const def = FEATURE_DEFINITIONS[featureKey];
        return def?.environments[env] ?? def?.defaultEnabled ?? false;
      }

      const { enabled, rollout_percentage } = result[0];
      
      // If rollout percentage is set, use deterministic hashing
      if (rollout_percentage > 0 && rollout_percentage < 100) {
        const userId = context.userId || context.virtualUserId || 'anonymous';
        const hash = this.hashString(userId) % 100;
        return hash < rollout_percentage;
      }

      return enabled;
    } catch (error) {
      logger.warn({ error: error.message, featureKey }, 'Failed to check feature flag, using default');
      const def = FEATURE_DEFINITIONS[featureKey];
      return def?.defaultEnabled ?? false;
    }
  }

  /**
   * Enable a feature
   */
  async enable(featureKey, options = {}) {
    const { rolloutPercentage = 100, environment } = options;
    const env = environment || process.env.NODE_ENV || 'development';
    
    try {
      await this.prisma.$executeRawUnsafe(
        `INSERT INTO feature_flags (id, name, description, enabled, rollout_percentage, environment, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) 
         DO UPDATE SET enabled = $4, rollout_percentage = $5, updated_at = NOW()`,
        featureKey,
        FEATURE_DEFINITIONS[featureKey]?.name || featureKey,
        FEATURE_DEFINITIONS[featureKey]?.description || '',
        true,
        rolloutPercentage,
        env
      );
      
      this.clearCache(featureKey);
      this.notifyListeners(featureKey, true);
      logger.info({ featureKey, rolloutPercentage }, 'Feature enabled');
      
      return { success: true, featureKey, enabled: true, rolloutPercentage };
    } catch (error) {
      logger.error({ error: error.message, featureKey }, 'Failed to enable feature');
      return { success: false, error: error.message };
    }
  }

  /**
   * Disable a feature
   */
  async disable(featureKey, environment) {
    const env = environment || process.env.NODE_ENV || 'development';
    
    try {
      await this.prisma.$executeRawUnsafe(
        'UPDATE feature_flags SET enabled = false, rollout_percentage = 0, updated_at = NOW() WHERE id = $1 AND environment = $2',
        featureKey,
        env
      );
      
      this.clearCache(featureKey);
      this.notifyListeners(featureKey, false);
      logger.info({ featureKey }, 'Feature disabled');
      
      return { success: true, featureKey, enabled: false };
    } catch (error) {
      logger.error({ error: error.message, featureKey }, 'Failed to disable feature');
      return { success: false, error: error.message };
    }
  }

  /**
   * Set rollout percentage for gradual rollout
   */
  async setRolloutPercentage(featureKey, percentage) {
    if (percentage < 0 || percentage > 100) {
      return { success: false, error: 'Percentage must be between 0 and 100' };
    }
    
    try {
      await this.prisma.$executeRawUnsafe(
        'UPDATE feature_flags SET rollout_percentage = $1, enabled = $1 > 0, updated_at = NOW() WHERE id = $2',
        percentage,
        featureKey
      );
      
      this.clearCache(featureKey);
      logger.info({ featureKey, percentage }, 'Rollout percentage updated');
      
      return { success: true, featureKey, rolloutPercentage: percentage };
    } catch (error) {
      logger.error({ error: error.message, featureKey }, 'Failed to set rollout percentage');
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all feature flags
   */
  async getAllFeatures(environment) {
    const env = environment || process.env.NODE_ENV || 'development';
    
    try {
      const features = await this.prisma.$queryRawUnsafe(
        'SELECT * FROM feature_flags WHERE environment = $1 OR environment = \'all\' ORDER BY id',
        env
      );
      
      // Merge with defaults for missing features
      const result = {};
      for (const [key, def] of Object.entries(FEATURE_DEFINITIONS)) {
        const dbFeature = features.find(f => f.id === key);
        result[key] = {
          key,
          name: def.name,
          description: def.description,
          enabled: dbFeature?.enabled ?? def.environments[env] ?? def.defaultEnabled,
          rolloutPercentage: dbFeature?.rollout_percentage ?? (def.defaultEnabled ? 100 : 0),
          dependencies: def.dependencies || [],
          rollbackPlan: def.rollbackPlan,
        };
      }
      
      return result;
    } catch (error) {
      logger.error({ error: error.message }, 'Failed to get feature flags');
      return {};
    }
  }

  /**
   * Clear cache for a feature
   */
  clearCache(featureKey) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(featureKey)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Subscribe to feature flag changes
   */
  on(featureKey, callback) {
    if (!this.listeners.has(featureKey)) {
      this.listeners.set(featureKey, []);
    }
    this.listeners.get(featureKey).push(callback);
  }

  /**
   * Notify listeners of feature flag changes
   */
  notifyListeners(featureKey, enabled) {
    const callbacks = this.listeners.get(featureKey) || [];
    for (const callback of callbacks) {
      try {
        callback(featureKey, enabled);
      } catch (error) {
        logger.error({ error: error.message }, 'Feature flag listener error');
      }
    }
  }

  /**
   * Simple string hash for deterministic percentage rollout
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get feature status summary
   */
  async getStatus() {
    const env = process.env.NODE_ENV || 'development';
    const features = await this.getAllFeatures(env);
    
    const summary = {
      environment: env,
      totalFeatures: Object.keys(features).length,
      enabledFeatures: Object.values(features).filter(f => f.enabled).length,
      disabledFeatures: Object.values(features).filter(f => !f.enabled).length,
      partialRollout: Object.values(features).filter(f => f.rolloutPercentage > 0 && f.rolloutPercentage < 100).length,
      features,
    };
    
    return summary;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const featureSwitch = new FeatureSwitch();

// ============================================================================
// EXPRESS ROUTES FOR FEATURE SWITCH MANAGEMENT
// ============================================================================

import { Router } from 'express';

export function createFeatureSwitchRoutes() {
  const router = Router();

  // GET /api/v1/features - Get all feature flags
  router.get('/', async (req, res) => {
    try {
      const status = await featureSwitch.getStatus();
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/v1/features/:key - Get specific feature
  router.get('/:key', async (req, res) => {
    try {
      const features = await featureSwitch.getAllFeatures();
      const feature = features[req.params.key];
      
      if (!feature) {
        return res.status(404).json({ error: 'Feature not found' });
      }
      
      res.json({ success: true, data: feature });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/v1/features/:key/enable - Enable feature
  router.post('/:key/enable', async (req, res) => {
    try {
      const { rolloutPercentage, environment } = req.body;
      const result = await featureSwitch.enable(req.params.key, { rolloutPercentage, environment });
      
      if (result.success) {
        res.json({ success: true, data: result });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/v1/features/:key/disable - Disable feature
  router.post('/:key/disable', async (req, res) => {
    try {
      const { environment } = req.body;
      const result = await featureSwitch.disable(req.params.key, environment);
      
      if (result.success) {
        res.json({ success: true, data: result });
      } else {
        res.status(500).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT /api/v1/features/:key/rollout - Set rollout percentage
  router.put('/:key/rollout', async (req, res) => {
    try {
      const { percentage } = req.body;
      const result = await featureSwitch.setRolloutPercentage(req.params.key, percentage);
      
      if (result.success) {
        res.json({ success: true, data: result });
      } else {
        res.status(400).json({ success: false, error: result.error });
      }
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/v1/features/:key/check - Check if feature is enabled for context
  router.post('/:key/check', async (req, res) => {
    try {
      const { userId, virtualUserId, environment } = req.body;
      const enabled = featureSwitch.isEnabled(req.params.key, {
        userId,
        virtualUserId,
        environment,
      });
      
      res.json({ success: true, data: { feature: req.params.key, enabled } });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

export default featureSwitch;
