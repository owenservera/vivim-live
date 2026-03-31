import { GlobalRateLimiter } from './global-rate-limiter.js';
import { logger } from './logger.js';

/**
 * Initialize the global rate limiter with environment-based configuration
 * Call this once at application startup
 */
export function initializeGlobalRateLimiter(overrides) {
  const config = {
    minIntervalMs: parseInt(process.env.GLOBAL_RATE_LIMIT_INTERVAL_MS || '2000', 10),
    maxQueueSize: parseInt(process.env.GLOBAL_RATE_LIMIT_MAX_QUEUE || '1000', 10),
    timeoutMs: parseInt(process.env.GLOBAL_RATE_LIMIT_TIMEOUT_MS || '60000', 10),
    enablePriority: process.env.GLOBAL_RATE_LIMIT_ENABLE_PRIORITY === 'true',
    ...overrides
  };

  const limiter = GlobalRateLimiter.getInstance(config);

  // Set up event logging
  limiter.on('queued', ({ id, position }) => {
    logger.debug({ id: id.slice(0, 8), position }, 'Rate limiter request queued');
  });

  limiter.on('processing', ({ id, waitTimeMs, queueLength }) => {
    logger.debug(
      { id: id.slice(0, 8), waitTimeMs, queueLength },
      'Rate limiter request processing'
    );
  });

  limiter.on('completed', ({ id, waitTimeMs, processingTimeMs }) => {
    logger.debug(
      { id: id.slice(0, 8), waitTimeMs, processingTimeMs },
      'Rate limiter request completed'
    );
  });

  limiter.on('failed', ({ id, error }) => {
    logger.error({ id: id.slice(0, 8), error: error.message }, 'Rate limiter request failed');
  });

  limiter.on('timeout', ({ id }) => {
    logger.error({ id: id.slice(0, 8) }, 'Rate limiter request timed out');
  });

  // Graceful shutdown handlers
  const shutdown = () => {
    logger.info('Draining rate limiter queue on shutdown...');
    limiter.pause();
    
    const stats = limiter.getStats();
    logger.info(
      { 
        pending: stats.queueLength, 
        processed: stats.totalProcessed, 
        failed: stats.totalFailed 
      },
      'Rate limiter final stats'
    );
    
    setTimeout(() => {
      limiter.destroy();
      process.exit(0);
    }, 5000);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  logger.info(
    { 
      intervalMs: config.minIntervalMs, 
      maxQueue: config.maxQueueSize,
      timeoutMs: config.timeoutMs 
    },
    'Global rate limiter initialized'
  );
  
  return limiter;
}
